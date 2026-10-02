import db from "../db"

async function getGenres() {
    const locale = navigator.language.split("-")[0]

    const { data: genres, error: genreError } = await db
        .from("genre")
        .select("id")
        .order("id")

    if (genreError) {
        throw genreError
    }

    const labels = genres.map(genre => `genre_${genre.id}`)

    let { data: translations, error: translationError } = await db
        .from("translation")
        .select("label, value, locale!inner(code)")
        .in("label", labels)
        .eq("locale.code", locale)

    if (translationError) {
        throw translationError
    }

    if (!translations || translations.length === 0) {
        const result = await db
            .from("translation")
            .select("label, value, locale!inner(code)")
            .in("label", labels)
            .eq("locale.code", "en")

        if (result.error) {
            throw result.error
        }

        translations = result.data
    }

    return genres.map(genre => ({
        id: genre.id,
        name: translations.find(
            translation => translation.label === `genre_${genre.id}`
        )?.value
    }))
}

export default getGenres