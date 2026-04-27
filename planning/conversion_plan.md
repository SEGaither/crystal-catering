# Conversion Plan

## Primary path

Hero CTA and repeated CTAs scroll to quote form.

## Secondary path

Check My Event Date scrolls to the event date field in the quote form.

## Phone path

Header and footer phone links use `tel:2566142510`.

## Chatbot path

Chatbot answers approved FAQ and routes qualified visitors to quote form, phone, or email.

## Form delivery

First build uses email-intent/static behavior to cbruce.dce@gmail.com. Production should upgrade to Formspree, Netlify Forms, Vercel serverless, CRM, or similar service.

## Spam protection

Include hidden honeypot and basic front-end validation. No CAPTCHA in first build.

## Tracking-ready IDs

Use semantic IDs/classes: `cta-hero-quote`, `cta-hero-date`, `cta-header-phone`, `cta-chatbot-quote`, `cta-final-quote`, `quote-form-submit`.
