import "./ProfileCard.css"

import QRCode from "../QRCode/QRCode"

function ProfileCard({ user }) {
    const staff = [1, 2, 26, 27].includes(user.role_id)
    const profileUrl = window.location.origin + window.location.pathname

    return (
        <div className="ProfileCard">
            <QRCode text={profileUrl} />

            <div className="ProfileCard-avatar">
                👤
            </div>

            <div className="ProfileCard-content">
                <div className="ProfileCard-name">
                    {user.display_name}
                </div>

                <div className={`ProfileCard-role ${staff ? "staff" : ""}`}>
                    {user.role}
                </div>

                {user.quote && (
                    <div className="ProfileCard-quote">
                        “{user.quote}”
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfileCard