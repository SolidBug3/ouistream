
import { useEffect, useRef, useState } from "react"

function PersonSelector({ users, value, onChange, placeholder }) {
    const [query, setQuery] = useState(value?.name || "")
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        setQuery(value?.name || "")
    }, [value?.name, value?.userId])

    useEffect(() => {
        function handleClick(event) {
            if (!ref.current?.contains(event.target)) {
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClick)

        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const filteredUsers = users.filter((user) =>
        user.name?.toLowerCase().includes(query.toLowerCase())
    )

    function handleInput(event) {
        const inputValue = event.target.value

        setQuery(inputValue)
        setOpen(true)

        onChange({
            userId: null,
            name: inputValue
        })
    }

    function selectUser(user) {
        setQuery(user.name)
        setOpen(false)

        onChange({
            userId: user.id,
            name: user.name
        })
    }

    function selectExternal() {
        const name = query.trim()

        if (!name) return

        setQuery(name)
        setOpen(false)

        onChange({
            userId: null,
            name
        })
    }

    return (
        <div className="PersonSelector" ref={ref}>
            <input
                type="text"
                value={query}
                placeholder={placeholder}
                onChange={handleInput}
                onFocus={() => setOpen(true)}
            />

            {open && query.trim() && (
                <div className="PersonSelector-options">
                    {filteredUsers.map((user) => (
                        <button
                            key={user.id}
                            type="button"
                            className="PersonSelector-option"
                            onClick={() => selectUser(user)}
                        >
                            {user.avatar_url ? (
                                <img
                                    className="PersonSelector-avatar"
                                    src={user.avatar_url}
                                    alt=""
                                    onError={(event) => {
                                        event.currentTarget.style.display = "none"
                                    }}
                                />
                            ) : (
                                <span className="PersonSelector-avatar-fallback">
                                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                            )}

                            <span>{user.name}</span>
                        </button>
                    ))}

                    <button
                        type="button"
                        className="PersonSelector-external"
                        onClick={selectExternal}
                    >
                        {`Use "${query.trim()}"`}
                    </button>
                </div>
            )}
        </div>
    )
}

export default PersonSelector
