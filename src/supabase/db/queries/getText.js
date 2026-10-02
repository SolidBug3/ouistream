import { supabase } from "../../supabase"

async function getText(label, locale) {
    const { data, error } = await supabase
        .from("translation")
        .select("value, locale!inner(code)")
        .eq("label", label)
        .eq("locale.code", locale)
        .single()

    if (error) {
        console.error(error)
        return null
    }

    return data.value
}

export default getText