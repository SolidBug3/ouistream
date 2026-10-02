import "./Panel.css"

import { useState } from "react"
import { Link } from "react-router-dom"

import useAuth from "../../supabase/auth/useAuth"
import * as auth from "../../supabase/auth/auth"

function Panel() {
    const user = useAuth()
    const [open, setOpen] = useState(false)

    return (
        <div className="Panel">
            <button className="Panel-menu" onClick={() => setOpen(!open)}>☰</button>
            <div className={`Panel-items ${open ? "open" : ""}`}>
                <Link className="Panel-item" to="/" onClick={() => setOpen(false)}>⌂</Link>
                {user ? (<>
                    <Link className="Panel-item" to="/profile" onClick={() => setOpen(false)}>⚙</Link>
                    <div className="Panel-item" onClick={() => { setOpen(false); auth.logout() }}>x</div>
                </>) : (
                    <div className="Panel-item" onClick={() => { setOpen(false); auth.login() }}>⚙</div>
                )}
            </div>
        </div>
    )
}

export default Panel