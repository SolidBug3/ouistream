import "./Content.css"

function Content({ title, icon, children }) {
    return (
        <section className="Content-section">
            <div className="Content-header">
                <div className="Content-icon">{icon}</div>
                <div className="Content-title">{title}</div>
            </div>

            <div className="Content">
                {children}
            </div>
        </section>
    )
}

export default Content