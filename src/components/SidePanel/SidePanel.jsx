import "./SidePanel.css"

import { Link } from "react-router-dom"

import useAuth from "../../supabase/auth/useAuth"
import * as auth from "../../supabase/auth/auth"

function SidePanel() {
    const user = useAuth()

    return (
        <div className="SidePanel">
            <Link className="SidePanel-item" to="/">⌂</Link>
            {user ? (<>
                <Link className="SidePanel-item" to="/profile">⚙</Link>
                <div className="SidePanel-item" onClick={auth.logout}>x</div>
            </>) : (
                <div className="SidePanel-item" onClick={auth.login}>⚙</div>
            )}
        </div>
    )
}

export default SidePanel