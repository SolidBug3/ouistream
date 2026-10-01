import { useEffect, useState } from "react"

import { supabase } from "../supabase"
import * as auth from "./auth"

function useAuth() {
    const [user, setUser] = useState(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null)
        })

        const { data } = auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => data.subscription.unsubscribe()
    }, [])

    return user
}

export default useAuth