import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

import { supabase } from "../supabase"

function RequireAuth({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function checkAuth() {
            const { data } = await supabase.auth.getSession()

            setUser(data.session?.user ?? null)
            setLoading(false)
        }

        checkAuth()
    }, [])

    if (loading) {
        return null
    }

    if (!user) {
        return <Navigate to="/" replace />
    }

    return children
}

export default RequireAuth