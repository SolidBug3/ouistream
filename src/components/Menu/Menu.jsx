
import "./Menu.css"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import useAuth from "../../supabase/auth/useAuth"
import * as auth from "../../supabase/auth/auth"
import getUser from "../../supabase/db/queries/getUser"

import useMenuText from "./useMenuText"

function Menu() {
    const [open, setOpen] = useState(false)
    const [profile, setProfile] = useState(null)

    const user = useAuth()
    const texts = useMenuText()

    useEffect(() => {
        let active = true

        if (!user?.id) {
            setProfile(null)
            return () => {
                active = false
            }
        }

        async function loadProfile() {
            try {
                const data = await getUser(user.id)

                if (active) {
                    setProfile(data)
                }
            } catch (error) {
                console.error("Could not load menu profile:", error)
            }
        }

        loadProfile()

        return () => {
            active = false
        }
    }, [user?.id])

    const profileName =
        profile?.display_name ||
        user?.user_metadata?.display_name ||
        user?.email ||
        "?"

    const profileInitial = profileName.trim().charAt(0).toUpperCase()
    const avatarUrl =
        profile?.avatar_url ||
        user?.user_metadata?.avatar_url ||
        null

    return (
        <div className="Menu">
            <button className="Menu-menu" onClick={() => setOpen(!open)}>☰</button>

            <div className={`Menu-items ${open ? "open" : ""}`}>
                <Link className="Menu-item" to="/" onClick={() => setOpen(false)}>
                    <span className="Menu-icon">⌂</span>
                    <span>{texts.home}</span>
                </Link>

                {user ? (
                    <>
                        <Link className="Menu-item" to="/profile" onClick={() => setOpen(false)}>
                            <span className="Menu-icon Menu-profile-avatar">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="" />
                                ) : (
                                    profileInitial
                                )}
                            </span>
                            <span>{texts.profile}</span>
                        </Link>

                        <Link className="Menu-item Menu-upload" to="/upload" onClick={() => setOpen(false)}>
                            <span className="Menu-icon">🎬</span>
                            <span>{texts.upload}</span>
                        </Link>

                        <Link className="Menu-item" to="/" onClick={() => {
                            setOpen(false)
                            auth.logout()
                        }}>
                            <span className="Menu-icon">↪</span>
                            <span>{texts.logout}</span>
                        </Link>
                    </>
                ) : (
                    <Link className="Menu-item" to="/" onClick={auth.login}>
                        <span className="Menu-icon">↪</span>
                        <span>{texts.login}</span>
                    </Link>
                )}
            </div>
        </div>
    )
}

export default Menu
