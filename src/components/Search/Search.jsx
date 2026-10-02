import "./Search.css"

function Search({ value, onChange, filter, onFilterChange }) {
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
                <option value="comedy">Comédie</option>
                <option value="horror">Horreur</option>
                <option value="drama">Drame</option>
                <option value="thriller">Thriller</option>
                <option value="romance">Romance</option>
                <option value="action">Action</option>
                <option value="fantasy">Fantastique</option>
            </select>
        </div>
    )
}

export default Search