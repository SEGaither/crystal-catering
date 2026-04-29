/* ============================================================
   CRYSTAL'S BEVERAGE CATERING SERVICE — script.js
   Static: no API keys, no external calls, no build system
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     MOBILE NAV TOGGLE
  ---------------------------------------------------------- */
  var mobileBtn = document.querySelector('.mobile-menu-btn');
  var mobileNav = document.getElementById('mobile-nav');

  if (mobileBtn && mobileNav) {
    mobileBtn.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      mobileNav.hidden = expanded;
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.hidden = true;
        mobileBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----------------------------------------------------------
     SECONDARY CTA — scroll to + focus event date field
  ---------------------------------------------------------- */
  document.querySelectorAll('[data-focus-field]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var fieldId = this.getAttribute('data-focus-field');
      var field = document.getElementById(fieldId);
      if (!field) return;
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function () { field.focus(); }, 380);
    });
  });

  /* ----------------------------------------------------------
     QUOTE FORM — validation + mailto submission
  ---------------------------------------------------------- */
  var form = document.getElementById('quote-form');

  var REQUIRED_FIELDS = [
    { id: 'name',           label: 'full name',          msg: 'Please enter your full name.' },
    { id: 'email',          label: 'email',              msg: 'Please enter a valid email address.' },
    { id: 'phone',          label: 'phone',              msg: 'Please enter your phone number.' },
    { id: 'event-date',     label: 'event date',         msg: 'Please select your event date.' },
    { id: 'event-location', label: 'event location',     msg: 'Please enter your event city and state.' },
    { id: 'event-type',     label: 'event type',         msg: 'Please select an event type.' }
  ];

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setError(id, msg) {
    var el = document.getElementById(id);
    var errEl = document.getElementById(id + '-error');
    if (el) el.classList.add('error');
    if (errEl) errEl.textContent = msg;
  }

  function clearError(id) {
    var el = document.getElementById(id);
    var errEl = document.getElementById(id + '-error');
    if (el) el.classList.remove('error');
    if (errEl) errEl.textContent = '';
  }

  function validateForm() {
    var valid = true;
    var firstInvalid = null;

    REQUIRED_FIELDS.forEach(function (f) {
      var val = getVal(f.id);
      var fieldValid = val.length > 0;

      if (f.id === 'email' && val) {
        fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      }

      if (!fieldValid) {
        setError(f.id, f.msg);
        if (!firstInvalid) firstInvalid = document.getElementById(f.id);
        valid = false;
      } else {
        clearError(f.id);
      }
    });

    if (firstInvalid) firstInvalid.focus();
    return valid;
  }

  function buildMailtoLink() {
    var subject = "Event Quote Request – Crystal's Beverage Catering Service";

    var lines = [
      'Name: '           + getVal('name'),
      'Email: '          + getVal('email'),
      'Phone: '          + getVal('phone'),
      'Event Date: '     + getVal('event-date'),
      'Event Location: ' + getVal('event-location'),
      'Event Type: '     + getVal('event-type'),
      'Guest Count: '    + (getVal('guest-count') || 'Not provided'),
      'Beverage Preferences / Service Needs: ' + (getVal('preferences') || 'Not provided'),
      'Additional Notes: ' + (getVal('message') || 'Not provided')
    ];

    var body = lines.join('\n');

    return 'mailto:cbruce.dce@gmail.com'
      + '?subject=' + encodeURIComponent(subject)
      + '&body='    + encodeURIComponent(body);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Honeypot check — silently exit if filled */
      var honeypot = form.querySelector('[name="company_website"]');
      if (honeypot && honeypot.value) return;

      if (!validateForm()) return;

      window.location.href = buildMailtoLink();
    });

    /* Clear individual field errors on input */
    REQUIRED_FIELDS.forEach(function (f) {
      var el = document.getElementById(f.id);
      if (el) {
        el.addEventListener('input', function () { clearError(f.id); });
        el.addEventListener('change', function () { clearError(f.id); });
      }
    });
  }

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

  var chatToggle  = document.getElementById('chatbot-toggle');
  var chatPanel   = document.getElementById('chatbot-panel');
  var chatClose   = document.getElementById('chatbot-close');
  var chatMsgs    = document.getElementById('chatbot-messages');
  var chatInput   = document.getElementById('chatbot-input');
  var chatSend    = document.getElementById('chatbot-send');
  var chatPrompts = document.getElementById('chat-prompts');
  var promptsRemoved = false;

  function openChatbot() {
    if (!chatPanel) return;
    chatPanel.hidden = false;
    if (chatToggle) chatToggle.setAttribute('aria-expanded', 'true');
    if (chatClose) chatClose.focus();
  }

  function closeChatbot() {
    if (!chatPanel) return;
    chatPanel.hidden = true;
    if (chatToggle) {
      chatToggle.setAttribute('aria-expanded', 'false');
      chatToggle.focus();
    }
  }

  function addMessage(text, type) {
    if (!chatMsgs) return;
    var msg = document.createElement('div');
    msg.className = 'chat-msg ' + type;
    msg.textContent = text;
    if (chatPrompts && !promptsRemoved) {
      chatMsgs.insertBefore(msg, chatPrompts);
    } else {
      chatMsgs.appendChild(msg);
    }
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }

  function removePrompts() {
    if (chatPrompts && !promptsRemoved) {
      chatPrompts.remove();
      promptsRemoved = true;
    }
  }

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

  if (chatToggle) chatToggle.addEventListener('click', openChatbot);
  if (chatClose)  chatClose.addEventListener('click', closeChatbot);

  if (chatPanel) {
    chatPanel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeChatbot();
    });
  }

  if (chatSend) {
    chatSend.addEventListener('click', function () {
      if (chatInput) handleUserInput(chatInput.value);
    });
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUserInput(this.value);
      }
    });
  }

  if (chatPrompts) {
    chatPrompts.querySelectorAll('.chat-prompt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleUserInput(this.textContent);
      });
    });
  }

  /* Close chatbot if clicking the toggle CTA link inside panel */
  var chatCtaBtn = document.getElementById('cta-chatbot-quote');
  if (chatCtaBtn) {
    chatCtaBtn.addEventListener('click', function () {
      closeChatbot();
    });
  }

})();
