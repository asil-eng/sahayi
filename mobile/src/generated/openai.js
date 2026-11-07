// Sahayi – shared OpenAI client (ES module).
// Used by the Chrome extension background worker and by the mobile app.
// Platform-specific bits (how to attach audio, how to read binary) are passed in.
//
// Only page structure (labels, headings, visible page text) and the user's
// spoken answers (voice mode) are sent here. Typed answers never are.

export const DEFAULT_CONFIG = {
  apiKey: '',
  model: 'gpt-4.1-mini',
  ttsModel: 'gpt-4o-mini-tts',
  sttModel: 'gpt-4o-transcribe',
  voice: 'alloy',
};

const BASE = 'https://api.openai.com/v1';

const LANG_NAME = {
  ml: 'Malayalam',
  en: 'simple English',
};

const ML_STYLE =
  'Write in Malayalam script, in a simple, warm, spoken style that an elderly person in Kerala easily understands. ' +
  'Keep commonly used English words such as Aadhaar, OTP, IFSC, PIN code, Ration card, Username, Password, Login, Submit as they are. ' +
  'Keep names of organisations, universities, websites, schemes and all abbreviations in English letters exactly as written (e.g. KTU, DigiLocker, KSEB, e-Governance); never transliterate or half-translate them. ' +
  'Use correct, standard Malayalam spelling; if unsure of a Malayalam word, use the plain English word instead.';

function analyzeSystem(lang) {
  return `You are "Sahayi", a helper that makes government websites easy for senior citizens and persons with disabilities in Kerala, India.
You receive: page info (url, title, headings, visible text), form fields (id, kind, label, options...), links (id, text) and buttons (id, text). You never see what the person types.
Write ALL human-readable text in ${LANG_NAME[lang]}. ${lang === 'ml' ? ML_STYLE : 'Use short, plain words.'}
Return ONLY a JSON object of this exact shape:
{"title":"","summary":"","key_points":[""],"actions":[{"id":"","label":""}],"documents":[""],"warnings":[""],
 "fields":[{"id":"","required":true,"sensitive":false,"secret":false,"section":"","label":"","help":"","ask":"","example":""}],
 "order":[""],"submit_id":null}
Rules:
- title: max 6 words. summary: 1-2 short sentences saying what this page is for.
- key_points: up to 5 most useful facts for a citizen on this page (eligibility, fees, deadlines, office hours...). Only from the page text. [] if none.
- actions: up to 6 most useful links/buttons for a citizen (e.g. Apply online, Check status, Download form, Login). Use only ids from "links". label = simple 2-5 words. Skip menus, social media, language switches, "skip to content", footers.
- documents: things to keep ready before filling the form. [] if there is no form.
- warnings: only real safety notes (page asks for OTP/PIN/password/card details, or looks suspicious). [] otherwise.
- fields: exactly one entry per given field id. On a login form, the username/ID/email field is required.
  label: max 5 simple words. help: max 2 short sentences in plain words; explain jargon (IFSC, LSGI, BPL, Ward, Taluk, Village...) and where to find it.
  ask: one polite spoken question asking the person for this value. example: a short realistic example value, or "" for choices, checkboxes and files.
  required: true if marked required or clearly mandatory. sensitive: true for Aadhaar number, bank account number, PAN, card numbers.
  section: a short group name (1-3 words) such as Personal details / Address / Bank details; consecutive related fields share the same name. Use "" for every field if the form has 5 fields or fewer.
  secret: true for OTP, PIN (not PIN code), password, CAPTCHA, CVV: things the person must type themselves and never say aloud.
- order: all field ids in a natural filling order (keep page order unless clearly wrong).
- submit_id: id of the final Submit/Save/Apply/Pay button from "buttons", or null.
- Never invent facts, fields, fees or requirements that are not on the page.`;
}

function normalizeSystem(lang) {
  return `You convert a person's spoken answer into the exact value to enter in one web form field.
The answer was transcribed from speech: it may be Malayalam, English or mixed, and may contain transcription errors.
Return ONLY JSON: {"ok":true,"value":null,"display":"","say":"","problem":""}
- value: for kind "select" or "radio": the 0-based index (number) of the best matching option. For "checkbox": true or false. Otherwise a string exactly as it should be typed.
- Text: if the field label is English, write names, places and addresses in English letters (transliterate Malayalam; Title Case for names).
- Numbers as digits only (convert Malayalam/English number words). No spaces for phone (10 digits), Aadhaar (12 digits), PIN code (6 digits), account numbers.
- Dates: if type is "date" use YYYY-MM-DD; else follow the placeholder format if any; else DD/MM/YYYY.
- Email: lowercase; "at the rate"/"at" -> @, "dot" -> .
- Respect maxlength and pattern if given.
- display: the value as the person will see it (for choices: the option text).
- say: how to read the value back to the person in ${LANG_NAME[lang]}, naturally (read long numbers in small groups).
- If the answer is unclear, does not fit the field, or the person says they don't know: ok=false and problem = one short polite sentence in ${LANG_NAME[lang]} saying what is needed. ${lang === 'ml' ? ML_STYLE : ''}`;
}

const TTS_INSTRUCTIONS = {
  ml: 'Speak in Malayalam with a natural Kerala accent. Speak slowly, clearly and warmly, like a patient helper talking to an elderly person.',
  en: 'Speak in clear Indian English. Speak slowly, clearly and warmly, like a patient helper talking to an elderly person.',
};

/**
 * @param {object} opts
 * @param {() => Promise<object>} opts.getConfig  resolves to {apiKey, model, ttsModel, sttModel, voice}
 * @param {(form: FormData, base64: string, mime: string) => Promise<void>|void} opts.appendAudio
 * @param {(res: Response) => Promise<string>} opts.responseToBase64
 * @param {typeof fetch} [opts.fetchImpl]  platform fetch (mobile passes expo/fetch)
 */
export function createApi({ getConfig, appendAudio, responseToBase64, fetchImpl }) {
  const fetch = fetchImpl || globalThis.fetch.bind(globalThis);
  async function cfg() {
    const c = { ...DEFAULT_CONFIG, ...(await getConfig()) };
    if (!c.apiKey) {
      const e = new Error('NO_KEY');
      e.code = 'NO_KEY';
      throw e;
    }
    return c;
  }

  async function fail(res, what) {
    let detail = '';
    try {
      detail = (await res.text()).slice(0, 300);
    } catch {}
    if (res.status === 401) throw Object.assign(new Error('BAD_KEY'), { code: 'BAD_KEY' });
    throw new Error(`${what} failed (${res.status}): ${detail}`);
  }

  async function chatJSON(system, user) {
    const c = await cfg();
    const res = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.apiKey}` },
      body: JSON.stringify({
        model: c.model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: typeof user === 'string' ? user : JSON.stringify(user) },
        ],
      }),
    });
    if (!res.ok) await fail(res, 'AI');
    const data = await res.json();
    return JSON.parse(data.choices?.[0]?.message?.content || '{}');
  }

  return {
    /** Simplify a scanned page. payload: {lang, page, fields, links, buttons} */
    async analyze({ lang, ...page }) {
      return chatJSON(analyzeSystem(lang), page);
    },

    /** Turn a transcribed spoken answer into a field value. payload: {lang, transcript, field} */
    async normalize({ lang, transcript, field }) {
      return chatJSON(normalizeSystem(lang), { field, transcript });
    },

    /** Text to speech. Returns {audio: base64 mp3} */
    async tts({ text, lang }) {
      const c = await cfg();
      const body = { model: c.ttsModel, voice: c.voice, input: String(text).slice(0, 1500), response_format: 'mp3' };
      if (/gpt-4o/.test(c.ttsModel)) body.instructions = TTS_INSTRUCTIONS[lang] || TTS_INSTRUCTIONS.en;
      const res = await fetch(`${BASE}/audio/speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.apiKey}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) await fail(res, 'Speech');
      return { audio: await responseToBase64(res) };
    },

    /** Speech to text. payload: {audio: base64, mime, lang?, prompt?}. Returns {text} */
    async transcribe({ audio, mime = 'audio/wav', lang, prompt }) {
      const c = await cfg();
      const form = new FormData();
      await appendAudio(form, audio, mime);
      form.append('model', c.sttModel);
      if (lang) form.append('language', lang);
      if (prompt) form.append('prompt', String(prompt).slice(0, 400));
      form.append('response_format', 'json');
      const res = await fetch(`${BASE}/audio/transcriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${c.apiKey}` },
        body: form,
      });
      if (!res.ok) await fail(res, 'Listening');
      const data = await res.json();
      return { text: (data.text || '').trim() };
    },
  };
}
