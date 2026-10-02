import "./Menu.css"

import { useState } from "react"
import { Link } from "react-router-dom"

import useAuth from "../../supabase/auth/useAuth"
import * as auth from "../../supabase/auth/auth"

import useMenuText from "./useMenuText"

function Menu() {
    const [open, setOpen] = useState(false)
    const user = useAuth()
    const texts = useMenuText()

    return (
        <div className="Menu">
            <button className="Menu-menu" onClick={() => setOpen(!open)}>☰</button>

            <div className={`Menu-items ${open ? "open" : ""}`}>
                <Link className="Menu-item" to="/" onClick={() => setOpen(false)}>
                    <span className="Menu-icon">⌂</span>
                    <span>{texts.home}</span>
                </Link>

                {user ? (<>
                    <Link className="Menu-item" to="/profile" onClick={() => setOpen(false)}>
                        <span className="Menu-icon">👤</span>
                        <span>{texts.profile}</span>
                    </Link>

                    <Link className="Menu-item" onClick={auth.logout}>
                        <span className="Menu-icon">↪</span>
                        <span>{texts.logout}</span>
                    </Link>
                </>) : (
                    <Link className="Menu-item" onClick={auth.login}>
                        <span className="Menu-icon">↪</span>
                        <span>{texts.login}</span>
                    </Link>
                )}
            </div>
        </div>
    )
}

export default Menu