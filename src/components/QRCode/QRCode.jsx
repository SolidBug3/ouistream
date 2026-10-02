import "./QRCode.css"

import { useEffect, useState } from "react"
import QRCodeGenerator from "qrcode"

function QRCode({ text }) {
    const [image, setImage] = useState(null)

    useEffect(() => {
        QRCodeGenerator.toDataURL(text, {
            width: 200,
            margin: 4,
            errorCorrectionLevel: "M"
        }).then(setImage)
    }, [text])

    if (!image) {
        return null
    }

    return (
        <div className="QRCode">
            <img src={image} alt="QR Code" />
        </div>
    )
}

export default QRCode