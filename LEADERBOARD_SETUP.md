# Shared leaderboard setup

The interface and Firebase adapter are implemented, but shared scores stay disabled until Firebase is configured. Activities, saved results and certificates work without the leaderboard.

1. In the existing `storyangfilipino` Firebase project, enable Authentication → Sign-in method → Anonymous. Add `storyang-filipino.com` and `www.storyang-filipino.com` to authorized domains if absent.
2. Review the existing Firestore rules first. Merge the `leaderboardV2` block from `firestore.rules` into them. Preserve any rules used by other applications. The included file also allows public reads of `videos`; it denies video writes from the browser.
3. Create the collection-scope composite index in `firestore.indexes.json`: `leaderboardV2`, `story` ascending, `score` descending, `timeUsed` ascending. Wait for the index to finish building.
4. If App Check is enforced, keep the deployed domain registered for the existing reCAPTCHA provider and verify anonymous auth/Firestore requests succeed. Never disable certificate checking or deploy open write rules.
5. Set GitHub repository **variable** `VITE_LEADERBOARD_ENABLED` to `true`, then build and deploy using the existing Hostinger workflow. For local development use the same flag in `.env.local` alongside the public Firebase configuration.
6. Validate with consenting test learners: publish a completed result; check it on another browser; retry with a lower score; verify the best score stays; check nickname changes. Remove test documents using the Firebase console after testing.

## Behavior and limits

Participation is opt-in after all activities are completed. Only a nickname, points, word-search time, story key, anonymous UID and timestamp are stored in the leaderboard. Reflections and certificate names remain outside it. Each browser identity has one entry per story. Scores count 10 vocabulary matches plus up to 10 found words; reflection is required but not graded. Higher scores rank first, then shorter word-search times; identical scores/times share a rank. The table fetches up to 30 rows when opened, switched or refreshed; it does not use a continual live listener.

Rules restrict writes to a learner's own entry, require bounded fields, and prevent lowering the best score. Scores are calculated in the browser: this is a classroom participation leaderboard, not a tamper-proof examination system. Learners can create another identity by clearing browser storage or changing devices. Server-verified grading would require additional infrastructure.

Firebase usage depends on the project's current plan and quotas; this implementation introduces no separate paid video-storage service. Monitor usage in the Firebase console.

References: [Anonymous authentication](https://firebase.google.com/docs/auth/web/anonymous-auth), [Firestore rules](https://firebase.google.com/docs/rules/basics), [Composite indexes](https://firebase.google.com/docs/firestore/query-data/indexing).
