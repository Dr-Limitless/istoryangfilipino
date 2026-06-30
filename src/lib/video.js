const YOUTUBE_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;

export function getYouTubeId(url = "") {
  const match = url.match(YOUTUBE_RE);
  return match ? match[1] : null;
}

export function isYouTubeUrl(url = "") {
  return Boolean(getYouTubeId(url));
}

export function toYouTubeEmbed(url = "") {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : url;
}

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export function toRoman(n) {
  return ROMAN[n] || String(n);
}

export function shareUrlFor(videoId) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/video/${videoId}`;
}
