import setUser from "../../supabase/db/queries/setUser"

async function saveProfile(event, id, name, roleId, quote) {
    event.preventDefault()

    await setUser(id, name, Number(roleId), quote)
}

export default saveProfile