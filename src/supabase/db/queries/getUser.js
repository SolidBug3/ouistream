import db from "../db"

async function getUser(id) {
    const { data, error } = await db
        .from("users")
        .select("*, roles(name)")
        .eq("id", id)
        .single()

    if (error) {
        throw error
    }

    return data
}

export default getUser