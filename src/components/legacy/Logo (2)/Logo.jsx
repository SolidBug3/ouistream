import "./Logo.css"

import logo from "../../assets/images/Logo.png"

function Logo() {
    return (
        <div className="Logo">
            <img src={logo} alt="Ouistream" />
        </div>
    )
}

export default Logo