
import "./Home.css"
import "../../components/Content.css"

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import getVideos from "../../supabase/db/queries/getVideos"

import Menu from "../../components/Menu/Menu"
import Search from "../../components/Search/Search"
import Card from "../../components/Card/Card"

const PAGE_SIZE = 10

function formatDuration(seconds) {
    if (seconds == null || !Number.isFinite(Number(seconds))) return "--:--"

    seconds = Math.floor(Number(seconds))

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

function Home() {
    const navigate = useNavigate()

    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("all")
    const [videos, setVideos] = useState([])
    const [translations, setTranslations] = useState({})
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    useEffect(() => {
        let active = true

        async function loadVideos() {
            setLoading(true)

            try {
                const locale = navigator.language.split("-")[0]
                const result = await getVideos(locale)

                if (!active) return

                setVideos(result.videos)
                setTranslations(result.translations)
            } catch (error) {
                console.error("Could not load homepage:", error)

                if (active) {
                    setVideos([])
                    setTranslations({})
                }
            } finally {
                if (active) setLoading(false)
            }
        }

        loadVideos()

        return () => {
            active = false
        }
    }, [])

    function t(label, fallback) {
        return translations[`home_${label}`] || fallback
    }

    const filteredVideos = useMemo(() => {
        const term = search.trim().toLowerCase()

        return videos.filter(video => {
            const matchesSearch = !term ||
                video.title.toLowerCase().includes(term) ||
                video.actors.some(actor =>
                    actor.name.toLowerCase().includes(term)
                ) ||
                video.producers.some(producer =>
                    producer.name.toLowerCase().includes(term)
                ) ||
                video.genres.some(genre =>
                    genre.name.toLowerCase().includes(term)
                )

            const matchesGenre = filter === "all" ||
                video.genres.some(genre => genre.id === String(filter))

            return matchesSearch && matchesGenre
        })
    }, [videos, search, filter])

    useEffect(() => {
        setPage(1)
    }, [search, filter])

    const latestVideos = filteredVideos.slice(0, 5)
    const pageCount = Math.max(1, Math.ceil(filteredVideos.length / PAGE_SIZE))
    const pageVideos = filteredVideos.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    )

    function openVideo(videoId) {
        navigate(`/video/${videoId}`, {
            state: { from: "/" }
        })
    }

    function renderCards(items) {
        return items.map(video => (
            <div
                key={video.id}
                className="Home-card"
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
        <div className="Home">
            <Menu />

            <div className="Content">
                <Search
                    value={search}
                    onChange={setSearch}
                    filter={filter}
                    onFilterChange={setFilter}
                />

                {loading ? (
                    <p className="Home-message">
                        {t("loading", "Loading videos...")}
                    </p>
                ) : (
                    <>
                        <section className="Content-section">
                            <h2 className="Content-title">
                                {t("featured", "Featured")}
                            </h2>

                            <div className="Content-grid">
                                {renderCards(latestVideos)}
                            </div>
                        </section>

                        <section className="Content-section">
                            <h2 className="Content-title">
                                {t("new_videos", "New videos")}
                            </h2>

                            <div className="Content-grid">
                                {renderCards(latestVideos)}
                            </div>
                        </section>

                        <section className="Content-section">
                            <h2 className="Content-title">
                                {t("all_videos", "All videos")}
                            </h2>

                            {pageVideos.length > 0 ? (
                                <div className="Content-grid">
                                    {renderCards(pageVideos)}
                                </div>
                            ) : (
                                <p className="Home-message">
                                    {t("empty", "No videos found.")}
                                </p>
                            )}

                            {pageCount > 1 && (
                                <div className="Home-pagination">
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
                        </section>
                    </>
                )}
            </div>
        </div>
    )
}

export default Home
