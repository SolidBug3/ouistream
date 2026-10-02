import "./User.css"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import Menu from "../../components/Menu/Menu"

import getUser from "../../supabase/db/queries/getUser"

import ProfileCard from "../../components/ProfileCard/ProfileCard"

function User() {
    const { id } = useParams()
    const [user, setUser] = useState(null)

    useEffect(() => { getUser(id).then(setUser) }, [id])

    return (
        <div className="User">
            <Menu />

            <div className="Content">
                {user && <ProfileCard user={user} />}
            </div>
        </div>
    )
}

export default User