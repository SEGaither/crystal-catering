# Polished Pours with Crystal — Website Build Package

Version: v0.1

## Execution chain

ChatGPT creates this single zip package. The user unzips it and creates/opens the local repo. Claude Code TUI works inside the local repo, reads the package, completes the static landing-page build, then the local repo is used to populate GitHub. Vercel builds/deploys from GitHub.

## Project

Polished Pours with Crystal is a public-facing, SEO-ready landing page for a private event bartender and beverage service operated by Crystal Bruce.

## Known facts

- Owner: Crystal Bruce
- Service area: Alabama, Tennessee, Mississippi, Georgia
- Service: private event bartender and beverage service for host-supplied beverages
- Event types: weddings, corporate events, private parties, special celebrations
- Phone: 256-614-2510
- Email: cbruce.dce@gmail.com
- Stack: Static HTML/CSS/JS
- Site type: landing page only to start
- Tone: upscale
- Primary CTA: Request an Event Quote
- Secondary CTA: Check My Event Date
- Domain: https://www.cbbeveragecatering.com

## Claim boundary

Do not claim alcohol service, licensing, insurance, certifications, testimonials, reviews, awards, prices, venue approval, guaranteed availability, or guaranteed outcomes unless the owner later supplies verification.

Crystal provides bartender labor, setup support, and guest-focused beverage service for host-supplied beverages. Alcohol, if served, is supplied by the host or venue, not by the business.

## How to use this package

1. Unzip this package.
2. Initialize or open the unzipped folder as the local repo.
3. Run Claude Code TUI from the repo root.
4. Instruct Claude Code to read `README.md`, `repo_manifest.json`, `planning/`, `documentation/`, and `claude_prompts/`.
5. Claude Code should build implementation files inside `website/`.
6. After local QA, populate/push GitHub from this local repo.
7. Deploy from GitHub through Vercel.
