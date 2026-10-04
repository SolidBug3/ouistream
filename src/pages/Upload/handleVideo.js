function handleVideo(event, setVideo) {
    const file = event.target.files?.[0]

    if (!file) {
        return
    }

    setVideo(file)
}

export default handleVideo