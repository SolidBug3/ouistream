import "./SidePanel.css"

import useAuth from "../../supabase/auth/useAuth"
import * as auth from "../../supabase/auth/auth"

function SidePanel() {
    const user = useAuth()

    return (
        <div className="SidePanel">
            <div className="SidePanel-item">⌂</div>
            <div className="SidePanel-item">▶</div>
            <div className="SidePanel-item">♡</div>

            {user ? (<>
                <div className="SidePanel-item" >⚙</div>
                <div className="SidePanel-item" onClick={auth.logout}>↪</div>
            </>) : (
                <div className="SidePanel-item" onClick={auth.login}>⚙</div>
            )}
        </div>
    )
}

export default SidePanel