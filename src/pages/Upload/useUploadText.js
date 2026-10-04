
import { useEffect, useState } from "react"

import getText from "../../supabase/db/queries/getText"

function useUploadText() {
    const [texts, setTexts] = useState({})

    useEffect(() => {
        async function load() {
            const locale = navigator.language.split("-")[0]
            const labels = [
                "upload_video",
                "upload_title",
                "upload_description",
                "upload_thumbnail",
                "upload_publish",
                "upload_actors",
                "upload_produced_by",
                "upload_add_actor",
                "upload_add_producer",
                "upload_search_person",
                "upload_use_name",
                "upload_genres",
                "upload_add_genre",
                "upload_search_genre",
                "upload_uploading",
                "upload_complete",
                "upload_failed"
            ]

            const result = {}

            for (const label of labels) {
                let value = await getText(label, locale)

                if (!value && locale !== "en") {
                    value = await getText(label, "en")
                }

                result[label.replace("upload_", "")] = value
            }

            setTexts(result)
        }

        load()
    }, [])

    return texts
}

export default useUploadText
