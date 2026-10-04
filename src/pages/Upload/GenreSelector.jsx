
import { useEffect, useRef, useState } from "react"

function GenreSelector({ genres, value, onChange, placeholder }) {
    const [query, setQuery] = useState("")
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    const selectedGenre = genres.find(genre => genre.id === value)

    useEffect(() => {
        if (selectedGenre) setQuery(selectedGenre.name)
        else if (!value) setQuery("")
    }, [value, selectedGenre?.name])

    useEffect(() => {
        function handleClick(event) {
            if (!ref.current?.contains(event.target)) {
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClick)

        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const filteredGenres = genres.filter(genre =>
        genre.name.toLowerCase().includes(query.toLowerCase())
    )

    function handleInput(event) {
        const inputValue = event.target.value

        setQuery(inputValue)
        setOpen(true)

        if (value) onChange("")
    }

    function selectGenre(genre) {
        setQuery(genre.name)
        setOpen(false)
        onChange(genre.id)
    }

    return (
        <div className="PersonSelector" ref={ref}>
            <input
                type="text"
                value={query}
                placeholder={placeholder}
                onChange={handleInput}
                onFocus={() => setOpen(true)}
            />

            {open && (
                <div className="PersonSelector-options">
                    {filteredGenres.map(genre => (
                        <button
                            key={genre.id}
                            type="button"
                            className="PersonSelector-option"
                            onClick={() => selectGenre(genre)}
                        >
                            <span>{genre.name}</span>
                        </button>
                    ))}

                    {filteredGenres.length === 0 && (
                        <button
                            type="button"
                            className="PersonSelector-external"
                            disabled
                        >
                            {texts?.no_genres || "No genres found"}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default GenreSelector
