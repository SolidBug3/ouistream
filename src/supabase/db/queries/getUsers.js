import { supabase } from "../../supabase"

async function getUsers() {
    const { data, error } = await supabase
        .from("users")
        .select("id, display_name")
        .order("display_name")

    if (error) {
        console.error(error)
        return []
    }

    return data.map((user) => ({
        id: user.id,
        name: user.display_name
    }))
}

export default getUsers