# AI Chatbot Design — Crystal's Beverage Catering Service

**Date:** 2026-04-29
**Status:** Approved

---

## Goal

Replace the existing static keyword-matching FAQ chatbot with an OpenAI-powered assistant that answers business questions warmly, stays on-topic, and nudges visitors toward the quote form or Crystal's phone number.

---

## Architecture

### 1. `website/api/chat.js` — Vercel Serverless Function

- Accepts `POST { messages }` where `messages` is the conversation history (array of `{ role, content }` objects)
- Prepends the system prompt as `{ role: "system", content: SYSTEM_PROMPT }`
- Calls OpenAI Chat Completions API (`gpt-4o-mini`) with the full messages array
- Returns `{ reply: string }` on success, `{ error: string }` on failure
- `OPENAI_API_KEY` is read from Vercel environment variable — never exposed to the browser
- No conversation data is logged or stored

### 2. `website/script.js` — Frontend changes

- Remove `FAQ_DATA`, `FALLBACK`, and `getBotResponse()` keyword-matcher
- Add `conversationHistory` array (in-memory, resets on page reload)
- Replace synchronous response with async `sendMessage()` that:
  1. Appends user message to history
  2. Shows "Typing…" indicator
  3. POSTs `{ messages: conversationHistory }` to `/api/chat`
  4. Appends assistant reply to history and renders it
  5. On error, renders fallback contact message and does not append to history
- Existing UI wiring (toggle, close, prompt buttons, Enter key) unchanged

### 3. `website/index.html` — UI rename

- Toggle button label: "Have a question?" → "Chat with us"
- Panel header: "FAQ Assistant" → "Chat with us"
- `aria-label` attributes updated to match
- Opening greeting updated to match new persona

### 4. `website/styles.css`

- No structural changes required. Typing indicator uses existing `.chat-msg.bot` style.

---

## System Prompt

```
You are a friendly, warm assistant for Crystal's Beverage Catering Service, owned by Crystal Bruce.
Your job is to help visitors learn about the business and take the next step toward booking.

What you know:
- Services: upscale beverage catering for weddings, corporate events, private parties, and special celebrations.
  Three tiers: Event Beverage Service, Signature Beverage Planning, and Full Event Beverage Support.
- Service area: Alabama, Tennessee, Mississippi, and Georgia.
- Pricing: no published prices. Every event gets a custom quote based on date, location, guest count,
  event type, and service needs.
- How to book: submit the quote form on the page, call Crystal at 256-614-2510,
  or email cbruce.dce@gmail.com.
- Beverage preferences and service needs are discussed during consultation — nothing is locked in before that.

How to respond:
- Keep answers short, warm, and conversational — two to four sentences is usually right.
- Always end with a gentle nudge toward the quote form or Crystal's phone number when it fits naturally.
- If someone asks about something outside the business, politely acknowledge it and redirect:
  "That's a bit outside what I can help with, but Crystal would be happy to talk through your event —
  you can reach her at 256-614-2510 or use the quote form on this page."
- Never invent pricing, availability, or service details. If unsure, direct them to Crystal.
```

---

## Data Flow

```
User types → conversationHistory.push(user msg) → POST /api/chat
  → serverless fn prepends system prompt → OpenAI gpt-4o-mini
  → { reply } → conversationHistory.push(assistant msg) → render
```

---

## Error Handling

- API failure (network, quota, 5xx): show "Something went wrong — you can reach Crystal directly at 256-614-2510 or via the quote form." Do not append error to history.
- Empty/blank user input: no-op (existing behavior retained).
- Honeypot: not applicable to chatbot.

---

## Environment Setup

- Add `OPENAI_API_KEY` to Vercel project via CLI: `vercel env add OPENAI_API_KEY`
- Value: from `D:\api-credentials\general-purpose-api-key.txt`
- Scope: Production (and Preview if desired)

---

## Out of Scope

- Streaming responses (can be added later if response latency is a concern)
- Rate limiting (Vercel default function limits sufficient for site traffic)
- Conversation persistence across page reloads
- Analytics/logging of chat content
