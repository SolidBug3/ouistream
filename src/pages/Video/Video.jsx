
import "./Video.css"

import Hls from "hls.js"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../../supabase/supabase"

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00"

    const minutes = Math.floor(seconds / 60)
    const remaining = Math.floor(seconds % 60)

    return `${minutes}:${String(remaining).padStart(2, "0")}`
}

async function getTranslations(labels, locale) {
    if (labels.length === 0) return {}

    const { data, error } = await supabase
        .from("translation")
        .select("label, value, locale!inner(code)")
        .in("label", labels)

    if (error) {
        console.error("Could not load video translations:", error)
        return {}
    }

    const translations = {}

    for (const label of labels) {
        const matches = data?.filter(row => row.label === label) || []

        const translation =
            matches.find(row => row.locale.code === locale) ||
            matches.find(row => row.locale.code === "en") ||
            matches[0]

        translations[label] = translation?.value || ""
    }

    return translations
}

function Video() {
    const { id } = useParams()
    const navigate = useNavigate()

    const videoRef = useRef(null)
    const hlsRef = useRef(null)

    const [video, setVideo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)

    const [playing, setPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [quality, setQuality] = useState("Auto")
    const [qualities, setQualities] = useState([])
    const [playbackError, setPlaybackError] = useState(null)
    const [showInfo, setShowInfo] = useState(false)

    const progress = duration > 0
        ? Math.min((currentTime / duration) * 100, 100)
        : 0

    useEffect(() => {
        let active = true

        async function loadVideo() {
            setLoading(true)
            setLoadError(null)

            const { data: videoData, error: videoError } = await supabase
                .from("videos")
                .select("id, user_id, locale, stream_path, thumbnail_url, status, published")
                .eq("id", id)
                .maybeSingle()

            if (!active) return

            if (videoError) {
                console.error("Could not load video:", videoError)
                setLoadError("Unable to load this video.")
                setLoading(false)
                return
            }

            if (!videoData) {
                navigate("/", { replace: true })
                return
            }

            const [
                { data: actorRows, error: actorError },
                { data: producerRows, error: producerError },
                { data: genreRows, error: genreError }
            ] = await Promise.all([
                supabase
                    .from("video_actors")
                    .select("user_id, name")
                    .eq("video_id", id),

                supabase
                    .from("video_producers")
                    .select("user_id, name")
                    .eq("video_id", id),

                supabase
                    .from("video_genres")
                    .select("genre_id")
                    .eq("video_id", id)
            ])

            if (!active) return

            if (actorError) console.error("Could not load actors:", actorError)
            if (producerError) console.error("Could not load producers:", producerError)
            if (genreError) console.error("Could not load genres:", genreError)

            const actors = actorRows || []
            const producers = producerRows || []
            const genres = genreRows || []

            const locale = videoData.locale || navigator.language.split("-")[0]

            const translationLabels = [
                `video_${id}_title`,
                `video_${id}_description`,
                ...genres.map(genre => `genre_${genre.genre_id}`)
            ]

            const userIds = [...new Set([
                videoData.user_id,
                ...actors.map(actor => actor.user_id),
                ...producers.map(producer => producer.user_id)
            ].filter(Boolean))]

            const [
                translations,
                { data: users, error: usersError }
            ] = await Promise.all([
                getTranslations(translationLabels, locale),

                userIds.length > 0
                    ? supabase
                        .from("users")
                        .select("id, display_name, avatar_url")
                        .in("id", userIds)
                    : Promise.resolve({ data: [], error: null })
            ])

            if (!active) return

            if (usersError) console.error("Could not load user profiles:", usersError)

            const userMap = new Map(
                (users || []).map(user => [user.id, user])
            )

            const uploader = userMap.get(videoData.user_id)

            setVideo({
                ...videoData,
                title: translations[`video_${id}_title`] || "Untitled video",
                description: translations[`video_${id}_description`] || "",
                uploader: uploader?.display_name || "Ouistream user",
                uploaderAvatar: uploader?.avatar_url || null,
                actors: actors.map(actor => ({
                    name: actor.name || userMap.get(actor.user_id)?.display_name
                })).filter(actor => actor.name),
                producers: producers.map(producer => ({
                    name: producer.name || userMap.get(producer.user_id)?.display_name
                })).filter(producer => producer.name),
                genres: genres.map(genre => ({
                    id: genre.genre_id,
                    name: translations[`genre_${genre.genre_id}`] || null
                })).filter(genre => genre.name)
            })

            setLoading(false)
        }

        loadVideo()

        return () => {
            active = false
        }
    }, [id, navigate])

    useEffect(() => {
        const media = videoRef.current
        const streamUrl = video?.stream_path

        if (!media || !streamUrl) return

        let hls = null
        setPlaybackError(null)
        setQualities([])
        setQuality("Auto")

        if (media.canPlayType("application/vnd.apple.mpegurl")) {
            media.src = streamUrl
        } else if (Hls.isSupported()) {
            hls = new Hls()
            hlsRef.current = hls

            const updateQualities = () => {
                const heights = [...new Set(
                    hls.levels
                        .map(level => level.height)
                        .filter(height => Number.isFinite(height) && height > 0)
                )].sort((a, b) => b - a)

                setQualities(heights)
            }

            hls.on(Hls.Events.MANIFEST_PARSED, updateQualities)
            hls.on(Hls.Events.LEVELS_UPDATED, updateQualities)

            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    console.error("HLS playback error:", data)
                    setPlaybackError("Unable to play this video stream.")
                    setPlaying(false)
                }
            })

            hls.loadSource(streamUrl)
            hls.attachMedia(media)
        } else {
            setPlaybackError("HLS playback is not supported by this browser.")
        }

        return () => {
            if (hls) {
                hls.destroy()
                if (hlsRef.current === hls) hlsRef.current = null
            }

            media.pause()
            media.removeAttribute("src")
            media.load()
        }
    }, [video?.stream_path])

    async function togglePlayback() {
        const media = videoRef.current

        if (!media || !video?.stream_path) return

        if (media.paused) {
            try {
                await media.play()
                setPlaybackError(null)
            } catch (error) {
                console.error("Playback could not start:", error)
                setPlaybackError("Unable to start video playback.")
            }
        } else {
            media.pause()
        }
    }

    function seekVideo(value) {
        const media = videoRef.current
        if (!media || !Number.isFinite(media.duration)) return

        media.currentTime = Number(value)
        setCurrentTime(media.currentTime)
    }

    function changeQuality(value) {
        setQuality(value)

        const hls = hlsRef.current
        if (!hls) return

        if (value === "Auto") {
            hls.currentLevel = -1
            return
        }

        const height = Number.parseInt(value, 10)
        const levelIndex = hls.levels.findIndex(level => level.height === height)

        if (levelIndex !== -1) {
            hls.currentLevel = levelIndex
        }
    }

    if (loading) return null

    if (loadError) {
        return (
            <div className="Video Video-message">
                <p>{loadError}</p>
                <button onClick={() => navigate(-1)}>Go back</button>
            </div>
        )
    }

    if (!video) return null

    const hasStream = Boolean(video.stream_path)
    const statusLabel = video.status === "ready"
        ? "Ready"
        : video.status === "failed"
            ? "Failed"
            : "Processing"

    return (
        <div className="Video">
            <header className="Video-header">
                <button className="Video-back" onClick={() => navigate(-1)}>
                    <span>←</span>
                    <span>Back</span>
                </button>

                <div className="Video-logo">
                    Ou<span>i</span>stream
                </div>

                <div className="Video-header-space" />
            </header>

            <main className={`Video-content ${showInfo ? "with-info" : ""}`}>
                <section className="Video-main">
                    <div className="Video-player">
                        {hasStream ? (
                            <video
                                ref={videoRef}
                                className="Video-media"
                                poster={video.thumbnail_url || undefined}
                                playsInline
                                preload="metadata"
                                onClick={togglePlayback}
                                onPlay={() => setPlaying(true)}
                                onPause={() => setPlaying(false)}
                                onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
                                onLoadedMetadata={event => {
                                    const value = event.currentTarget.duration
                                    setDuration(Number.isFinite(value) ? value : 0)
                                }}
                                onDurationChange={event => {
                                    const value = event.currentTarget.duration
                                    setDuration(Number.isFinite(value) ? value : 0)
                                }}
                                onError={() => {
                                    setPlaybackError("Unable to load the video stream.")
                                    setPlaying(false)
                                }}
                            />
                        ) : (
                            <div className="Video-placeholder">
                                {video.thumbnail_url && (
                                    <img
                                        className="Video-placeholder-image"
                                        src={video.thumbnail_url}
                                        alt=""
                                    />
                                )}
                                <div className="Video-placeholder-overlay" />
                                <div className="Video-placeholder-content">
                                    <span className="Video-placeholder-icon">▶</span>
                                    <span>
                                        {video.status === "failed"
                                            ? "Video processing failed"
                                            : "Video is processing"}
                                    </span>
                                </div>
                            </div>
                        )}

                        {hasStream && !playing && (
                            <button
                                className="Video-center-play"
                                onClick={togglePlayback}
                                aria-label="Play video"
                            >
                                ▶
                            </button>
                        )}

                        {playbackError && (
                            <div className="Video-playback-error">
                                {playbackError}
                            </div>
                        )}

                        <div className="Video-controls">
                            <div className="Video-seek">
                                <span className="Video-time">
                                    {formatTime(currentTime)}
                                </span>

                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 0}
                                    step="0.1"
                                    value={Math.min(currentTime, duration || 0)}
                                    onChange={event => seekVideo(event.target.value)}
                                    disabled={!hasStream || duration <= 0}
                                    aria-label="Seek video"
                                    style={{ "--seek-progress": `${progress}%` }}
                                />

                                <span className="Video-time">
                                    {formatTime(duration)}
                                </span>
                            </div>

                            <div className="Video-control-row">
                                <div className="Video-control-left">
                                    <button
                                        className="Video-control-button Video-play"
                                        onClick={togglePlayback}
                                        disabled={!hasStream}
                                        aria-label={playing ? "Pause" : "Play"}
                                    >
                                        {playing ? "Ⅱ" : "▶"}
                                    </button>

                                    <span className="Video-control-label">
                                        {hasStream
                                            ? playing ? "Playing" : "Paused"
                                            : statusLabel}
                                    </span>
                                </div>

                                <div className="Video-control-right">
                                    <label className="Video-quality">
                                        <span>Quality</span>
                                        <select
                                            value={quality}
                                            onChange={event => changeQuality(event.target.value)}
                                            aria-label="Video quality"
                                            disabled={!hasStream}
                                        >
                                            <option value="Auto">Auto</option>
                                            {qualities.map(height => (
                                                <option key={height} value={`${height}p`}>
                                                    {height}p
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <button
                                        className={`Video-control-button Video-info-button ${showInfo ? "active" : ""}`}
                                        onClick={() => setShowInfo(!showInfo)}
                                        aria-label="Toggle video information"
                                        title="Video information"
                                    >
                                        i
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="Video-details">
                        <div className="Video-title-row">
                            <div>
                                <span className="Video-category">FEATURED VIDEO</span>
                                <h1>{video.title}</h1>
                            </div>

                            <span className="Video-status">{statusLabel}</span>
                        </div>

                        {video.description && (
                            <p className="Video-description">
                                {video.description}
                            </p>
                        )}

                        <div className="Video-meta">
                            <span>
                                Uploaded by <strong>{video.uploader}</strong>
                            </span>
                            {duration > 0 && (
                                <span>{formatTime(duration)}</span>
                            )}
                            <span>ID: {video.id}</span>
                        </div>

                        {video.genres.length > 0 && (
                            <div className="Video-tags">
                                {video.genres.map(genre => (
                                    <span key={genre.id}>{genre.name}</span>
                                ))}
                            </div>
                        )}

                        {video.actors.length > 0 && (
                            <div className="Video-people">
                                <span>Actors</span>
                                <strong>{video.actors.map(actor => actor.name).join(", ")}</strong>
                            </div>
                        )}

                        {video.producers.length > 0 && (
                            <div className="Video-people">
                                <span>Produced by</span>
                                <strong>{video.producers.map(producer => producer.name).join(", ")}</strong>
                            </div>
                        )}
                    </div>
                </section>

                {showInfo && (
                    <aside className="Video-info">
                        <div className="Video-info-header">
                            <h2>Information</h2>
                            <button
                                onClick={() => setShowInfo(false)}
                                aria-label="Close information"
                            >
                                ×
                            </button>
                        </div>

                        <div className="Video-info-thumbnail">
                            {video.thumbnail_url ? (
                                <img src={video.thumbnail_url} alt="" />
                            ) : (
                                <span>▶</span>
                            )}
                        </div>

                        <h3>{video.title}</h3>

                        {video.description && (
                            <p className="Video-info-description">
                                {video.description}
                            </p>
                        )}

                        <div className="Video-info-divider" />

                        <div className="Video-info-item">
                            <span>Uploader</span>
                            <strong>{video.uploader}</strong>
                        </div>

                        {duration > 0 && (
                            <div className="Video-info-item">
                                <span>Duration</span>
                                <strong>{formatTime(duration)}</strong>
                            </div>
                        )}

                        <div className="Video-info-item">
                            <span>Status</span>
                            <strong>{statusLabel}</strong>
                        </div>

                        {video.actors.length > 0 && (
                            <div className="Video-info-item">
                                <span>Actors</span>
                                <strong>{video.actors.map(actor => actor.name).join(", ")}</strong>
                            </div>
                        )}

                        {video.producers.length > 0 && (
                            <div className="Video-info-item">
                                <span>Produced by</span>
                                <strong>{video.producers.map(producer => producer.name).join(", ")}</strong>
                            </div>
                        )}

                        {video.genres.length > 0 && (
                            <div className="Video-info-item">
                                <span>Genres</span>
                                <strong>{video.genres.map(genre => genre.name).join(", ")}</strong>
                            </div>
                        )}

                        <div className="Video-info-item">
                            <span>Video ID</span>
                            <strong>{video.id}</strong>
                        </div>

                        <div className="Video-info-item">
                            <span>Quality</span>
                            <strong>{quality}</strong>
                        </div>
                    </aside>
                )}
            </main>
        </div>
    )
}

export default Video
