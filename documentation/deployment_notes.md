# Deployment Notes

## Deployment chain

ChatGPT zip → user local repo → Claude Code local build → GitHub populated from local repo → Vercel deploys from GitHub.

## Recommended GitHub repo name

`crystals-beverage-catering-site`

## Vercel settings

Root directory: `website/`

Framework: Other/static

Build command: none

Output directory: `.` when root is `website/`

## Domain

Provisional corrected domain: `CBbeveragecatering.com`

Do not finalize canonical/sitemap production domain until availability and ownership are verified.

## Post-deploy tasks

Verify deployed URL, submit sitemap to Google Search Console and Bing Webmaster Tools, confirm robots.txt, confirm metadata, test CTAs, and check for unsupported claims.
