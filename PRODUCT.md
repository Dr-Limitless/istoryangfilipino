# Storyang Filipino

## Confirmed product facts

A public learning website for three stories: Ang Ama, Bangkang Papel and Pamana. The repository uses React/Vite, Firebase video metadata, browser-local activity progress and an existing anonymous Google Form submission. Hostinger hosts the deployed site. There is no video-upload interface.

The user confirmed on 2026-09-15 that each story should have **10 vocabulary items and 10 word-search words**, adding five to each existing activity. The client has not yet supplied approved additional content. The user requested a **shared leaderboard using nicknames**, a **new-user guide**, **Tagalog interface copy**, and a UI enhancement using Impeccable. Activities remain available whether or not the video has finished.

## Learner path

Choose a story → optionally watch or use QR → match ten vocabulary words → search for ten words within ten minutes, with two hints → write a reflection → see the result → optionally publish points under a nickname. Timed-out learners may retry or continue to reflection. Complete all three stories' activities to access a locally generated certificate.

## Release dependencies

Additional activity items are drafts in CONTENT_REVIEW.md; they are based on existing themes, not verified against film scripts. Shared scoring is implemented but disabled until LEADERBOARD_SETUP.md is completed in the existing Firebase project. Firebase service setup and real multi-browser scoring have not been validated against production. The user rejected the initial UI replacement and requested preservation of the original UI, plus an animated first-visit manual. Client review remains pending.

## Data boundaries

Answers and certificate names are local to the browser. Existing Google Form submissions contain reflection and activity results without learner names/emails. Leaderboard participation is opt-in and stores only nickname, bounded points/time, story, anonymous Firebase UID, version and timestamp. No fake public scores should appear. Browser-calculated scores are suitable for participation, not authoritative examination grading.
