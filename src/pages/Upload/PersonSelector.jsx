import { useEffect, useRef, useState } from "react"

function PersonSelector({ users, value, onChange, placeholder }) {
    const [query, setQuery] = useState(value?.name || "")
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        function handleClick(event) {
            if (!ref.current?.contains(event.target)) {
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClick)

        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))

    function handleInput(event) {
        const value = event.target.value

        setQuery(value)
        setOpen(true)

        onChange({
            userId: null,
            name: value
        })
    }

    function selectUser(user) {
        setQuery(user.name)
        setOpen(false)

        onChange({
            userId: user.id,
            name: null
        })
    }

    function selectExternal() {
        const name = query.trim()

        if (!name) {
            return
        }

        setQuery(name)
        setOpen(false)

        onChange({
            userId: null,
            name
        })
    }

    return (
        <div className="PersonSelector" ref={ref}>
            <input type="text" value={query} placeholder={placeholder} onChange={handleInput} onFocus={() => setOpen(true)} />

            {open && query.trim() && (
                <div className="PersonSelector-options">
                    {filteredUsers.map((user) => (
                        <button key={user.id} type="button" onClick={() => selectUser(user)}>
                            {user.name}
                        </button>
                    ))}

                    <button type="button" className="PersonSelector-external" onClick={selectExternal}>
                        {`Use "${query.trim()}"`}
                    </button>
                </div>
            )}
        </div>
    )
}

export default PersonSelector