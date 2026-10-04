
require("dotenv").config()

const { S3Client, PutBucketCorsCommand } = require("@aws-sdk/client-s3")

const s3 = new S3Client({
    endpoint: "https://s3.filebase.io",
    region: "auto",
    credentials: {
        accessKeyId: process.env.FILEBASE_ACCESS_KEY,
        secretAccessKey: process.env.FILEBASE_SECRET_KEY
    }
})

async function configureCors() {
    try {
        await s3.send(new PutBucketCorsCommand({
            Bucket: process.env.FILEBASE_BUCKET,
            CORSConfiguration: {
                CORSRules: [{
                    AllowedOrigins: ["http://localhost:5173"],
                    AllowedMethods: ["GET", "PUT", "HEAD"],
                    AllowedHeaders: ["*"],
                    ExposeHeaders: ["ETag", "x-amz-request-id"],
                    MaxAgeSeconds: 3000
                }]
            }
        }))

        console.log("Filebase CORS configured successfully.")
    } catch (error) {
        console.error("CORS configuration failed:", error)
    }
}

configureCors()
