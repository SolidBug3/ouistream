function selectAvatar(isOwnProfile, fileInput) {
    if (!isOwnProfile) {
        return
    }

    fileInput.current?.click()
}

export default selectAvatar