import "./Video.css"

import logo from "../../assets/images/logo.png"
import Hls from "hls.js"
import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { supabase } from "../../supabase/supabase"
import QRCode from "../../components/QRCode/QRCode"

const VOLUME_KEY = "ouistream_video_volume"
const MUTED_KEY = "ouistream_video_muted"

const INFO_LABELS = [
    "video_info_featured",
    "video_info_uploaded_by",
    "video_info_actors",
    "video_info_produced_by",
    "video_info_information",
    "video_info_close_information",
    "video_info_uploader",
    "video_info_duration",
    "video_info_status",
    "video_info_genres",
    "video_info_video_id",
    "video_info_quality",
    "video_info_share_video",
    "video_info_ready",
    "video_info_failed",
    "video_info_processing",
    "video_info_video_processing_failed",
    "video_info_video_processing",
    "video_info_playing",
    "video_info_paused",
    "video_info_back",
    "video_info_home",
    "video_info_auto",
    "video_info_play",
    "video_info_pause",
    "video_info_toggle_information",
    "video_info_untitled_video",
    "video_info_ouistream_user"
]

function getSavedVolume() {
    try {
        const saved = localStorage.getItem(VOLUME_KEY)
        if (saved === null) return 1

        const value = Number(saved)
        return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1
    } catch {
        return 1
    }
}

function getSavedMuted() {
    try {
        return localStorage.getItem(MUTED_KEY) === "true"
    } catch {
        return false
    }
}

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
    const location = useLocation()

    const videoRef = useRef(null)
    const hlsRef = useRef(null)

    const [video, setVideo] = useState(null)
    const [uiTranslations, setUiTranslations] = useState({})
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)

    const [playing, setPlaying] = useState(false)
    const [playbackStarted, setPlaybackStarted] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [quality, setQuality] = useState("Auto")
    const [qualities, setQualities] = useState([])
    const [playbackError, setPlaybackError] = useState(null)
    const [showInfo, setShowInfo] = useState(false)
    const [volume, setVolume] = useState(getSavedVolume)
    const [muted, setMuted] = useState(getSavedMuted)

    useEffect(() => {
        try {
            localStorage.setItem(VOLUME_KEY, String(volume))
            localStorage.setItem(MUTED_KEY, String(muted))
        } catch (error) {
            console.warn("Could not save sound settings:", error)
        }
    }, [volume, muted])

    useEffect(() => {
        const media = videoRef.current
        if (!media) return

        media.volume = volume
        media.muted = muted
    }, [volume, muted])

    function changeVolume(value) {
        const nextVolume = Number(value)
        setVolume(nextVolume)
        setMuted(nextVolume === 0)
    }

    function toggleMute() {
        if (muted || volume === 0) {
            setMuted(false)
            if (volume === 0) setVolume(0.5)
        } else {
            setMuted(true)
        }
    }

    function t(key, fallback) {
        return uiTranslations[`video_info_${key}`] || fallback
    }

    const from = location.state?.from
    const canGoBack = typeof from === "string" && from !== "/"

    const progress = duration > 0
        ? Math.min((currentTime / duration) * 100, 100)
        : 0

    useEffect(() => {
        let active = true

        async function loadVideo() {
            setLoading(true)
            setLoadError(null)

            if (!id || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)) {
                navigate("/", { replace: true })
                return
            }

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
                ...genres.map(genre => `genre_${genre.genre_id}`),
                ...INFO_LABELS
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

            setUiTranslations(translations)

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
        let destroyed = false

        setPlaybackError(null)
        setQualities([])
        setQuality("Auto")
        setPlaybackStarted(false)
        setPlaying(false)

        const updateQualities = () => {
            if (!hls) return

            const heights = [...new Set(
                hls.levels
                    .map(level => level.height)
                    .filter(height => Number.isFinite(height) && height > 0)
            )].sort((a, b) => b - a)

            setQualities(heights)
        }

        const onHlsError = (_, data) => {
            if (!data.fatal || destroyed) return

            console.error("Fatal HLS playback error:", data)

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad()
                return
            }

            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError()
                return
            }

            setPlaybackError("Unable to play this video stream.")
            setPlaying(false)
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            })

            hlsRef.current = hls

            hls.on(Hls.Events.MANIFEST_PARSED, updateQualities)
            hls.on(Hls.Events.LEVELS_UPDATED, updateQualities)
            hls.on(Hls.Events.ERROR, onHlsError)

            hls.attachMedia(media)
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                if (!destroyed) hls.loadSource(streamUrl)
            })
        } else if (media.canPlayType("application/vnd.apple.mpegurl")) {
            media.src = streamUrl
            media.load()
        } else {
            setPlaybackError("HLS playback is not supported by this browser.")
        }

        return () => {
            destroyed = true

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

        if (levelIndex !== -1) hls.currentLevel = levelIndex
    }

    function goBack() {
        if (canGoBack) {
            navigate(-1)
        } else {
            navigate("/")
        }
    }

    if (loading) return null

    if (loadError) {
        return (
            <div className="Video Video-message">
                <p>{loadError}</p>
                <button onClick={() => navigate("/")}>Home</button>
            </div>
        )
    }

    if (!video) return null

    const hasStream = Boolean(video.stream_path)
    const statusLabel = video.status === "ready"
        ? t("ready", "Ready")
        : video.status === "failed"
            ? t("failed", "Failed")
            : t("processing", "Processing")

    return (
        <div className="Video">
            <header className="Video-header">
                <button className="Video-back" onClick={goBack}>
                    <span>{canGoBack ? "←" : "⌂"}</span>
                    <span>{canGoBack ? t("back", "Back") : t("home", "Home")}</span>
                </button>

                <div className="Video-logo">
                    <img src={logo} alt="Ouistream" />
                </div>

                <div className="Video-header-space" />
            </header>

            <main className={`Video-content ${showInfo ? "with-info" : ""}`}>
                <section className="Video-main">
                    <div className="Video-player">
                        {hasStream ? (
                            <>
                                <video
                                    ref={videoRef}
                                    className="Video-media"
                                    crossOrigin="anonymous"
                                    playsInline
                                    preload="auto"
                                    onClick={togglePlayback}
                                    onPlay={() => {
                                        setPlaying(true)
                                        setPlaybackStarted(true)
                                        setPlaybackError(null)
                                    }}
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
                                    onEnded={() => setPlaying(false)}
                                    onError={event => {
                                        const mediaError = event.currentTarget.error
                                        console.error("Video element error:", {
                                            code: mediaError?.code,
                                            message: mediaError?.message,
                                            stream: video.stream_path
                                        })
                                        if (!playbackError) {
                                            setPlaybackError("Unable to load the video stream.")
                                        }
                                        setPlaying(false)
                                    }}
                                />

                                {!playbackStarted && video.thumbnail_url && (
                                    <img
                                        className="Video-poster-overlay"
                                        src={video.thumbnail_url}
                                        alt=""
                                    />
                                )}
                            </>
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
                                            ? t("video_processing_failed", "Video processing failed")
                                            : t("video_processing", "Video is processing")}
                                    </span>
                                </div>
                            </div>
                        )}

                        {hasStream && !playing && (
                            <button
                                className="Video-center-play"
                                onClick={togglePlayback}
                                aria-label={t("play", "Play")}
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
                                        aria-label={playing ? t("pause", "Pause") : t("play", "Play")}
                                    >
                                        {playing ? "Ⅱ" : "▶"}
                                    </button>

                                    <span className="Video-control-label">
                                        {hasStream
                                            ? playing ? t("playing", "Playing") : t("paused", "Paused")
                                            : statusLabel}
                                    </span>
                                </div>

                                <div className="Video-control-right">
                                    <div className="Video-volume">
                                        <button
                                            className="Video-control-button Video-volume-button"
                                            onClick={toggleMute}
                                            disabled={!hasStream}
                                            aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
                                            title={muted || volume === 0 ? "Unmute" : "Mute"}
                                        >
                                            {muted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
                                        </button>

                                        <input
                                            className="Video-volume-slider"
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={muted ? 0 : volume}
                                            onChange={event => changeVolume(event.target.value)}
                                            disabled={!hasStream}
                                            aria-label="Volume"
                                            style={{ "--volume-progress": `${(muted ? 0 : volume) * 100}%` }}
                                        />
                                    </div>

                                    <label className="Video-quality">
                                        <span>{t("quality", "Quality")}</span>
                                        <select
                                            value={quality}
                                            onChange={event => changeQuality(event.target.value)}
                                            aria-label="Video quality"
                                            disabled={!hasStream}
                                        >
                                            <option value="Auto">{t("auto", "Auto")}</option>
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
                                        aria-label={t("toggle_information", "Toggle video information")}
                                        title={t("information", "Video information")}
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
                                <span className="Video-category">{t("featured", "FEATURED VIDEO")}</span>
                                <h1>{video.title}</h1>
                            </div>

                            <span className="Video-status">{statusLabel}</span>
                        </div>

                        {video.description && (
                            <p className="Video-description">{video.description}</p>
                        )}

                        <div className="Video-meta">
                            <span>{t("uploaded_by", "Uploaded by")} <strong>{video.uploader}</strong></span>
                            {duration > 0 && <span>{formatTime(duration)}</span>}
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
                                <span>{t("actors", "Actors")}</span>
                                <strong>{video.actors.map(actor => actor.name).join(", ")}</strong>
                            </div>
                        )}

                        {video.producers.length > 0 && (
                            <div className="Video-people">
                                <span>{t("produced_by", "Produced by")}</span>
                                <strong>{video.producers.map(producer => producer.name).join(", ")}</strong>
                            </div>
                        )}
                    </div>
                </section>

                {showInfo && (
                    <aside className="Video-info">
                        <div className="Video-info-header">
                            <h2>{t("information", "Information")}</h2>
                            <button
                                onClick={() => setShowInfo(false)}
                                aria-label={t("close_information", "Close information")}
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
                            <span>{t("uploader", "Uploader")}</span>
                            <strong>{video.uploader}</strong>
                        </div>

                        {duration > 0 && (
                            <div className="Video-info-item">
                                <span>{t("duration", "Duration")}</span>
                                <strong>{formatTime(duration)}</strong>
                            </div>
                        )}

                        <div className="Video-info-item">
                            <span>{t("status", "Status")}</span>
                            <strong>{statusLabel}</strong>
                        </div>

                        {video.actors.length > 0 && (
                            <div className="Video-info-item">
                                <span>{t("actors", "Actors")}</span>
                                <strong>{video.actors.map(actor => actor.name).join(", ")}</strong>
                            </div>
                        )}

                        {video.producers.length > 0 && (
                            <div className="Video-info-item">
                                <span>{t("produced_by", "Produced by")}</span>
                                <strong>{video.producers.map(producer => producer.name).join(", ")}</strong>
                            </div>
                        )}

                        {video.genres.length > 0 && (
                            <div className="Video-info-item">
                                <span>{t("genres", "Genres")}</span>
                                <strong>{video.genres.map(genre => genre.name).join(", ")}</strong>
                            </div>
                        )}

                        <div className="Video-info-item">
                            <span>{t("video_id", "Video ID")}</span>
                            <strong>{video.id}</strong>
                        </div>

                        <div className="Video-info-item">
                            <span>{t("quality", "Quality")}</span>
                            <strong>{quality}</strong>
                        </div>

                        <div className="Video-info-divider" />

                        <div className="Video-info-qr">
                            <span>{t("share_video", "Share video")}</span>
                            <QRCode text={window.location.href} />
                        </div>
                    </aside>
                )}
            </main>
        </div>
    )
}

export default Video