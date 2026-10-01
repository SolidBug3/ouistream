import { supabase } from "../supabase"

export async function login() {
    return await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: "http://localhost:5173/ouistream/"
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