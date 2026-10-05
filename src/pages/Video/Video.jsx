
import "./Video.css"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../../supabase/supabase"

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remaining = Math.floor(seconds % 60)

    return `${minutes}:${String(remaining).padStart(2, "0")}`
}

function Video() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [valid, setValid] = useState(false)
    const [playing, setPlaying] = useState(false)
    const [progress, setProgress] = useState(18)
    const [quality, setQuality] = useState("1080p")
    const [showInfo, setShowInfo] = useState(false)

    const duration = 768
    const currentTime = Math.round(duration * progress / 100)

    useEffect(() => {
        let active = true

        async function checkVideo() {
            const { data, error } = await supabase
                .from("videos")
                .select("id")
                .eq("id", id)
                .maybeSingle()

            if (!active) return

            if (error || !data) {
                navigate("/", { replace: true })
                return
            }

            setValid(true)
        }

        checkVideo()

        return () => {
            active = false
        }
    }, [id, navigate])

    if (!valid) return null

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
                        <div className="Video-placeholder">
                            <div className="Video-placeholder-glow" />
                            <div className="Video-placeholder-content">
                                <span className="Video-placeholder-icon">▶</span>
                                <span>Video preview</span>
                            </div>
                        </div>

                        <div className="Video-controls">
                            <div className="Video-seek">
                                <span className="Video-time">{formatTime(currentTime)}</span>

                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progress}
                                    onChange={(event) => setProgress(Number(event.target.value))}
                                    aria-label="Seek video"
                                    style={{ "--seek-progress": `${progress}%` }}
                                />

                                <span className="Video-time">{formatTime(duration)}</span>
                            </div>

                            <div className="Video-control-row">
                                <div className="Video-control-left">
                                    <button
                                        className="Video-control-button Video-play"
                                        onClick={() => setPlaying(!playing)}
                                        aria-label={playing ? "Pause" : "Play"}
                                    >
                                        {playing ? "Ⅱ" : "▶"}
                                    </button>

                                    <span className="Video-control-label">
                                        {playing ? "Playing preview" : "Preview paused"}
                                    </span>
                                </div>

                                <div className="Video-control-right">
                                    <label className="Video-quality">
                                        <span>Quality</span>
                                        <select
                                            value={quality}
                                            onChange={(event) => setQuality(event.target.value)}
                                            aria-label="Video quality"
                                        >
                                            <option value="Auto">Auto</option>
                                            <option value="1080p">1080p</option>
                                            <option value="720p">720p</option>
                                            <option value="480p">480p</option>
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
                                <h1>Video title</h1>
                            </div>

                            <span className="Video-status">Preview</span>
                        </div>

                        <p className="Video-description">
                            This is a placeholder video page. Video playback and real
                            information will be connected once the streaming pipeline
                            is ready.
                        </p>

                        <div className="Video-meta">
                            <span>Uploaded by <strong>Ouistream user</strong></span>
                            <span>12:48</span>
                            <span>ID: {id}</span>
                        </div>
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
                            <span>▶</span>
                        </div>

                        <h3>Video title</h3>
                        <p className="Video-info-description">
                            Video description will appear here once the video data is
                            connected to the database.
                        </p>

                        <div className="Video-info-divider" />

                        <div className="Video-info-item">
                            <span>Uploader</span>
                            <strong>Ouistream user</strong>
                        </div>

                        <div className="Video-info-item">
                            <span>Duration</span>
                            <strong>12:48</strong>
                        </div>

                        <div className="Video-info-item">
                            <span>Video ID</span>
                            <strong>{id}</strong>
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
