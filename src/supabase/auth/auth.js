import { supabase } from "../supabase"

export async function login() {
    const redirectTo = window.location.hostname === "localhost"
        ? "http://localhost:5173/ouistream/"
        : "https://solidbug3.github.io/ouistream/"

    return await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo
        }
    })
}

export async function logout() {
    return await supabase.auth.signOut()
}

export async function getUser() {
    const { data } = await supabase.auth.getUser()
    return data.user
}

export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
}