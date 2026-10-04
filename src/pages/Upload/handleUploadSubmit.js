import validateUpload from "./validateUpload"

function handleUploadSubmit(event, video, title, thumbnail) {
    event.preventDefault()

    if (!validateUpload(video, title, thumbnail)) {
        return false
    }

    return true
}

export default handleUploadSubmit