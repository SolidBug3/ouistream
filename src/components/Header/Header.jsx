import "./Header.css";

import Logo from "../Logo/Logo"
import Searchbar from "../Searchbar/Searchbar"

function Header() {
    return (
        <div className="Header" >
            <span className="logo-helper"><Logo /><span className="logo-text">uïvox</span></span>
            <Searchbar />
        </div>
    );
}

export default Header;