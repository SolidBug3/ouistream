
import "./Upload.css"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { supabase } from "../../supabase/supabase"
import getUsers from "../../supabase/db/queries/getUsers"
import useAuth from "../../supabase/auth/useAuth"
import handleThumbnail from "./handleThumbnail"
import handleUploadSubmit from "./handleUploadSubmit"
import handleVideo from "./handleVideo"
import uploadVideo from "./uploadVideo.js"
import PersonSelector from "./PersonSelector.jsx"
import GenreSelector from "./GenreSelector.jsx"
import useUploadText from "./useUploadText"

function Upload() {
    const texts = useUploadText()
    const navigate = useNavigate()
    const loggedUser = useAuth()

    const [users, setUsers] = useState([])
    const [genreOptions, setGenreOptions] = useState([])
    const [selectedGenres, setSelectedGenres] = useState([""])
    const [video, setVideo] = useState(null)
    const [thumbnail, setThumbnail] = useState(null)
    const [thumbnailUrl, setThumbnailUrl] = useState(null)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [actors, setActors] = useState([{ userId: null, name: "" }])
    const [producers, setProducers] = useState([{ userId: null, name: "" }])
    const [invalid, setInvalid] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [complete, setComplete] = useState(false)
    const [uploadError, setUploadError] = useState("")

    useEffect(() => {
        if (window.innerWidth <= 900) {
            navigate("/")
        }
    }, [navigate])

    useEffect(() => {
        async function loadUsers() {
            try {
                const result = await getUsers()
                setUsers(Array.isArray(result) ? result : [])
            } catch (error) {
                console.error("Could not load users:", error)
            }
        }

        loadUsers()
    }, [])

    useEffect(() => {
        async function loadGenres() {
            try {
                const locale = navigator.language.split("-")[0]

                const { data: locales, error: localeError } = await supabase
                    .from("locale")
                    .select("id, code")
                    .in("code", [locale, "en"])

                if (localeError) throw localeError

                const availableLocales = locales || []
                const currentLocale = availableLocales.find(item => item.code === locale)
                    || availableLocales.find(item => item.code === "en")

                if (!currentLocale) {
                    throw new Error("Could not find a supported locale")
                }

                const { data: genres, error: genreError } = await supabase
                    .from("genre")
                    .select("id")
                    .order("id", { ascending: true })

                if (genreError) throw genreError

                if (!genres?.length) {
                    setGenreOptions([])
                    return
                }

                const labels = genres.map(genre => `genre_${genre.id}`)
                const localeIds = availableLocales.map(item => item.id)

                const { data: translations, error: translationError } = await supabase
                    .from("translation")
                    .select("label, locale_id, value")
                    .in("label", labels)
                    .in("locale_id", localeIds)

                if (translationError) throw translationError

                const englishLocale = availableLocales.find(item => item.code === "en")

                setGenreOptions(genres.map(genre => {
                    const label = `genre_${genre.id}`

                    const translation = translations?.find(item =>
                        item.label === label && item.locale_id === currentLocale.id
                    ) || translations?.find(item =>
                        item.label === label && item.locale_id === englishLocale?.id
                    )

                    return {
                        id: String(genre.id),
                        name: translation?.value || `Genre ${genre.id}`
                    }
                }))
            } catch (error) {
                console.error("Could not load genres:", error)
            }
        }

        loadGenres()
    }, [])

    function updateActor(index, value) {
        const values = [...actors]
        values[index] = value
        setActors(values)
    }

    function updateProducer(index, value) {
        const values = [...producers]
        values[index] = value
        setProducers(values)
    }

    function updateGenre(index, value) {
        const values = [...selectedGenres]
        values[index] = value
        setSelectedGenres(values)
    }

    async function submitUpload(event) {
        const valid = handleUploadSubmit(event, video, title, thumbnail)
        setInvalid(!valid)

        if (!valid || !loggedUser?.id || uploading) return

        setUploading(true)
        setUploadError("")
        setProgress(0)

        try {
            await uploadVideo({
                userId: loggedUser.id,
                video,
                thumbnail,
                title,
                description,
                actors,
                producers,
                genres: selectedGenres.filter(Boolean),
                onProgress: setProgress
            })

            setProgress(100)
            setComplete(true)
            setTimeout(() => navigate("/profile"), 1500)
        } catch (error) {
            const details = [
                error?.message,
                error?.details,
                error?.hint,
                error?.code ? `Code: ${error.code}` : ""
            ]
                .filter(value => typeof value === "string" && value.trim())
                .join(" | ")

            console.error("Video upload failed:", {
                name: error?.name,
                message: error?.message,
                code: error?.code,
                status: error?.status,
                details: error?.details,
                hint: error?.hint,
                error
            })

            setUploadError(details || "Unknown upload error")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="Upload">
            {uploading || complete ? (
                <div className="Upload-progress">
                    {complete ? (
                        <>
                            <div className="Upload-progress-icon">✓</div>
                            <h2>{texts.complete}</h2>
                        </>
                    ) : (
                        <>
                            <div className="Upload-progress-icon">🎬</div>
                            <h2>{texts.uploading}</h2>
                            <div className="Upload-progress-bar">
                                <div
                                    className="Upload-progress-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="Upload-progress-percent">
                                {Math.floor(progress)}%
                            </span>
                        </>
                    )}
                </div>
            ) : (
                <form className="Upload-form" onSubmit={submitUpload}>
                    {uploadError && (
                        <div className="Upload-error">
                            <div>{texts.failed}</div>
                            <span>{uploadError}</span>
                        </div>
                    )}

                    <div className={`Upload-video ${invalid && !video ? "invalid" : ""}`}>
                        <div className="Upload-video-icon">🎬</div>

                        {video ? (
                            <>
                                <span className="Upload-video-name">{video.name}</span>
                                <span className="Upload-video-size">
                                    {(video.size / 1024 / 1024).toFixed(1)} MB
                                </span>
                            </>
                        ) : (
                            <span>{texts.video}</span>
                        )}

                        <input
                            type="file"
                            accept="video/*"
                            onChange={(event) => {
                                handleVideo(event, setVideo)
                                setInvalid(false)
                                setUploadError("")
                            }}
                        />
                    </div>

                    <label className="Upload-field">
                        <span>{texts.title}</span>
                        <input
                            className={invalid && !title.trim() ? "invalid" : ""}
                            type="text"
                            value={title}
                            onChange={(event) => {
                                setTitle(event.target.value)
                                setInvalid(false)
                                setUploadError("")
                            }}
                        />
                    </label>

                    <label className="Upload-field">
                        <span>{texts.description}</span>
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                        />
                    </label>

                    <div className="Upload-person">
                        <span className="Upload-person-title">{texts.actors}</span>

                        {actors.map((actor, index) => (
                            <PersonSelector
                                key={index}
                                users={users}
                                value={actor}
                                placeholder={texts.search_person}
                                onChange={(value) => updateActor(index, value)}
                            />
                        ))}

                        <button
                            className="Upload-person-add"
                            type="button"
                            onClick={() =>
                                setActors([...actors, { userId: null, name: "" }])
                            }
                        >
                            + {texts.add_actor}
                        </button>
                    </div>

                    <div className="Upload-person">
                        <span className="Upload-person-title">{texts.produced_by}</span>

                        {producers.map((producer, index) => (
                            <PersonSelector
                                key={index}
                                users={users}
                                value={producer}
                                placeholder={texts.search_person}
                                onChange={(value) => updateProducer(index, value)}
                            />
                        ))}

                        <button
                            className="Upload-person-add"
                            type="button"
                            onClick={() =>
                                setProducers([...producers, { userId: null, name: "" }])
                            }
                        >
                            + {texts.add_producer}
                        </button>
                    </div>

                    <div className="Upload-person">
                        <span className="Upload-person-title">{texts.genres}</span>

                        {selectedGenres.map((genreId, index) => (
                            <GenreSelector
                                key={index}
                                genres={genreOptions.filter(genre =>
                                    !selectedGenres.some((selected, selectedIndex) =>
                                        selectedIndex !== index && selected === genre.id
                                    )
                                )}
                                value={genreId}
                                placeholder={texts.search_genre}
                                onChange={(value) => updateGenre(index, value)}
                            />
                        ))}

                        <button
                            className="Upload-person-add"
                            type="button"
                            onClick={() => setSelectedGenres([...selectedGenres, ""])}
                            disabled={selectedGenres.some(genre => !genre)}
                        >
                            + {texts.add_genre}
                        </button>
                    </div>

                    <label className={`Upload-thumbnail ${invalid && !thumbnail ? "invalid" : ""}`}>
                        <span>{texts.thumbnail}</span>

                        <div className="Upload-thumbnail-preview">
                            {thumbnailUrl ? (
                                <img src={thumbnailUrl} alt="" />
                            ) : (
                                <span>🖼️</span>
                            )}
                        </div>

                        {thumbnail && (
                            <span className="Upload-thumbnail-name">
                                {thumbnail.name}
                            </span>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            required
                            onChange={(event) => {
                                handleThumbnail(event, setThumbnail, setThumbnailUrl)
                                setInvalid(false)
                                setUploadError("")
                            }}
                        />
                    </label>

                    <button
                        className="Upload-submit"
                        type="submit"
                        disabled={uploading}
                    >
                        {texts.publish}
                    </button>
                </form>
            )}
        </div>
    )
}

export default Upload
