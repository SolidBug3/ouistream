import "./ProfileCard.css"

import { useParams } from "react-router-dom"

import QRCode from "../QRCode/QRCode"
import useAuth from "../../supabase/auth/useAuth"
import useMobile from "./useMobile"
import useProfileText from "./useProfileText"

function ProfileCard({ user }) {
    const loggedUser = useAuth()
    const { id } = useParams()
    const mobile = useMobile()
    const texts = useProfileText()

    const staff = [1, 2, 26, 27].includes(user.role_id)
    const isOwnProfile = loggedUser?.id === id
    const profileUrl = window.location.origin + window.location.pathname

    return (
        <div className="ProfileCard">
            <QRCode text={profileUrl} />

            <div className="ProfileCard-avatar">👤</div>

            <div className="ProfileCard-content">
                <div className="ProfileCard-name">{user.display_name}</div>

                <div className={`ProfileCard-role ${staff ? "staff" : ""}`}>{user.role}</div>

                {user.quote && (
                    <div className="ProfileCard-quote">
                        “{user.quote}”
                    </div>
                )}

                {isOwnProfile && !mobile && (
                    <button className="ProfileEditButton">
                        {texts.save}
                    </button>
                )}
            </div>
        </div>
    )
}

export default ProfileCard