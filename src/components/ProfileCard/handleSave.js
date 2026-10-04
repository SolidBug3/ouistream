import saveProfile from "./saveProfile"

async function handleSave(event, id, name, roleId, quote, setSaving) {
    setSaving(true)

    try {
        await saveProfile(event, id, name, roleId, quote)
        window.location.reload()
    } catch (error) {
        console.error(error)
        setSaving(false)
    }
}

export default handleSave