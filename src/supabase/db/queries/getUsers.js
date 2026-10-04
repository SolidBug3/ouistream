
import { supabase } from "../../supabase"

async function getUsers() {
    const { data, error } = await supabase
        .from("users")
        .select("id, display_name, avatar_url")
        .order("display_name")

    if (error) {
        console.error(error)
        return []
    }

    return data.map((user) => ({
        id: user.id,
        name: user.display_name,
        avatar_url: user.avatar_url
    }))
}

export default getUsers
