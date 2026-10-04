import uploadAvatar from "./uploadAvatar"

async function handleAvatar(event, id, isOwnProfile, setAvatarUrl, setUploadingAvatar) {
    if (!isOwnProfile) {
        return
    }

    const file = event.target.files?.[0]

    if (!file) {
        return
    }

    setUploadingAvatar(true)

    try {
        const url = await uploadAvatar(id, file)

        if (url) {
            setAvatarUrl(url)
        }
    } catch (error) {
        console.error(error)
    } finally {
        setUploadingAvatar(false)
        event.target.value = ""
    }
}

export default handleAvatar