/*
 * Hand-checked templates for supported government pages.
 * A matching template is used instantly: no AI call, nothing sent anywhere.
 *
 * How to add one:
 *   1. Open the page with Sahayi, then in the browser console run:  Sahayi.exportTemplate()
 *      (AI drafts it in Malayalam + English and copies the JSON to your clipboard)
 *   2. Check/fix every label and help text by hand.
 *   3. Paste it into the list below and run `npm run sync`.
 *
 * Shape:
 * {
 *   id, match: { host, path (regex), keys: [field keys used to recognise the page] },
 *   langs: ['ml','en'],
 *   title: {ml,en}, summary: {ml,en},
 *   keyPoints: {ml:[], en:[]}, documents: {ml:[], en:[]}, warnings: {ml:[], en:[]},
 *   actions: [{ ref: {text, href}, label: {ml,en} }],
 *   fields: { "<key>": { required, sensitive, label:{ml,en}, help:{ml,en}, ask:{ml,en}, example } },
 *   order: ["<key>", ...],
 *   submit: "<button key>"
 * }
 * Field keys: "#elementId", or "name=fieldName" (radio groups always use name=).
 */
window.SAHAYI_TEMPLATES = window.SAHAYI_TEMPLATES || [];

// ---- Demo: fictional welfare pension form (demo/pension-form.html) ----
window.SAHAYI_TEMPLATES.push({
  id: 'demo-welfare-pension',
  match: {
    path: 'pension-form\\.html$',
    keys: ['#applicantName', '#dob', 'name=gender', '#pensionType', '#aadhaar', '#mobile', '#district', '#lsgiType', '#ifsc', '#accountNo'],
  },
  langs: ['ml', 'en'],
  title: { ml: 'ക്ഷേമ പെൻഷൻ അപേക്ഷ', en: 'Welfare pension application' },
  summary: {
    ml: 'വാർദ്ധക്യ, വിധവ, ഭിന്നശേഷി പെൻഷനുകൾക്ക് ഓൺലൈനായി അപേക്ഷിക്കാനുള്ള പേജാണിത്.',
    en: 'Apply online for old age, widow or disability pension.',
  },
  keyPoints: {
    ml: ['വാർദ്ധക്യ പെൻഷന് 60 വയസ്സ് പൂർത്തിയാകണം.', 'കുടുംബ വരുമാനം വർഷം ₹1,00,000-ൽ താഴെ ആയിരിക്കണം.', 'അപേക്ഷ സൗജന്യമാണ്. ഒരു ഫീസും ഇല്ല.'],
    en: ['For old age pension you must be 60 or older.', 'Family income must be below ₹1,00,000 a year.', 'Applying is free. There is no fee.'],
  },
  documents: {
    ml: ['Aadhaar കാർഡ്', 'ബാങ്ക് പാസ്ബുക്ക്', 'വരുമാന സർട്ടിഫിക്കറ്റ് (ഫോട്ടോ അല്ലെങ്കിൽ PDF)', 'റേഷൻ കാർഡ്'],
    en: ['Aadhaar card', 'Bank passbook', 'Income certificate (photo or PDF)', 'Ration card'],
  },
  warnings: {
    ml: ['ഈ അപേക്ഷ സൗജന്യമാണ്. ആരെങ്കിലും പണം ചോദിച്ചാൽ നൽകരുത്.'],
    en: ['This application is free. Do not pay anyone who asks for money.'],
  },
  actions: [{ ref: { text: 'Check Application Status', href: '?status=1' }, label: { ml: 'അപേക്ഷയുടെ നില അറിയാം', en: 'Check application status' } }],
  fields: {
    '#applicantName': { required: true, label: { ml: 'നിങ്ങളുടെ പേര്', en: 'Your name' }, help: { ml: 'Aadhaar കാർഡിൽ ഉള്ളതുപോലെ, ഇംഗ്ലീഷ് അക്ഷരത്തിൽ.', en: 'In English letters, exactly as on your Aadhaar card.' }, ask: { ml: 'നിങ്ങളുടെ പേര് എന്താണ്? Aadhaar കാർഡിൽ ഉള്ളതുപോലെ പറയൂ.', en: 'What is your name, as on your Aadhaar card?' }, example: 'Ramesh Kumar' },
    '#dob': { required: true, label: { ml: 'ജനന തീയതി', en: 'Date of birth' }, help: { ml: 'Aadhaar കാർഡിൽ ഉള്ള ജനന തീയതി.', en: 'As shown on your Aadhaar card.' }, ask: { ml: 'നിങ്ങളുടെ ജനന തീയതി എന്നാണ്?', en: 'What is your date of birth?' }, example: '23/03/1958' },
    'name=gender': { required: true, label: { ml: 'ലിംഗം', en: 'Gender' }, help: { ml: '', en: '' }, ask: { ml: 'നിങ്ങളുടെ ലിംഗം ഏതാണ്? പുരുഷൻ, സ്ത്രീ, അല്ലെങ്കിൽ ട്രാൻസ്ജെൻഡർ.', en: 'What is your gender? Male, female or transgender.' } },
    '#pensionType': { required: true, label: { ml: 'ഏത് പെൻഷൻ വേണം?', en: 'Which pension?' }, help: { ml: 'വാർദ്ധക്യ (Old Age), വിധവ (Widow), ഭിന്നശേഷി (Disability) തുടങ്ങിയവയിൽ ഒന്ന് തിരഞ്ഞെടുക്കുക.', en: 'Choose one: old age, widow, disability and so on.' }, ask: { ml: 'ഏത് പെൻഷനാണ് വേണ്ടത്? വാർദ്ധക്യ പെൻഷൻ, വിധവ പെൻഷൻ, ഭിന്നശേഷി പെൻഷൻ...', en: 'Which pension do you need? Old age, widow, disability...' } },
    '#aadhaar': { required: true, sensitive: true, label: { ml: 'Aadhaar നമ്പർ', en: 'Aadhaar number' }, help: { ml: 'Aadhaar കാർഡിലെ 12 അക്ക നമ്പർ.', en: 'The 12-digit number on your Aadhaar card.' }, ask: { ml: 'നിങ്ങളുടെ Aadhaar നമ്പർ ടൈപ്പ് ചെയ്യൂ.', en: 'Please type your Aadhaar number.' }, example: '123456789012' },
    '#mobile': { required: true, label: { ml: 'മൊബൈൽ നമ്പർ', en: 'Mobile number' }, help: { ml: 'അപേക്ഷയുടെ വിവരങ്ങൾ SMS ആയി ഈ നമ്പറിൽ വരും.', en: 'Updates about your application will come to this number by SMS.' }, ask: { ml: 'നിങ്ങളുടെ മൊബൈൽ നമ്പർ പറയൂ.', en: 'What is your mobile number?' }, example: '9876543210' },
    '#district': { required: true, label: { ml: 'ജില്ല', en: 'District' }, help: { ml: 'നിങ്ങൾ താമസിക്കുന്ന ജില്ല.', en: 'The district where you live.' }, ask: { ml: 'ഏത് ജില്ലയിലാണ് താമസിക്കുന്നത്?', en: 'Which district do you live in?' } },
    '#lsgiType': { required: true, label: { ml: 'പഞ്ചായത്തോ നഗരസഭയോ?', en: 'Panchayat or municipality?' }, help: { ml: 'LSGI എന്നാൽ നിങ്ങളുടെ പഞ്ചായത്ത്, മുനിസിപ്പാലിറ്റി അല്ലെങ്കിൽ കോർപ്പറേഷൻ.', en: 'LSGI means your local body: panchayat, municipality or corporation.' }, ask: { ml: 'നിങ്ങളുടെ സ്ഥലം പഞ്ചായത്താണോ, മുനിസിപ്പാലിറ്റിയാണോ, കോർപ്പറേഷനാണോ?', en: 'Is your area a panchayat, municipality or corporation?' } },
    '#lsgiName': { required: true, label: { ml: 'പഞ്ചായത്തിന്റെ പേര്', en: 'Name of your local body' }, help: { ml: 'നിങ്ങളുടെ ഗ്രാമപഞ്ചായത്തിന്റെയോ നഗരസഭയുടെയോ പേര്.', en: 'The name of your panchayat or municipality.' }, ask: { ml: 'നിങ്ങളുടെ പഞ്ചായത്തിന്റെയോ നഗരസഭയുടെയോ പേര് എന്താണ്?', en: 'What is the name of your panchayat or municipality?' }, example: 'Kallara' },
    '#wardNo': { required: true, label: { ml: 'വാർഡ് നമ്പർ', en: 'Ward number' }, help: { ml: 'വീട്ടുനികുതി രസീതിലോ റേഷൻ കാർഡിലോ കാണാം.', en: 'You can find it on your house tax receipt or ration card.' }, ask: { ml: 'നിങ്ങളുടെ വാർഡ് നമ്പർ എത്രയാണ്?', en: 'What is your ward number?' }, example: '7' },
    '#houseName': { required: true, label: { ml: 'വീട്ടുപേര്', en: 'House name' }, help: { ml: 'വീട്ടുപേരും വീട്ടുനമ്പറും.', en: 'Your house name and house number.' }, ask: { ml: 'നിങ്ങളുടെ വീട്ടുപേരും നമ്പറും എന്താണ്?', en: 'What is your house name and number?' }, example: 'Rose Villa, 12/345' },
    '#pincode': { required: true, label: { ml: 'PIN കോഡ്', en: 'PIN code' }, help: { ml: 'നിങ്ങളുടെ പോസ്റ്റ് ഓഫീസിന്റെ 6 അക്ക നമ്പർ.', en: 'The 6-digit number of your post office.' }, ask: { ml: 'നിങ്ങളുടെ PIN കോഡ് പറയൂ.', en: 'What is your PIN code?' }, example: '695001' },
    '#rationCard': { required: false, label: { ml: 'റേഷൻ കാർഡ് നമ്പർ', en: 'Ration card number' }, help: { ml: 'റേഷൻ കാർഡിന്റെ മുൻ പേജിൽ ഉണ്ട്.', en: 'It is on the front page of your ration card.' }, ask: { ml: 'റേഷൻ കാർഡ് നമ്പർ പറയൂ.', en: 'What is your ration card number?' } },
    '#annualIncome': { required: true, label: { ml: 'വർഷത്തെ കുടുംബ വരുമാനം', en: 'Yearly family income' }, help: { ml: 'വില്ലേജ് ഓഫീസർ തന്ന വരുമാന സർട്ടിഫിക്കറ്റിലെ തുക, രൂപയിൽ.', en: 'The amount on the income certificate from the Village Officer, in rupees.' }, ask: { ml: 'കുടുംബത്തിന്റെ ഒരു വർഷത്തെ വരുമാനം എത്രയാണ്? സർട്ടിഫിക്കറ്റിൽ ഉള്ളത് പറയൂ.', en: "What is your family's yearly income, as on the certificate?" }, example: '60000' },
    '#bankName': { required: true, label: { ml: 'ബാങ്കിന്റെ പേര്', en: 'Bank name' }, help: { ml: 'പെൻഷൻ വരേണ്ട ബാങ്ക്.', en: 'The bank where your pension should come.' }, ask: { ml: 'പെൻഷൻ ഏത് ബാങ്കിലേക്കാണ് വരേണ്ടത്?', en: 'Which bank should the pension go to?' }, example: 'State Bank of India' },
    '#ifsc': { required: true, label: { ml: 'IFSC കോഡ്', en: 'IFSC code' }, help: { ml: 'ബാങ്ക് ശാഖയുടെ കോഡ്. പാസ്ബുക്കിന്റെ ആദ്യ പേജിൽ ഉണ്ടാകും.', en: 'Your bank branch code. It is on the first page of your passbook.' }, ask: { ml: 'പാസ്ബുക്കിലെ IFSC കോഡ് പറയൂ.', en: 'What is the IFSC code in your passbook?' }, example: 'SBIN0070123' },
    '#accountNo': { required: true, sensitive: true, label: { ml: 'ബാങ്ക് അക്കൗണ്ട് നമ്പർ', en: 'Bank account number' }, help: { ml: 'പാസ്ബുക്കിന്റെ ആദ്യ പേജിൽ ഉണ്ട്.', en: 'It is on the first page of your passbook.' }, ask: { ml: 'ബാങ്ക് അക്കൗണ്ട് നമ്പർ ടൈപ്പ് ചെയ്യൂ.', en: 'Please type your bank account number.' } },
    '#incomeCert': { required: true, label: { ml: 'വരുമാന സർട്ടിഫിക്കറ്റ്', en: 'Income certificate' }, help: { ml: 'സർട്ടിഫിക്കറ്റിന്റെ ഫോട്ടോ അല്ലെങ്കിൽ PDF.', en: 'A photo or PDF of the certificate.' } },
    '#captcha': { required: true, label: { ml: 'ചിത്രത്തിലെ അക്ഷരങ്ങൾ', en: 'Letters in the picture' }, help: { ml: 'പേജിൽ കാണിച്ച അക്ഷരങ്ങൾ അതേപടി ടൈപ്പ് ചെയ്യൂ.', en: 'Type the letters shown on the page exactly.' } },
    '#declaration': { required: true, label: { ml: 'വിവരങ്ങൾ ശരിയാണോ?', en: 'Is everything true?' }, help: { ml: 'നൽകിയ വിവരങ്ങൾ എല്ലാം ശരിയാണെന്ന് നിങ്ങൾ സമ്മതിക്കുന്നു.', en: 'You confirm that all the information you gave is true.' }, ask: { ml: 'നൽകിയ വിവരങ്ങൾ എല്ലാം ശരിയാണോ?', en: 'Is all the information you gave true?' } },
    '#email': { required: false, label: { ml: 'ഇമെയിൽ', en: 'Email' }, help: { ml: 'ഉണ്ടെങ്കിൽ മാത്രം.', en: 'Only if you have one.' }, ask: { ml: 'ഇമെയിൽ വിലാസം ഉണ്ടോ? ഉണ്ടെങ്കിൽ പറയൂ.', en: 'Do you have an email address? If yes, say it.' } },
    '#spouseName': { required: false, label: { ml: 'ഭർത്താവിന്റെ / ഭാര്യയുടെ പേര്', en: "Spouse's name" }, help: { ml: 'അല്ലെങ്കിൽ രക്ഷിതാവിന്റെ പേര്.', en: "Or your guardian's name." }, ask: { ml: 'ഭർത്താവിന്റെയോ ഭാര്യയുടെയോ പേര് എന്താണ്?', en: "What is your spouse's name?" } },
  },
  sections: [
    { title: { ml: 'നിങ്ങളെക്കുറിച്ച്', en: 'About you' }, keys: ['#applicantName', '#dob', 'name=gender', '#pensionType', '#aadhaar', '#mobile', '#email', '#spouseName'] },
    { title: { ml: 'വിലാസം', en: 'Address' }, keys: ['#district', '#lsgiType', '#lsgiName', '#wardNo', '#houseName', '#pincode', '#rationCard'] },
    { title: { ml: 'വരുമാനവും ബാങ്കും', en: 'Income and bank' }, keys: ['#annualIncome', '#bankName', '#ifsc', '#accountNo', '#incomeCert'] },
    { title: { ml: 'അവസാന ഘട്ടം', en: 'Last step' }, keys: ['#captcha', '#declaration'] },
  ],
  order: ['#applicantName', '#dob', 'name=gender', '#pensionType', '#aadhaar', '#mobile', '#district', '#lsgiType', '#lsgiName', '#wardNo', '#houseName', '#pincode', '#annualIncome', '#bankName', '#ifsc', '#accountNo', '#incomeCert', '#rationCard', '#email', '#spouseName', '#captcha', '#declaration'],
  submit: '#btnSubmit',
});

// ---- DigiLocker (private site: these templates are used, and page content is never sent to AI) ----
const DL_OTP_WARNING = {
  ml: ['OTP-ഓ DigiLocker PIN-ഓ ആരോടും പറയരുത്. ഫോണിൽ വിളിച്ച് ചോദിക്കുന്നവരോട് പോലും.'],
  en: ['Never tell anyone your OTP or DigiLocker PIN, not even someone who calls you.'],
};
window.SAHAYI_TEMPLATES.push(
  {
    id: 'digilocker-home',
    match: { host: 'www.digilocker.gov.in', path: '^/(web/?)?$', keys: [] },
    langs: ['ml', 'en'],
    title: { ml: 'DigiLocker: നിങ്ങളുടെ ഡിജിറ്റൽ രേഖകൾ', en: 'DigiLocker: your digital documents' },
    summary: {
      ml: 'Aadhaar, ഡ്രൈവിംഗ് ലൈസൻസ്, മാർക്ക് ലിസ്റ്റ് തുടങ്ങിയ സർക്കാർ രേഖകൾ ഫോണിൽ സൂക്ഷിക്കാനും ആവശ്യമുള്ളപ്പോൾ കാണിക്കാനുമുള്ള സർക്കാർ സേവനം.',
      en: 'A government service to keep documents like Aadhaar, driving licence and mark sheets on your phone, and show them when needed.',
    },
    keyPoints: {
      ml: ['Aadhaar നമ്പറോ മൊബൈൽ നമ്പറോ ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യാം.', 'തിരിച്ചറിയൽ, വിദ്യാഭ്യാസം, ആരോഗ്യം, വാഹനം തുടങ്ങിയ രേഖകൾ ലഭിക്കും.', 'കേരളത്തിലെ സർക്കാർ വകുപ്പുകളുടെ രേഖകളും ലഭ്യമാണ്.'],
      en: ['You can log in with your Aadhaar number or mobile number.', 'Identity, education, health and vehicle documents are available.', 'Documents from Kerala government departments are also available.'],
    },
    documents: { ml: [], en: [] },
    warnings: DL_OTP_WARNING,
    actions: [
      { ref: { text: 'Login / Register', href: '/web/signup' }, label: { ml: 'ലോഗിൻ ചെയ്യുക / അക്കൗണ്ട് ഉണ്ടാക്കുക', en: 'Log in / create account' } },
      { ref: { text: 'Kerala 95+ Issuers', href: '/web/dashboard/issuers?state=Kerala' }, label: { ml: 'കേരളത്തിലെ രേഖകൾ', en: 'Kerala documents' } },
      { ref: { text: 'Driving Licence', href: '/web/dashboard/issuers/000048' }, label: { ml: 'ഡ്രൈവിംഗ് ലൈസൻസ്', en: 'Driving licence' } },
      { ref: { text: 'Class X Marksheet', href: '/web/dashboard/issuers?searchKey=Class%20X%20Marksheet' }, label: { ml: 'പത്താം ക്ലാസ് മാർക്ക് ലിസ്റ്റ്', en: 'Class 10 mark sheet' } },
      { ref: { text: 'Identity Documents', href: '/web/dashboard/issuers?id=19' }, label: { ml: 'തിരിച്ചറിയൽ രേഖകൾ', en: 'Identity documents' } },
      { ref: { text: 'Health and Wellness', href: '/web/dashboard/issuers?id=7' }, label: { ml: 'ആരോഗ്യ രേഖകൾ', en: 'Health records' } },
      { ref: { text: 'FAQ', href: '/web/about/faq' }, label: { ml: 'സംശയങ്ങൾക്ക് ഉത്തരം (FAQ)', en: 'Questions and answers (FAQ)' } },
    ],
    fields: {},
    order: [],
    submit: null,
  },
  {
    id: 'digilocker-login-mobile',
    match: { host: 'accounts.digilocker.gov.in', path: '^/v3/(?!aadhaar)[^/]+$', keys: ['#mobile'] },
    langs: ['ml', 'en'],
    title: { ml: 'DigiLocker-ൽ ലോഗിൻ ചെയ്യാം', en: 'Log in to DigiLocker' },
    summary: {
      ml: 'മൊബൈൽ നമ്പർ നൽകി Continue അമർത്തുക. അടുത്ത പേജിൽ OTP അല്ലെങ്കിൽ നിങ്ങളുടെ PIN ചോദിക്കും.',
      en: 'Enter your mobile number and press Continue. The next page will ask for an OTP or your PIN.',
    },
    keyPoints: { ml: ['Aadhaar ഉപയോഗിച്ചും ലോഗിൻ ചെയ്യാം.'], en: ['You can also log in with Aadhaar.'] },
    documents: { ml: ['DigiLocker-ൽ രജിസ്റ്റർ ചെയ്ത മൊബൈൽ ഫോൺ കയ്യിൽ വേണം'], en: ['Keep the mobile phone registered with DigiLocker with you'] },
    warnings: DL_OTP_WARNING,
    actions: [{ ref: { text: 'Try using Aadhaar or VID', href: '/v3/aadhaar' }, label: { ml: 'Aadhaar ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യാം', en: 'Log in with Aadhaar instead' } }],
    fields: {
      '#mobile': {
        required: true,
        sensitive: true,
        label: { ml: 'മൊബൈൽ നമ്പർ', en: 'Mobile number' },
        help: { ml: 'DigiLocker-ൽ രജിസ്റ്റർ ചെയ്ത 10 അക്ക മൊബൈൽ നമ്പർ.', en: 'The 10-digit mobile number registered with DigiLocker.' },
        ask: { ml: 'നിങ്ങളുടെ മൊബൈൽ നമ്പർ ടൈപ്പ് ചെയ്യൂ.', en: 'Please type your mobile number.' },
        example: '9876543210',
      },
    },
    order: ['#mobile'],
    submit: '#button',
  },
  {
    id: 'digilocker-login-aadhaar',
    match: { host: 'accounts.digilocker.gov.in', path: '^/v3/aadhaar', keys: ['#aadhaar_num'] },
    langs: ['ml', 'en'],
    title: { ml: 'Aadhaar ഉപയോഗിച്ച് ലോഗിൻ', en: 'Log in with Aadhaar' },
    summary: {
      ml: 'Aadhaar നമ്പറോ VID-ഓ നൽകി Continue അമർത്തുക. Aadhaar-ൽ ചേർത്ത മൊബൈലിലേക്ക് OTP വരും.',
      en: 'Enter your Aadhaar number or VID and press Continue. An OTP will come to the mobile linked with your Aadhaar.',
    },
    keyPoints: {
      ml: ['VID എന്നാൽ Aadhaar നമ്പറിന് പകരം ഉപയോഗിക്കാവുന്ന 16 അക്ക നമ്പർ.', 'Continue അമർത്തുമ്പോൾ DigiLocker-ന്റെ നിബന്ധനകൾ അംഗീകരിക്കുന്നു.'],
      en: ['VID is a 16-digit number you can use instead of your Aadhaar number.', "Pressing Continue means you accept DigiLocker's terms."],
    },
    documents: { ml: ['Aadhaar കാർഡ്', 'Aadhaar-ൽ ചേർത്ത മൊബൈൽ ഫോൺ'], en: ['Aadhaar card', 'The mobile phone linked with your Aadhaar'] },
    warnings: DL_OTP_WARNING,
    actions: [{ ref: { text: 'Try using Mobile Number', href: '' }, label: { ml: 'മൊബൈൽ നമ്പർ ഉപയോഗിച്ച് ലോഗിൻ', en: 'Log in with mobile number instead' } }],
    fields: {
      '#aadhaar_num': {
        required: true,
        sensitive: true,
        label: { ml: 'Aadhaar നമ്പർ', en: 'Aadhaar number' },
        help: { ml: 'Aadhaar കാർഡിലെ 12 അക്ക നമ്പർ, അല്ലെങ്കിൽ 16 അക്ക VID.', en: 'The 12-digit number on your Aadhaar card, or your 16-digit VID.' },
        ask: { ml: 'Aadhaar നമ്പർ ടൈപ്പ് ചെയ്യൂ.', en: 'Please type your Aadhaar number.' },
        example: '123456789012',
      },
    },
    order: ['#aadhaar_num'],
    submit: '#button',
  }
);
