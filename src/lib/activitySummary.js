import { getStoryContent } from "../data/activities.js";
import { loadActivityProgress, loadVideoProgress } from "./progress.js";
export function activitySummary(video) {
  const watched = loadVideoProgress(video.id);
  const activity = loadActivityProgress(video.id);
  const content = getStoryContent(video);
  const vocabularyCount = content.vocabulary.filter(({word}) => activity?.matchedVocabulary?.includes(word)).length;
  const wordFinished = ["won", "failed"].includes(activity?.gameStatus);
  const reflection = (activity?.reflection?.trim().length || 0) >= 20;
  const completed = Boolean(activity?.completed && vocabularyCount === content.vocabulary.length && wordFinished && reflection);
  const percent = Math.round((vocabularyCount / content.vocabulary.length + Number(wordFinished) + Number(reflection)) / 3 * 100);
  return { watched, activity, percent, completed, vocabularyCount, vocabularyTotal: content.vocabulary.length };
}
