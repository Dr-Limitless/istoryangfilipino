const FORM_RESPONSE_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdiC7GsWMw92cy3u0v8RKS40uf6pOPiZ1Qd_2DTcqKMzR3Cdw/formResponse";

const FIELDS = {
  storyTitle: "entry.1738287728",
  reflection: "entry.1268409971",
  vocabularyScore: "entry.1954316721",
  wordSearchResult: "entry.676296476",
  attempts: "entry.307615432",
  completionTime: "entry.1106961319",
  anonymousReference: "entry.1145902532",
};

function formatDuration(seconds = 0) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
  const remainder = Math.floor(safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export function createAnonymousReference() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function submitAnonymousActivityResult(video, result) {
  const body = new URLSearchParams({
    [FIELDS.storyTitle]: video.title,
    [FIELDS.reflection]: result.reflectionText,
    [FIELDS.vocabularyScore]: `${result.vocabularyScore}/${result.vocabularyTotal}`,
    [FIELDS.wordSearchResult]: result.wordSearchStatus === "won" ? "Nakapasa" : "Time Out",
    [FIELDS.attempts]: String(result.attempts),
    [FIELDS.completionTime]: formatDuration(result.timeUsed),
    [FIELDS.anonymousReference]: result.submissionReference,
  });

  await fetch(FORM_RESPONSE_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body,
  });
}
