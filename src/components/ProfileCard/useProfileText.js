import { useEffect, useState } from "react"

import getText from "../../supabase/db/queries/getText"

function useProfileCardText() {
    const [texts, setTexts] = useState({
        save: null
    })

    useEffect(() => {
        const locale = navigator.language.split("-")[0]

        getText("save", locale).then(save => { setTexts({ save }) }) }, [])

    return texts
}

export default useProfileCardText