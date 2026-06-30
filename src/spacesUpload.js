// lib/spacesUpload.js
//
// Two-step upload: ask the backend for a presigned URL, then PUT the file
// straight to DigitalOcean Spaces from the browser. The secret key never
// leaves the server.

export async function uploadVideoFile(file, episodeId, adminKey) {
  const presignRes = await fetch("/api/spaces-presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey,
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      episodeId,
    }),
  });

  if (!presignRes.ok) {
    const { error } = await presignRes.json().catch(() => ({}));
    throw new Error(error || "Hindi nakuha ang upload URL.");
  }

  const { uploadUrl, cdnUrl } = await presignRes.json();

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!putRes.ok) {
    throw new Error("Nabigo ang pag-upload sa DigitalOcean Spaces.");
  }

  // this is what you store on the video document as videoUrl / posterUrl
  return cdnUrl;
}
