# AI Chatbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static keyword-matching chatbot with an OpenAI-powered assistant that answers business questions warmly and redirects off-topic queries to Crystal's contact info.

**Architecture:** A Vercel serverless function at `website/api/chat.js` accepts POST `{ messages }` from the frontend, prepends the system prompt, calls OpenAI Chat Completions, and returns `{ reply }`. The API key lives only in Vercel's environment. The frontend replaces the synchronous keyword-matcher with an async fetch call and maintains conversation history in memory for multi-turn context.

**Tech Stack:** Vanilla JS (ES5, matching existing codebase), Node.js 24 (Vercel serverless — global `fetch` built in, no npm packages needed), OpenAI Chat Completions REST API (`gpt-4o-mini`), Vercel CLI.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `website/api/chat.js` | Create | Serverless function — OpenAI proxy, holds API key |
| `website/script.js` | Modify | Remove keyword-matcher, add async sendMessage + typing indicator |
| `website/index.html` | Modify | Rename chatbot labels and opening greeting |

---

### Task 1: Add OPENAI_API_KEY to Vercel

**Files:**
- No file changes — Vercel environment only

- [ ] **Step 1: Add the key to Vercel production environment**

Run from `D:\website-repos\crystals-repo\website\`:
```bash
cat "D:\api-credentials\general-purpose-api-key.txt" | npx vercel env add OPENAI_API_KEY production
```
When prompted "What's the value of OPENAI_API_KEY?" — the value will be piped in automatically.
When prompted for environment — select **Production**.

- [ ] **Step 2: Verify the key was added**

```bash
npx vercel env ls
```
Expected output includes a row for `OPENAI_API_KEY` scoped to `Production`.

---

### Task 2: Create the serverless function

**Files:**
- Create: `website/api/chat.js`

- [ ] **Step 1: Create `website/api/chat.js`**

```javascript
var SYSTEM_PROMPT = [
  'You are a friendly, warm assistant for Crystal\'s Beverage Catering Service, owned by Crystal Bruce.',
  'Your job is to help visitors learn about the business and take the next step toward booking.',
  '',
  'What you know:',
  '- Services: upscale beverage catering for weddings, corporate events, private parties, and special celebrations.',
  '  Three tiers: Event Beverage Service, Signature Beverage Planning, and Full Event Beverage Support.',
  '- Service area: Alabama, Tennessee, Mississippi, and Georgia.',
  '- Pricing: no published prices. Every event gets a custom quote based on date, location, guest count,',
  '  event type, and service needs.',
  '- How to book: submit the quote form on the page, call Crystal at 256-614-2510,',
  '  or email cbruce.dce@gmail.com.',
  '- Beverage preferences and service needs are discussed during consultation — nothing is locked in before that.',
  '',
  'How to respond:',
  '- Keep answers short, warm, and conversational — two to four sentences is usually right.',
  '- Always end with a gentle nudge toward the quote form or Crystal\'s phone number when it fits naturally.',
  '- If someone asks about something outside the business, politely acknowledge it and redirect:',
  '  "That\'s a bit outside what I can help with, but Crystal would be happy to talk through your event —',
  '  you can reach her at 256-614-2510 or use the quote form on this page."',
  '- Never invent pricing, availability, or service details. If unsure, direct them to Crystal.'
].join('\n');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var messages = req.body && req.body.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' });
  }

  var openaiMessages = [{ role: 'system', content: SYSTEM_PROMPT }].concat(messages);

  try {
    var response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Upstream API error' });
    }

    var data = await response.json();
    var reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

    if (!reply) {
      return res.status(502).json({ error: 'No reply from upstream' });
    }

    res.status(200).json({ reply: reply });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add website/api/chat.js
git commit -m "feat: add OpenAI serverless function for chatbot"
```

---

### Task 3: Update script.js — replace keyword-matcher with async AI call

**Files:**
- Modify: `website/script.js`

- [ ] **Step 1: Remove the static FAQ block**

Delete lines 150–214 (everything from `var FAQ_DATA = [` through the closing `var FALLBACK = ...` line and the `getBotResponse` function). Replace with:

```javascript
  /* ----------------------------------------------------------
     AI CHATBOT — async OpenAI-powered responses
  ---------------------------------------------------------- */
  var conversationHistory = [];
  var CHAT_ERROR_MSG = 'Something went wrong — you can reach Crystal directly at 256-614-2510 or use the quote form on this page.';

  function addTypingIndicator() {
    if (!chatMsgs) return null;
    var el = document.createElement('div');
    el.className = 'chat-msg bot';
    el.textContent = 'Typing…';
    chatMsgs.appendChild(el);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
    return el;
  }

  function removeTypingIndicator(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function setInputDisabled(disabled) {
    if (chatInput) chatInput.disabled = disabled;
    if (chatSend) chatSend.disabled = disabled;
  }

  function sendToAI(text, callback) {
    conversationHistory.push({ role: 'user', content: text });
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.reply) {
          conversationHistory.push({ role: 'assistant', content: data.reply });
          callback(null, data.reply);
        } else {
          conversationHistory.pop();
          callback(new Error('no reply'));
        }
      })
      .catch(function () {
        conversationHistory.pop();
        callback(new Error('fetch error'));
      });
  }
```

- [ ] **Step 2: Replace `handleUserInput` with async version**

Find the existing `handleUserInput` function and replace it entirely:

```javascript
  function handleUserInput(text) {
    text = text.trim();
    if (!text) return;
    removePrompts();
    addMessage(text, 'user');
    if (chatInput) chatInput.value = '';
    setInputDisabled(true);
    var typingEl = addTypingIndicator();
    sendToAI(text, function (err, reply) {
      removeTypingIndicator(typingEl);
      setInputDisabled(false);
      addMessage(err ? CHAT_ERROR_MSG : reply, 'bot');
      if (chatInput) chatInput.focus();
    });
  }
```

- [ ] **Step 3: Commit**

```bash
git add website/script.js
git commit -m "feat: wire chatbot to OpenAI API with conversation history"
```

---

### Task 4: Update index.html — rename chatbot UI

**Files:**
- Modify: `website/index.html`

- [ ] **Step 1: Update toggle button label**

Find:
```html
      <span class="chatbot-label">Have a question?</span>
```
Replace with:
```html
      <span class="chatbot-label">Chat with us</span>
```

- [ ] **Step 2: Update toggle button aria-label**

Find:
```html
      aria-label="Open FAQ assistant"
```
Replace with:
```html
      aria-label="Open chat"
```

- [ ] **Step 3: Update panel aria-label**

Find:
```html
      aria-label="FAQ Assistant"
      aria-modal="false"
```
Replace with:
```html
      aria-label="Chat with us"
      aria-modal="false"
```

- [ ] **Step 4: Update panel header text**

Find:
```html
        <span>FAQ Assistant</span>
        <button class="chatbot-close" id="chatbot-close" aria-label="Close FAQ assistant">&#10005;</button>
```
Replace with:
```html
        <span>Chat with us</span>
        <button class="chatbot-close" id="chatbot-close" aria-label="Close chat">&#10005;</button>
```

- [ ] **Step 5: Update opening greeting and prompt buttons**

Find:
```html
        <div class="chat-msg bot">
          Hi! I can answer common questions about Crystal's Beverage Catering Service. What would you like to know?
        </div>
        <div class="chat-prompts" id="chat-prompts">
          <button class="chat-prompt">What events do you serve?</button>
          <button class="chat-prompt">What states do you cover?</button>
          <button class="chat-prompt">How do I get a quote?</button>
          <button class="chat-prompt">Can I check my event date?</button>
          <button class="chat-prompt">Do you list prices?</button>
        </div>
```
Replace with:
```html
        <div class="chat-msg bot">
          Hi! I'm here to help with questions about Crystal's Beverage Catering Service. What can I help you with?
        </div>
        <div class="chat-prompts" id="chat-prompts">
          <button class="chat-prompt">What events do you serve?</button>
          <button class="chat-prompt">What states do you cover?</button>
          <button class="chat-prompt">How do I get a quote?</button>
          <button class="chat-prompt">Can I check my event date?</button>
          <button class="chat-prompt">Do you list prices?</button>
        </div>
```

- [ ] **Step 6: Update chatbot input aria-label**

Find:
```html
          aria-label="Type your FAQ question"
```
Replace with:
```html
          aria-label="Type your question"
```

- [ ] **Step 7: Commit**

```bash
git add website/index.html
git commit -m "feat: rename chatbot UI to 'Chat with us'"
```

---

### Task 5: Deploy and verify

**Files:**
- No file changes

- [ ] **Step 1: Deploy to Vercel production**

Run from `D:\website-repos\crystals-repo\website\`:
```bash
npx vercel --prod --yes
```
Expected: deployment completes and aliases `https://www.cbbeveragecatering.com`.

- [ ] **Step 2: Smoke-test the API endpoint with curl**

```bash
curl -s -X POST https://www.cbbeveragecatering.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What states do you serve?"}]}' | cat
```
Expected response shape:
```json
{"reply":"Crystal's Beverage Catering Service covers Alabama, Tennessee, Mississippi, and Georgia. ..."}
```

- [ ] **Step 3: Test off-topic redirect**

```bash
curl -s -X POST https://www.cbbeveragecatering.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What is the capital of France?"}]}' | cat
```
Expected: reply contains `256-614-2510` or `quote form` redirect, no factual answer about France.

- [ ] **Step 4: Open site in browser and verify chatbot**

1. Go to `https://www.cbbeveragecatering.com`
2. Confirm the toggle button says "Chat with us"
3. Click to open — header should read "Chat with us"
4. Click a prompt button — confirm a natural AI reply appears (not a keyword match)
5. Type a free-form question — confirm reply and that input is disabled while waiting
6. Type something off-topic — confirm reply redirects to Crystal's contact info

- [ ] **Step 5: Push to GitHub**

```bash
git push origin main
```
