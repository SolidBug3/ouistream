import { Navigate } from "react-router-dom"

import useAuth from "../../supabase/auth/useAuth"

function Profile() {
    const user = useAuth()

    if (!user) {
        return null
    }

    return <Navigate to={`/user/${user.id}`} replace />
}

export default Profile