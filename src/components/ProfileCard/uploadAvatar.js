import { supabase } from "../../supabase/supabase"

async function uploadAvatar(id, file) {
    const extension = file.name.split(".").pop().toLowerCase()
    const path = `${id}/avatar.${extension}`

    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, arrayBuffer, {
            upsert: true,
            contentType: file.type,
            cacheControl: "3600"
        })

    if (uploadError) {
        throw uploadError
    }

    const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(path)

    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`

    const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: avatarUrl })
        .eq("id", id)

    if (updateError) {
        throw updateError
    }

    return avatarUrl
}

export default uploadAvatar