# Technical Spec

## Stack

Static HTML/CSS/JS.

## Active source directory

`website/`

## Required implementation files

- `website/index.html`
- `website/styles.css`
- `website/script.js`
- `website/robots.txt`
- `website/sitemap.xml`
- `website/site.webmanifest`
- `website/data/site-config.json`
- `website/assets/owner-crystal-bruce.jpeg`

## Chatbot

Build a static frontend FAQ chatbot. No API key. No external model call. Future API integration must use backend/serverless proxy, never a frontend-exposed secret.

## Form

Use email-intent/static behavior in first build. Include honeypot, labels, validation, and privacy microcopy.

## Vercel

Recommended root directory: `website/`. For static site, no build command required; output is the directory root.

## Performance

Minimal JS, compressed images, lazy-load non-critical images, no heavy dependencies.
