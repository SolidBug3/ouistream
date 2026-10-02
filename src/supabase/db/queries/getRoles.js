import db from "../db"

async function getRoles() {
    const { data, error } = await db
        .from("roles")
        .select("id, name")
        .order("name")

    if (error) {
        throw error
    }

    return data
}

export default getRoles