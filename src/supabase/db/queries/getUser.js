import db from "../db"

async function getUser(id) {
    const locale = navigator.language.split("-")[0]

    const { data: user, error: userError } = await db
        .from("users")
        .select("id, display_name, quote, role_id, avatar_url")
        .eq("id", id)
        .single()

    if (userError) {
        throw userError
    }

    let role = null

    if (user.role_id) {
        let { data: translation } = await db
            .from("translation")
            .select("value, locale!inner(code)")
            .eq("label", `role_${user.role_id}`)
            .eq("locale.code", locale)
            .maybeSingle()

        if (!translation && locale !== "en") {
            const result = await db
                .from("translation")
                .select("value, locale!inner(code)")
                .eq("label", `role_${user.role_id}`)
                .eq("locale.code", "en")
                .maybeSingle()

            translation = result.data
        }

        role = translation?.value ?? null
    }

    return {
        id: user.id,
        display_name: user.display_name,
        quote: user.quote,
        role_id: user.role_id,
        role,
        avatar_url: user.avatar_url
    }
}

export default getUser