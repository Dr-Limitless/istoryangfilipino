export const STORY_VIDEO_URLS = {
  "ang-ama": "https://drive.google.com/file/d/1YTTm2F-jFl4aSE6tLP9K4Ac5wtmpVYKW/view",
  "bangkang-papel": "https://drive.google.com/file/d/1_oUZYguY4AHwPKLBBupDkMyOs7uHT3uY/view",
  pamana: "https://drive.google.com/file/d/1pK4IbwY-elsYi5rM9zvA0Bc3PDUI-4Ox/view",
};

function normalizeStory(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getStoryVideoUrl(video = {}) {
  if (STORY_VIDEO_URLS[video.id]) return STORY_VIDEO_URLS[video.id];
  const identity = normalizeStory(`${video.id || ""}${video.title || ""}`);
  if (identity.includes("angama")) return STORY_VIDEO_URLS["ang-ama"];
  if (identity.includes("bangkangpapel")) return STORY_VIDEO_URLS["bangkang-papel"];
  if (identity.includes("pamana")) return STORY_VIDEO_URLS.pamana;
  return video.videoUrl;
}
