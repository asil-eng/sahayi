# സഹായി · Sahayi

**Government websites made simple for senior citizens and persons with disabilities in Kerala.**
Sahayi reads a cluttered government page, hides it behind a calm, large-text, one-question-at-a-time screen in
Malayalam or English, and can fill the form **by voice**: it asks each question aloud in Malayalam, listens to
the answer, confirms it, and writes it into the real form. The person always presses **Submit** themselves.

## How it works

```
real government page ──scan──▶ template? ──yes──▶ instant, checked Simple Mode (no AI, nothing sent)
                                   │no
                                   ▼
                         OpenAI simplifies page structure once ──▶ cached for next time
                                   ▼
   Simple Mode UI  ──answers──▶ written straight into the REAL form fields ──▶ person presses Submit
   voice mode: ask (OpenAI TTS, Malayalam) → listen → transcribe → convert to form format → "ശരിയാണോ?" → fill
```

* **Privacy:** typed answers never leave the device. Only page labels/text go to OpenAI (and only when there's no
  template). In voice mode the spoken audio is sent for transcription, and users are told so on screen. Aadhaar and
  bank numbers default to typing.
* **Never does for the user:** OTP, PIN, passwords, CAPTCHA, file uploads, Submit. Sahayi highlights them on the real
  page. These fields have no mic and no input box, so nothing about them is sent anywhere. If a spoken answer sounds
  like an OTP/PIN, it is thrown away.
* **Private sites** (DigiLocker, UIDAI, Income Tax, EPFO: `PRIVATE_HOSTS` in `core/sahayi-core.js`): page content
  is **never** sent to the AI. Sahayi uses only the hand-checked templates; other pages get a plain no-AI simple view.
* **Elsewhere**, before any page text goes to the AI, numbers (4+ digits), emails and PAN-like codes are masked and
  session codes are stripped from the URL. When Sahayi reads your spoken answer back to you, it uses the device's own
  voice, so the answer is not sent again for speech.

### DigiLocker
Checked templates cover the home page, mobile login and Aadhaar login. Aadhaar and mobile number default to typing.
OTP and security PIN steps are done by the person on the page. Logged-in pages (your documents) use the plain no-AI view.

## Project layout

| Path | What |
|---|---|
| `core/sahayi-core.js` | The shared engine: scanning, templates, Simple Mode UI, form filling, voice loop |
| `core/openai.js` | Shared OpenAI client (simplify, normalise answers, speech, transcription) |
| `core/templates.js` | Hand-checked page templates (includes the demo pension form) |
| `extension/` | Chrome extension (desktop) |
| `mobile/` | Android/iOS app (Expo) with a built-in browser that loads the same core |
| `demo/pension-form.html` | Fictional, deliberately cluttered pension form for the demo |
| `scripts/sync.mjs` | Copies `core/` into the extension and the app (`npm run sync`) |

**After editing anything in `core/`, run `npm run sync`.**

## Run it: Chrome extension (laptop)

1. `npm run sync`
2. Chrome → `chrome://extensions` → turn on **Developer mode** → **Load unpacked** → choose the `extension/` folder.
3. The Settings page opens. Paste your **OpenAI API key** → Save.
   Use **"Speak a Malayalam sentence"** and **"Record 5 seconds"** to check Malayalam voice quality first.
4. Open any website and click the Sahayi toolbar button (or press **Alt+S**).

Demo page: `python3 -m http.server 8080` in this folder, then open
<http://localhost:8080/demo/pension-form.html> and tap the blue **"സഹായി: ലളിതമായി കാണാം"** button.

## Run it: phone (Android)

1. Install **Expo Go** from the Play Store. The phone and laptop must be on the same Wi-Fi.
2. `npm run mobile` (syncs, then starts Expo). Scan the QR code with Expo Go.
3. In the app: **Settings** → paste API key → Save. Then open a service tile or type a website address.

Notes:
* The microphone only works on **https** pages (browser rule). For the demo page on a phone, host `demo/` on
  any https static host (GitHub Pages, Netlify Drop), then add its URL to `mobile/src/services.js`.
* Check the URLs in `mobile/src/services.js` before the demo.

## Adding a real government page as a checked template

1. Open the page and turn Sahayi on (this needs the API key).
2. Open DevTools on the page. In the Console, switch the context dropdown from "top" to **Sahayi**, then run
   `Sahayi.exportTemplate()`. The AI drafts the template in Malayalam and English and copies the JSON.
3. Check every label and help text by hand, paste it into `core/templates.js`, and run `npm run sync`.

## 3-minute demo script

1. **Problem (30 s):** show the cluttered portal: tiny text, jargon (LSGI, IFSC, IGNOAPS), 25+ fields.
2. **Simple Mode (45 s):** tap Sahayi. A calm Malayalam summary appears, plus a "free, don't pay anyone" warning
   and a documents checklist. Only the required questions are asked. Show **A+** and **◐** (high contrast).
3. **Voice (60 s):** tap **സംസാരിച്ച് പൂരിപ്പിക്കാം**. It asks "നിങ്ങളുടെ പേര് എന്താണ്?"; answer in Malayalam;
   it reads the answer back ("ഞാൻ കേട്ടത്: Ramesh Kumar. ശരിയാണോ?"); say "ശരി". It fills the field and asks the
   next question. Show Aadhaar going to typing and CAPTCHA being highlighted on the page.
4. **Safety & impact (45 s):** review screen, then the real page with Submit highlighted. The person stays in control.
   Typed data never leaves the phone. Any government site works: checked templates are instant, and AI covers the rest.
