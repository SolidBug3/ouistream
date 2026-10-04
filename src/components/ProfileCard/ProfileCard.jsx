import "./ProfileCard.css"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import QRCode from "../QRCode/QRCode"
import useAuth from "../../supabase/auth/useAuth"
import useMobile from "./useMobile"
import useProfileText from "./useProfileText"
import getRoles from "../../supabase/db/queries/getRoles"
import setUser from "../../supabase/db/queries/setUser"

function ProfileCard({ user }) {
    const loggedUser = useAuth()
    const { id } = useParams()
    const mobile = useMobile()
    const texts = useProfileText()

    const [name, setName] = useState(user.display_name ?? "")
    const [quote, setQuote] = useState(user.quote ?? "")
    const [roleId, setRoleId] = useState(user.role_id)
    const [roles, setRoles] = useState([])
    const [roleOpen, setRoleOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    const staffIds = [1, 2, 26, 27]
    const staff = staffIds.includes(Number(user.role_id))
    const isOwnProfile = loggedUser?.id === id
    const isEditable = isOwnProfile && !mobile
    const isRoleEditable = isEditable && !staff
    const profileUrl = window.location.origin + window.location.pathname

    useEffect(() => {
        async function loadRoles() {
            try {
                const data = await getRoles()

                setRoles(
                    data.filter((role) => !staffIds.includes(Number(role.id)))
                )
            } catch (error) {
                console.error(error)
            }
        }

        loadRoles()
    }, [])

    const selectedRole = roles.find(
        (role) => Number(role.id) === Number(roleId)
    )

    async function saveProfile(event) {
        event.preventDefault()
        setSaving(true)

        try {
            await setUser(id, name, Number(roleId), quote)
            window.location.reload()
        } catch (error) {
            console.error(error)
            setSaving(false)
        }
    }

    return (
        <div className="ProfileCard">
            <QRCode text={profileUrl} />

            <div className="ProfileCard-avatar">👤</div>

            <div className="ProfileCard-content">
                {isEditable ? (
                    <form onSubmit={saveProfile}>
                        <input className="ProfileCard-name ProfileCard-editable" type="text" value={name} onChange={(event) => setName(event.target.value)} />

                        {isRoleEditable ? (
                            <div className="ProfileCard-roleSelect">
                                <button type="button" className="ProfileCard-roleSelect-button" onClick={() => setRoleOpen(!roleOpen)}>
                                    <span>{selectedRole?.name ?? user.role}</span>
                                    <span className="ProfileCard-roleSelect-arrow">{roleOpen ? "⌃" : "⌄"}</span>
                                </button>

                                {roleOpen && (
                                    <div className="ProfileCard-roleSelect-options">
                                        {roles.map((role) => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                className="ProfileCard-roleSelect-option"
                                                onClick={() => {
                                                    setRoleId(role.id)
                                                    setRoleOpen(false)
                                                }}
                                            >
                                                {role.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={`ProfileCard-role ${staff ? "staff" : ""}`}>{user.role}</div>
                        )}

                        <textarea className="ProfileCard-quote ProfileCard-editable ProfileCard-quoteEditable" value={quote} onChange={(event) => setQuote(event.target.value)} placeholder="..." rows={1} />

                        <button className="ProfileEditButton" type="submit" disabled={saving} >{texts.save}</button>
                    </form>
                ) : (
                    <>
                        <div className="ProfileCard-name">{user.display_name}</div>

                        <div className={`ProfileCard-role ${staff ? "staff" : ""}`}>{user.role}</div>

                        {user.quote && (
                            <div className="ProfileCard-quote">
                                “{user.quote}”
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default ProfileCard