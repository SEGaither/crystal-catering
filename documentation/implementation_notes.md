# Implementation Notes

## Build date

2026-04-27

## Files created

| File | Purpose |
|---|---|
| `website/index.html` | Full single-page landing site, 12 sections |
| `website/styles.css` | Mobile-first CSS, no external dependencies |
| `website/script.js` | Form validation, mailto, chatbot, mobile nav |
| `website/robots.txt` | Public crawl open; OAI-SearchBot, GPTBot, ChatGPT-User, Google-Extended permitted |
| `website/sitemap.xml` | Single URL with provisional domain |
| `website/site.webmanifest` | PWA manifest, references favicon.svg |

## Stack

Static HTML/CSS/JS. No frameworks, no build tools, no external scripts.

## Design choices

- **Palette:** deep charcoal (`#2b2723`), champagne gold (`#d6b36a`), warm cream (`#f7f2eb`), soft taupe (`#e8e1d7`). Colors derived from brand_profile.md and favicon.svg.
- **Typography:** Georgia/serif headings, system-ui sans-serif body.
- **Hero background:** CSS gradient (charcoal tones with subtle gold radial highlight). No external images in hero — CSS-only for zero external dependencies.
- **Mobile-first:** single-column layouts expand to multi-column at 600px, 640px, 700px, 800px, 900px breakpoints.
- **Anchor IDs:** `#events`, `#services`, `#meet-crystal`, `#faq`, `#quote` per site_architecture.md.
- **CTA tracking IDs:** `cta-hero-quote`, `cta-hero-date`, `cta-header-phone`, `cta-chatbot-quote`, `cta-final-quote`, `quote-form-submit` per conversion_plan.md.

## Form behavior

- **Mechanism:** email-intent (mailto). On valid submission, opens user's email client pre-filled to cbruce.dce@gmail.com.
- **Subject:** `Event Quote Request – Crystal's Beverage Catering Service`
- **Body:** all submitted fields serialized as plain text.
- **Validation:** required-field check + email format regex, front-end only.
- **Honeypot:** `company_website` field, `position: absolute; left: -9999px`, `tabindex="-1"`, `aria-hidden="true"`. Silently exits on bot submission.
- **No CAPTCHA** in first build per plan.

### Future form upgrade options

Production should replace mailto with a real form backend. Options in priority order:

1. **Vercel Serverless Function** — native to the deployment environment; handles POST, sends email via SendGrid/Resend/Nodemailer. No third-party account dependency beyond the email provider.
2. **Formspree** — drop-in; replace `action` attribute, remove mailto logic. Free tier for low volume.
3. **Web3Forms** — similar to Formspree, free tier, simple integration.
4. **EmailJS** — client-side SDK; acceptable for low volume but exposes a public key (not a secret). Requires key rotation policy.
5. **CRM/booking integration** — if the business adopts HoneyBook, Dubsado, or similar, the quote form can POST to a webhook or embedded form.

**Do not use EmailJS or similar client-exposed keys without understanding the security posture.** A Vercel serverless function is the cleanest upgrade path for this stack.

## Chatbot behavior

- **Type:** static keyword-matched FAQ widget. No API, no LLM, no external call.
- **Placement:** fixed bottom-right, floating.
- **Open/close:** toggle button + ✕ close button + Escape key.
- **Responses:** 12 keyword groups covering event types, area, quote requests, date availability, beverages, pricing, contact, and general unknowns.
- **Fallback:** unknown queries routed to quote form, phone, and email.
- **Quick-prompt buttons:** 5 pre-set prompts on first open.
- **Accessibility:** `aria-live="polite"` on message container, `aria-label` on toggle/close, Escape closes panel, focus returns to toggle on close.

### Future chatbot upgrade options

A real AI chatbot requires a backend/serverless proxy. Do NOT expose an API key in frontend JavaScript.

1. **Vercel Serverless Function** — proxy requests to Claude or OpenAI API. Key stays server-side.
2. **Hosted chatbot embed** (Intercom, Drift, Tidio) — third-party embed with own auth. Less control but faster to deploy.
3. **Claude API via Anthropic SDK** — ideal for brand-consistent, grounded responses. Requires serverless proxy. Prime candidate given this workflow's origin.

## SEO and schema

- **Title:** `Crystal's Beverage Catering Service | Private Event Beverage Catering`
- **Meta description:** 160-character optimized description from seo_plan.md.
- **H1:** one per page — `Upscale Beverage Catering for Private Events Across the South`
- **JSON-LD:** Organization + Service schema. No ratings, hours, coordinates, certifications, or alcohol claims.
- **Open Graph:** og:title, og:description, og:type, og:url (provisional), og:image, og:image:alt, og:site_name.
- **Twitter Card:** summary_large_image.
- **Canonical:** provisional domain. Update when domain is confirmed.
- **FAQ:** rendered in semantic HTML `<details>`/`<summary>` — visible to search crawlers.
- **Image alt text:** all images have descriptive alt text.

## Assets used

- `website/assets/owner-crystal-bruce.jpeg` — user-supplied portrait. Used in Meet Crystal section.
- `website/assets/favicon.svg` — included in repo. Used as favicon and webmanifest icon.
- **No external stock images added.** Hero and section backgrounds use CSS gradients. Provenance is therefore trivially clean.

## Provisional items

| Item | Status |
|---|---|
| Domain `CBbeveragecatering.com` | Provisional — ownership unverified |
| Sitemap canonical URL | Tied to provisional domain |
| og:url and `<link rel="canonical">` | Provisional domain |
| Form backend | Mailto only — upgrade documented above |
| FAQ chatbot AI | Static only — upgrade documented above |
| Logo/wordmark | Text only — no verified graphic asset |
| Social media links | Absent from all source files — omitted |
| Base city | Excluded per planning files |
| Alcohol/licensing/insurance claims | Excluded per legal_claims_review.md |
