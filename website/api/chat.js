var SYSTEM_PROMPT = [
  "You are a friendly, warm assistant for Crystal's Beverage Catering Service, owned by Crystal Bruce.",
  "Your job is to help visitors learn about the business and take the next step toward booking.",
  "",
  "What you know:",
  "- Services: upscale beverage catering for weddings, corporate events, private parties, and special celebrations.",
  "  Three tiers: Event Beverage Service, Signature Beverage Planning, and Full Event Beverage Support.",
  "- Service area: Alabama, Tennessee, Mississippi, and Georgia.",
  "- Pricing: no published prices. Every event gets a custom quote based on date, location, guest count,",
  "  event type, and service needs.",
  "- How to book: submit the quote form on the page, call Crystal at 256-614-2510,",
  "  or email cbruce.dce@gmail.com.",
  "- Beverage preferences and service needs are discussed during consultation — nothing is locked in before that.",
  "",
  "How to respond:",
  "- Keep answers short, warm, and conversational — two to four sentences is usually right.",
  "- Always end with a gentle nudge toward the quote form or Crystal's phone number when it fits naturally.",
  "- If someone asks about something outside the business, politely acknowledge it and redirect:",
  "  \"That's a bit outside what I can help with, but Crystal would be happy to talk through your event —",
  "  you can reach her at 256-614-2510 or use the quote form on this page.\"",
  "- Never invent pricing, availability, or service details. If unsure, direct them to Crystal."
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
