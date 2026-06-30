// Fallback / sample data.
//
// The app reads from the Firestore collection "videos" first. If that
// collection is empty (e.g. on first run, before the 3 real videos have
// been added), it falls back to this local array so the site is never
// blank during development.
//
// To add your real videos, create documents in Firestore with this same
// shape — see README.md for the exact steps. Replace `videoUrl` with a
// direct file URL (Firebase Storage) or a YouTube watch/embed URL, and
// `thumbnail` with a direct image URL (e.g. from DigitalOcean Spaces).

export const placeholderVideos = [
  {
    id: "unang-sigaw",
    episode: 1,
    title: "Ang Unang Sigaw",
    era: "1896",
    duration: "—",
    description:
      "Sample placeholder lang ito. Palitan ng tunay na kasaysayan, deskripsyon, at video link mula sa inyong Firestore collection.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://picsum.photos/seed/unang-sigaw/640/360",
  },
  {
    id: "buwan-ng-bayani",
    episode: 2,
    title: "Buwan ng mga Bayani",
    era: "1898",
    duration: "—",
    description:
      "Sample placeholder lang ito. Palitan ng tunay na kasaysayan, deskripsyon, at video link mula sa inyong Firestore collection.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://picsum.photos/seed/buwan-ng-bayani/640/360",
  },
  {
    id: "mula-sa-abo",
    episode: 3,
    title: "Mula sa Abo",
    era: "1986",
    duration: "—",
    description:
      "Sample placeholder lang ito. Palitan ng tunay na kasaysayan, deskripsyon, at video link mula sa inyong Firestore collection.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://picsum.photos/seed/mula-sa-abo/640/360",
  },
];