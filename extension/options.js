import { DEFAULT_CONFIG } from './openai.js';

const FIELDS = Object.keys(DEFAULT_CONFIG);
const $ = (id) => document.getElementById(id);

function say(el, text, ok) {
  el.textContent = text;
  el.className = ok === undefined ? '' : ok ? 'ok' : 'bad';
}

async function load() {
  const cfg = await chrome.storage.local.get(DEFAULT_CONFIG);
  for (const k of FIELDS) $(k).value = cfg[k] || '';
}

$('save').addEventListener('click', async () => {
  const cfg = {};
  for (const k of FIELDS) cfg[k] = $(k).value.trim() || DEFAULT_CONFIG[k];
  await chrome.storage.local.set(cfg);
  say($('status'), cfg.apiKey ? '✓ Saved' : 'Saved (no API key yet)', !!cfg.apiKey);
});

function call(type, payload) {
  return new Promise((resolve, reject) =>
    chrome.runtime.sendMessage({ sahayi: true, type, payload }, (res) =>
      res && res.ok ? resolve(res.data) : reject(new Error((res && res.error) || chrome.runtime.lastError?.message))
    )
  );
}

$('test-speak').addEventListener('click', async () => {
  const out = $('test-out');
  say(out, 'Generating voice…');
  try {
    const t0 = performance.now();
    const { audio } = await call('tts', {
      lang: 'ml',
      text: 'നമസ്കാരം! ഞാൻ സഹായി. നിങ്ങളുടെ പേര് പറയാമോ? Aadhaar കാർഡിൽ ഉള്ളതുപോലെ.',
    });
    say(out, `✓ Voice ready in ${Math.round(performance.now() - t0)} ms. Playing…`, true);
    await new Audio('data:audio/mpeg;base64,' + audio).play();
  } catch (e) {
    say(out, '✗ ' + e.message, false);
  }
});

$('test-listen').addEventListener('click', async () => {
  const out = $('test-out');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    const parts = [];
    rec.ondataavailable = (e) => parts.push(e.data);
    const done = new Promise((r) => (rec.onstop = r));
    rec.start();
    say(out, '🎤 Speak in Malayalam now (5 seconds)…');
    setTimeout(() => rec.stop(), 5000);
    await done;
    stream.getTracks().forEach((t) => t.stop());
    say(out, 'Transcribing…');
    const blob = new Blob(parts, { type: rec.mimeType || 'audio/webm' });
    const b64 = await new Promise((r) => {
      const fr = new FileReader();
      fr.onload = () => r(String(fr.result).split(',')[1]);
      fr.readAsDataURL(blob);
    });
    const { text } = await call('transcribe', { audio: b64, mime: blob.type.split(';')[0], lang: 'ml' });
    say(out, text ? '✓ Heard: ' + text : '✗ Nothing recognised', !!text);
  } catch (e) {
    say(out, '✗ ' + e.message, false);
  }
});

$('clear').addEventListener('click', async () => {
  const all = await chrome.storage.local.get(null);
  const keys = Object.keys(all).filter((k) => k.startsWith('c:tpl:'));
  await chrome.storage.local.remove(keys);
  say($('status'), `✓ Cleared ${keys.length} saved page(s)`, true);
});

load();
