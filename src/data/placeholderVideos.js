// Local fallback data used when the Firestore `videos` collection is empty.
// The entries intentionally mirror the three stories in the activity system.

export const placeholderVideos = [
  {
    id: "ang-ama",
    episode: 1,
    title: "Ang Ama",
    era: "Kwentong Filipino",
    duration: "—",
    description:
      "Isang kuwentong tumatalakay sa pagmamahal, pagsisisi, galit, at kapatawaran sa loob ng pamilya.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://picsum.photos/seed/ang-ama/640/360",
  },
  {
    id: "bangkang-papel",
    episode: 2,
    title: "Bangkang Papel",
    era: "Kwentong Filipino",
    duration: "—",
    description:
      "Isang paglalakbay sa pangarap, alaala, kabataan, at kalayaang sinasagisag ng munting bangkang papel.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://picsum.photos/seed/bangkang-papel/640/360",
  },
  {
    id: "pamana",
    episode: 3,
    title: "Pamana",
    era: "Kwentong Filipino",
    duration: "—",
    description:
      "Isang kuwentong nagbibigay-halaga sa lupain, pagsasaka, kabuhayan, kasipagan, at pag-asa.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://picsum.photos/seed/pamana/640/360",
  },
];
