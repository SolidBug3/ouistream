function handleThumbnail(event, setThumbnail, setThumbnailUrl) {
    const file = event.target.files?.[0]

    if (!file) { return }

    setThumbnail(file)
    setThumbnailUrl(URL.createObjectURL(file))
}

export default handleThumbnail