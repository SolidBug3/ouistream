require("dotenv").config()

const express = require("express")
const cors = require("cors")
const { randomUUID } = require("crypto")
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const { createClient } = require("@supabase/supabase-js")

const app = express()
const port = process.env.PORT || 3001

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

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
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json())

app.get("/", (req, res) => {
    res.json({ status: "Ouistream backend running" })
})

app.post("/api/upload-url", async (req, res) => {
    try {
        const authorization = req.headers.authorization

        if (!authorization?.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        const token = authorization.slice(7)

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
            Key: key
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
        console.error("Upload URL error:", error.name, error.message)
        res.status(500).json({ error: "Could not create upload URL" })
    }
})

app.listen(port, () => {
    console.log(`Ouistream backend running at http://localhost:${port}`)
})