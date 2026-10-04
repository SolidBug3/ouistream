import { useEffect, useState } from "react"

import getText from "../../supabase/db/queries/getText"

function useMenuText() {
    const [texts, setTexts] = useState({})

    useEffect(() => {
        async function load() {
            const locale = navigator.language.split("-")[0]
            const labels = ["home", "profile", "upload", "logout", "login"]
            const result = {}

            for (const label of labels) {
                let value = await getText(label, locale)

                if (!value && locale !== "en") {
                    value = await getText(label, "en")
                }

                result[label] = value
            }

            setTexts(result)
        }

        load()
    }, [])

    return texts
}

export default useMenuText