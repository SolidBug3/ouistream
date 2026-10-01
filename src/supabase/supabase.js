import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://pkwxkgkhcigklknlbkdj.supabase.co"
const supabaseKey = "sb_publishable_e51j1S3y4W5nUsz1cP1yHQ_o7HV8lTU"

console.log("SUPABASE URL:", window.location.href)
console.log("SUPABASE HASH:", window.location.hash)

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        flowType: "implicit",
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        debug: true
    }
})

console.log("SUPABASE CLIENT CREATED")