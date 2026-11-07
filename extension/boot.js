// Starts Sahayi inside the page and listens for the toolbar button.
if (!window.__sahayiBooted) {
  window.__sahayiBooted = true;
  window.Sahayi.boot({ platform: 'extension' });
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg && msg.sahayi === 'toggle') {
      window.Sahayi.toggle();
      sendResponse({ ok: true });
    }
  });
}
