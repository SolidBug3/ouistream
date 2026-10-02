import "./Header.css";

import { useLocation } from "react-router-dom";

import Logo from "../Logo/Logo"
import Panel from "../Panel/Panel"
import Searchbar from "../Searchbar/Searchbar"

function Header() {
    const location = useLocation()

    return (
        <div className="Header">
            <span className="logo-helper"><Logo /><span className="logo-text">uïvox</span></span>
            <Panel />
            {location.pathname === "/" && <Searchbar />}
        </div>
    );
}

export default Header;