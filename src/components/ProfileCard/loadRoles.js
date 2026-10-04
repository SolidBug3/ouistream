import getRoles from "../../supabase/db/queries/getRoles"

async function loadRoles(staffIds) {
    const data = await getRoles()

    return data.filter(role => !staffIds.includes(Number(role.id)))
}

export default loadRoles