// Sahayi extension background worker: toolbar button + OpenAI calls + storage.
// The API key is entered on the Options page and stored in chrome.storage.local.
// (For a public release, route OpenAI calls through your own backend instead.)
import { createApi, DEFAULT_CONFIG } from './openai.js';

const getConfig = () => chrome.storage.local.get(DEFAULT_CONFIG);

const api = createApi({
  getConfig,
  appendAudio(form, base64, mime) {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const ext = mime.includes('webm') ? 'webm' : mime.includes('mp4') ? 'mp4' : 'wav';
    form.append('file', new Blob([bytes], { type: mime }), `answer.${ext}`);
  },
  async responseToBase64(res) {
    const bytes = new Uint8Array(await res.arrayBuffer());
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  },
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { sahayi: 'toggle' });
  } catch {
    // page was open before the extension loaded: inject now
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['templates.js', 'sahayi-core.js', 'boot.js'] });
      await chrome.tabs.sendMessage(tab.id, { sahayi: 'toggle' });
    } catch (e) {
      console.warn('Sahayi cannot run on this page:', e);
    }
  }
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') chrome.runtime.openOptionsPage();
});

async function handle(type, payload = {}) {
  switch (type) {
    case 'analyze':
    case 'normalize':
    case 'tts':
    case 'transcribe':
      return api[type](payload);
    case 'get': {
      const k = 'c:' + payload.key;
      return (await chrome.storage.local.get(k))[k] ?? null;
    }
    case 'set':
      await chrome.storage.local.set({ ['c:' + payload.key]: payload.value });
      return true;
    case 'settings':
      await chrome.runtime.openOptionsPage();
      return true;
    default:
      throw new Error('Unknown request ' + type);
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.sahayi !== true) return false;
  handle(msg.type, msg.payload)
    .then((data) => sendResponse({ ok: true, data }))
    .catch((err) => sendResponse({ ok: false, error: err.code || String(err.message || err) }));
  return true;
});
