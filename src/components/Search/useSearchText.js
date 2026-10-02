import { useEffect, useState } from "react"

import getText from "../../supabase/db/queries/getText"

function useSearchText() {
    const [texts, setTexts] = useState({})

    useEffect(() => {
        async function load() {
            const locale = navigator.language.split("-")[0]

            let searchPlaceholder = await getText("search_placeholder", locale)
            let allGenres = await getText("all_genres", locale)

            if (!searchPlaceholder && locale !== "en") {
                searchPlaceholder = await getText("search_placeholder", "en")
            }

            if (!allGenres && locale !== "en") {
                allGenres = await getText("all_genres", "en")
            }

            setTexts({
                searchPlaceholder,
                allGenres
            })
        }

        load()
    }, [])

    return texts
}

export default useSearchText