// api/spaces-presign.js
//
// Generates a short-lived presigned URL so video files can be uploaded
// directly from the browser to DigitalOcean Spaces, without ever exposing
// the Spaces secret key to the client.
//
// Since Istoryang Filipino has no public login system, this endpoint is
// protected by a single admin shared-secret header instead of a user auth
// token. Only you (or whoever has ADMIN_UPLOAD_KEY) should call this.

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  endpoint: `https://${process.env.DO_SPACES_REGION}.digitaloceanspaces.com`,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const adminKey = req.headers["x-admin-key"];
  if (!adminKey || adminKey !== process.env.ADMIN_UPLOAD_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileName, fileType, episodeId } = req.body || {};
  if (!fileName || !fileType || !episodeId) {
    return res.status(400).json({ error: "fileName, fileType, and episodeId are required" });
  }

  // keep object keys predictable and safe: videos/{episodeId}/{timestamp}-{name}
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const key = `videos/${episodeId}/${Date.now()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: key,
    ContentType: fileType,
    ACL: "public-read", // individual file is public even though Space listing stays restricted
  });

  try {
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes
    const cdnUrl = `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_REGION}.cdn.digitaloceanspaces.com/${key}`;

    return res.status(200).json({ uploadUrl, cdnUrl, key });
  } catch (err) {
    console.error("Spaces presign error:", err);
    return res.status(500).json({ error: "Could not generate upload URL" });
  }
}
