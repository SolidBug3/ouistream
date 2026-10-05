
import "./User.css"
import "../../components/Content.css"

import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import Menu from "../../components/Menu/Menu"
import getUser from "../../supabase/db/queries/getUser"
import getVideos from "../../supabase/db/queries/getVideos"
import ProfileCard from "../../components/ProfileCard/ProfileCard"
import Card from "../../components/Card/Card"

const PAGE_SIZE = 10

function formatDuration(seconds) {
    if (seconds == null || !Number.isFinite(Number(seconds))) return "--:--"

    seconds = Math.floor(Number(seconds))

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

function User() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [user, setUser] = useState(null)
    const [videos, setVideos] = useState([])
    const [translations, setTranslations] = useState({})
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    useEffect(() => {
        let active = true

        async function loadUser() {
            try {
                const result = await getUser(id)

                if (active) {
                    setUser(result)
                }
            } catch (error) {
                console.error("Could not load user:", error)

                if (active) {
                    setUser(null)
                }
            }
        }

        loadUser()

        return () => {
            active = false
        }
    }, [id])

    useEffect(() => {
        let active = true

        async function loadVideos() {
            setLoading(true)
            setVideos([])
            setPage(1)

            try {
                const locale = navigator.language.split("-")[0]
                const result = await getVideos(locale)

                if (!active) return

                const userVideos = result.videos
                    .filter(video => video.user_id === id)
                    .sort((a, b) =>
                        new Date(b.created_at) - new Date(a.created_at)
                    )

                setVideos(userVideos)
                setTranslations(result.translations)
            } catch (error) {
                console.error("Could not load user videos:", error)

                if (active) {
                    setVideos([])
                    setTranslations({})
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        loadVideos()

        return () => {
            active = false
        }
    }, [id])

    const pageCount = Math.max(1, Math.ceil(videos.length / PAGE_SIZE))

    const pageVideos = useMemo(() => {
        return videos.slice(
            (page - 1) * PAGE_SIZE,
            page * PAGE_SIZE
        )
    }, [videos, page])

    function t(label, fallback) {
        return translations[`home_${label}`] || fallback
    }

    function openVideo(videoId) {
        navigate(`/video/${videoId}`, {
            state: { from: `/user/${id}` }
        })
    }

    function renderCards(items) {
        return items.map(video => (
            <div
                key={video.id}
                className="User-card"
                onClick={() => openVideo(video.id)}
                onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        openVideo(video.id)
                    }
                }}
                role="button"
                tabIndex={0}
            >
                <Card
                    title={video.title}
                    produced={video.producers.map(producer => producer.name).join(", ")}
                    actors={video.actors.map(actor => actor.name)}
                    image={video.thumbnail_url}
                    duration={formatDuration(video.duration)}
                    ecritPar={video.producers.map(producer => producer.name)}
                />
            </div>
        ))
    }

    return (
        <div className="User">
            <Menu />

            <div className="Content">
                {user && <ProfileCard user={user} />}

                <section className="User-videos">
                    <h2 className="User-videos-title">
                        {t("all_videos", "Videos")}
                    </h2>

                    {loading ? (
                        <p className="User-message">
                            {t("loading", "Loading videos...")}
                        </p>
                    ) : pageVideos.length > 0 ? (
                        <>
                            <div className="User-videos-grid">
                                {renderCards(pageVideos)}
                            </div>

                            {pageCount > 1 && (
                                <div className="User-pagination">
                                    <button
                                        type="button"
                                        disabled={page === 1}
                                        onClick={() => setPage(current => current - 1)}
                                    >
                                        {t("previous", "Previous")}
                                    </button>

                                    <span>
                                        {t("page", "Page")} {page} / {pageCount}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={page === pageCount}
                                        onClick={() => setPage(current => current + 1)}
                                    >
                                        {t("next", "Next")}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="User-message">
                            {t("empty", "No videos found.")}
                        </p>
                    )}
                </section>
            </div>
        </div>
    )
}

export default User
