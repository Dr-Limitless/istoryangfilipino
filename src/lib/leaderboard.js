import { getAuth, signInAnonymously } from "firebase/auth";
import { collection, doc, getDocs, limit, orderBy, query, runTransaction, serverTimestamp, where } from "firebase/firestore";
import { scoreResult, isBetterScore } from "./leaderboardScore";
import app, { db } from "../firebase";
import { getStoryContent, STORY_ACTIVITIES } from "../data/activities";
export const leaderboardEnabled = import.meta.env.VITE_LEADERBOARD_ENABLED === "true";
export function storyKey(video) {
  const content = getStoryContent(video);
  return Object.keys(STORY_ACTIVITIES).find(key => STORY_ACTIVITIES[key] === content);
}
export { scoreResult, isBetterScore } from "./leaderboardScore";
export async function readLeaderboard(story) {
  if (!leaderboardEnabled) return [];
  const snapshot = await getDocs(query(collection(db, "leaderboardV2"), where("story", "==", story), orderBy("score", "desc"), orderBy("timeUsed", "asc"), limit(30)));
  return snapshot.docs.map(row => ({ id: row.id, ...row.data() }));
}
export async function publishScore(video, result, nickname) {
  if (!leaderboardEnabled) throw new Error("Hindi pa nakabukas ang talaan.");
  nickname = nickname.trim();
  if (nickname.length < 2 || nickname.length > 24) throw new Error("Gumamit ng palayaw na may 2–24 na karakter.");
  const next = scoreResult(result);
  const auth = getAuth(app);
  await auth.authStateReady();
  const user = auth.currentUser || (await signInAnonymously(auth)).user;
  const story = storyKey(video);
  const ref = doc(db, "leaderboardV2", `${user.uid}_${story}`);
  const improved = await runTransaction(db, async transaction => {
    const existing = await transaction.get(ref);
    const better = isBetterScore(next, existing.exists() ? existing.data() : null);
    if (better) transaction.set(ref, { ...next, nickname, story, uid: user.uid, version: 2, updatedAt: serverTimestamp() });
    else transaction.update(ref, { nickname, updatedAt: serverTimestamp() });
    return better;
  });
  window.dispatchEvent(new Event("leaderboard-updated"));
  return improved;
}
