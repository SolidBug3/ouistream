import { useEffect, useState } from "react"

function useMobile() {
    const [mobile, setMobile] = useState(window.innerWidth <= 600)

    useEffect(() => {
        function updateMobile() {
            setMobile(window.innerWidth <= 600)
        }

        window.addEventListener("resize", updateMobile)

        return () => window.removeEventListener("resize", updateMobile)
    }, [])

    return mobile
}

export default useMobile