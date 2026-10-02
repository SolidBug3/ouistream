import "./Search.css"

import { useEffect, useState } from "react"

import getGenres from "../../supabase/db/queries/getGenres"
import useSearchText from "./useSearchText"

function Search({ value, onChange, filter, onFilterChange }) {
    const [genres, setGenres] = useState([])
    const [filterOpen, setFilterOpen] = useState(false)
    const texts = useSearchText()

    useEffect(() => { getGenres().then(setGenres) }, [])

    const selectedGenre = genres.find(genre => String(genre.id) === String(filter))

    function selectGenre(value) {
        onFilterChange(value)
        setFilterOpen(false)
    }

    return (
        <div className="Search">
            <div className="Search-input">
                <span className="Search-icon">⌕</span>

                <input
                    type="text"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={texts.searchPlaceholder}
                />
            </div>

            <div className="Search-select">
                <button
                    className="Search-select-button"
                    onClick={() => setFilterOpen(!filterOpen)}
                >
                    <span>
                        {filter === "all"
                            ? texts.allGenres
                            : selectedGenre?.name}
                    </span>

                    <span className="Search-select-arrow">⌄</span>
                </button>

                {filterOpen && (
                    <div className="Search-select-options">
                        <button
                            className="Search-select-option"
                            onClick={() => selectGenre("all")}
                        >
                            {texts.allGenres}
                        </button>

                        {genres.map((genre) => (
                            <button
                                className="Search-select-option"
                                key={genre.id}
                                onClick={() => selectGenre(genre.id)}
                            >
                                {genre.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Search