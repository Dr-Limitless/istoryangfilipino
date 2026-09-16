import { test } from "node:test";
import assert from "node:assert/strict";
import { getStoryVideoUrl, STORY_VIDEO_URLS } from "../src/data/storyVideoSources.js";
import { getGoogleDriveId, isGoogleDriveUrl, toGoogleDriveEmbed } from "../src/lib/video.js";

test("each story resolves to its replacement Google Drive video", () => {
  assert.equal(getStoryVideoUrl({ id: "ang-ama" }), STORY_VIDEO_URLS["ang-ama"]);
  assert.equal(getStoryVideoUrl({ id: "remote-1", title: "BANGKANG PAPEL", videoUrl: "old.mp4" }), STORY_VIDEO_URLS["bangkang-papel"]);
  assert.equal(getStoryVideoUrl({ id: "remote-2", title: "Pamana", videoUrl: "old.mp4" }), STORY_VIDEO_URLS.pamana);
});

test("Google Drive links become embeddable preview URLs", () => {
  const url = STORY_VIDEO_URLS["ang-ama"];
  assert.equal(getGoogleDriveId(url), "1YTTm2F-jFl4aSE6tLP9K4Ac5wtmpVYKW");
  assert.equal(isGoogleDriveUrl(url), true);
  assert.equal(toGoogleDriveEmbed(url), "https://drive.google.com/file/d/1YTTm2F-jFl4aSE6tLP9K4Ac5wtmpVYKW/preview");
  assert.equal(isGoogleDriveUrl("https://example.com/video.mp4"), false);
});
