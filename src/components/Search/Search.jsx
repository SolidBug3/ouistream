import "./Search.css"

import { useEffect, useState } from "react"

import getGenres from "../../supabase/db/queries/getGenres"

function Search({ value, onChange, filter, onFilterChange }) {
    const [genres, setGenres] = useState([])

    useEffect(() => { getGenres().then(setGenres) }, [])

    return (
        <div className="Search">
            <div className="Search-input">
                <span className="Search-icon">⌕</span>

                <input
                    type="text"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="Rechercher une pièce..."
                />
            </div>

            <select value={filter} onChange={(event) => onFilterChange(event.target.value)}>
                <option value="all">Tous les genres</option>

                {genres.map((genre) => (
                    <option key={genre.id} value={genre.id}>
                        {genre.name}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default Search