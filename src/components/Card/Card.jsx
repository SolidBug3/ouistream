import "./Card.css"

function Card({ title, produced, actors, image, duration }) {
    return (
        <div className="Card">
            <div className="Card-image" style={{ backgroundImage: `url(${image})` }}>
                <div className="Card-info">
                    <div className="Card-title">{title}</div>
                </div>

                <div className="Card-duration">{duration}</div>
            </div>

            <div className="Card-details">
                <div className="Card-produced">Produit par <span>{produced}</span></div>
                <div className="Card-actors">Avec {actors.join(", ")}</div>
            </div>
        </div>
    )
}

export default Card