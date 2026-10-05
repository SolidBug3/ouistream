
import { supabase } from "../../supabase"

const HOME_LABELS = [
    "home_featured",
    "home_new_videos",
    "home_all_videos",
    "home_loading",
    "home_empty",
    "home_previous",
    "home_next",
    "home_page"
]

async function getTranslations(labels, locale) {
    if (!labels.length) return {}

    const { data, error } = await supabase
        .from("translation")
        .select("label, value, locale!inner(code)")
        .in("label", labels)

    if (error) {
        console.error("Could not load video translations:", error)
        return {}
    }

    const result = {}

    for (const label of labels) {
        const matches = data?.filter(row => row.label === label) || []

        const translation =
            matches.find(row => row.locale.code === locale) ||
            matches.find(row => row.locale.code === "en") ||
            matches[0]

        result[label] = translation?.value || ""
    }

    return result
}

export default async function getVideos(locale = "en") {
    const [
        { data: videoRows, error: videoError },
        uiTranslations
    ] = await Promise.all([
        supabase
            .from("videos")
            .select("*")
            .eq("status", "ready")
            .order("created_at", { ascending: false }),

        getTranslations(HOME_LABELS, locale)
    ])

    if (videoError) {
        console.error("Could not load videos:", videoError)
        throw videoError
    }

    const rows = videoRows || []

    if (!rows.length) {
        return {
            videos: [],
            translations: uiTranslations
        }
    }

    const videoIds = rows.map(video => video.id)

    const [
        { data: actorRows, error: actorError },
        { data: producerRows, error: producerError },
        { data: genreRows, error: genreError }
    ] = await Promise.all([
        supabase
            .from("video_actors")
            .select("video_id, user_id, name")
            .in("video_id", videoIds),

        supabase
            .from("video_producers")
            .select("video_id, user_id, name")
            .in("video_id", videoIds),

        supabase
            .from("video_genres")
            .select("video_id, genre_id")
            .in("video_id", videoIds)
    ])

    if (actorError) console.error("Could not load actors:", actorError)
    if (producerError) console.error("Could not load producers:", producerError)
    if (genreError) console.error("Could not load genres:", genreError)

    const actors = actorRows || []
    const producers = producerRows || []
    const genres = genreRows || []

    const userIds = [...new Set([
        ...actors.map(actor => actor.user_id),
        ...producers.map(producer => producer.user_id)
    ].filter(Boolean))]

    let users = []

    if (userIds.length) {
        const { data, error } = await supabase
            .from("users")
            .select("id, display_name")
            .in("id", userIds)

        if (error) {
            console.error("Could not load user names:", error)
        } else {
            users = data || []
        }
    }

    const userMap = new Map(
        users.map(user => [user.id, user.display_name])
    )

    const genreIds = [...new Set(
        genres.map(genre => genre.genre_id)
    )]

    const titleLabels = rows.map(video => `video_${video.id}_title`)
    const genreLabels = genreIds.map(id => `genre_${id}`)

    const translations = await getTranslations(
        [...titleLabels, ...genreLabels],
        locale
    )

    const mappedVideos = rows.map(video => ({
        ...video,

        title: translations[`video_${video.id}_title`] || "Untitled video",

        actors: actors
            .filter(actor => actor.video_id === video.id)
            .map(actor => ({
                user_id: actor.user_id,
                name: actor.name || userMap.get(actor.user_id)
            }))
            .filter(actor => actor.name),

        producers: producers
            .filter(producer => producer.video_id === video.id)
            .map(producer => ({
                user_id: producer.user_id,
                name: producer.name || userMap.get(producer.user_id)
            }))
            .filter(producer => producer.name),

        genres: genres
            .filter(genre => genre.video_id === video.id)
            .map(genre => ({
                id: String(genre.genre_id),
                name: translations[`genre_${genre.genre_id}`] || ""
            }))
            .filter(genre => genre.name)
    }))

    return {
        videos: mappedVideos,
        translations: uiTranslations
    }
}
