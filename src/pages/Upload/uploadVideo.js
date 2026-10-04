
import { supabase } from "../../supabase/supabase"

const backendUrl = "http://localhost:3001"

async function uploadToFilebase(file, kind, onProgress = () => { }) {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
        throw error || new Error("Not authenticated")
    }

    const contentType = file.type || (kind === "video" ? "video/mp4" : "image/jpeg")

    const response = await fetch(`${backendUrl}/api/upload-url`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
            kind,
            fileName: file.name,
            contentType
        })
    })

    if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || "Could not get upload URL")
    }

    const { uploadUrl, key } = await response.json()

    await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.open("PUT", uploadUrl)

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                onProgress((event.loaded / event.total) * 100)
            }
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve()
            } else {
                const details = xhr.responseText?.trim()
                reject(new Error(
                    `Filebase upload failed: ${xhr.status} ${xhr.statusText}${details ? ` - ${details}` : ""}`
                ))
            }
        }

        xhr.onerror = () => reject(new Error("Filebase upload network error"))
        xhr.onabort = () => reject(new Error("Filebase upload aborted"))

        xhr.send(file)
    })

    return key
}

async function uploadVideo({
    userId,
    video,
    thumbnail,
    title,
    description,
    actors,
    producers,
    onProgress = () => { }
}) {
    const videoId = crypto.randomUUID()
    const locale = navigator.language.split("-")[0]

    const thumbnailExtension = thumbnail.name.includes(".")
        ? thumbnail.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "")
        : "jpg"

    const thumbnailPath = `${userId}/${videoId}/thumbnail.${thumbnailExtension || "jpg"}`
    const labels = [`video_${videoId}_title`, `video_${videoId}_description`]

    let videoPath = null
    let thumbnailUploaded = false
    let videoInserted = false
    let translationsInserted = false
    let actorsInserted = false
    let producersInserted = false

    try {
        videoPath = await uploadToFilebase(video, "video", onProgress)

        const { error: thumbnailError } = await supabase.storage
            .from("thumbnails")
            .upload(thumbnailPath, thumbnail, {
                contentType: thumbnail.type || "image/jpeg",
                upsert: false
            })

        if (thumbnailError) throw thumbnailError
        thumbnailUploaded = true

        const { data: thumbnailData } = supabase.storage
            .from("thumbnails")
            .getPublicUrl(thumbnailPath)

        const { data: localeData, error: localeError } = await supabase
            .from("locale")
            .select("id")
            .eq("code", locale)
            .single()

        if (localeError) throw localeError

        const { error: videoError } = await supabase.from("videos").insert({
            id: videoId,
            user_id: userId,
            locale,
            source_path: videoPath,
            stream_path: null,
            thumbnail_url: thumbnailData.publicUrl,
            status: "processing",
            published: false
        })

        if (videoError) throw videoError
        videoInserted = true

        const { error: translationError } = await supabase
            .from("translation")
            .insert([
                {
                    label: labels[0],
                    value: title.trim(),
                    locale_id: localeData.id
                },
                {
                    label: labels[1],
                    value: description.trim(),
                    locale_id: localeData.id
                }
            ])

        if (translationError) throw translationError
        translationsInserted = true

        const actorRows = actors
            .filter(actor => actor.userId || actor.name?.trim())
            .map(actor => ({
                video_id: videoId,
                user_id: actor.userId || null,
                name: actor.name?.trim() || null
            }))

        const producerRows = producers
            .filter(producer => producer.userId || producer.name?.trim())
            .map(producer => ({
                video_id: videoId,
                user_id: producer.userId || null,
                name: producer.name?.trim() || null
            }))

        if (actorRows.length > 0) {
            const { error: actorError } = await supabase
                .from("video_actors")
                .insert(actorRows)

            if (actorError) throw actorError
            actorsInserted = true
        }

        if (producerRows.length > 0) {
            const { error: producerError } = await supabase
                .from("video_producers")
                .insert(producerRows)

            if (producerError) throw producerError
            producersInserted = true
        }

        return videoId
    } catch (error) {
        console.error("Upload database operation failed:", {
            message: error?.message,
            code: error?.code,
            details: error?.details,
            hint: error?.hint
        })

        if (producersInserted) {
            const { error: cleanupError } = await supabase
                .from("video_producers")
                .delete()
                .eq("video_id", videoId)

            if (cleanupError) console.error("Producer cleanup failed:", cleanupError)
        }

        if (actorsInserted) {
            const { error: cleanupError } = await supabase
                .from("video_actors")
                .delete()
                .eq("video_id", videoId)

            if (cleanupError) console.error("Actor cleanup failed:", cleanupError)
        }

        if (translationsInserted || videoInserted) {
            const { error: cleanupError } = await supabase
                .from("translation")
                .delete()
                .in("label", labels)

            if (cleanupError) console.error("Translation cleanup failed:", cleanupError)
        }

        if (videoInserted) {
            const { error: cleanupError } = await supabase
                .from("videos")
                .delete()
                .eq("id", videoId)

            if (cleanupError) console.error("Video record cleanup failed:", cleanupError)
        }

        if (thumbnailUploaded) {
            const { error: cleanupError } = await supabase.storage
                .from("thumbnails")
                .remove([thumbnailPath])

            if (cleanupError) console.error("Thumbnail cleanup failed:", cleanupError)
        }

        throw error
    }
}

export default uploadVideo
