import "./SearchBar.css"

function SearchBar() {
    return (
        <div className="SearchBar">
            <span className="SearchBar-icon">⌕</span>
            <input type="text" placeholder="Rechercher..." />
        </div>
    )
}

export default SearchBar