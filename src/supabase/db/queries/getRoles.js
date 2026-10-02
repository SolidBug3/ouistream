import db from "../db"

async function getRoles() {
    const locale = navigator.language.split("-")[0]

    let { data, error } = await db
        .from("roles")
        .select("id, translation!inner(value, locale!inner(code))")
        .eq("translation.locale.code", locale)
        .order("id")

    if (error) {
        throw error
    }

    if (!data || data.length === 0) {
        const result = await db
            .from("roles")
            .select("id, translation!inner(value, locale!inner(code))")
            .eq("translation.locale.code", "en")
            .order("id")

        if (result.error) {
            throw result.error
        }

        data = result.data
    }

    return data.map(role => ({
        id: role.id,
        name: role.translation[0]?.value
    }))
}

export default getRoles