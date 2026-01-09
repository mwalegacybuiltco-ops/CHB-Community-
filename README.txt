Canine Haven Boutique Community — Tabs Layout (no Guides)

WHAT YOU ASKED FOR
- FB-style tabs: Discussion, Featured, Events, Media, Files, People
- Removed Guides tab
- Kept Sign In (simple device-based, no passwords)

SETUP
1) Create Google Form for posts:
   Display Name (required)
   Channel dropdown: Announcements, New Drops, Pup Pics, Questions, Reviews / Wins
   Post (Paragraph, required)
   Photo Link (optional)
   Rules checkbox (required)

2) In the responses Sheet add columns:
   status (APPROVED / HIDDEN)
   pinned (TRUE / FALSE)

3) Publish responses tab as CSV and paste into config.js:
   FEED_CSV_URL

4) Paste your links into config.js:
   POST_FORM_URL
   SHOP_URL (optional)
   EVENTS_URL (optional)
   FILES_URL (optional)

FEATURED / MEDIA / PEOPLE
- Featured = pinned posts (pinned=TRUE)
- Media = posts with Photo Link
- People = unique names pulled from posts

DEPLOY
Upload files to GitHub repo root and enable GitHub Pages.


AFFILIATE MENU (1–5) WIRED TO LINKS
- Open config.js and paste your links under MENU_URLS:
  start, training, vault, mediaAssets, links
- If a link is not added, the app will show a prompt telling you what to paste.

MOBILE
- Tap ☰ Menu to open/close the side menu on mobile.
