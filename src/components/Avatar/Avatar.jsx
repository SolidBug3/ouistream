import "./Avatar.css"

function AvatarUpload({ image }) {
    return (
        <button className="AvatarUpload">
            {image && <img src={image} alt="Avatar" />}
        </button>
    )
}

export default AvatarUpload