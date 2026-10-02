import "./Card.css"

function Card({ title, produced, actors, image, duration, ecritPar }) {
    return (
        <div className="Card">
            <div className="Card-image" style={{ backgroundImage: `url(${image})` }}>
                <div className="Card-overlay"></div>

                <div className="Card-duration">{duration}</div>

                <div className="Card-info">
                    <div className="Card-title">{title}</div>

                    <div className="Card-author">
                        Écrit par {ecritPar.join(", ")}
                    </div>

                    <div className="Card-line"></div>

                    <div className="Card-meta">
                        <div>Produit par {produced}</div>
                        <div>Avec {actors.join(", ")}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Card