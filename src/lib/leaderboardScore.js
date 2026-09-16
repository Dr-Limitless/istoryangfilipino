import { ACTIVITY_VERSION } from "../data/activities.js";
export function scoreResult(result) {
  if (result?.version !== ACTIVITY_VERSION || result.vocabularyTotal !== 10 || result.wordsTotal !== 10 || result.vocabularyScore !== 10 || !result.reflectionCompleted || !["won", "failed"].includes(result.wordSearchStatus)) throw new Error("Tapusin muna ang mga bagong gawain.");
  const words = Number(result.wordsFound);
  if (!Number.isInteger(words) || words < 0 || words > 10) throw new Error("Hindi wasto ang bilang ng salita.");
  return { score: 10 + words, timeUsed: Math.max(0, Math.min(600, Math.round(Number(result.timeUsed) || 0))) };
}
export function isBetterScore(next, previous) {
  return !previous || next.score > previous.score || (next.score === previous.score && next.timeUsed < previous.timeUsed);
}
