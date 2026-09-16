import { ACTIVITY_VERSION } from "../data/activities.js";
const PREFIX = "istoryang-filipino";

function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Progress saving is an enhancement; private browsing may block storage.
  }
}

function videoKey(videoId) {
  return `${PREFIX}:video:${videoId}`;
}

function activityKey(videoId) {
  return `${PREFIX}:activity:${videoId}`;
}

const learnerKey = `${PREFIX}:learner`;

export function loadVideoProgress(videoId) {
  return readJson(videoKey(videoId), { finished: false });
}

export function saveVideoProgress(videoId, progress) {
  writeJson(videoKey(videoId), progress);
}

export function loadActivityProgress(videoId) {
  const saved = readJson(activityKey(videoId), null);
  if (!saved || saved.version === ACTIVITY_VERSION) return saved;
  // Keep prior vocabulary and reflection; the enlarged puzzle has different cells.
  return { ...saved, version: ACTIVITY_VERSION, expanded: true, step: 0,
    completed: false, result: null, foundWords: [], attempts: 0,
    gameStatus: "ready", gameDeadline: null, timeRemaining: 600, hintsLeft: 2 };

}

export function saveActivityProgress(videoId, progress) {
  writeJson(activityKey(videoId), { ...progress, version: ACTIVITY_VERSION });
}

export function clearActivityProgress(videoId) {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(activityKey(videoId)); } catch { /* no-op */ }
}

export function loadLearnerProfile() {
  return readJson(learnerKey, { name: "" });
}

export function saveLearnerProfile(profile) {
  writeJson(learnerKey, { ...loadLearnerProfile(), ...profile });
}
