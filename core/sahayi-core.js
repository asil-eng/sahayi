/*
 * Sahayi core: shared by the Chrome extension and the mobile app.
 *
 *  scan the real page -> find a template (bundled, cached, or made by AI) ->
 *  draw a calm, accessible "Simple Mode" UI -> write answers into the REAL
 *  form fields -> the person presses Submit on the real page themselves.
 *
 * Talks to its host (extension / app) only through `bridge.call(type, payload)`.
 */
(function () {
  'use strict';
  if (window.Sahayi && window.Sahayi.__ready) return;

  // ------------------------------------------------------------------ strings
  const S = {
    ml: {
      app: 'സഹായി',
      original: 'യഥാർത്ഥ പേജ്',
      otherLang: 'English',
      size: 'വലുപ്പം',
      contrast: 'നിറം',
      loading: 'ഈ പേജ് നിങ്ങൾക്കായി ലളിതമാക്കുന്നു…',
      loadingSub: 'കുറച്ച് സെക്കൻഡ് കാത്തിരിക്കൂ.',
      keyPoints: 'പ്രധാന കാര്യങ്ങൾ',
      actions: 'ഈ പേജിൽ ചെയ്യാവുന്നത്',
      documents: 'ഇവ കയ്യിൽ കരുതുക',
      warning: 'ശ്രദ്ധിക്കുക',
      questions: (n) => `${n} ചോദ്യങ്ങൾ`,
      talk: '🎤  സംസാരിച്ച് പൂരിപ്പിക്കാം',
      talkSub: 'ഞാൻ ചോദിക്കും, നിങ്ങൾ മറുപടി പറഞ്ഞാൽ മതി',
      type: '⌨  ടൈപ്പ് ചെയ്ത് പൂരിപ്പിക്കാം',
      showOptional: 'നിർബന്ധമല്ലാത്ത ചോദ്യങ്ങളും ചോദിക്കുക',
      step: (i, n) => `ചോദ്യം ${i} / ${n}`,
      required: 'നിർബന്ധം',
      optional: 'നിർബന്ധമല്ല',
      example: 'ഉദാഹരണം',
      onPage: 'പേജിൽ ഇങ്ങനെ:',
      back: '◀  പിന്നോട്ട്',
      next: 'അടുത്തത്  ▶',
      skip: 'ഒഴിവാക്കുക',
      finish: 'പൂർത്തിയായി  ▶',
      speak: '🎤  പറയൂ',
      hear: '🔊  ചോദ്യം കേൾക്കാം',
      stop: '■  നിർത്തുക',
      listening: 'കേൾക്കുന്നു… പറഞ്ഞോളൂ',
      speaking: '🔊  ചോദിക്കുന്നു…',
      thinking: 'മനസ്സിലാക്കുന്നു…',
      heard: 'ഞാൻ കേട്ടത്:',
      isRight: 'ശരിയാണോ?',
      yes: '✓  ശരി',
      retry: '↺  വീണ്ടും പറയാം',
      typeInstead: '⌨  ടൈപ്പ് ചെയ്യാം',
      sorry: 'ക്ഷമിക്കണം, വ്യക്തമായി കേട്ടില്ല. ഒന്നുകൂടി പറയാമോ?',
      sayAgain: 'ശരി, ഒന്നുകൂടി പറയൂ.',
      fallbackType: 'ഇത് ടൈപ്പ് ചെയ്യുന്നതാണ് നല്ലത്. ബോക്സിൽ ടൈപ്പ് ചെയ്യൂ.',
      sensitive: 'ഇത് സ്വകാര്യ വിവരമാണ്. ടൈപ്പ് ചെയ്യുന്നതാണ് സുരക്ഷിതം. വേണമെങ്കിൽ മൈക്ക് അമർത്തി പറയാം.',
      selfTitle: 'ഇത് നിങ്ങൾ തന്നെ പേജിൽ ചെയ്യണം',
      selfSecret: 'OTP, പാസ്‌വേഡ്, CAPTCHA എന്നിവ ആരോടും പറയരുത്. പേജിൽ നേരിട്ട് നൽകുക.',
      selfFile: 'ഫയൽ പേജിൽ നിന്ന് തന്നെ തിരഞ്ഞെടുക്കണം.',
      showOnPage: '👆  പേജിൽ കാണിക്കൂ',
      backToSahayi: '✓  കഴിഞ്ഞു, തിരികെ പോകാം',
      peekHint: 'മഞ്ഞ നിറത്തിൽ കാണിച്ച ഭാഗത്ത് ചെയ്യൂ.',
      review: 'ഉത്തരങ്ങൾ ഒന്നുകൂടി നോക്കാം',
      reviewSub: 'മാറ്റണമെങ്കിൽ ആ ഉത്തരത്തിൽ തൊടൂ.',
      missing: 'ബാക്കിയുണ്ട്',
      goSubmit: 'Submit ചെയ്യാൻ പേജിലേക്ക്  ▶',
      submitHint: 'എല്ലാം ശരിയാണെങ്കിൽ മഞ്ഞ നിറത്തിലുള്ള ബട്ടൺ അമർത്തുക.',
      noSubmit: 'പേജിലെ Submit ബട്ടൺ അമർത്തുക.',
      allDone: 'എല്ലാ ചോദ്യങ്ങളും കഴിഞ്ഞു. ഉത്തരങ്ങൾ ഒന്നുകൂടി നോക്കൂ.',
      voiceNote: 'സംസാരിക്കുമ്പോൾ നിങ്ങളുടെ ശബ്ദം എഴുത്താക്കാൻ OpenAI-ലേക്ക് അയയ്ക്കും. ടൈപ്പ് ചെയ്യുന്നത് എങ്ങോട്ടും അയയ്ക്കില്ല.',
      noKey: 'OpenAI API കീ ഇനിയും നൽകിയിട്ടില്ല.',
      badKey: 'OpenAI API കീ ശരിയല്ല.',
      openSettings: '⚙  ക്രമീകരണങ്ങൾ',
      aiFailed: 'AI ഇപ്പോൾ ലഭ്യമല്ല. പേജിലെ ചോദ്യങ്ങൾ അതേപടി കാണിക്കുന്നു.',
      nothing: 'ഈ പേജിൽ ലളിതമാക്കാൻ ഒന്നും കണ്ടെത്തിയില്ല.',
      rescan: '↻  പേജ് വീണ്ടും വായിക്കുക',
      waitingOptions: 'ഓപ്ഷനുകൾ ലോഡ് ആകുന്നു…',
      filter: 'തിരയുക…',
      yesOpt: 'അതെ',
      noOpt: 'ഇല്ല',
      micDenied: 'മൈക്ക് ഉപയോഗിക്കാൻ അനുവാദം കിട്ടിയില്ല. ടൈപ്പ് ചെയ്യൂ.',
      isRequired: 'ഈ ചോദ്യം നിർബന്ധമാണ്. എന്നിട്ടും മുന്നോട്ട് പോകാൻ വീണ്ടും അമർത്തുക.',
      pageSays: 'പേജ് പറയുന്നത്:',
      srcTemplate: '✓ ഞങ്ങളുടെ ടീം പരിശോധിച്ചത്',
      srcAi: 'AI ലളിതമാക്കിയത്. സംശയമുണ്ടെങ്കിൽ യഥാർത്ഥ പേജ് നോക്കുക.',
      launcher: 'സഹായി: ലളിതമായി കാണാം',
      start: 'തുടങ്ങാം',
      edit: 'മാറ്റുക',
      heardLead: 'ഞാൻ കേട്ടത് ഇതാണ്:',
      looksSecret: 'ഇത് OTP അല്ലെങ്കിൽ PIN പോലെ തോന്നുന്നു. അത് ആരോടും പറയരുത്. ഈ ചോദ്യത്തിന്റെ ഉത്തരം പറയൂ.',
      privateSite: '🔒 ഇത് സ്വകാര്യ രേഖകളുള്ള സൈറ്റാണ്. ഈ പേജിലെ വിവരങ്ങൾ ഒന്നും AI-ലേക്ക് അയയ്ക്കുന്നില്ല.',
      aboutPage: 'ഈ പേജിനെക്കുറിച്ച്',
      simpleView: 'ലളിത രൂപം',
      formTitle: 'ഫോം പൂരിപ്പിക്കാം',
      filled: (a, b) => `${b}-ൽ ${a} പൂരിപ്പിച്ചു`,
      talkBtn: 'സംസാരിച്ച് പൂരിപ്പിക്കാം',
      showOptionalN: (n) => `നിർബന്ധമല്ലാത്ത ${n} ചോദ്യങ്ങളും കാണിക്കുക`,
      speakThis: 'പറഞ്ഞ് പൂരിപ്പിക്കാം',
      choose: 'ഒന്ന് തിരഞ്ഞെടുക്കുക',
      yesAgree: 'അതെ, ശരിയാണ്',
      display: 'കാഴ്ച',
      textSize: 'അക്ഷര വലുപ്പം',
      highContrast: 'ഉയർന്ന കോൺട്രാസ്റ്റ്',
      settings: 'ക്രമീകരണങ്ങൾ',
      voiceRegion: 'ശബ്ദ സഹായി',
      typeHereHint: 'ഇത് ഫോമിൽ ടൈപ്പ് ചെയ്യൂ. എന്നിട്ട് "അടുത്തത്" അമർത്തൂ.',
      speakAnyway: 'എന്നാലും പറയാം',
      doneSpeaking: 'പറഞ്ഞു കഴിഞ്ഞു',
      stopVoice: 'നിർത്തുക',
      progressQ: (i, n) => `ചോദ്യം ${i} / ${n}`,
      nextShort: 'അടുത്തത്',
      prevQ: 'മുമ്പത്തെ ചോദ്യം',
      reviewSubmit: 'പരിശോധിച്ച് Submit ചെയ്യാം',
      backToForm: 'ഫോമിലേക്ക്',
      missingN: (n) => `${n} നിർബന്ധ ചോദ്യങ്ങൾ ബാക്കിയുണ്ട്.`,
      pageSaysShort: 'വെബ്സൈറ്റ് കാണിക്കുന്ന സന്ദേശം',
      showAllQ: 'എല്ലാ ചോദ്യങ്ങളും ഒരുമിച്ച് കാണുക',
      oneByOneQ: 'ഓരോ ചോദ്യമായി കാണുക',
    },
    en: {
      app: 'Sahayi',
      original: 'Original page',
      otherLang: 'മലയാളം',
      size: 'Size',
      contrast: 'Colour',
      loading: 'Making this page simple for you…',
      loadingSub: 'Please wait a few seconds.',
      keyPoints: 'Key points',
      actions: 'What you can do here',
      documents: 'Keep these ready',
      warning: 'Be careful',
      questions: (n) => `${n} questions`,
      talk: '🎤  Fill by talking',
      talkSub: 'I will ask, you just answer',
      type: '⌨  Fill by typing',
      showOptional: 'Also ask optional questions',
      step: (i, n) => `Question ${i} of ${n}`,
      required: 'Required',
      optional: 'Optional',
      example: 'Example',
      onPage: 'On the page:',
      back: '◀  Back',
      next: 'Next  ▶',
      skip: 'Skip',
      finish: 'Finish  ▶',
      speak: '🎤  Speak',
      hear: '🔊  Hear question',
      stop: '■  Stop',
      listening: 'Listening… please speak',
      speaking: '🔊  Asking…',
      thinking: 'Understanding…',
      heard: 'I heard:',
      isRight: 'Is that right?',
      yes: '✓  Yes',
      retry: '↺  Say again',
      typeInstead: '⌨  Type instead',
      sorry: "Sorry, I didn't hear that clearly. Could you say it again?",
      sayAgain: 'OK, please say it again.',
      fallbackType: 'Typing may be easier for this one. Please type it in the box.',
      sensitive: 'This is private information. Typing it is safer. You can still tap the mic to say it.',
      selfTitle: 'Please do this one yourself on the page',
      selfSecret: 'Never tell anyone your OTP, password or CAPTCHA. Enter it directly on the page.',
      selfFile: 'Choose the file on the page itself.',
      showOnPage: '👆  Show me on the page',
      backToSahayi: '✓  Done, go back',
      peekHint: 'Do this in the part marked in yellow.',
      review: 'Check your answers',
      reviewSub: 'Tap any answer to change it.',
      missing: 'Not filled',
      goSubmit: 'Go to page to Submit  ▶',
      submitHint: 'If everything is right, press the button marked in yellow.',
      noSubmit: 'Press the Submit button on the page.',
      allDone: 'All questions are done. Please check your answers.',
      voiceNote: 'When you speak, your voice is sent to OpenAI to turn it into text. What you type is never sent anywhere.',
      noKey: 'The OpenAI API key is not set yet.',
      badKey: 'The OpenAI API key is not valid.',
      openSettings: '⚙  Settings',
      aiFailed: 'AI is not available right now. Showing the page questions as they are.',
      nothing: 'Nothing to simplify was found on this page.',
      rescan: '↻  Read the page again',
      waitingOptions: 'Loading options…',
      filter: 'Search…',
      yesOpt: 'Yes',
      noOpt: 'No',
      micDenied: 'Microphone permission was not given. Please type.',
      isRequired: 'This question is required. Press again to continue anyway.',
      pageSays: 'The page says:',
      srcTemplate: '✓ Checked by our team',
      srcAi: 'Simplified by AI. If unsure, check the original page.',
      launcher: 'Sahayi: view simply',
      start: 'Start',
      edit: 'Change',
      heardLead: 'This is what I heard:',
      looksSecret: 'That sounds like an OTP or PIN. Never say it to anyone. Please answer this question instead.',
      privateSite: '🔒 This site holds private documents. Nothing from this page is sent to the AI.',
      aboutPage: 'About this page',
      simpleView: 'Simple view',
      formTitle: 'Fill the form',
      filled: (a, b) => `${a} of ${b} filled`,
      talkBtn: 'Fill by talking',
      showOptionalN: (n) => `Also show ${n} optional questions`,
      speakThis: 'Say it',
      choose: 'Choose one',
      yesAgree: 'Yes, I agree',
      display: 'Display',
      textSize: 'Text size',
      highContrast: 'High contrast',
      settings: 'Settings',
      voiceRegion: 'Voice helper',
      typeHereHint: 'Type this in the form, then press Next.',
      speakAnyway: 'Speak anyway',
      doneSpeaking: "I'm done",
      stopVoice: 'Stop',
      progressQ: (i, n) => `Question ${i} of ${n}`,
      nextShort: 'Next',
      prevQ: 'Previous question',
      reviewSubmit: 'Review and submit',
      backToForm: 'Back to form',
      missingN: (n) => `${n} required questions are still empty.`,
      pageSaysShort: 'Message from the website',
      showAllQ: 'See all questions together',
      oneByOneQ: 'One question at a time',
    },
  };

  const YES_RE = /(^|\s)(ശരി|ശരിയാണ്|അതെ|ആണ്|ഉവ്വ്|ഓക്കെ|ഒക്കെ|ok|okay|yes|yeah|correct|right|sheri|shari|athe)(\s|[.!,]|$)/i;
  const NO_RE = /(അല്ല|ഇല്ല|തെറ്റ്|വേണ്ട|മാറ്റ|ശരിയല്ല|\bno\b|\bnot\b|wrong|change)/i;
  const SKIP_RE = /(ഒഴിവാക്കുക|അറിയില്ല|ഇല്ല\s*$|\bskip\b|don'?t know|not applicable)/i;

  // ------------------------------------------------------------------ state
  let bridge = null;
  let platform = 'extension';
  let prefs = { lang: 'ml', scale: 1, hc: false };
  let host, shadow, app, peekBar, launcherEl, liveRegion;
  let scanRes = null; // result of scan()
  let tpl = null; // template object (merged languages)
  let tplSource = 'basic'; // template | ai | basic
  let plan = null; // built for current language
  let view = 'closed'; // closed | loading | page | review | peek | error
  let mode = 'type'; // type | voice
  let cur = 0;
  let showOptional = false;
  let notice = '';
  let errorCode = '';
  let pending = {}; // key -> value waiting to be committed to the real field
  let warnedRequired = null;
  let savedOverflow = null;
  let savedViewport = null;
  let ui = {}; // live element refs for the current view
  const T = (k, ...a) => {
    const v = (S[prefs.lang] || S.en)[k];
    return typeof v === 'function' ? v(...a) : v;
  };

  // ------------------------------------------------------------------ utils
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false || kid === '') continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }
  function hash(str) {
    let x = 5381;
    for (let i = 0; i < str.length; i++) x = ((x << 5) + x + str.charCodeAt(i)) | 0;
    return (x >>> 0).toString(36);
  }
  function announce(text) {
    if (liveRegion) {
      liveRegion.textContent = '';
      setTimeout(() => (liveRegion.textContent = text), 50);
    }
  }

  // ------------------------------------------------------------------ bridge
  function makeBridge(kind) {
    const unwrap = (res) => {
      if (!res || !res.ok) {
        const e = new Error((res && res.error) || 'UNKNOWN');
        e.code = res && res.error;
        throw e;
      }
      return res.data;
    };
    if (kind === 'mobile') {
      const waiting = new Map();
      let seq = 0;
      window.__sahayiResolve = (id, res) => {
        const fn = waiting.get(id);
        if (fn) {
          waiting.delete(id);
          fn(res);
        }
      };
      return {
        call(type, payload) {
          return new Promise((resolve) => {
            const id = 'm' + ++seq;
            waiting.set(id, resolve);
            window.ReactNativeWebView.postMessage(JSON.stringify({ sahayi: true, id, type, payload }));
          }).then(unwrap);
        },
        event(name, data) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ sahayi: true, event: name, data }));
        },
      };
    }
    return {
      call(type, payload) {
        return new Promise((resolve) => {
          try {
            chrome.runtime.sendMessage({ sahayi: true, type, payload }, (res) => {
              if (chrome.runtime.lastError) resolve({ ok: false, error: chrome.runtime.lastError.message });
              else resolve(res);
            });
          } catch (e) {
            resolve({ ok: false, error: String(e && e.message) });
          }
        }).then(unwrap);
      },
      event() {},
    };
  }

  const store = {
    async get(key) {
      try {
        return await bridge.call('get', { key });
      } catch {
        return null;
      }
    },
    async set(key, value) {
      try {
        await bridge.call('set', { key, value });
      } catch {}
    },
  };

  // per-tab session (survives page reloads / postbacks within the same site)
  const SESSION_KEY = 'sahayi:session';
  function readSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
    } catch {
      return {};
    }
  }
  function saveSession(extra) {
    try {
      const s = { ...readSession(), open: view !== 'closed', mode, showOptional, ...extra };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } catch {}
  }

  // ------------------------------------------------------------------ scanning
  const SKIP_TYPES = new Set(['hidden', 'submit', 'button', 'reset', 'image']);
  // OTP / PIN / password / CAPTCHA: never asked by voice, never sent anywhere; the person types them on the page.
  // "PIN" alone is secret, but "PIN code" / "pincode" (postal code) is not.
  const SELF_RE =
    /\botp\b|one[\s-]?time\s*(pass|code)|captcha|password|passcode|\bcvv\b|\bm?pin\b(?!\s*-?\s*code)|security\s*(pin|code)|verification\s*code|characters shown|പാസ്\u200c?വേഡ്|രഹസ്യ\s*നമ്പർ/i;
  const SECRET_AUTOCOMPLETE = /current-password|new-password|one-time-code/i;
  // Sites holding identity documents / money: page content is NEVER sent to the AI there.
  // Only bundled, hand-checked templates (or the plain no-AI view) are used.
  const PRIVATE_HOSTS = ['digilocker.gov.in', 'meripehchaan.gov.in', 'uidai.gov.in', 'incometax.gov.in', 'epfindia.gov.in'];
  const isPrivateHost = () => PRIVATE_HOSTS.some((d) => location.hostname === d || location.hostname.endsWith('.' + d));

  function isShown(el) {
    if (!el || !el.getClientRects || !el.getClientRects().length) return false;
    const s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none';
  }
  function labelOf(el) {
    let t = '';
    if (el.labels && el.labels.length) t = [...el.labels].map((l) => l.innerText).join(' ');
    if (!clean(t) && el.getAttribute('aria-labelledby'))
      t = el
        .getAttribute('aria-labelledby')
        .split(/\s+/)
        .map((id) => (document.getElementById(id) || {}).innerText || '')
        .join(' ');
    if (!clean(t)) t = el.getAttribute('aria-label') || '';
    if (!clean(t) && (el.type === 'checkbox' || el.type === 'radio') && el.parentElement) {
      // e.g. <td><input type=checkbox> I declare that ...</td>
      const own = clean(el.parentElement.innerText);
      if (own && el.parentElement.querySelectorAll('input,select,textarea').length === 1) t = own;
    }
    if (!clean(t)) {
      const td = el.closest('td');
      if (td && td.previousElementSibling) t = td.previousElementSibling.innerText;
    }
    if (!clean(t)) {
      let p = el.previousElementSibling;
      for (let i = 0; p && i < 3 && !clean(p.innerText); i++) p = p.previousElementSibling;
      if (p && !p.matches('input,select,textarea')) t = p.innerText;
    }
    if (!clean(t)) t = el.placeholder || el.title || '';
    if (!clean(t)) t = (el.name || el.id || '').replace(/[_\-.]+/g, ' ');
    return clean(t).slice(0, 160);
  }
  function commonAncestor(els) {
    let a = els[0].parentElement;
    while (a && !els.every((e) => a.contains(e))) a = a.parentElement;
    return a || document.body;
  }
  function groupLabel(els, container) {
    const fs = els[0].closest('fieldset');
    const lg = fs && fs.querySelector('legend');
    if (lg && clean(lg.innerText)) return clean(lg.innerText).slice(0, 160);
    const td = container.closest('td');
    if (td && td.previousElementSibling && clean(td.previousElementSibling.innerText))
      return clean(td.previousElementSibling.innerText).slice(0, 160);
    const prev = container.previousElementSibling;
    if (prev && clean(prev.innerText) && !prev.querySelector('input,select,textarea')) return clean(prev.innerText).slice(0, 160);
    let t = clean(container.innerText);
    for (const e of els) {
      const l = labelOf(e);
      if (l) t = t.replace(l, ' ');
    }
    return (clean(t) || els[0].name || '').slice(0, 160);
  }
  function isRequired(el, label) {
    return !!(el.required || el.getAttribute('aria-required') === 'true' || /\*|\(required\)|നിർബന്ധ/i.test(label));
  }
  function keyOf(el) {
    if (el.id && document.querySelectorAll('#' + CSS.escape(el.id)).length === 1) return '#' + el.id;
    if (el.name) return 'name=' + el.name;
    return null;
  }
  function optionsOf(f) {
    if (f.kind === 'select') {
      return [...f.els[0].options]
        .filter((o) => !o.disabled && !(o.value === '' && /select|choose|--|തിരഞ്ഞെടു/i.test(o.text + ' ')) && clean(o.text))
        .map((o) => ({ value: o.value, text: clean(o.text) }));
    }
    if (f.kind === 'radio') return f.els.map((e) => ({ value: e.value, text: labelOf(e) || e.value, el: e }));
    return [];
  }

  function scan() {
    const fields = [];
    const groups = new Map();
    let idx = 0;
    for (const el of document.querySelectorAll('input, select, textarea')) {
      if (host && host.contains(el)) continue;
      const type = (el.getAttribute('type') || '').toLowerCase();
      if (el.tagName === 'INPUT' && SKIP_TYPES.has(type)) continue;
      if (el.disabled || el.readOnly) continue;
      const kind =
        el.tagName === 'SELECT' ? 'select' : el.tagName === 'TEXTAREA' ? 'textarea' : ['radio', 'checkbox', 'file'].includes(type) ? type : 'text';
      const shown = isShown(el) || (['radio', 'checkbox', 'file'].includes(kind) && el.labels && [...el.labels].some(isShown));
      if (!shown) continue;
      idx++;
      if (kind === 'radio') {
        const gk = el.name ? 'name=' + el.name : 'radio:' + idx;
        let g = groups.get(gk);
        if (!g) {
          g = { key: gk, kind: 'radio', inputType: 'radio', els: [], required: false };
          groups.set(gk, g);
          fields.push(g);
        }
        g.els.push(el);
        g.required = g.required || el.required;
        continue;
      }
      const label = labelOf(el);
      fields.push({
        key: keyOf(el) || 'idx:' + idx,
        kind,
        inputType: kind === 'text' ? type || 'text' : kind,
        els: [el],
        label,
        placeholder: el.placeholder || '',
        required: isRequired(el, label),
        maxlength: el.maxLength > 0 ? el.maxLength : undefined,
        pattern: el.getAttribute('pattern') || undefined,
      });
      if (fields.length >= 60) break;
    }
    for (const f of fields) {
      if (f.kind === 'radio') {
        f.container = commonAncestor(f.els);
        f.label = groupLabel(f.els, f.container);
        if (/\*/.test(f.label)) f.required = true;
      } else {
        f.container = f.els[0];
      }
      const ident = `${f.label} ${f.els[0].name || ''} ${f.els[0].id || ''}`;
      const ac = f.els[0].getAttribute('autocomplete') || '';
      f.secret = f.inputType === 'password' || SECRET_AUTOCOMPLETE.test(ac) || SELF_RE.test(`${ident} ${f.placeholder || ''}`);
      f.self = f.kind === 'file' || f.secret;
      if (f.secret) f.required = true;
    }
    // login forms: the username/ID next to a password box is needed even if the page doesn't mark it
    for (const pw of fields.filter((f) => f.inputType === 'password')) {
      const box = pw.els[0].form || pw.els[0].closest('form, fieldset, .card, .panel, .modal, section') || null;
      if (!box) continue;
      for (const f of fields) if (f !== pw && f.kind === 'text' && box.contains(f.els[0])) f.required = true;
    }
    fields.forEach((f, i) => (f.fid = 'f' + (i + 1)));

    // links a citizen might want (Apply, Check status, Download...)
    const links = [];
    const seenText = new Set();
    const linkEls = [...document.querySelectorAll('a[href], [role="link"]')].filter((a) => !(host && host.contains(a)) && isShown(a));
    const inChrome = (a) => !!a.closest('nav, header, footer, [role="navigation"], [role="contentinfo"]');
    linkEls.sort((a, b) => inChrome(a) - inChrome(b));
    // things you can click that are not links: account cards, "Create New Account" buttons, tiles...
    const mainRoot = document.querySelector('main, [role="main"], #main-section, #main, #content') || document.body;
    const clickEls = [];
    const pointer = (el) => {
      try {
        return getComputedStyle(el).cursor === 'pointer';
      } catch {
        return false;
      }
    };
    const fieldsHere = new Set(fields.flatMap((f) => f.els));
    const cands = mainRoot.querySelectorAll(
      'button, [role="button"], [onclick], [tabindex]:not([tabindex="-1"]), li, [class*="card"], [class*="item"], [class*="tile"], [class*="option"], [class*="account"]'
    );
    for (let i = 0; i < cands.length && i < 800; i++) {
      const el = cands[i];
      if ((host && host.contains(el)) || el.matches('a[href], [role="link"]') || el.closest('a[href]') || inChrome(el)) continue;
      if (el.matches('input,select,textarea,label,option') || [...fieldsHere].some((f) => el.contains(f))) continue;
      const isBtn = el.matches('button, [role="button"]');
      if (!isBtn && !pointer(el)) continue;
      if (!isBtn && el.parentElement && pointer(el.parentElement) && mainRoot.contains(el.parentElement) && el.parentElement !== mainRoot) continue; // keep the outer card only
      if (isBtn && el.type === 'submit' && el.form && fields.some((f) => f.els[0].form === el.form)) continue; // a form's own submit button
      if (!isShown(el)) continue;
      clickEls.push(el);
    }
    const chromeLast = [...clickEls.map((el) => ({ el, click: true })), ...linkEls.map((el) => ({ el, click: false }))];
    for (const { el: a, click } of chromeLast) {
      let text = clean(a.innerText || a.getAttribute('aria-label') || a.title || a.value);
      // tidy card text: drop arrows/plus signs and the 1-3 letter avatar initials in front ("MP M***m*** ..." -> "M***m*** ...")
      text = text.replace(/^[+›>»→\s]+|[\s›>»→]+$/g, '').replace(/^([A-Z]{1,3})\s+(?=\1?[A-Z*])/, (m, ini) => (click && text.length > ini.length + 3 ? '' : m));
      const href = click ? '' : a.getAttribute('href') || '';
      if (text.length < 2 || text.length > 90 || href === '#' || seenText.has(text)) continue;
      if (/^(a[+-]?|skip to (main )?content|english|മലയാളം|हिंदी|screen reader access)$/i.test(text)) continue;
      seenText.add(text);
      links.push({ lid: 'a' + (links.length + 1), text, href, el: a, chrome: inChrome(a) });
      if (links.length >= 50) break;
    }

    // submit-like buttons
    const buttons = [];
    const btnEls = [
      ...document.querySelectorAll('button, input[type="submit"], input[type="button"], input[type="image"], [role="button"]'),
    ].filter((b) => !(host && host.contains(b)) && isShown(b));
    for (const b of btnEls) {
      const text = clean(b.innerText || b.value || b.getAttribute('aria-label') || b.alt || b.title);
      if (!text || text.length > 60) continue;
      const key = b.id ? '#' + b.id : 'btn:' + text;
      buttons.push({ bid: 'b' + (buttons.length + 1), text, key, el: b, isSubmit: b.type === 'submit' });
      if (buttons.length >= 25) break;
    }

    const main = document.querySelector('main, [role="main"], article, #content, .content') || document.body;
    const headings = [...document.querySelectorAll('h1, h2, h3')]
      .filter(isShown)
      .map((x) => clean(x.innerText))
      .filter(Boolean)
      .slice(0, 15);
    const pageText = clean(main.innerText).slice(0, 3000);
    const keys = fields.map((f) => f.key).sort();
    const pageId = location.host + cleanPath() + '|' + hash(keys.length ? keys.join(',') : document.title + headings.join('|'));
    return { fields, links, buttons, headings, pageText, keys, pageId };
  }

  // ------------------------------------------------------------------ privacy helpers
  /** path without session codes, e.g. /v3/81bcaab2...--en -> /v3/:id */
  function cleanPath() {
    return location.pathname
      .split('/')
      .map((seg) => (/[0-9a-f]{16,}|[A-Za-z0-9_-]{24,}/i.test(seg) ? ':id' : seg))
      .join('/');
  }
  /** remove things that look personal before any text leaves the device */
  function redact(text) {
    return String(text || '')
      .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email]')
      .replace(/(?:\d[\s-]?){4,}/g, '#### ')
      .replace(/\b[A-Z]{5}\d{4}[A-Z]\b/g, '[PAN]');
  }

  // ------------------------------------------------------------------ templates
  function emptyTemplate() {
    return {
      id: scanRes.pageId,
      match: { host: location.host, path: '^' + location.pathname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', keys: scanRes.keys },
      langs: [],
      title: {},
      summary: {},
      keyPoints: {},
      documents: {},
      warnings: {},
      actions: [],
      fields: {},
      order: [],
      submit: null,
    };
  }
  function findBundled() {
    const list = window.SAHAYI_TEMPLATES || [];
    let best = null;
    let bestScore = 0;
    for (const t of list) {
      const m = t.match || {};
      if (m.host && !(location.host === m.host || location.host.endsWith('.' + m.host))) continue;
      if (m.path && !new RegExp(m.path).test(location.pathname)) continue;
      const want = m.keys || [];
      const score = want.length ? want.filter((k) => scanRes.keys.includes(k)).length / want.length : 0.7;
      if (score >= 0.6 && score > bestScore) {
        best = t;
        bestScore = score;
      }
    }
    return best;
  }
  function aiPayload(lang) {
    return {
      lang,
      page: {
        url: location.origin + cleanPath(),
        title: redact(document.title),
        headings: scanRes.headings.map(redact),
        text: redact(scanRes.pageText),
      },
      fields: scanRes.fields.map((f) => ({
        id: f.fid,
        kind: f.kind,
        type: f.inputType,
        label: redact(f.label),
        placeholder: redact(f.placeholder) || undefined,
        required: f.required,
        options: optionsOf(f).slice(0, 25).map((o) => redact(o.text)),
        do_it_yourself: f.self || undefined,
      })),
      links: scanRes.links.map((l) => ({ id: l.lid, text: redact(l.text) })),
      buttons: scanRes.buttons.map((b) => ({ id: b.bid, text: redact(b.text) })),
    };
  }
  function mergeAi(t, ai, lang) {
    const str = (v) => (typeof v === 'string' ? v : '');
    const arr = (v) => (Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x : x && (x[lang] || x.text || ''))).filter(Boolean) : []);
    t.title[lang] = str(ai.title);
    t.summary[lang] = str(ai.summary);
    t.keyPoints[lang] = arr(ai.key_points).slice(0, 5);
    t.documents[lang] = arr(ai.documents);
    t.warnings[lang] = arr(ai.warnings);
    const byFid = new Map(scanRes.fields.map((f) => [f.fid, f]));
    for (const af of Array.isArray(ai.fields) ? ai.fields : []) {
      const f = byFid.get(af.id);
      if (!f) continue;
      const tf = (t.fields[f.key] = t.fields[f.key] || { label: {}, help: {}, ask: {} });
      tf.required = !!af.required;
      tf.sensitive = !!af.sensitive;
      if (af.secret) tf.secret = true;
      tf.label[lang] = str(af.label);
      tf.help[lang] = str(af.help);
      tf.ask[lang] = str(af.ask);
      if (af.example) tf.example = str(af.example);
      if (af.section) (tf.section = tf.section || {})[lang] = str(af.section);
    }
    if (Array.isArray(ai.order) && ai.order.length) t.order = ai.order.map((id) => byFid.get(id)).filter(Boolean).map((f) => f.key);
    const byLid = new Map(scanRes.links.map((l) => [l.lid, l]));
    for (const a of Array.isArray(ai.actions) ? ai.actions : []) {
      const l = byLid.get(a.id);
      if (!l) continue;
      let ta = t.actions.find((x) => x.ref.text === l.text);
      if (!ta) t.actions.push((ta = { ref: { text: l.text, href: l.href }, label: {} }));
      ta.label[lang] = str(a.label);
    }
    const b = scanRes.buttons.find((x) => x.bid === ai.submit_id);
    if (b) t.submit = b.key;
    if (!t.langs.includes(lang)) t.langs.push(lang);
    return t;
  }
  function buildPlan() {
    const lang = prefs.lang;
    const t = tpl || emptyTemplate();
    const L = (o) => (o && (o[lang] || o.en || o.ml)) || '';
    const LA = (o) => (o && (o[lang] || o.en || o.ml)) || [];
    const byKey = new Map(scanRes.fields.map((f) => [f.key, f]));
    const keys = [...(t.order || []), ...scanRes.fields.map((f) => f.key)].filter((k, i, a) => a.indexOf(k) === i);
    const steps = [];
    const onlyTemplateFields = tplSource === 'template' && t.fields;
    const sectionOf = new Map();
    for (const sec of t.sections || []) for (const k of sec.keys || []) sectionOf.set(k, L(sec.title));
    for (const k of keys) {
      const f = byKey.get(k);
      if (!f) continue;
      // checked templates list exactly the questions to ask (secret fields like OTP are always shown)
      if (onlyTemplateFields && !t.fields[k] && !f.secret) continue;
      const tf = (t.fields && t.fields[k]) || {};
      if (tf.secret && !f.secret) {
        f.secret = f.self = f.required = true;
      }
      const basic = L(tf.label) ? null : basicLabel(f);
      const label = L(tf.label) || (basic && basic.label) || f.label;
      steps.push({
        key: k,
        f,
        label,
        help: L(tf.help) || (basic && basic.help) || '',
        ask: L(tf.ask) || (basic && basic.ask) || label,
        example: tf.example || '',
        required: !!(f.required || tf.required),
        sensitive: !!(tf.sensitive || (basic && basic.sensitive)),
        section: sectionOf.get(k) || L(tf.section) || '',
      });
    }
    let actions = (t.actions || [])
      .map((a) => ({ ref: a.ref, label: L(a.label) || a.ref.text, sub: '' }))
      .filter((a) => scanRes.links.some((l) => l.text === a.ref.text));
    if (!actions.length && tplSource === 'basic')
      actions = scanRes.links
        .filter((l) => !l.chrome)
        .concat(scanRes.links.filter((l) => l.chrome))
        .slice(0, 8)
        .map((l) => ({ ref: { text: l.text, href: l.href }, label: phrase(l.text) || l.text, sub: phrase(l.text) ? l.text : '' }));
    let submit = scanRes.buttons.find((b) => b.key === t.submit) || null;
    if (!submit && scanRes.fields.length)
      submit =
        scanRes.buttons.find((b) => b.isSubmit) ||
        scanRes.buttons.find((b) => /^(continue|submit|next|proceed|verify|log\s?in|sign\s?in|apply|save)\b/i.test(b.text)) ||
        null;
    return {
      title: L(t.title) || (tplSource === 'basic' && mainHeading() ? phrase(mainHeading()) || mainHeading() : '') || clean(document.title),
      summary: L(t.summary),
      keyPoints: LA(t.keyPoints),
      documents: LA(t.documents),
      warnings: LA(t.warnings),
      actions,
      steps,
      submit,
    };
  }
  // Simple names for common fields, used when no template/AI text exists (works offline, nothing sent).
  const BASIC = [
    [/\botp\b|one[\s-]?time/i, { ml: ['SMS ആയി വന്ന OTP', 'ഫോണിൽ SMS ആയി വന്ന നമ്പർ. ആരോടും പറയരുത്.'], en: ['OTP from SMS', 'The number that came to your phone by SMS. Never tell anyone.'] }],
    [/\bm?pin\b(?!\s*-?\s*code)|security\s*pin/i, { ml: ['നിങ്ങളുടെ രഹസ്യ PIN', 'നിങ്ങൾ മുമ്പ് ഉണ്ടാക്കിയ രഹസ്യ നമ്പർ. ആരോടും പറയരുത്.'], en: ['Your secret PIN', 'The secret number you created earlier. Never tell anyone.'] }],
    [/password/i, { ml: ['പാസ്‌വേഡ്', 'ആരോടും പറയരുത്.'], en: ['Password', 'Never tell anyone.'] }],
    [/aadhaa?r|\bvid\b|\buid\b/i, { ml: ['Aadhaar നമ്പർ', 'Aadhaar കാർഡിലെ 12 അക്ക നമ്പർ (അല്ലെങ്കിൽ 16 അക്ക VID).'], en: ['Aadhaar number', 'The 12-digit number on your Aadhaar card (or 16-digit VID).'], sensitive: true }],
    [/mobile|phone/i, { ml: ['മൊബൈൽ നമ്പർ', '10 അക്ക മൊബൈൽ നമ്പർ.'], en: ['Mobile number', 'Your 10-digit mobile number.'], sensitive: true }],
    [/user\s*name|username/i, { ml: ['യൂസർനെയിം', 'ഈ സൈറ്റിൽ നിങ്ങൾ ഉണ്ടാക്കിയ പേര്.'], en: ['Username', 'The user name you created on this site.'] }],
    [/date of birth|\bdob\b/i, { ml: ['ജനന തീയതി', 'Aadhaar കാർഡിൽ ഉള്ള ജനന തീയതി.'], en: ['Date of birth', 'As on your Aadhaar card.'] }],
    [/e-?mail/i, { ml: ['ഇമെയിൽ', ''], en: ['Email', ''] }],
    [/pin\s*-?\s*code|pincode|postal/i, { ml: ['PIN കോഡ്', 'പോസ്റ്റ് ഓഫീസിന്റെ 6 അക്ക നമ്പർ.'], en: ['PIN code', 'The 6-digit post office number.'] }],
  ];
  function basicLabel(f) {
    const text = `${f.label} ${f.placeholder || ''} ${f.els[0].id || ''} ${f.els[0].name || ''}`;
    for (const [re, v] of BASIC) {
      if (re.test(text)) {
        const [label, help] = v[prefs.lang] || v.en;
        return { label, help, ask: label, sensitive: !!v.sensitive };
      }
    }
    return null;
  }
  // Malayalam for common buttons/headings, used on pages without a template or AI (works offline, nothing sent)
  const PHRASES = {
    'select account': 'അക്കൗണ്ട് തിരഞ്ഞെടുക്കുക',
    'create new account': 'പുതിയ അക്കൗണ്ട് ഉണ്ടാക്കുക',
    'create account': 'അക്കൗണ്ട് ഉണ്ടാക്കുക',
    continue: 'തുടരുക',
    next: 'അടുത്തത്',
    back: 'പിന്നോട്ട്',
    cancel: 'റദ്ദാക്കുക',
    submit: 'സമർപ്പിക്കുക (Submit)',
    login: 'ലോഗിൻ ചെയ്യുക',
    'log in': 'ലോഗിൻ ചെയ്യുക',
    'sign in': 'ലോഗിൻ ചെയ്യുക',
    'sign up': 'അക്കൗണ്ട് ഉണ്ടാക്കുക',
    register: 'രജിസ്റ്റർ ചെയ്യുക',
    'login / register': 'ലോഗിൻ / രജിസ്റ്റർ',
    'resend otp': 'OTP വീണ്ടും അയയ്ക്കുക',
    'verify otp': 'OTP ഉറപ്പാക്കുക',
    verify: 'ഉറപ്പാക്കുക',
    logout: 'ലോഗൗട്ട്',
    'log out': 'ലോഗൗട്ട്',
    'sign out': 'ലോഗൗട്ട്',
    'forgot password?': 'പാസ്‌വേഡ് മറന്നോ?',
    'forgot password': 'പാസ്‌വേഡ് മറന്നോ?',
    home: 'ഹോം',
    dashboard: 'ഡാഷ്ബോർഡ്',
    'issued documents': 'എനിക്ക് ലഭിച്ച രേഖകൾ',
    'search documents': 'രേഖകൾ തിരയുക',
    'my documents': 'എന്റെ രേഖകൾ',
    profile: 'പ്രൊഫൈൽ',
    download: 'ഡൗൺലോഡ് ചെയ്യുക',
    view: 'കാണുക',
    'enter otp': 'OTP നൽകുക',
    'verify your mobile number': 'മൊബൈൽ നമ്പർ ഉറപ്പാക്കുക',
    'help': 'സഹായം',
    faq: 'സംശയങ്ങൾ (FAQ)',
  };
  function phrase(text) {
    if (prefs.lang !== 'ml') return null;
    return PHRASES[clean(text).toLowerCase().replace(/^\+\s*/, '')] || null;
  }
  // ------------------------------------------------------------------ the site's own error messages
  const ERROR_SEL =
    '[role="alert"], [aria-live="assertive"], .error, .errors, .alert-danger, .alert-error, .text-danger, .invalid-feedback, .help-block, ' +
    '.field-validation-error, .validation-summary-errors, .errorlist, .error-message, .err, .errormsg, [class*="error"], [class*="invalid"], [class*="danger"], [id*="error" i], [id*="Error"]';
  function isRed(el) {
    try {
      const m = getComputedStyle(el).color.match(/\d+(\.\d+)?/g);
      if (!m) return false;
      const [r, g, b] = m.map(Number);
      return r >= 150 && g <= 110 && b <= 110 && r - g >= 70;
    } catch {
      return false;
    }
  }
  function ownText(el) {
    let t = '';
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.textContent;
    return clean(t);
  }
  function okErrorText(t) {
    return t.length >= 4 && t.length <= 220 && /[a-z\u0D00-\u0D7F]{3}/i.test(t) && !/^fields? marked|^\*|mandatory fields|are mandatory/i.test(t);
  }
  /** visible error texts on the real page: [{ text, el }] */
  function pageErrors() {
    const out = [];
    const seen = new Set();
    const add = (el, text) => {
      text = clean(text);
      if (!okErrorText(text) || seen.has(text)) return;
      if ([...seen].some((x) => x.includes(text) || text.includes(x))) return;
      seen.add(text);
      out.push({ text, el });
    };
    for (const el of document.querySelectorAll(ERROR_SEL)) {
      if ((host && host.contains(el)) || el.matches('input,select,textarea,button,form,body,html') || !isShown(el)) continue;
      if (el.querySelector('input,select,textarea')) continue; // a whole form wrapper, not a message
      add(el, el.innerText);
    }
    const root = document.querySelector('main, [role="main"], form, #content') || document.body;
    const cands = root.querySelectorAll('p, span, div, small, label, li, font, b, strong, em, td');
    for (let i = 0; i < cands.length && i < 1500; i++) {
      const el = cands[i];
      const t = ownText(el);
      if (!t || (host && host.contains(el)) || !isRed(el) || !isShown(el)) continue;
      add(el, el.innerText);
    }
    return out.slice(0, 4);
  }
  const ERROR_ML = [
    [/(invalid|incorrect|wrong).*(user ?name|user ?id|email|login|mobile).*(password|pin)|(user ?name|email).*(or|and|\/).*password.*(invalid|incorrect|wrong)/i, 'യൂസർനെയിം അല്ലെങ്കിൽ പാസ്‌വേഡ് തെറ്റാണ്. ഒന്നുകൂടി ശ്രദ്ധിച്ച് നൽകൂ.'],
    [/(invalid|incorrect|wrong).*password|password.*(invalid|incorrect|wrong)/i, 'പാസ്‌വേഡ് തെറ്റാണ്. ഒന്നുകൂടി ശ്രദ്ധിച്ച് നൽകൂ.'],
    [/otp.*expired|expired.*otp/i, 'OTP-യുടെ സമയം കഴിഞ്ഞു. പുതിയ OTP ചോദിക്കൂ.'],
    [/(invalid|incorrect|wrong).*otp|otp.*(invalid|incorrect|wrong|mismatch)/i, 'OTP തെറ്റാണ്. SMS-ൽ വന്ന നമ്പർ ഒന്നുകൂടി നോക്കൂ.'],
    [/password.*(at least|minimum|min\.?)\s*(\d+)/i, (m) => `പാസ്‌വേഡിന് കുറഞ്ഞത് ${m[2]} അക്ഷരങ്ങൾ വേണം.`],
    [/(passwords?).*(do not|don.?t|does not) match|mismatch/i, 'രണ്ട് പാസ്‌വേഡുകളും ഒന്നല്ല. ഒരേ പോലെ ടൈപ്പ് ചെയ്യൂ.'],
    [/captcha|security code|(characters|letters|text) (shown|in the (image|picture))|image (text|code)/i, 'ചിത്രത്തിലെ അക്ഷരങ്ങൾ തെറ്റാണ്. ഒന്നുകൂടി നോക്കി ടൈപ്പ് ചെയ്യൂ.'],
    [/(invalid|incorrect|wrong).*(mobile|phone)|(mobile|phone).*(invalid|not valid)/i, 'മൊബൈൽ നമ്പർ ശരിയല്ല. 10 അക്കം ഉണ്ടോ എന്ന് നോക്കൂ.'],
    [/(invalid|incorrect).*e-?mail|e-?mail.*(invalid|not valid)/i, 'ഇമെയിൽ വിലാസം ശരിയല്ല.'],
    [/(invalid|incorrect).*aadhaa?r|aadhaa?r.*(invalid|not valid)/i, 'Aadhaar നമ്പർ ശരിയല്ല. 12 അക്കം ഉണ്ടോ എന്ന് നോക്കൂ.'],
    [/(user|account).*(not found|does ?n.?t exist|not registered)|not registered/i, 'ഈ അക്കൗണ്ട് കണ്ടെത്തിയില്ല. വിവരങ്ങൾ ഒന്നുകൂടി നോക്കൂ.'],
    [/too many|locked|blocked|try again later/i, 'പല തവണ തെറ്റി. കുറച്ച് സമയം കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കൂ.'],
    [/session.*(expired|timed? ?out)|timed? ?out/i, 'സമയം കഴിഞ്ഞു. പേജ് വീണ്ടും തുറന്ന് ശ്രമിക്കൂ.'],
    [/required|cannot be (empty|blank)|is mandatory|please (enter|fill|select)/i, 'ചില വിവരങ്ങൾ ബാക്കിയുണ്ട്. ചുവന്ന അടയാളമുള്ളവ പൂരിപ്പിക്കൂ.'],
    [/(invalid|incorrect|not valid|wrong|failed|error)/i, 'എന്തോ തെറ്റുണ്ട്. പേജ് പറയുന്നത് താഴെ കാണാം.'],
  ];
  function errorInMalayalam(text) {
    if (prefs.lang !== 'ml' || /[\u0D00-\u0D7F]/.test(text)) return null;
    for (const [re, ml] of ERROR_ML) {
      const m = text.match(re);
      if (m) return typeof ml === 'function' ? ml(m) : ml;
    }
    return null;
  }
  /** error shown next to one particular field on the real page */
  function fieldError(f, errors) {
    const el = f.els[0];
    if (el.getAttribute('aria-invalid') === 'true') {
      const ids = `${el.getAttribute('aria-errormessage') || ''} ${el.getAttribute('aria-describedby') || ''}`.trim().split(/\s+/).filter(Boolean);
      const t = ids.map((id) => clean((document.getElementById(id) || {}).innerText || '')).filter(Boolean).join(' ');
      if (t) return t;
    }
    const near = errors.find((e) => ownerField(e.el) === f);
    return near ? near.text : '';
  }
  /** the field a message on the page belongs to: the one sharing the deepest container with it,
   *  and (if several) the last one before it. Messages above the whole form belong to no field. */
  function ownerField(errEl) {
    const depth = (n) => {
      let d = 0;
      for (; n; n = n.parentElement) d++;
      return d;
    };
    let best = [];
    let bestDepth = -1;
    for (const f of scanRes.fields) {
      let a = f.container;
      while (a && !a.contains(errEl)) a = a.parentElement;
      if (!a) continue;
      const d = depth(a);
      if (d > bestDepth) {
        bestDepth = d;
        best = [f];
      } else if (d === bestDepth) best.push(f);
    }
    if (best.length === 1) return best[0];
    const before = best.filter((f) => f.container.compareDocumentPosition(errEl) & Node.DOCUMENT_POSITION_FOLLOWING);
    return before.length ? before[before.length - 1] : null;
  }
  function errorsSignature() {
    return pageErrors()
      .map((e) => e.text)
      .join('|');
  }

  function mainHeading() {
    const root = document.querySelector('main, [role="main"], #main-section, #main, #content') || document.body;
    const hd = [...root.querySelectorAll('h1, h2, h3')].find((x) => !(host && host.contains(x)) && isShown(x) && clean(x.innerText).length > 1);
    return hd ? clean(hd.innerText).slice(0, 80) : '';
  }
  function visibleSteps() {
    if (!plan) return [];
    // OTP/password fields are always "required"; they must not make every other field look optional
    const anyRequired = plan.steps.some((s) => s.required && !s.f.secret);
    return plan.steps.filter((s) => showOptional || !anyRequired || s.required);
  }

  // ------------------------------------------------------------------ reading / writing the real fields
  function currentValue(s) {
    if (s.key in pending) return pending[s.key];
    const f = s.f;
    const el = f.els[0];
    if (f.kind === 'radio') {
      const c = f.els.find((e) => e.checked);
      return c ? c.value : '';
    }
    if (f.kind === 'checkbox') return el.checked;
    if (f.kind === 'file') return el.files && el.files.length ? el.files[0].name : '';
    return el.value;
  }
  function displayValue(s) {
    const v = currentValue(s);
    if (s.f.kind === 'checkbox') return v ? T('yesOpt') : '';
    if (s.f.kind === 'select' || s.f.kind === 'radio') {
      const o = optionsOf(s.f).find((x) => x.value === v);
      return o ? o.text : '';
    }
    return v || '';
  }
  function setNative(el, value) {
    const proto = Object.getPrototypeOf(el);
    const d = Object.getOwnPropertyDescriptor(proto, 'value');
    if (d && d.set) d.set.call(el, value);
    else el.value = value;
  }
  function liveWrite(s, value) {
    // write while typing (input events only, so pages don't post back mid-typing)
    pending[s.key] = value;
    if (s.f.kind === 'text' || s.f.kind === 'textarea') {
      setNative(s.f.els[0], value);
      s.f.els[0].dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  function commit(s) {
    if (!s || !(s.key in pending)) return;
    const v = pending[s.key];
    delete pending[s.key];
    const f = s.f;
    const el = f.els[0];
    try {
      if (f.kind === 'radio') {
        const r = f.els.find((e) => e.value === v);
        if (r && !r.checked) r.click();
      } else if (f.kind === 'checkbox') {
        if (el.checked !== !!v) el.click();
      } else if (f.kind === 'select') {
        if (el.value !== v) {
          el.value = v;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else if (f.kind !== 'file') {
        setNative(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      }
    } catch (e) {
      console.warn('Sahayi: could not fill field', e);
    }
  }
  function pageValidation(s) {
    const el = s.f.els[0];
    try {
      if (el.checkValidity && !el.checkValidity()) return el.validationMessage;
    } catch {}
    return '';
  }

  // highlight elements on the real page (inline styles: no CSS needed, no CSP issues)
  let highlighted = null;
  function highlight(el) {
    unhighlight();
    if (!el) return;
    highlighted = { el, css: el.getAttribute('style') };
    const st = el.style;
    st.setProperty('outline', '5px solid #FFBF00', 'important');
    st.setProperty('outline-offset', '4px', 'important');
    st.setProperty('box-shadow', '0 0 0 9px #16181D, 0 0 0 9999px rgba(0,0,0,.45)', 'important');
    st.setProperty('position', getComputedStyle(el).position === 'static' ? 'relative' : getComputedStyle(el).position, 'important');
    st.setProperty('z-index', '2147483600', 'important');
    try {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } catch {
      el.scrollIntoView();
    }
  }
  function unhighlight() {
    if (!highlighted) return;
    const { el, css } = highlighted;
    if (css == null) el.removeAttribute('style');
    else el.setAttribute('style', css);
    highlighted = null;
  }

  // ------------------------------------------------------------------ voice
  const voice = { ctx: null, stream: null, run: 0, stopRec: null, stopAudio: null, confirmResolve: null, cache: new Map() };

  function unlockAudio() {
    try {
      if (!voice.ctx) voice.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (voice.ctx.state === 'suspended') voice.ctx.resume();
    } catch {}
  }
  async function ensureMic() {
    unlockAudio();
    if (voice.stream && voice.stream.active) return;
    voice.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  }
  function releaseMic() {
    if (voice.stream) voice.stream.getTracks().forEach((t) => t.stop());
    voice.stream = null;
  }

  /** Record until the person stops talking. Resolves base64 WAV, or null if nothing was said. */
  function record({ maxMs = 15000, noSpeechMs = 7000, silenceMs = 1400, onLevel } = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        await ensureMic();
      } catch (e) {
        reject(e);
        return;
      }
      const ctx = voice.ctx;
      if (ctx.state === 'suspended') await ctx.resume();
      const src = ctx.createMediaStreamSource(voice.stream);
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      const chunks = [];
      const t0 = performance.now();
      let started = false;
      let lastVoice = 0;
      let noise = 0.01;
      const calib = [];
      let done = false;
      const finish = (keep, force) => {
        if (done) return;
        done = true;
        try {
          proc.disconnect();
          src.disconnect();
        } catch {}
        voice.stopRec = null;
        resolve(keep && (started || force) && chunks.length > 4 ? encodeWav(chunks, ctx.sampleRate) : null);
      };
      voice.stopRec = finish;
      proc.onaudioprocess = (e) => {
        if (done) return;
        const d = e.inputBuffer.getChannelData(0);
        chunks.push(new Float32Array(d));
        let sum = 0;
        for (let i = 0; i < d.length; i++) sum += d[i] * d[i];
        const rms = Math.sqrt(sum / d.length);
        const now = performance.now();
        if (now - t0 < 350) {
          calib.push(rms);
          noise = Math.max(0.006, calib.reduce((a, b) => a + b, 0) / calib.length);
          return;
        }
        const thr = Math.max(noise * 3, 0.018);
        if (onLevel) onLevel(Math.min(1, rms / (thr * 3)));
        if (rms > thr) {
          started = true;
          lastVoice = now;
        }
        if (started && now - lastVoice > silenceMs) finish(true);
        else if (!started && now - t0 > noSpeechMs) finish(false);
        else if (now - t0 > maxMs) finish(true);
      };
      src.connect(proc);
      proc.connect(ctx.destination);
    });
  }
  function encodeWav(chunks, rate) {
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const ratio = rate / 16000;
    const outLen = Math.floor(total / ratio);
    const pcm = new Int16Array(outLen);
    let ci = 0;
    let off = 0;
    let pos = 0;
    for (let i = 0; i < outLen; i++) {
      const target = Math.floor(i * ratio);
      while (pos + chunks[ci].length <= target) {
        pos += chunks[ci].length;
        ci++;
      }
      off = target - pos;
      const s = Math.max(-1, Math.min(1, chunks[ci][off]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const buf = new ArrayBuffer(44 + pcm.length * 2);
    const v = new DataView(buf);
    const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF');
    v.setUint32(4, 36 + pcm.length * 2, true);
    w(8, 'WAVE');
    w(12, 'fmt ');
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, 1, true);
    v.setUint32(24, 16000, true);
    v.setUint32(28, 32000, true);
    v.setUint16(32, 2, true);
    v.setUint16(34, 16, true);
    w(36, 'data');
    v.setUint32(40, pcm.length * 2, true);
    new Int16Array(buf, 44).set(pcm);
    return bytesToB64(new Uint8Array(buf));
  }
  function bytesToB64(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function b64ToBytes(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function ttsAudio(text) {
    const k = prefs.lang + '|' + text;
    if (!voice.cache.has(k)) {
      const p = bridge.call('tts', { text, lang: prefs.lang }).then((r) => r.audio);
      voice.cache.set(k, p);
      p.catch(() => voice.cache.delete(k));
    }
    return voice.cache.get(k);
  }
  function prefetch(text) {
    if (text) ttsAudio(text).catch(() => {});
  }
  async function speak(text, run) {
    if (!text) return;
    stopAudio();
    let b64 = null;
    try {
      b64 = await ttsAudio(text);
    } catch {}
    if (run !== undefined && run !== voice.run) return;
    if (b64) {
      try {
        unlockAudio();
        const bytes = b64ToBytes(b64);
        const buffer = await voice.ctx.decodeAudioData(bytes.buffer);
        if (run !== undefined && run !== voice.run) return;
        await new Promise((resolve) => {
          const srcNode = voice.ctx.createBufferSource();
          srcNode.buffer = buffer;
          srcNode.connect(voice.ctx.destination);
          srcNode.onended = resolve;
          voice.stopAudio = () => {
            try {
              srcNode.stop();
            } catch {}
            resolve();
          };
          srcNode.start();
        });
        voice.stopAudio = null;
        return;
      } catch (e) {
        console.warn('Sahayi: audio playback failed, using system voice', e);
      }
    }
    await systemSpeak(text, run);
  }
  function systemSpeak(text, run) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) return resolve();
      const code = prefs.lang === 'ml' ? 'ml' : 'en';
      const v = speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith(code));
      if (!v && code === 'ml') return resolve(); // no Malayalam voice: text stays on screen
      const u = new SpeechSynthesisUtterance(text);
      if (v) u.voice = v;
      u.lang = v ? v.lang : 'en-IN';
      u.rate = 0.9;
      u.onend = u.onerror = resolve;
      voice.stopAudio = () => {
        speechSynthesis.cancel();
        resolve();
      };
      if (run !== undefined && run !== voice.run) return resolve();
      speechSynthesis.speak(u);
    });
  }
  /** Speak text with the device's own voice only (nothing sent anywhere). Silent if no suitable voice. */
  function deviceSpeak(text, run) {
    return new Promise((resolve) => {
      if (!text || !window.speechSynthesis) return resolve();
      const isMl = /[\u0D00-\u0D7F]/.test(text);
      const voices = speechSynthesis.getVoices();
      const v = isMl
        ? voices.find((x) => /^ml/i.test(x.lang))
        : voices.find((x) => /^en-IN/i.test(x.lang)) || voices.find((x) => /^en/i.test(x.lang));
      if (!v) return resolve();
      const spoken = String(text).replace(/\d{5,}/g, (d) => d.match(/.{1,4}/g).join(' '));
      const u = new SpeechSynthesisUtterance(spoken);
      u.voice = v;
      u.lang = v.lang;
      u.rate = 0.85;
      u.onend = u.onerror = resolve;
      voice.stopAudio = () => {
        speechSynthesis.cancel();
        resolve();
      };
      if (run !== undefined && run !== voice.run) return resolve();
      speechSynthesis.speak(u);
    });
  }
  function stopAudio() {
    if (voice.stopAudio) {
      const f = voice.stopAudio;
      voice.stopAudio = null;
      f();
    }
  }
  function stopVoice() {
    voice.run++;
    if (voice.stopRec) voice.stopRec(false);
    stopAudio();
    if (voice.confirmResolve) voice.confirmResolve(null);
  }

  async function transcribe(wav, prompt, withLang = true) {
    try {
      const r = await bridge.call('transcribe', { audio: wav, mime: 'audio/wav', lang: withLang ? prefs.lang : undefined, prompt });
      return clean(r.text);
    } catch (e) {
      console.warn('Sahayi: transcription failed', e);
      return '';
    }
  }
  function fieldInfo(s) {
    return {
      label: s.f.label,
      simple_label: s.label,
      kind: s.f.kind,
      type: s.f.inputType,
      placeholder: s.f.placeholder || undefined,
      maxlength: s.f.maxlength,
      pattern: s.f.pattern,
      options: optionsOf(s.f).map((o) => o.text),
    };
  }
  function applyNormalized(s, res) {
    const opts = optionsOf(s.f);
    if (s.f.kind === 'select' || s.f.kind === 'radio') {
      const o = opts[Number(res.value)];
      if (!o) return false;
      pending[s.key] = o.value;
      return true;
    }
    if (s.f.kind === 'checkbox') {
      pending[s.key] = res.value === true || res.value === 'true';
      return true;
    }
    if (res.value == null || res.value === '') return false;
    liveWrite(s, String(res.value));
    return true;
  }

  // ------------------------------------------------------------------ helpers for the page view
  function hasValue(s) {
    const v = currentValue(s);
    return s.f.kind === 'checkbox' ? !!v : !!(v && String(v).trim());
  }
  function firstUnfilledIndex() {
    const steps = visibleSteps();
    const i = steps.findIndex((s) => !s.f.self && !hasValue(s));
    return i >= 0 ? i : 0;
  }
  function stepIndexByKey(key) {
    return visibleSteps().findIndex((s) => s.key === key);
  }

  // ------------------------------------------------------------------ voice conversation (bottom bar)
  /** Voice mode for the current question: ask -> listen -> understand -> confirm -> fill -> next */
  async function voiceStep({ ask = true } = {}) {
    stopVoice();
    const run = voice.run;
    const steps = visibleSteps();
    const s = steps[cur];
    if (!s) return finishVoice();
    mode = 'voice';
    saveSession({ stepKey: s.key });
    setActive(s.key, true);
    const alive = () => run === voice.run && view === 'page' && mode === 'voice' && visibleSteps()[cur] === s;
    if (steps[cur + 1]) prefetch(steps[cur + 1].ask);
    prefetch(T('heardLead'));
    prefetch(T('isRight'));

    if (s.f.self) {
      setVoice('self', s);
      await speak(`${s.label}. ${T('selfTitle')}. ${s.f.secret ? T('selfSecret') : T('selfFile')}`, run);
      return;
    }
    if (ask) {
      setVoice('speaking', s);
      await speak(s.ask, run);
      if (!alive()) return;
    }
    if (s.sensitive && ask) {
      setVoice('typeHere', s);
      focusField(s.key);
      await speak(T('sensitive'), run);
      return;
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      setVoice('listening', s);
      let wav;
      try {
        wav = await record({ onLevel: (x) => ui.level && (ui.level.style.width = Math.round(x * 100) + '%') });
      } catch (e) {
        setVoice('idle', null, T('micDenied'));
        mode = 'type';
        return;
      }
      if (!alive()) return;
      if (!wav) {
        setVoice('speaking', s, T('sorry'));
        await speak(T('sorry'), run);
        if (!alive()) return;
        continue;
      }
      setVoice('thinking', s);
      const text = await transcribe(wav, `${s.label}. ${s.example ? T('example') + ': ' + s.example : ''}`);
      if (!alive()) return;
      if (!text) {
        setVoice('speaking', s, T('sorry'));
        await speak(T('sorry'), run);
        if (!alive()) return;
        continue;
      }
      const numericField =
        /tel|number/.test(s.f.inputType) ||
        /aadhaa?r|mobile|phone|pin\s*-?\s*code|pincode|account|ward|income|age|year|number|no\.?$/i.test(s.f.label + ' ' + s.label);
      if (!numericField && /^\D{0,12}\d{4,8}\D{0,12}$/.test(text)) {
        // sounds like an OTP/PIN was spoken: drop it, don't send it on
        setVoice('speaking', s, T('looksSecret'));
        await speak(T('looksSecret'), run);
        if (!alive()) return;
        continue;
      }
      if (!s.required && SKIP_RE.test(text) && !['checkbox', 'radio', 'select'].includes(s.f.kind)) {
        voiceNext(true);
        return;
      }
      let res = null;
      try {
        res = await bridge.call('normalize', { lang: prefs.lang, transcript: text, field: fieldInfo(s) });
      } catch (e) {
        console.warn('Sahayi: normalize failed', e);
      }
      if (!alive()) return;
      if (!res || !res.ok || !applyNormalized(s, res)) {
        const msg = (res && res.problem) || T('sorry');
        setVoice('speaking', s, msg);
        await speak(msg, run);
        if (!alive()) return;
        continue;
      }
      refreshField(s.key);
      const shown = displayValue(s) || res.display || '';
      setVoice('confirm', s, shown);
      // read-back: fixed phrases from OpenAI voice (cached); the answer itself only from the device's own voice
      await speak(T('heardLead'), run);
      if (!alive()) return;
      await deviceSpeak(shown, run);
      if (!alive()) return;
      await speak(T('isRight'), run);
      if (!alive()) return;
      const answer = await confirm(run);
      if (!alive()) return;
      if (answer === 'yes') {
        voiceNext();
        return;
      }
      if (answer === 'type') {
        stopVoiceMode();
        focusField(s.key);
        return;
      }
      delete pending[s.key];
      refreshField(s.key);
      setVoice('speaking', s, T('sayAgain'));
      await speak(T('sayAgain'), run);
      if (!alive()) return;
    }
    setVoice('typeHere', s, T('fallbackType'));
    focusField(s.key);
    await speak(T('fallbackType'), run);
  }

  /** Wait for yes/no by voice or button. */
  function confirm(run) {
    return new Promise((resolve) => {
      voice.confirmResolve = (v) => {
        voice.confirmResolve = null;
        if (voice.stopRec) voice.stopRec(false);
        resolve(v);
      };
      (async () => {
        try {
          const wav = await record({ maxMs: 6000, noSpeechMs: 5000, silenceMs: 900 });
          if (!voice.confirmResolve || run !== voice.run || !wav) return; // keep waiting for a tap
          const text = await transcribe(wav, 'ശരി, അതെ, അല്ല, ഇല്ല, yes, no', false);
          if (!voice.confirmResolve) return;
          if (NO_RE.test(text)) voice.confirmResolve('no');
          else if (YES_RE.test(text)) voice.confirmResolve('yes');
        } catch {}
      })();
    });
  }

  function startVoice(index) {
    unlockAudio();
    stopVoice();
    mode = 'voice';
    cur = Math.max(0, Math.min(index, visibleSteps().length - 1));
    voiceStep();
  }
  function voiceNext(skip) {
    const steps = visibleSteps();
    const s = steps[cur];
    if (s) {
      commit(s);
      refreshField(s.key);
    }
    updateProgress();
    cur++;
    if (!skip) while (cur < steps.length && !steps[cur].f.self && hasValue(steps[cur])) cur++;
    if (cur >= steps.length) return finishVoice();
    voiceStep();
  }
  function voicePrev() {
    if (cur > 0) cur--;
    voiceStep();
  }
  function finishVoice() {
    stopVoice();
    mode = 'type';
    setActive(null);
    saveSession({ stepKey: null });
    setVoice('done');
    speak(T('allDone'), voice.run);
  }
  function stopVoiceMode() {
    stopVoice();
    mode = 'type';
    saveSession();
    setActive(null);
    setVoice('idle');
  }

  // ------------------------------------------------------------------ icons (inline SVG, no network)
  const ICONS = {
    check: 'M20 6 9 17l-5-5',
    x: 'M18 6 6 18M6 6l12 12',
    mic: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v3',
    speaker: 'M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14',
    lock: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4',
    alert: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    back: 'M19 12H5M11 6l-6 6 6 6',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',
    download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
    pen: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
    type: 'M4 7V4h16v3M9 20h6M12 4v16',
    contrast: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 2a10 10 0 0 1 0 20z',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    refresh: 'M21 12a9 9 0 1 1-2.6-6.4L21 8M21 3v5h-5',
    stop: 'M7 7h10v10H7z',
    skip: 'M5 4l10 8-10 8V4zM19 5v14',
    home: 'M3 11l9-8 9 8M5 10v10h14V10',
    phone: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2',
    help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01',
    heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z',
    car: 'M5 17h14M6 17v2M18 17v2M3 13l2-6h14l2 6v4H3zM7 13h.01M17 13h.01',
    school: 'M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5',
  };
  function icon(name) {
    const span = document.createElement('span');
    span.className = 'ic';
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = `<svg viewBox="0 0 24 24"><path d="${ICONS[name] || ICONS.arrow}"/></svg>`;
    return span;
  }
  function iconFor(text) {
    const t = text.toLowerCase();
    if (/status|track|നില/.test(t)) return 'search';
    if (/download|form|ഡൗൺ/.test(t)) return 'download';
    if (/\*\*|verified|account|login|log in|sign|register|ലോഗിൻ|അക്കൗണ്ട്/.test(t)) return 'user';
    if (/apply|application|അപേക്ഷ/.test(t)) return 'pen';
    if (/faq|help|question|സംശയ/.test(t)) return 'help';
    if (/health|ആരോഗ്യ/.test(t)) return 'heart';
    if (/driving|licen|vehicle|ഡ്രൈവിം|വാഹന/.test(t)) return 'car';
    if (/mark|school|class|education|degree|മാർക്ക്|ക്ലാസ്/.test(t)) return 'school';
    if (/identity|aadhaar|id\b|തിരിച്ചറിയ/.test(t)) return 'shield';
    if (/home|kerala|state|കേരള/.test(t)) return 'home';
    return 'doc';
  }

  // ------------------------------------------------------------------ styles
  const CSS_TEXT = `
:host{all:initial}
*{box-sizing:border-box}
.root{--bg:#F6F4EE;--surface:#FFFFFF;--surface2:#EFECE3;--text:#14201C;--muted:#4A5852;--primary:#0F5C4D;--primary-hover:#0B4A3E;--on-primary:#FFFFFF;--soft:#E2EFEA;--border:#DAD5C8;--border-strong:#8C978F;--warn-bg:#FFF3D6;--warn:#6E4300;--warn-line:#E2A93B;--danger:#A61B1B;--ok:#1D7A46;--focus:#F2B705;--bar:#0B3D33;
  --shadow:0 1px 2px rgba(20,32,28,.06),0 12px 32px rgba(20,32,28,.07);
  font-family:"Noto Sans Malayalam","Nirmala UI","Malayalam Sangam MN","Kartika",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  font-size:calc(19px * var(--scale,1));line-height:1.6;color:var(--text);-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased}
.root.hc{--bg:#000;--surface:#0A0A0A;--surface2:#1A1A1A;--text:#FFF;--muted:#F2F2F2;--primary:#FFE600;--primary-hover:#FFF176;--on-primary:#000;--soft:#262300;--border:#FFF;--border-strong:#FFF;--warn-bg:#000;--warn:#FFE600;--warn-line:#FFE600;--danger:#FF9A9A;--ok:#7CFF9B;--bar:#000;--shadow:none}
.app{position:fixed;inset:0;display:flex;flex-direction:column;background:var(--bg);color:var(--text);pointer-events:auto}
[hidden]{display:none!important}
button,input,select,textarea{font:inherit;color:inherit;letter-spacing:inherit}
button{cursor:pointer;background:none;border:0;padding:0;margin:0}
.ic{display:inline-flex;flex:none}
.ic svg{width:1.2em;height:1.2em;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
:focus-visible{outline:3px solid var(--focus)!important;outline-offset:2px}
[tabindex="-1"]:focus{outline:none!important}
p{margin:0}

.hdr{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;padding:10px 24px;background:var(--surface);border-bottom:1px solid var(--border)}
.brand{display:flex;align-items:center;gap:12px;margin-right:auto;min-width:0}
.logo{width:42px;height:42px;border-radius:13px;background:var(--primary);color:var(--on-primary);display:grid;place-items:center;font-weight:800;font-size:22px;line-height:1;flex:none}
.brand-text{display:flex;flex-direction:column;line-height:1.25;min-width:0}
.brand-text b{font-size:1em;color:var(--primary);font-weight:800}
.brand-text small{font-size:.72em;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:46vw}
.hdr-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.seg{display:inline-flex;background:var(--surface2);border-radius:13px;padding:4px;gap:4px}
.seg-btn{min-height:42px;padding:0 14px;border-radius:10px;font-weight:700;font-size:.82em;color:var(--muted)}
.seg-btn[aria-pressed="true"]{background:var(--surface);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.14)}
.hc .seg-btn[aria-pressed="true"]{background:var(--primary);color:var(--on-primary)}
.hbtn{display:inline-flex;align-items:center;gap:8px;min-height:50px;padding:0 14px;border-radius:13px;border:1px solid var(--border);background:var(--surface);font-weight:700;font-size:.82em}
.hbtn:hover{background:var(--surface2)}
.menu-wrap{position:relative}
.menu{position:absolute;right:0;top:calc(100% + 8px);width:270px;background:var(--surface);border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow);padding:14px;z-index:5}
.menu-label{margin:0 0 8px;font-size:.78em;font-weight:700;color:var(--muted)}
.menu .seg{display:flex}
.menu .seg-btn{flex:1}
.menu-item{display:flex;align-items:center;gap:12px;width:100%;min-height:50px;padding:0 12px;margin-top:8px;border-radius:12px;font-weight:600;text-align:left;font-size:.9em}
.menu-item:hover{background:var(--surface2)}
.menu-item[aria-checked="true"]{background:var(--soft)}
@media (max-width:600px){.hide-sm{display:none}.hdr{padding:8px 12px}.brand-text small{max-width:38vw}}

.main{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;scroll-behavior:smooth}
.page{max-width:1180px;margin:0 auto;padding:36px 28px 56px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.12fr);grid-template-areas:"top form" "bottom form";grid-template-rows:auto 1fr;gap:8px 44px;align-items:start}
.page.info-only{grid-template-columns:minmax(0,1fr);grid-template-areas:"top" "bottom";grid-template-rows:auto;max-width:880px}
.page.single{display:block;max-width:760px}
.area-top{grid-area:top}.area-bottom{grid-area:bottom}.area-form{grid-area:form}
@media (max-width:940px){.page{grid-template-columns:minmax(0,1fr);grid-template-areas:"top" "form" "bottom";grid-template-rows:auto;padding:22px 16px 36px;gap:20px}}

.eyebrow{display:inline-flex;align-items:center;gap:8px;margin:0 0 16px;padding:6px 14px;border-radius:999px;background:var(--soft);color:var(--primary);font-weight:700;font-size:.76em}
h1{font-size:2.05em;line-height:1.22;margin:0 0 14px;font-weight:800;letter-spacing:-.01em}
@media (max-width:600px){h1{font-size:1.6em}}
.lead{font-size:1.12em;color:var(--text)}
.notice{display:flex;gap:10px;align-items:flex-start;margin-top:18px;padding:12px 14px;border-radius:14px;background:var(--surface2);font-size:.88em}
.alert{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:14px;background:var(--warn-bg);color:var(--warn);border-left:6px solid var(--warn-line);font-weight:700;margin-top:18px}
.hc .alert{border:2px solid var(--warn)}
.alert .ic{margin-top:.15em}
.card{background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:20px 22px;box-shadow:var(--shadow);margin-top:22px}
.card-title{display:flex;align-items:center;gap:10px;font-size:1.02em;margin:0 0 10px;font-weight:800}
.card-title .ic{color:var(--primary)}
.chk{display:flex;gap:14px;align-items:center;width:100%;min-height:54px;padding:8px 10px;margin:0 -10px;border-radius:12px;text-align:left;font-weight:600}
.chk:hover{background:var(--surface2)}
.box{flex:none;width:28px;height:28px;border:2px solid var(--border-strong);border-radius:8px;display:grid;place-items:center;color:transparent;background:var(--surface)}
.box .ic svg{width:18px;height:18px;stroke-width:3}
[aria-checked="true"]>.box{background:var(--ok);border-color:var(--ok);color:#fff}
.chk[aria-checked="true"] .chk-text{color:var(--muted);text-decoration:line-through}
.facts{list-style:none;margin:0;padding:0}
.facts li{display:flex;gap:12px;padding:11px 0;border-top:1px solid var(--border)}
.facts li:first-child{border-top:0;padding-top:2px}
.facts .ic{color:var(--ok);margin-top:.22em}
.section-title{font-size:1.02em;font-weight:800;margin:30px 0 12px}
.actions{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.action{display:flex;align-items:center;gap:14px;min-height:72px;padding:12px 16px;border-radius:18px;border:1px solid var(--border);background:var(--surface);text-align:left;font-weight:700;box-shadow:0 1px 2px rgba(20,32,28,.05)}
.action:hover{border-color:var(--primary);background:var(--soft)}
.action-ic{width:46px;height:46px;border-radius:14px;background:var(--soft);color:var(--primary);display:grid;place-items:center;flex:none}
.action-label{flex:1;line-height:1.35}
.action-sub{display:block;font-size:.76em;font-weight:600;color:var(--muted)}
.action>.ic{color:var(--muted)}
.src{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-top:26px;font-size:.78em;color:var(--muted)}
.link-btn{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 10px;border-radius:10px;color:var(--primary);font-weight:700}
.link-btn:hover{background:var(--soft)}
.empty{padding:28px;text-align:center;color:var(--muted)}

.form-card{background:var(--surface);border:1px solid var(--border);border-radius:26px;box-shadow:var(--shadow);overflow:hidden}
.form-head{padding:24px 26px 20px;background:linear-gradient(180deg,var(--soft),var(--surface));border-bottom:1px solid var(--border)}
.hc .form-head{background:var(--surface)}
.form-head h2{margin:0;font-size:1.3em;font-weight:800}
.page-errors:empty{display:none}
.mode-link{margin-top:8px}
.one .sec{padding:26px 26px 10px}
.step-count{font-size:.85em;font-weight:800;color:var(--primary);margin:0 0 6px}
.one .fld{margin:0 -16px;padding-top:8px}
.one .fld-label{font-size:1.45em;line-height:1.35}
.one .fld-help{font-size:1em}
.one .field{min-height:68px;font-size:1.25em}
.one .choice{min-height:64px;font-size:1.05em}
.nav-row{display:flex;gap:12px}
.nav-row .btn{flex:1}
.nav-row .btn[disabled]{opacity:.4;cursor:default}
.page-errors{margin-top:14px}
.page-error{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;margin-top:10px;border-radius:14px;background:#FDECEC;color:#8A1414;border-left:6px solid #C62828;font-size:1.02em}
.page-error b{display:block;line-height:1.4}
.page-error small{display:block;margin-top:4px;font-size:.8em;font-weight:600;opacity:.9}
.page-error .ic{margin-top:.15em}
.hc .page-error{background:#000;color:#FF9A9A;border:2px solid #FF9A9A}
.prog{display:flex;align-items:center;gap:12px;margin:10px 0 18px;font-size:.82em;color:var(--muted);font-weight:700}
.bar{flex:1;height:8px;border-radius:99px;background:var(--surface2);overflow:hidden}
.bar>i{display:block;height:100%;width:0;background:var(--primary);border-radius:99px;transition:width .3s}
.talk{display:flex;align-items:center;gap:14px;width:100%;padding:14px 18px;border-radius:18px;background:var(--primary);color:var(--on-primary);text-align:left}
.talk:hover{background:var(--primary-hover)}
.talk .mic-dot{width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.18);display:grid;place-items:center;flex:none}
.talk .mic-dot svg{width:26px;height:26px}
.hc .talk .mic-dot{background:rgba(0,0,0,.15)}
.talk b{display:block;font-size:1.05em}
.talk small{display:block;opacity:.92;font-size:.8em;font-weight:500}
.talk>.ic{margin-left:auto}
.opt-toggle{display:flex;gap:12px;align-items:center;width:100%;min-height:52px;margin-top:12px;padding:6px 4px;border-radius:12px;font-weight:600;font-size:.88em;text-align:left}
.sec{border:0;margin:0;padding:22px 26px 8px;border-top:1px solid var(--border);min-width:0}
.sec:first-of-type{border-top:0}
.sec-title{display:flex;align-items:center;gap:12px;padding:0;margin:0 0 4px;font-weight:800;font-size:1.06em}
.sec-num{width:32px;height:32px;border-radius:50%;background:var(--primary);color:var(--on-primary);display:grid;place-items:center;font-size:.82em;flex:none}
.sec-count{margin-left:auto;font-size:.72em;color:var(--muted);font-weight:700}
.fld{padding:16px 16px 18px;margin:4px -16px;border-radius:18px;transition:background .2s,box-shadow .2s;scroll-margin:120px}
.fld.active{background:var(--soft);box-shadow:inset 0 0 0 3px var(--primary)}
.fld-top{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;margin-bottom:4px}
.fld-label{font-weight:800;font-size:1.04em;line-height:1.4}
.tag{font-size:.68em;font-weight:800;padding:2px 10px;border-radius:999px;background:var(--surface2);color:var(--muted)}
.tag.req{background:var(--warn-bg);color:var(--warn)}
.hc .tag{border:1px solid currentColor}
.done-tick{color:var(--ok);margin-left:auto}
.fld-help{margin:0 0 10px;color:var(--muted);font-size:.9em}
.fld-orig{margin:8px 0 0;font-size:.74em;color:var(--muted)}
.field{width:100%;min-height:58px;padding:10px 16px;font-size:1.08em;border:2px solid var(--border-strong);border-radius:14px;background:var(--surface);color:var(--text)}
.field:focus{border-color:var(--primary);outline:none;box-shadow:0 0 0 4px var(--soft)}
.field::placeholder{color:#8A938E;opacity:1}
textarea.field{min-height:120px;resize:vertical}
.choices{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}
.choice{display:flex;align-items:center;gap:12px;min-height:56px;padding:10px 14px;border-radius:14px;border:2px solid var(--border);background:var(--surface);text-align:left;font-weight:700;line-height:1.35}
.choice:hover{border-color:var(--border-strong)}
.choice .dot{width:22px;height:22px;border-radius:50%;border:2px solid var(--border-strong);flex:none}
.choice[aria-checked="true"]{border-color:var(--primary);background:var(--soft)}
.choice[aria-checked="true"] .dot{border-color:var(--primary);background:var(--primary);box-shadow:inset 0 0 0 4px var(--surface)}
.check-row{display:flex;gap:14px;align-items:center;min-height:56px;padding:10px 14px;border-radius:14px;border:2px solid var(--border);background:var(--surface);font-weight:700;width:100%;text-align:left}
.check-row[aria-checked="true"]{border-color:var(--ok)}
.self{display:flex;gap:14px;align-items:flex-start;padding:16px;border-radius:16px;background:var(--surface2)}
.self>.ic{color:var(--primary);margin-top:.15em}
.self p{margin:0 0 12px}
.fld-err{margin:8px 0 0;color:var(--danger);font-weight:700;font-size:.88em}
.fld-err:empty{display:none}
.mini-btn{display:inline-flex;align-items:center;gap:6px;margin-top:10px;min-height:42px;padding:0 14px;border-radius:12px;color:var(--primary);font-weight:700;font-size:.82em;border:1px solid var(--border);background:var(--surface)}
.mini-btn:hover{background:var(--soft)}
.form-foot{padding:20px 26px 26px;border-top:1px solid var(--border)}
.form-foot .small{margin-top:12px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:56px;padding:10px 22px;border-radius:15px;font-weight:800;line-height:1.3;text-align:center;border:2px solid var(--primary);color:var(--primary);background:var(--surface)}
.btn:hover{background:var(--soft)}
.btn.primary{background:var(--primary);color:var(--on-primary)}
.btn.primary:hover{background:var(--primary-hover)}
.btn.block{display:flex;width:100%}
.btn.big{min-height:64px;font-size:1.04em}
.btn.quiet{border-color:var(--border);color:var(--text)}
.small{font-size:.8em}.muted{color:var(--muted)}

.vbar{display:flex;align-items:center;gap:12px 16px;flex-wrap:wrap;padding:12px 24px calc(12px + env(safe-area-inset-bottom));background:var(--surface);border-top:1px solid var(--border);box-shadow:0 -10px 30px rgba(20,32,28,.08)}
.vbar.on{background:var(--bar);color:#fff;border-top-color:var(--bar)}
.hc .vbar.on{border-top:2px solid #FFE600}
.vb-ic{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--soft);color:var(--primary)}
.vb-ic svg{width:26px;height:26px}
.vbar.on .vb-ic{background:rgba(255,255,255,.14);color:#fff}
.vb-ic.pulse{animation:pulse 1.5s ease-in-out infinite;background:#F2B705;color:#14201C}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(242,183,5,.55)}50%{box-shadow:0 0 0 12px rgba(242,183,5,0)}}
.vb-text{flex:1 1 240px;min-width:0}
.vb-text b{display:block;font-size:1em;line-height:1.35}
.vb-text small{display:block;font-size:.8em;opacity:.88;margin-top:2px}
.vb-heard{display:inline-block;margin-top:6px;padding:4px 12px;border-radius:10px;background:rgba(255,255,255,.14);font-size:1.2em;font-weight:800;word-break:break-word}
.vb-actions{display:flex;gap:8px;flex-wrap:wrap}
.vbar .btn{min-height:52px;padding:6px 18px}
.vbar.on .btn{border-color:rgba(255,255,255,.55);color:#fff;background:transparent}
.vbar.on .btn:hover{background:rgba(255,255,255,.1)}
.vbar.on .btn.primary{background:#F2B705;border-color:#F2B705;color:#14201C}
.vb-count{font-size:.78em;font-weight:700;opacity:.85;white-space:nowrap}
.level{height:10px;border-radius:5px;background:rgba(255,255,255,.22);overflow:hidden;margin-top:8px;max-width:340px}
.level>i{display:block;height:100%;width:0;background:#F2B705;transition:width .08s linear}
@media (max-width:600px){.vbar{padding:10px 12px calc(10px + env(safe-area-inset-bottom))}.vb-actions{width:100%}.vb-actions .btn{flex:1 1 0;padding:6px 10px}
  .vbar.idle{flex-wrap:nowrap}.vbar.idle .vb-ic,.vbar.idle .vb-text small{display:none}.vbar.idle .vb-actions{width:auto}.vbar.idle .vb-actions .btn{flex:none;padding:6px 16px}.vbar .vb-ic{width:44px;height:44px}}

.rv-card{background:var(--surface);border:1px solid var(--border);border-radius:22px;box-shadow:var(--shadow);padding:6px 22px;margin-top:18px}
.rv-card h2{font-size:.95em;margin:16px 0 4px;color:var(--muted);font-weight:800}
.rv-row{display:flex;align-items:center;gap:12px;padding:14px 0;border-top:1px solid var(--border)}
.rv-card h2+.rv-row{border-top:0}
.rv-main{flex:1;min-width:0}
.rv-main b{display:block;font-size:.82em;color:var(--muted);font-weight:700}
.rv-main span{display:block;font-weight:800;font-size:1.08em;word-break:break-word}
.rv-row.missing .rv-main span{color:var(--warn)}
.sticky-foot{position:sticky;bottom:0;display:flex;gap:12px;flex-wrap:wrap;padding:18px 0 calc(18px + env(safe-area-inset-bottom));margin-top:8px;background:linear-gradient(rgba(0,0,0,0),var(--bg) 35%)}
.sticky-foot .btn{flex:1 1 240px}

.center{max-width:600px;margin:14vh auto 0;padding:0 18px;text-align:center}
.center .btn{margin-top:14px}
.spinner{width:56px;height:56px;margin:0 auto 22px;border-radius:50%;border:5px solid var(--soft);border-top-color:var(--primary);animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.skel{height:16px;border-radius:8px;margin:12px auto;background:var(--surface2)}

.peek{position:fixed;left:16px;right:16px;bottom:16px;pointer-events:auto;background:#0B3D33;color:#fff;padding:16px 18px;border-radius:22px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;box-shadow:0 12px 40px rgba(0,0,0,.35);z-index:2}
.peek p{flex:1 1 260px;margin:0;font-weight:700}
.peek .btn{flex:1 1 220px;background:#F2B705;border-color:#F2B705;color:#14201C}
.launcher{position:fixed;right:20px;bottom:20px;pointer-events:auto;display:flex;align-items:center;gap:12px;min-height:58px;padding:8px 22px 8px 8px;border-radius:999px;background:#0F5C4D;color:#fff;font-weight:700;font-size:17px;box-shadow:0 12px 32px rgba(0,0,0,.28);z-index:2}
.launcher .logo{width:42px;height:42px;border-radius:50%;background:#fff;color:#0F5C4D;font-size:20px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (prefers-reduced-motion:reduce){.main{scroll-behavior:auto}.vb-ic.pulse,.spinner{animation:none}*{transition:none!important}}
`;

  // ------------------------------------------------------------------ shell
  function ensureShell() {
    if (host && host.isConnected) return;
    host = document.createElement('div');
    host.id = 'sahayi-host';
    host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
    shadow = host.attachShadow({ mode: 'open' });
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(CSS_TEXT);
      shadow.adoptedStyleSheets = [sheet];
    } catch {
      shadow.append(h('style', { text: CSS_TEXT }));
    }
    const root = h('div', { class: 'root', lang: prefs.lang });
    app = h('div', { class: 'app', role: 'dialog', 'aria-modal': 'true', 'aria-label': T('app'), hidden: true });
    peekBar = h('div', { class: 'peek', hidden: true });
    launcherEl = h('button', { class: 'launcher', hidden: true, onclick: () => open() });
    liveRegion = h('div', { class: 'sr', 'aria-live': 'polite' });
    root.append(app, peekBar, launcherEl, liveRegion);
    shadow.append(root);
    // close the display menu when clicking elsewhere / pressing Escape
    shadow.addEventListener('click', (e) => {
      const menu = shadow.querySelector('.menu');
      if (menu && !menu.hidden && !e.composedPath().some((n) => n.classList && n.classList.contains('menu-wrap'))) toggleMenu(false);
    });
    shadow.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggleMenu(false);
    });
    document.documentElement.append(host);
    applyPrefs();
  }
  function setLauncher() {
    launcherEl.replaceChildren(h('span', { class: 'logo', 'aria-hidden': 'true' }, 'സ'), T('launcher'));
  }
  function applyPrefs() {
    if (!shadow) return;
    const root = shadow.querySelector('.root');
    root.style.setProperty('--scale', prefs.scale);
    root.classList.toggle('hc', !!prefs.hc);
    root.setAttribute('lang', prefs.lang);
    shadow.querySelectorAll('[data-scale]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.scale) === prefs.scale)));
    shadow.querySelectorAll('[data-hc]').forEach((b) => b.setAttribute('aria-checked', String(!!prefs.hc)));
  }
  function lockPage(lock) {
    const de = document.documentElement;
    if (lock) {
      if (savedOverflow === null) savedOverflow = de.style.overflow;
      de.style.overflow = 'hidden';
      // many government sites have no mobile viewport: make ours readable on phones
      let vp = document.querySelector('meta[name="viewport"]');
      if (savedViewport === null) savedViewport = vp ? vp.getAttribute('content') : '';
      if (!vp) {
        vp = document.createElement('meta');
        vp.name = 'viewport';
        vp.dataset.sahayi = '1';
        document.head && document.head.append(vp);
      }
      vp.setAttribute('content', 'width=device-width, initial-scale=1');
    } else {
      if (savedOverflow !== null) de.style.overflow = savedOverflow;
      savedOverflow = null;
      const vp = document.querySelector('meta[name="viewport"]');
      if (vp && savedViewport !== null) {
        if (vp.dataset.sahayi) vp.remove();
        else vp.setAttribute('content', savedViewport);
      }
      savedViewport = null;
    }
  }
  function toggleMenu(open) {
    const menu = shadow && shadow.querySelector('.menu');
    const btn = shadow && shadow.querySelector('[data-menu-btn]');
    if (!menu) return;
    menu.hidden = open === undefined ? !menu.hidden : !open;
    if (btn) btn.setAttribute('aria-expanded', String(!menu.hidden));
  }

  function header() {
    const seg = (code, label) =>
      h('button', { class: 'seg-btn', lang: code, 'aria-pressed': String(prefs.lang === code), onclick: () => prefs.lang !== code && toggleLang() }, label);
    const menu = h(
      'div',
      { class: 'menu', hidden: true },
      h('p', { class: 'menu-label' }, T('textSize')),
      h(
        'div',
        { class: 'seg', role: 'group', 'aria-label': T('textSize') },
        [1, 1.2, 1.4].map((v, i) =>
          h('button', { class: 'seg-btn', 'data-scale': String(v), 'aria-pressed': String(prefs.scale === v), onclick: () => setScale(v) }, ['A', 'A+', 'A++'][i])
        )
      ),
      h('button', { class: 'menu-item', role: 'menuitemcheckbox', 'data-hc': '1', 'aria-checked': String(!!prefs.hc), onclick: toggleContrast }, icon('contrast'), T('highContrast')),
      h('button', { class: 'menu-item', onclick: () => bridge.call('settings', {}).catch(() => {}) }, icon('gear'), T('settings'))
    );
    return h(
      'header',
      { class: 'hdr' },
      h(
        'div',
        { class: 'brand' },
        h('span', { class: 'logo', 'aria-hidden': 'true' }, 'സ'),
        h('span', { class: 'brand-text' }, h('b', {}, T('app')), h('small', {}, location.hostname.replace(/^www\./, '')))
      ),
      h(
        'div',
        { class: 'hdr-actions' },
        h('div', { class: 'seg', role: 'group', 'aria-label': 'Language / ഭാഷ' }, seg('ml', 'മലയാളം'), seg('en', 'English')),
        h(
          'div',
          { class: 'menu-wrap' },
          h('button', { class: 'hbtn', 'data-menu-btn': '1', 'aria-haspopup': 'true', 'aria-expanded': 'false', 'aria-label': T('display'), onclick: () => toggleMenu() }, icon('type'), h('span', { class: 'hide-sm' }, T('display'))),
          menu
        ),
        h('button', { class: 'hbtn', onclick: close, 'aria-label': T('original') }, icon('x'), h('span', { class: 'hide-sm' }, T('original')))
      )
    );
  }

  // ------------------------------------------------------------------ views
  function render() {
    ensureShell();
    app.hidden = view === 'peek' || view === 'closed';
    peekBar.hidden = view !== 'peek';
    launcherEl.hidden = true;
    applyPrefs();
    if (view === 'loading') return renderLoading();
    if (view === 'error') return renderError();
    if (view === 'page') return renderPage();
    if (view === 'review') return renderReview();
  }

  function renderLoading() {
    ui = {};
    app.replaceChildren(
      header(),
      h(
        'main',
        { class: 'main' },
        h(
          'div',
          { class: 'center' },
          h('div', { class: 'spinner', 'aria-hidden': 'true' }),
          h('h1', {}, T('loading')),
          h('p', { class: 'muted' }, T('loadingSub')),
          h('div', { class: 'skel', style: 'width:80%' }),
          h('div', { class: 'skel', style: 'width:64%' }),
          h('div', { class: 'skel', style: 'width:72%' })
        )
      )
    );
    announce(T('loading'));
  }

  function renderError() {
    ui = {};
    const msg = errorCode === 'BAD_KEY' ? T('badKey') : T('noKey');
    app.replaceChildren(
      header(),
      h(
        'main',
        { class: 'main' },
        h(
          'div',
          { class: 'center' },
          h('div', { class: 'action-ic', style: 'margin:0 auto 18px;width:64px;height:64px' }, icon('gear')),
          h('h1', {}, msg),
          h('button', { class: 'btn primary block big', onclick: () => bridge.call('settings', {}).catch(() => {}) }, icon('gear'), T('openSettings')),
          h('button', { class: 'btn block', onclick: () => analyze(true) }, icon('refresh'), T('rescan'))
        )
      )
    );
  }

  function renderPage() {
    const steps = visibleSteps();
    const hasForm = steps.length > 0;
    ui = { fields: new Map() };

    // left / top: what this page is
    const top = h('section', { class: 'area-top', 'aria-label': T('aboutPage') });
    top.append(
      h('p', { class: 'eyebrow' }, icon('shield'), T('simpleView')),
      h('h1', { tabindex: '-1', id: 'sahayi-title' }, plan.title)
    );
    if (plan.summary) top.append(h('p', { class: 'lead' }, plan.summary));
    if (notice) top.append(h('p', { class: 'notice' }, icon('info'), h('span', {}, notice)));
    ui.errBoxTop = h('div', { class: 'page-errors', role: 'alert' });
    if (!hasForm) top.append(ui.errBoxTop);
    for (const w of plan.warnings) top.append(h('div', { class: 'alert', role: 'note' }, icon('alert'), h('span', {}, w)));
    if (plan.documents.length) {
      top.append(
        h(
          'div',
          { class: 'card' },
          h('h2', { class: 'card-title' }, icon('doc'), T('documents')),
          plan.documents.map((d) => {
            const b = h('button', { class: 'chk', role: 'checkbox', 'aria-checked': String(!!docTicks[d]) }, h('span', { class: 'box' }, icon('check')), h('span', { class: 'chk-text' }, d));
            b.addEventListener('click', () => {
              docTicks[d] = !docTicks[d];
              b.setAttribute('aria-checked', String(docTicks[d]));
            });
            return b;
          })
        )
      );
    }

    // bottom: facts + quick actions
    const bottom = h('section', { class: 'area-bottom' });
    if (plan.keyPoints.length)
      bottom.append(
        h('div', { class: 'card' }, h('h2', { class: 'card-title' }, icon('info'), T('keyPoints')), h('ul', { class: 'facts' }, plan.keyPoints.map((p) => h('li', {}, icon('check'), h('span', {}, p)))))
      );
    if (plan.actions.length)
      bottom.append(
        h('h2', { class: 'section-title' }, T('actions')),
        h(
          'div',
          { class: 'actions' },
          plan.actions.map((a) =>
            h(
              'button',
              { class: 'action', onclick: () => activateLink(a.ref) },
              h('span', { class: 'action-ic' }, icon(iconFor(a.label + ' ' + a.ref.text))),
              h('span', { class: 'action-label' }, a.label, a.sub ? h('small', { class: 'action-sub' }, a.sub) : null),
              icon('arrow')
            )
          )
        )
      );
    if (!hasForm && !plan.actions.length && !plan.keyPoints.length && !plan.summary) bottom.append(h('div', { class: 'card empty' }, T('nothing')));
    bottom.append(
      h(
        'div',
        { class: 'src' },
        tplSource === 'template' ? h('span', {}, '✓ ' + T('srcTemplate').replace(/^✓\s*/, '')) : tplSource === 'ai' ? h('span', {}, T('srcAi')) : null,
        h('button', { class: 'link-btn', onclick: () => analyze(true) }, icon('refresh'), T('rescan').replace(/^↻\s*/, ''))
      )
    );

    const kids = [top];
    if (hasForm) kids.push(formBlock(steps));
    kids.push(bottom);
    ui.main = h('main', { class: 'main' }, h('div', { class: 'page' + (hasForm ? '' : ' info-only') }, kids));
    ui.vbar = hasForm ? h('div', { class: 'vbar', role: 'region', 'aria-label': T('voiceRegion'), 'aria-live': 'polite' }) : null;
    app.replaceChildren(header(), ui.main, ...(ui.vbar ? [ui.vbar] : []));
    if (ui.vbar) setVoice('idle');
    updateProgress();
    const hadErrors = showPageErrors();
    if (!hadErrors) focusTitle();
    saveSession({ view: 'page' });
  }
  const docTicks = {};
  let oneByOne = true; // form shows one question at a time (switchable)

  function formBlock(steps) {
    const optionalCount = plan.steps.filter((s) => !s.required).length;
    const showToggle = optionalCount > 0 && plan.steps.some((s) => s.required && !s.f.secret);
    ui.progText = h('span', {});
    ui.progBar = h('i');
    const head = h(
      'div',
      { class: 'form-head' },
      h('h2', { id: 'sahayi-form-title' }, T('formTitle')),
      (ui.errBoxForm = h('div', { class: 'page-errors', role: 'alert' })),
      h('div', { class: 'prog' }, h('div', { class: 'bar', 'aria-hidden': 'true' }, ui.progBar), ui.progText),
      h(
        'button',
        { class: 'talk', onclick: () => startVoice(firstUnfilledIndex()) },
        h('span', { class: 'mic-dot' }, icon('mic')),
        h('span', {}, h('b', {}, T('talkBtn')), h('small', {}, T('talkSub'))),
        icon('arrow')
      ),
      showToggle
        ? h(
            'button',
            {
              class: 'opt-toggle',
              role: 'checkbox',
              'aria-checked': String(showOptional),
              onclick: () => {
                showOptional = !showOptional;
                stopVoiceMode();
                saveSession();
                render();
              },
            },
            h('span', { class: 'box' }, icon('check')),
            T('showOptionalN', optionalCount)
          )
        : null
    );

    const modeLink = h(
      'button',
      { class: 'link-btn mode-link', onclick: () => { oneByOne = !oneByOne; stopVoiceMode(); render(); } },
      icon(oneByOne ? 'doc' : 'arrow'),
      oneByOne ? T('showAllQ') : T('oneByOneQ')
    );
    head.append(modeLink);
    if (oneByOne) {
      ui.stepBody = h('div', { class: 'one' });
      ui.stepNav = h('div', { class: 'form-foot step-nav' });
      const card = h('section', { class: 'form-card area-form', 'aria-labelledby': 'sahayi-form-title' }, head, ui.stepBody, ui.stepNav);
      renderStepBody();
      return card;
    }
    // group consecutive questions by section
    const groups = [];
    steps.forEach((s, i) => {
      const last = groups[groups.length - 1];
      if (last && last.title === s.section) last.items.push([s, i]);
      else groups.push({ title: s.section, items: [[s, i]] });
    });
    const titled = groups.length > 1 || (groups[0] && groups[0].title);
    const secs = groups.map((g, gi) =>
      h(
        'fieldset',
        { class: 'sec' },
        titled
          ? h('legend', { class: 'sec-title' }, h('span', { class: 'sec-num', 'aria-hidden': 'true' }, String(gi + 1)), g.title || T('formTitle'))
          : null,
        g.items.map(([s, i]) => renderField(s, i))
      )
    );
    const foot = h(
      'div',
      { class: 'form-foot' },
      h('button', { class: 'btn primary block big', onclick: openReview }, T('reviewSubmit'), icon('arrow')),
      h('p', { class: 'small muted' }, T('voiceNote'))
    );
    return h('section', { class: 'form-card area-form', 'aria-labelledby': 'sahayi-form-title' }, head, secs, foot);
  }

  function renderStepBody() {
    const steps = visibleSteps();
    if (!ui.stepBody || !steps.length) return;
    cur = Math.max(0, Math.min(cur, steps.length - 1));
    const s = steps[cur];
    const last = cur === steps.length - 1;
    ui.fields = new Map();
    ui.stepBody.replaceChildren(
      h(
        'div',
        { class: 'sec' },
        h('p', { class: 'step-count' }, T('progressQ', cur + 1, steps.length), s.section ? '  ·  ' + s.section : ''),
        renderField(s, cur)
      )
    );
    const go = (dir) => {
      commit(s);
      updateProgress();
      if (mode === 'voice') stopVoiceMode();
      if (dir > 0 && last) return openReview();
      cur = Math.max(0, cur + dir);
      renderStepBody();
      focusField(visibleSteps()[cur].key);
    };
    ui.stepNav.replaceChildren(
      h(
        'div',
        { class: 'nav-row' },
        h('button', { class: 'btn', onclick: () => go(-1), disabled: cur === 0 }, icon('back'), T('back').replace(/^\S+\s+/, '')),
        h('button', { class: 'btn primary', onclick: () => go(1) }, last ? T('reviewSubmit') : T('nextShort'), icon('arrow'))
      )
    );
    ui.stepGo = go;
    saveSession({ stepKey: s.key });
  }

  function renderField(s, idx) {
    const id = 'sf-' + idx;
    const card = h('div', { class: 'fld', 'data-key': s.key });
    const tick = h('span', { class: 'done-tick', hidden: !hasValue(s) || s.f.self }, icon('check'));
    card.append(
      h(
        'div',
        { class: 'fld-top' },
        h('label', { class: 'fld-label', for: id, id: id + '-l' }, s.label),
        h('span', { class: 'tag' + (s.required ? ' req' : '') }, s.required ? T('required') : T('optional')),
        tick
      )
    );
    if (s.help) card.append(h('p', { class: 'fld-help', id: id + '-h' }, s.help));
    const control = h('div', { class: 'fld-control' });
    const err = h('p', { class: 'fld-err', role: 'alert' });
    card.append(control, err);
    if (!s.f.self && !s.sensitive)
      card.append(h('button', { class: 'mini-btn', onclick: () => startVoice(idx), 'aria-label': T('speakThis') + ': ' + s.label }, icon('mic'), T('speakThis')));
    if (s.f.label && clean(s.f.label).toLowerCase() !== clean(s.label).toLowerCase())
      card.append(h('p', { class: 'fld-orig' }, T('onPage') + ' “' + s.f.label + '”'));
    const refresh = () => {
      buildControl(s, control, id);
      tick.hidden = !hasValue(s) || !!s.f.self;
    };
    ui.fields.set(s.key, { card, refresh, err, control });
    refresh();
    return card;
  }

  function buildControl(s, box, id) {
    const f = s.f;
    box.replaceChildren();
    const after = () => {
      commit(s);
      updateProgress();
      const fe = ui.fields.get(s.key);
      if (fe) fe.err.textContent = pageValidation(s) ? T('pageSays') + ' ' + pageValidation(s) : '';
    };
    if (f.self) {
      box.append(
        h(
          'div',
          { class: 'self' },
          icon(f.secret ? 'lock' : 'doc'),
          h(
            'div',
            {},
            h('p', {}, h('b', {}, T('selfTitle')), h('br'), f.secret ? T('selfSecret') : T('selfFile')),
            h('button', { class: 'btn', onclick: () => peek(f.container, T('peekHint'), 'page') }, icon('eye'), T('showOnPage').replace(/^\S+\s+/, ''))
          )
        )
      );
      return;
    }
    if (f.kind === 'text' || f.kind === 'textarea') {
      const t = f.inputType;
      const attrs = {
        class: 'field',
        id,
        'aria-labelledby': id + '-l',
        'aria-describedby': s.help ? id + '-h' : null,
        autocomplete: 'off',
        placeholder: f.placeholder || (s.example ? T('example') + ': ' + s.example : ''),
        type: ['date', 'email', 'tel', 'time', 'month'].includes(t) ? t : 'text',
      };
      if (t === 'number' || t === 'tel' || /aadhaa?r|pin\s?code|mobile|phone|account\s*(no|number)|ward\s*(no|number)|\bage\b|income/i.test(f.label + ' ' + s.label))
        attrs.inputmode = 'numeric';
      if (f.maxlength) attrs.maxlength = f.maxlength;
      const input = h(f.kind === 'textarea' ? 'textarea' : 'input', attrs);
      input.value = currentValue(s) || '';
      input.addEventListener('input', () => {
        liveWrite(s, input.value);
        updateProgress();
      });
      input.addEventListener('change', after);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && f.kind !== 'textarea') {
          e.preventDefault();
          after();
          if (oneByOne && ui.stepGo) ui.stepGo(1);
          else focusNextAfter(s.key);
        }
      });
      box.append(input);
      return;
    }
    if (f.kind === 'checkbox') {
      const on = !!currentValue(s);
      box.append(
        h(
          'button',
          {
            class: 'check-row',
            role: 'checkbox',
            id,
            'aria-labelledby': id + '-l',
            'aria-checked': String(on),
            onclick: () => {
              pending[s.key] = !on;
              after();
              refreshField(s.key);
            },
          },
          h('span', { class: 'box' }, icon('check')),
          T('yesAgree')
        )
      );
      return;
    }
    // select / radio
    const opts = optionsOf(f);
    if (!opts.length) {
      box.append(h('p', { class: 'muted' }, T('waitingOptions')));
      const started = Date.now();
      const poll = setInterval(() => {
        if (!box.isConnected) return clearInterval(poll);
        if (optionsOf(f).length || Date.now() - started > 8000) {
          clearInterval(poll);
          refreshField(s.key);
        }
      }, 500);
      return;
    }
    const value = currentValue(s);
    if (opts.length > 6) {
      const sel = h('select', { class: 'field', id, 'aria-labelledby': id + '-l', 'aria-describedby': s.help ? id + '-h' : null });
      sel.append(h('option', { value: '' }, T('choose')));
      for (const o of opts) {
        const op = h('option', { value: o.value }, o.text);
        if (o.value === value) op.selected = true;
        sel.append(op);
      }
      sel.addEventListener('change', () => {
        pending[s.key] = sel.value;
        after();
        refreshField(s.key);
      });
      box.append(sel);
      return;
    }
    box.append(
      h(
        'div',
        { class: 'choices', role: 'radiogroup', 'aria-labelledby': id + '-l' },
        opts.map((o) =>
          h(
            'button',
            {
              class: 'choice',
              role: 'radio',
              'aria-checked': String(o.value === value),
              onclick: () => {
                pending[s.key] = o.value;
                after();
                refreshField(s.key);
              },
            },
            h('span', { class: 'dot', 'aria-hidden': 'true' }),
            o.text
          )
        )
      )
    );
  }

  /** put the site's error messages on top of the form (and under the field they belong to). Returns true if any. */
  function showPageErrors() {
    const errors = pageErrors();
    lastErrors = errors.map((e) => e.text).join('|');
    const box = ui.errBoxForm || ui.errBoxTop;
    if (!box) return false;
    box.replaceChildren(
      ...errors.map((e) => {
        const ml = errorInMalayalam(e.text);
        return h(
          'div',
          { class: 'page-error' },
          icon('alert'),
          h('div', {}, h('b', {}, ml || e.text), ml ? h('small', {}, T('pageSays') + ' “' + e.text + '”') : h('small', {}, T('pageSaysShort')))
        );
      })
    );
    if (ui.fields)
      for (const s of visibleSteps()) {
        const fe = ui.fields.get(s.key);
        if (!fe) continue;
        const t = fieldError(s.f, errors);
        if (t && !fe.err.textContent) fe.err.textContent = (errorInMalayalam(t) || t) + (errorInMalayalam(t) ? ' (' + t + ')' : '');
      }
    if (errors.length) {
      announce(errors.map((e) => errorInMalayalam(e.text) || e.text).join('. '));
      try {
        box.scrollIntoView({ block: 'center', behavior: 'smooth' });
      } catch {}
    }
    return errors.length > 0;
  }
  let lastErrors = '';

  function refreshField(key) {
    const fe = ui.fields && ui.fields.get(key);
    if (fe) fe.refresh();
  }
  function updateProgress() {
    if (!ui.progText) return;
    const steps = visibleSteps();
    const done = steps.filter(hasValue).length;
    ui.progText.textContent = T('filled', done, steps.length);
    ui.progBar.style.width = (steps.length ? Math.round((done / steps.length) * 100) : 0) + '%';
  }
  function setActive(key, scroll) {
    if (oneByOne && ui.stepBody && key && !(ui.fields && ui.fields.has(key))) {
      const i = stepIndexByKey(key);
      if (i >= 0) {
        cur = i;
        renderStepBody();
      }
    }
    if (!ui.fields) return;
    for (const [k, fe] of ui.fields) fe.card.classList.toggle('active', k === key);
    const fe = key && ui.fields.get(key);
    if (fe && scroll) {
      try {
        fe.card.scrollIntoView({ block: 'center', behavior: 'smooth' });
      } catch {
        fe.card.scrollIntoView();
      }
    }
  }
  function focusField(key) {
    const fe = ui.fields && ui.fields.get(key);
    const el = fe && fe.control.querySelector('input,textarea,select,button');
    if (el)
      setTimeout(() => {
        try {
          el.focus({ preventScroll: true });
        } catch {}
      }, 60);
  }
  function focusNextAfter(key) {
    const steps = visibleSteps();
    const i = steps.findIndex((s) => s.key === key);
    for (let j = i + 1; j < steps.length; j++) {
      if (!steps[j].f.self) {
        setActive(null);
        const fe = ui.fields.get(steps[j].key);
        if (fe) fe.card.scrollIntoView({ block: 'center', behavior: 'smooth' });
        focusField(steps[j].key);
        return;
      }
    }
  }
  function focusTitle() {
    const el = app.querySelector('h1');
    if (el)
      setTimeout(() => {
        try {
          el.focus({ preventScroll: true });
        } catch {}
      }, 30);
  }

  function setVoice(state, s, text) {
    const bar = ui.vbar;
    if (!bar) return;
    ui.level = null;
    const steps = visibleSteps();
    const count = s ? h('span', { class: 'vb-count' }, T('progressQ', stepIndexByKey(s.key) + 1, steps.length)) : null;
    const stopBtn = h('button', { class: 'btn', onclick: stopVoiceMode, 'aria-label': T('stopVoice') }, icon('x'), h('span', { class: 'hide-sm' }, T('stopVoice')));
    const nextBtn = h('button', { class: 'btn', onclick: () => voiceNext(true) }, T('nextShort'), icon('skip'));
    const prevBtn = cur > 0 ? h('button', { class: 'btn', onclick: voicePrev, 'aria-label': T('prevQ') }, icon('back')) : null;
    let ic = 'mic';
    let pulse = false;
    let textKids = [];
    let actions = [];
    bar.classList.toggle('on', state !== 'idle' && state !== 'done');
    bar.classList.toggle('idle', state === 'idle' || state === 'done');
    if (state === 'idle') {
      textKids = [h('b', {}, text || T('talkBtn')), h('small', {}, text ? T('talkBtn') : T('talkSub'))];
      actions = [h('button', { class: 'btn primary', onclick: () => startVoice(firstUnfilledIndex()) }, icon('mic'), T('start'))];
    } else if (state === 'done') {
      ic = 'check';
      textKids = [h('b', {}, T('allDone'))];
      actions = [h('button', { class: 'btn primary', onclick: openReview }, T('reviewSubmit'), icon('arrow'))];
    } else if (state === 'speaking') {
      ic = 'speaker';
      textKids = [h('b', {}, s.label), h('small', {}, text || T('speaking').replace(/^\S+\s+/, ''))];
      actions = [prevBtn, nextBtn, stopBtn];
    } else if (state === 'listening') {
      pulse = true;
      ui.level = h('i');
      textKids = [h('b', {}, s.label), h('small', {}, T('listening')), h('div', { class: 'level', 'aria-hidden': 'true' }, ui.level)];
      actions = [h('button', { class: 'btn primary', onclick: () => voice.stopRec && voice.stopRec(true, true) }, icon('stop'), T('doneSpeaking')), stopBtn];
      announce(T('listening'));
    } else if (state === 'thinking') {
      ic = 'refresh';
      textKids = [h('b', {}, s.label), h('small', {}, T('thinking'))];
      actions = [stopBtn];
    } else if (state === 'confirm') {
      ic = 'check';
      const pick = (v) => voice.confirmResolve && voice.confirmResolve(v);
      textKids = [h('small', {}, T('heard')), h('span', { class: 'vb-heard' }, text || ''), h('small', {}, T('isRight'))];
      actions = [
        h('button', { class: 'btn primary', onclick: () => pick('yes') }, icon('check'), T('yes').replace(/^\S+\s+/, '')),
        h('button', { class: 'btn', onclick: () => pick('no') }, icon('refresh'), T('retry').replace(/^\S+\s+/, '')),
        h('button', { class: 'btn', onclick: () => pick('type') }, icon('type'), h('span', { class: 'hide-sm' }, T('typeInstead').replace(/^\S+\s+/, ''))),
      ];
      announce(T('heard') + ' ' + (text || '') + '. ' + T('isRight'));
    } else if (state === 'self') {
      ic = s.f.secret ? 'lock' : 'doc';
      textKids = [h('b', {}, s.label), h('small', {}, T('selfTitle'))];
      actions = [h('button', { class: 'btn primary', onclick: () => peek(s.f.container, T('peekHint'), 'page') }, icon('eye'), T('showOnPage').replace(/^\S+\s+/, '')), nextBtn, stopBtn];
    } else if (state === 'typeHere') {
      ic = 'type';
      textKids = [h('b', {}, s.label), h('small', {}, text || T('typeHereHint'))];
      actions = [
        h('button', { class: 'btn primary', onclick: () => voiceNext() }, T('nextShort'), icon('arrow')),
        h('button', { class: 'btn', onclick: () => { stopVoice(); voiceStep({ ask: false }); } }, icon('mic'), h('span', { class: 'hide-sm' }, T('speakAnyway'))),
        stopBtn,
      ];
    }
    bar.replaceChildren(
      h('span', { class: 'vb-ic' + (pulse ? ' pulse' : '') }, icon(ic)),
      h('div', { class: 'vb-text' }, textKids, count),
      h('div', { class: 'vb-actions' }, actions.filter(Boolean))
    );
  }

  function openReview() {
    stopVoice();
    mode = 'type';
    visibleSteps().forEach(commit);
    view = 'review';
    render();
  }

  function renderReview() {
    ui = {};
    const steps = visibleSteps();
    const groups = [];
    steps.forEach((s) => {
      const last = groups[groups.length - 1];
      if (last && last.title === s.section) last.items.push(s);
      else groups.push({ title: s.section, items: [s] });
    });
    const missing = steps.filter((s) => s.required && !s.f.self && !hasValue(s)).length;
    const body = [
      h('p', { class: 'eyebrow' }, icon('check'), T('simpleView')),
      h('h1', { tabindex: '-1' }, T('review')),
      h('p', { class: 'lead' }, T('reviewSub')),
      (ui.errBoxTop = h('div', { class: 'page-errors', role: 'alert' })),
      missing ? h('div', { class: 'alert' }, icon('alert'), h('span', {}, T('missingN', missing))) : null,
      groups.map((g) =>
        h(
          'div',
          { class: 'rv-card' },
          g.title ? h('h2', {}, g.title) : null,
          g.items.map((s) => {
            const val = s.f.self ? (s.f.kind === 'file' ? displayValue(s) : hasValue(s) ? '••••' : '') : displayValue(s);
            const filled = !!val;
            return h(
              'div',
              { class: 'rv-row' + (!filled && s.required ? ' missing' : '') },
              h('div', { class: 'rv-main' }, h('b', {}, s.label), h('span', {}, filled ? val : s.required ? T('missing') : '—')),
              h('button', { class: 'btn quiet', onclick: () => editField(s.key), 'aria-label': T('edit') + ': ' + s.label }, icon('pen'), h('span', { class: 'hide-sm' }, T('edit')))
            );
          })
        )
      ),
      h(
        'div',
        { class: 'sticky-foot' },
        h('button', { class: 'btn', onclick: () => { view = 'page'; render(); } }, icon('back'), T('backToForm')),
        h('button', { class: 'btn primary', onclick: goSubmit }, T('goSubmit').replace(/\s*▶$/, ''), icon('arrow'))
      ),
    ];
    app.replaceChildren(header(), h('main', { class: 'main' }, h('div', { class: 'page single' }, body)));
    if (!showPageErrors()) focusTitle();
    saveSession({ view: 'review' });
  }
  function editField(key) {
    view = 'page';
    const i = stepIndexByKey(key);
    if (i >= 0) cur = i;
    render();
    setTimeout(() => {
      setActive(key, true);
      focusField(key);
    }, 50);
  }

  function peek(target, hint, returnTo) {
    stopVoice();
    view = 'peek';
    lockPage(false);
    render();
    peekBar.replaceChildren(
      h('p', {}, hint),
      h('button', { class: 'btn', onclick: () => returnFromPeek(returnTo) }, icon('check'), T('backToSahayi').replace(/^\S+\s+/, ''))
    );
    if (target) {
      highlight(target);
      try {
        target.focus({ preventScroll: true });
      } catch {}
    }
    announce(hint);
  }

  function fieldSignature() {
    return [...document.querySelectorAll('input, select, textarea')]
      .filter((el) => !(host && host.contains(el)) && el.type !== 'hidden' && isShown(el))
      .map((el) => el.id || el.name || el.type)
      .join(',');
  }
  function returnFromPeek(returnTo) {
    unhighlight();
    lockPage(true);
    // the page moved on (e.g. after Continue it now asks for an OTP): read it again
    if (location.href !== lastHref || fieldSignature() !== lastSignature) {
      lastHref = location.href;
      mode = 'type';
      saveSession({ view: 'page', stepKey: null });
      analyze(false);
      return;
    }
    // after pressing Submit/Sign in on the page: if the site now shows an error, go to the form so it can be fixed
    view = returnTo === 'review' && pageErrors().length ? 'page' : returnTo;
    render();
    if (view === 'page' && returnTo === 'page' && mode === 'voice') voiceNext(true);
  }
  let lastHref = location.href;
  let lastSignature = '';
  let watchTimer = null;
  let lastContent = '';
  let changedTicks = 0;
  function contentSignature() {
    return fieldSignature() + '|' + mainHeading();
  }
  function startWatching() {
    if (watchTimer) return;
    watchTimer = setInterval(() => {
      if (view === 'closed' || view === 'loading' || view === 'peek') return;
      if (location.href !== lastHref) {
        lastHref = location.href;
        stopVoice();
        mode = 'type';
        saveSession({ view: 'page', stepKey: null });
        analyze(false);
        return;
      }
      // same address, new content (e.g. OTP screen -> "Select Account"): wait until it settles, then re-read,
      // but never while the person is typing in Sahayi or using voice
      const typing = shadow && shadow.activeElement && /INPUT|TEXTAREA|SELECT/.test(shadow.activeElement.tagName);
      if (mode === 'voice' || typing) return;
      const sig = contentSignature();
      if (sig !== lastContent) {
        changedTicks++;
        if (changedTicks >= 2) {
          changedTicks = 0;
          saveSession({ view: 'page', stepKey: null });
          analyze(false);
        }
      } else changedTicks = 0;
      if ((view === 'page' || view === 'review') && errorsSignature() !== lastErrors) showPageErrors();
    }, 800);
  }

  function goSubmit() {
    const steps = visibleSteps();
    steps.forEach(commit);
    lastSignature = fieldSignature();
    if (plan.submit && plan.submit.el && plan.submit.el.isConnected) peek(plan.submit.el, T('submitHint'), 'review');
    else peek(null, T('noSubmit'), 'review');
  }

  // ------------------------------------------------------------------ actions
  function activateLink(ref) {
    const found = scanRes && scanRes.links.find((l) => l.text === ref.text && l.el && l.el.isConnected);
    const el =
      (found && found.el) ||
      [...document.querySelectorAll('a[href], [role="link"]')].find((a) => clean(a.innerText || a.getAttribute('aria-label') || a.title) === ref.text);
    saveSession({ view: 'page', stepKey: null });
    if (el) {
      el.removeAttribute('target');
      el.click();
    } else if (ref.href && !/^javascript:/i.test(ref.href)) location.href = ref.href;
  }
  async function toggleLang() {
    const wasVoice = mode === 'voice';
    const keepKey = wasVoice ? (visibleSteps()[cur] || {}).key : null;
    stopVoice();
    mode = 'type';
    prefs.lang = prefs.lang === 'ml' ? 'en' : 'ml';
    store.set('prefs', prefs);
    applyPrefs();
    if (tpl && !tpl.langs.includes(prefs.lang) && tplSource === 'ai') await analyze(false, { keepView: true });
    else {
      plan = buildPlan();
      render();
    }
    if (keepKey) {
      const i = stepIndexByKey(keepKey);
      if (i >= 0 && view === 'page') startVoice(i);
    }
  }
  function setScale(v) {
    prefs.scale = v;
    store.set('prefs', prefs);
    applyPrefs();
  }
  function toggleContrast() {
    prefs.hc = !prefs.hc;
    store.set('prefs', prefs);
    applyPrefs();
  }

  // ------------------------------------------------------------------ analyze / open / close
  async function analyze(force, { keepView = false, keepKey = null } = {}) {
    const prevView = view;
    view = 'loading';
    render();
    notice = '';
    scanRes = scan();
    if (!scanRes.fields.length && document.readyState !== 'complete') {
      await new Promise((r) => setTimeout(r, 900));
      scanRes = scan();
    }
    tpl = null;
    tplSource = 'basic';
    const bundled = findBundled();
    if (bundled) {
      tpl = bundled;
      tplSource = 'template';
    } else {
      const cached = force ? null : await store.get('tpl:' + scanRes.pageId);
      if (cached) {
        tpl = cached;
        tplSource = 'ai';
      }
    }
    if (!tpl && isPrivateHost()) {
      tplSource = 'basic';
      notice = T('privateSite');
    } else if (!tpl || (!tpl.langs.includes(prefs.lang) && tplSource !== 'template')) {
      try {
        const ai = await bridge.call('analyze', aiPayload(prefs.lang));
        tpl = mergeAi(tpl || emptyTemplate(), ai, prefs.lang);
        tplSource = 'ai';
        store.set('tpl:' + scanRes.pageId, tpl);
      } catch (e) {
        if (e.code === 'NO_KEY' || e.code === 'BAD_KEY') {
          errorCode = e.code;
          view = 'error';
          render();
          return;
        }
        console.warn('Sahayi: AI simplification failed', e);
        if (!tpl) {
          tpl = null;
          tplSource = 'basic';
          notice = T('aiFailed');
        }
      }
    }
    plan = buildPlan();
    lastHref = location.href;
    lastSignature = fieldSignature();
    lastContent = contentSignature();
    changedTicks = 0;
    view = keepView && (prevView === 'page' || prevView === 'review') ? prevView : 'page';
    // voice never restarts by itself after a reload (browsers block sound without a tap)
    mode = 'type';
    const ss = readSession();
    if (!keepView && ss.view === 'review' && visibleSteps().length) view = 'review';
    render();
    const resumeKey = keepKey || (view === 'page' && ss.stepKey);
    if (resumeKey && stepIndexByKey(resumeKey) >= 0) {
      cur = stepIndexByKey(resumeKey);
      setTimeout(() => setActive(resumeKey, true), 60);
    }
  }

  async function open() {
    ensureShell();
    lockPage(true);
    view = 'loading';
    saveSession();
    render();
    bridge.event('opened');
    startWatching();
    await analyze(false);
  }
  function close() {
    stopVoice();
    releaseMic();
    unhighlight();
    view = 'closed';
    lockPage(false);
    if (app) app.hidden = true;
    if (peekBar) peekBar.hidden = true;
    saveSession({ open: false, view: null, stepKey: null });
    bridge.event('closed');
  }
  function toggle() {
    if (view === 'closed') open();
    else close();
  }

  /** Dev helper: build a reviewed-template draft for this page (both languages). */
  async function exportTemplate() {
    if (!scanRes) scanRes = scan();
    let t = (await store.get('tpl:' + scanRes.pageId)) || emptyTemplate();
    if (isPrivateHost()) {
      console.warn('Sahayi: private site, page content is never sent to AI. Write this template by hand.');
      return null;
    }
    for (const lang of ['ml', 'en']) if (!t.langs.includes(lang)) t = mergeAi(t, await bridge.call('analyze', aiPayload(lang)), lang);
    store.set('tpl:' + scanRes.pageId, t);
    const json = JSON.stringify(t, null, 2);
    console.log('Sahayi template (review it, then add to core/templates.js):\n' + json);
    try {
      await navigator.clipboard.writeText(json);
    } catch {}
    return t;
  }

  async function boot(opts = {}) {
    platform = opts.platform || 'extension';
    bridge = makeBridge(platform);
    const saved = await store.get('prefs');
    if (saved) prefs = { ...prefs, ...saved };
    const ss = readSession();
    if (ss.mode) mode = ss.mode;
    if (ss.showOptional) showOptional = true;
    const wantOpen = ss.open === true || (opts.autoOpen && ss.open !== false);
    if (wantOpen) {
      open();
      return;
    }
    // offer the launcher on pages we have a checked template for (only scan on those hosts)
    const hostHasTemplate = (window.SAHAYI_TEMPLATES || []).some((t) => {
      const m = t.match || {};
      if (m.host) return location.host === m.host || location.host.endsWith('.' + m.host);
      return !!m.path && new RegExp(m.path).test(location.pathname);
    });
    if (!hostHasTemplate) return;
    // pages built by JavaScript may draw their fields a little later: look a few times
    for (const wait of [0, 1500, 4000]) {
      if (wait) await new Promise((r) => setTimeout(r, wait));
      if (view !== 'closed') return;
      scanRes = scan();
      if (findBundled()) {
        ensureShell();
        setLauncher();
        launcherEl.hidden = false;
        return;
      }
    }
  }

  window.Sahayi = { __ready: true, boot, open, close, toggle, exportTemplate };
})();
