
require("dotenv").config()

const express = require("express")
const cors = require("cors")
const { randomUUID } = require("crypto")
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand
} = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const { createClient } = require("@supabase/supabase-js")
const cloudinary = require("cloudinary").v2

const app = express()
const port = process.env.PORT || 3001

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

const s3 = new S3Client({
    endpoint: process.env.FILEBASE_ENDPOINT,
    region: process.env.FILEBASE_REGION,
    credentials: {
        accessKeyId: process.env.FILEBASE_ACCESS_KEY,
        secretAccessKey: process.env.FILEBASE_SECRET_KEY
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    forcePathStyle: true
})

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://solidbug3.github.io"
    ],
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json())

function getToken(req) {
    const authorization = req.headers.authorization

    if (!authorization?.startsWith("Bearer ")) return null

    return authorization.slice(7)
}

function getUserClient(token) {
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            },
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        }
    )
}

app.get("/", (req, res) => {
    res.json({ status: "Ouistream backend running" })
})

app.get("/api/cloudinary-test", async (req, res) => {
    if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
    ) {
        return res.status(503).json({
            error: "Cloudinary environment variables are missing"
        })
    }

    try {
        await cloudinary.api.ping()

        res.json({
            status: "Cloudinary connected"
        })
    } catch (error) {
        const details = {
            type: typeof error,
            name: error?.name ?? null,
            message: error?.message ?? error?.error?.message ?? String(error),
            http_code: error?.http_code ?? error?.error?.http_code ?? null,
            statusCode: error?.statusCode ?? error?.response?.statusCode ?? null,
            code: error?.code ?? null,
            keys: error && typeof error === "object"
                ? Object.keys(error)
                : []
        }

        console.error("Cloudinary connection error:", details)

        res.status(502).json({
            error: "Could not connect to Cloudinary"
        })
    }
})

app.post("/api/upload-url", async (req, res) => {
    try {
        const token = getToken(req)

        if (!token) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return res.status(401).json({ error: "Invalid session" })
        }

        const { kind, fileName, contentType } = req.body

        if (!["video", "thumbnail"].includes(kind)) {
            return res.status(400).json({ error: "Invalid file type" })
        }

        if (
            typeof fileName !== "string" ||
            typeof contentType !== "string" ||
            (kind === "video" && !contentType.startsWith("video/")) ||
            (kind === "thumbnail" && !contentType.startsWith("image/"))
        ) {
            return res.status(400).json({ error: "Invalid file details" })
        }

        const extension = fileName.includes(".")
            ? fileName.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "")
            : ""

        const key = `${user.id}/${randomUUID()}/${kind}${extension ? `.${extension}` : ""}`

        const command = new PutObjectCommand({
            Bucket: process.env.FILEBASE_BUCKET,
            Key: key,
            ContentType: contentType
        })

        const uploadUrl = await getSignedUrl(s3, command, {
            expiresIn: 300
        })

        res.json({
            uploadUrl,
            key,
            contentType
        })
    } catch (error) {
        console.error("Upload URL error:", {
            name: error?.name,
            message: error?.message,
            code: error?.code,
            statusCode: error?.$metadata?.httpStatusCode
        })

        res.status(500).json({
            error: "Could not create upload URL"
        })
    }
})

app.post("/api/process-video", async (req, res) => {
    try {
        const token = getToken(req)

        if (!token) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return res.status(401).json({ error: "Invalid session" })
        }

        const { videoId, sourceKey } = req.body

        if (
            typeof videoId !== "string" ||
            typeof sourceKey !== "string" ||
            !videoId.trim() ||
            !sourceKey.startsWith(`${user.id}/`)
        ) {
            return res.status(400).json({ error: "Invalid video details" })
        }

        const userSupabase = getUserClient(token)

        const { data: video, error: videoError } = await userSupabase
            .from("videos")
            .select("id, user_id, source_path, status")
            .eq("id", videoId)
            .eq("user_id", user.id)
            .maybeSingle()

        if (videoError) {
            console.error("Video lookup error:", videoError)

            return res.status(500).json({
                error: "Could not verify video ownership"
            })
        }

        if (!video || video.source_path !== sourceKey) {
            return res.status(404).json({ error: "Video not found" })
        }

        if (video.status === "ready") {
            return res.json({
                status: "ready",
                message: "Video is already processed"
            })
        }

        if (
            !process.env.FILEBASE_BUCKET ||
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return res.status(503).json({
                error: "Storage or Cloudinary configuration is missing"
            })
        }

        const sourceUrl = await getSignedUrl(
            s3,
            new GetObjectCommand({
                Bucket: process.env.FILEBASE_BUCKET,
                Key: sourceKey
            }),
            {
                expiresIn: 3600
            }
        )

        const publicId = `ouistream/${videoId}`

        const { error: updateError } = await userSupabase
            .from("videos")
            .update({ status: "processing" })
            .eq("id", videoId)
            .eq("user_id", user.id)

        if (updateError) {
            console.error("Video status update error:", updateError)

            return res.status(500).json({
                error: "Could not update video status"
            })
        }

        const cloudinaryResult = await cloudinary.uploader.upload(
            sourceUrl,
            {
                public_id: publicId,
                resource_type: "video",
                overwrite: true,
                eager: [
                    {
                        streaming_profile: "full_hd",
                        format: "m3u8"
                    }
                ],
                eager_async: true
            }
        )

        res.json({
            status: "processing",
            videoId,
            cloudinaryPublicId: cloudinaryResult.public_id,
            message: "Video sent to Cloudinary for processing"
        })
    } catch (error) {
        console.error("Video processing error:", {
            name: error?.name,
            message: error?.message,
            http_code: error?.http_code,
            code: error?.code
        })

        res.status(500).json({
            error: "Could not start video processing"
        })
    }
})

app.listen(port, () => {
    console.log(`Ouistream backend running on port ${port}`)
})
