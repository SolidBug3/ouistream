import db from "../db"

async function setUser(id, name, roleId, quote) {
    const { data, error } = await db
        .from("users")
        .update({
            display_name: name,
            role_id: roleId,
            quote: quote
        })
        .eq("id", id)
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}

export default setUser