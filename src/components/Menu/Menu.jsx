import "./Menu.css"

import { useState } from "react"
import { Link } from "react-router-dom"

function Menu() {
    const [open, setOpen] = useState(false)

    return (
        <div className="Menu">
            <button className="Menu-menu" onClick={() => setOpen(!open)}>☰</button>

            {open && (
                <div className="Menu-items">
                    <Link className="Menu-item" to="/" onClick={() => setOpen(false)}>
                        <span className="Menu-icon">⌂</span>
                        <span>Accueuil</span>
                    </Link>

                    <Link className="Menu-item" to="/Profile" onClick={() => setOpen(false)}>
                        <span className="Menu-icon">♡</span>
                        <span>Profil</span>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default Menu