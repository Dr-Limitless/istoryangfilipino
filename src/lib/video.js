const YOUTUBE_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
const GOOGLE_DRIVE_RE = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([\w-]+)/;

export function getYouTubeId(url = "") {
  const match = url.match(YOUTUBE_RE);
  return match ? match[1] : null;
}

export function isYouTubeUrl(url = "") {
  return Boolean(getYouTubeId(url));
}

export function toYouTubeEmbed(url = "") {
  const id = getYouTubeId(url);
  const origin = typeof window !== "undefined" ? `&origin=${encodeURIComponent(window.location.origin)}` : "";
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1${origin}` : url;
}

export function getGoogleDriveId(url = "") {
  const match = url.match(GOOGLE_DRIVE_RE);
  return match ? match[1] : null;
}

export function isGoogleDriveUrl(url = "") {
  return Boolean(getGoogleDriveId(url));
}

export function toGoogleDriveEmbed(url = "") {
  const id = getGoogleDriveId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : url;
}

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export function toRoman(n) {
  return ROMAN[n] || String(n);
}

export function shareUrlFor(videoId) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/video/${videoId}`;
}
