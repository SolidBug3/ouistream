import "./Profile.css"

import { useEffect, useState } from "react"

import Menu from "../../components/Menu/Menu"

import useAuth from "../../supabase/auth/useAuth"
import getUser from "../../supabase/db/queries/getUser"

import ProfileCard from "../../components/ProfileCard/ProfileCard"

function Profile() {
    const authUser = useAuth()
    const [user, setUser] = useState(null)

    useEffect(() => { if (!authUser) { return } getUser(authUser.id).then(setUser) }, [authUser])

    return (
        <div className="Profile">
            <Menu />

            <div className="Content">
                {user && <ProfileCard user={user} />}
            </div>
        </div>
    )
}

export default Profile