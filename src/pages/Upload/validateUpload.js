function validateUpload(video, title, thumbnail) {
    return Boolean(video && title.trim() && thumbnail)
}

export default validateUpload