import { useState, useEffect, useRef, useMemo } from 'react'
import { GamePortal as CoconutMalletGame } from './games/coconut-mallet/src/games/coconut-mallet/index.ts'
import { FolkMusicPortal } from './games/folk-music-portal/FolkMusicPortal'
// ─── Types ────────────────────────────────────────────────────────────────────

type AppFlow = 'onboarding' | 'portal'

type OnboardStep = 'welcome' | 'language' | 'details' | 'pin' | 'done'

type Screen =
  | 'home'
  | 'games'
  | 'game-tree'
  | 'game-match'
  | 'game-coconut-mallet'
  | 'family'
  | 'family-analytics'
  | 'family-photos'
  | 'care'
  | 'game-folk-music'
// ─── Data ─────────────────────────────────────────────────────────────────────

const ONBOARD_LANGUAGES = [
  { code: 'en', label: 'English', sub: 'English' },
  { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
  { code: 'as', label: 'অসমীয়া', sub: 'Assamese' },
  { code: 'bn', label: 'বাংলা', sub: 'Bengali' },
  { code: 'mni', label: 'মৈতৈলোন্', sub: 'Manipuri (Meiteilon)' },
  { code: 'brx', label: 'बर\u2019', sub: 'Bodo' },
  { code: 'kha', label: 'Ka Ktien Khasi', sub: 'Khasi' },
  { code: 'grt', label: 'A\u00b7chik Ku\u00b7bidik', sub: 'Garo' },
  { code: 'lus', label: 'Mizo \u1E6Cawng', sub: 'Mizo' },
] as const

type LangCode = (typeof ONBOARD_LANGUAGES)[number]['code']

const LANGUAGE_ICONS: Record<LangCode, string> = {
  en: '🌐', hi: '🪔', as: '🏔', bn: '🌊', mni: '🌿',
  brx: '🌾', kha: '🍃', grt: '🌳', lus: '⛰',
}

const TRANSLATIONS = {
  en: {
    welcome: 'Welcome',
    heroTitle1: 'A caring space',
    heroTitle2: 'for your mind',
    heroSubtitle: 'Memory games, family connections, and AI-assisted daily care — all in one gentle app.',
    letsBegin: "Let's Begin",
    freeLine: 'Free · Designed for North East India · 9 Languages',

    chooseLanguage: 'Choose your language',
    selectLanguage: 'Select a language to continue.',
    back: 'Back',
    continue: 'Continue',

    enterDetails: 'Enter your details',
    personalize: "We'll use this to personalize your experience.",
    fullName: 'Full Name',
    enterName: 'Enter your name',
    phoneNumber: 'Phone Number',
    enterPhone: 'Enter 10-digit number',
    invalidPhone: 'Enter a valid 10-digit phone number.',

    setupPin: 'Set up your PIN',
    pinSubtitle: 'Create a 4-digit PIN to access the family portal later.',
    pinLabel: '4-digit PIN',
    pinPlaceholder: 'Enter 4-digit PIN',
    invalidPin: 'PIN must be exactly 4 digits.',

    setupComplete: 'Setup complete!',
    readyToUse: "You're ready to start using MemorySathi.",
    goToDashboard: 'Go to Dashboard',

    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    memoryTip: 'Memory Tip of the Day',
    memoryTipText: 'Recall 3 happy moments from last week',
    yourPortals: 'Your Portals',
    todaysProgress: "Today's Progress",

    gamesPortal: 'Games Portal',
    gamesSub: 'Memory & brain exercises',
    playNow: '▶ Play Now',

    familyPortal: 'Family Portal',
    familySub: 'Caregiver dashboard & data',
    secureLogin: '🔒 Secure Login',

    carePortal: 'Dementia Care',
    careSub: 'AI assistant & care guides',
    askAssistant: '🎙 Ask Assistant',

    familyTreeBuilder: 'Family Tree Builder',
    matchFaceName: 'Match Face to Name',
    familyCheckIn: 'Family Check-in',
    placed: '4/5 placed',
    correct: '3/4 correct',
    messages: '2 messages',

    familyAccess: 'Family Portal Access',
    secureLoginTitle: 'Secure Login',
    enterYourPin: 'Enter Your PIN',
    pinAccessLine: "Please enter your 4-digit PIN to access",
    verifyPin: 'Verify PIN',
    wrongPin: 'Incorrect PIN. Please try again.',
  },

  hi: {
    welcome: 'स्वागत है',
    heroTitle1: 'आपके मन के लिए',
    heroTitle2: 'एक स्नेहपूर्ण स्थान',
    heroSubtitle: 'मेमोरी गेम्स, परिवार से जुड़ाव, और AI-सहायता प्राप्त दैनिक देखभाल — सब एक ही ऐप में।',
    letsBegin: 'शुरू करें',
    freeLine: 'निःशुल्क · उत्तर-पूर्व भारत के लिए डिज़ाइन किया गया · 9 भाषाएँ',

    chooseLanguage: 'अपनी भाषा चुनें',
    selectLanguage: 'जारी रखने के लिए एक भाषा चुनें।',
    back: 'वापस',
    continue: 'आगे बढ़ें',

    enterDetails: 'अपनी जानकारी दर्ज करें',
    personalize: 'हम इसका उपयोग आपके अनुभव को व्यक्तिगत बनाने के लिए करेंगे।',
    fullName: 'पूरा नाम',
    enterName: 'अपना नाम दर्ज करें',
    phoneNumber: 'फ़ोन नंबर',
    enterPhone: '10 अंकों का नंबर दर्ज करें',
    invalidPhone: 'कृपया सही 10 अंकों का फ़ोन नंबर दर्ज करें।',

    setupPin: 'अपना PIN सेट करें',
    pinSubtitle: 'बाद में फैमिली पोर्टल खोलने के लिए 4 अंकों का PIN बनाएं।',
    pinLabel: '4 अंकों का PIN',
    pinPlaceholder: '4 अंकों का PIN दर्ज करें',
    invalidPin: 'PIN ठीक 4 अंकों का होना चाहिए।',

    setupComplete: 'सेटअप पूरा हुआ!',
    readyToUse: 'अब आप MemorySathi इस्तेमाल करने के लिए तैयार हैं।',
    goToDashboard: 'डैशबोर्ड पर जाएं',

    goodMorning: 'सुप्रभात',
    goodAfternoon: 'नमस्कार',
    goodEvening: 'शुभ संध्या',
    memoryTip: 'आज की स्मृति सलाह',
    memoryTipText: 'पिछले सप्ताह की 3 खुशहाल यादें याद करें',
    yourPortals: 'आपके पोर्टल',
    todaysProgress: 'आज की प्रगति',

    gamesPortal: 'गेम्स पोर्टल',
    gamesSub: 'स्मृति और मस्तिष्क अभ्यास',
    playNow: '▶ अभी खेलें',

    familyPortal: 'फैमिली पोर्टल',
    familySub: 'केयरगिवर डैशबोर्ड और डेटा',
    secureLogin: '🔒 सुरक्षित लॉगिन',

    carePortal: 'डिमेंशिया देखभाल',
    careSub: 'AI सहायक और देखभाल मार्गदर्शिका',
    askAssistant: '🎙 सहायक से पूछें',

    familyTreeBuilder: 'फैमिली ट्री बिल्डर',
    matchFaceName: 'चेहरा और नाम मिलाएं',
    familyCheckIn: 'फैमिली चेक-इन',
    placed: '4/5 रखा गया',
    correct: '3/4 सही',
    messages: '2 संदेश',

    familyAccess: 'फैमिली पोर्टल एक्सेस',
    secureLoginTitle: 'सुरक्षित लॉगिन',
    enterYourPin: 'अपना PIN दर्ज करें',
    pinAccessLine: 'कृपया एक्सेस के लिए अपना 4 अंकों का PIN दर्ज करें',
    verifyPin: 'PIN सत्यापित करें',
    wrongPin: 'गलत PIN। कृपया फिर से प्रयास करें।',
  },

  // ── Assamese ────────────────────────────────────────────────────────────────
  as: {
    welcome: 'স্বাগতম',
    heroTitle1: 'আপোনাৰ মনৰ বাবে',
    heroTitle2: 'এটা যত্নশীল ঠাই',
    heroSubtitle: 'মেমৰি গেম, পৰিয়ালৰ সংযোগ, আৰু AI-সহায়ক দৈনন্দিন যত্ন — সকলো একেটা এপত।',
    letsBegin: 'আৰম্ভ কৰক',
    freeLine: 'বিনামূলীয়া · উত্তৰ-পূব ভাৰতৰ বাবে ডিজাইন কৰা · 9টা ভাষা',

    chooseLanguage: 'আপোনাৰ ভাষা বাছক',
    selectLanguage: 'আগবাঢ়িবলৈ এটা ভাষা বাছক।',
    back: 'উভতি যাওক',
    continue: 'আগবাঢ়ক',

    enterDetails: 'আপোনাৰ তথ্য দিয়ক',
    personalize: 'আমি এইটো আপোনাৰ অভিজ্ঞতা ব্যক্তিগত কৰিবলৈ ব্যৱহাৰ কৰিম।',
    fullName: 'সম্পূৰ্ণ নাম',
    enterName: 'আপোনাৰ নাম দিয়ক',
    phoneNumber: 'ফোন নম্বৰ',
    enterPhone: '10 সংখ্যাৰ নম্বৰ দিয়ক',
    invalidPhone: 'অনুগ্ৰহ কৰি সঠিক 10 সংখ্যাৰ ফোন নম্বৰ দিয়ক।',

    setupPin: 'আপোনাৰ PIN ছেট কৰক',
    pinSubtitle: 'পিছত Family Portal খোলিবলৈ 4 সংখ্যাৰ PIN তৈয়াৰ কৰক।',
    pinLabel: '4 সংখ্যাৰ PIN',
    pinPlaceholder: '4 সংখ্যাৰ PIN দিয়ক',
    invalidPin: "PIN ঠিক 4 সংখ্যাৰ হ'লাগিব।",

    setupComplete: 'ছেটআপ সম্পূৰ্ণ!',
    readyToUse: 'এতিয়া আপুনি MemorySathi ব্যৱহাৰ কৰিবলৈ সাজু।',
    goToDashboard: "ডেশ্ব'ৰ্ডলৈ যাওক",

    goodMorning: 'সুপ্ৰভাত',
    goodAfternoon: 'শুভ অপৰাহ্ন',
    goodEvening: 'শুভ সন্ধিয়া',
    memoryTip: 'আজিৰ স্মৃতি পৰামৰ্শ',
    memoryTipText: 'পাছ সপ্তাহৰ 3টা সুখৰ মুহূৰ্ত মনত পেলাওক',
    yourPortals: "আপোনাৰ প'ৰ্টেলসমূহ",
    todaysProgress: 'আজিৰ অগ্ৰগতি',

    gamesPortal: "গেমছ প'ৰ্টেল",
    gamesSub: 'স্মৃতি আৰু মগজুৰ অনুশীলন',
    playNow: '▶ এতিয়াই খেলক',

    familyPortal: "ফেমিলি প'ৰ্টেল",
    familySub: "যত্নকাৰীৰ ডেশ্ব'ৰ্ড আৰু ডাটা",
    secureLogin: '🔒 সুৰক্ষিত লগইন',

    carePortal: 'ডিমেনচিয়া যত্ন',
    careSub: 'AI সহায়ক আৰু যত্ন নিৰ্দেশনা',
    askAssistant: '🎙 সহায়কক সুধক',

    familyTreeBuilder: 'ফেমিলি ট্ৰি বিল্ডাৰ',
    matchFaceName: 'মুখ আৰু নাম মিলাওক',
    familyCheckIn: 'ফেমিলি চেক-ইন',
    placed: '4/5 ৰখা হৈছে',
    correct: '3/4 শুদ্ধ',
    messages: '2টা বাৰ্তা',

    familyAccess: "ফেমিলি প'ৰ্টেল এক্সেছ",
    secureLoginTitle: 'সুৰক্ষিত লগইন',
    enterYourPin: 'আপোনাৰ PIN দিয়ক',
    pinAccessLine: 'এক্সেছ কৰিবলৈ আপোনাৰ 4 সংখ্যাৰ PIN দিয়ক',
    verifyPin: 'PIN যাচাই কৰক',
    wrongPin: 'ভুল PIN। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
  },

  // ── Bengali ─────────────────────────────────────────────────────────────────
  bn: {
    welcome: 'স্বাগতম',
    heroTitle1: 'আপনার মনের জন্য',
    heroTitle2: 'একটি যত্নশীল স্থান',
    heroSubtitle: 'স্মৃতির খেলা, পরিবারের সঙ্গে যোগাযোগ, এবং AI-সহায়ক দৈনন্দিন যত্ন — সবই একটি কোমল অ্যাপে।',
    letsBegin: 'শুরু করা যাক',
    freeLine: 'বিনামূল্যে · উত্তর-পূর্ব ভারতের জন্য তৈরি · 9টি ভাষা',

    chooseLanguage: 'আপনার ভাষা বেছে নিন',
    selectLanguage: 'চালিয়ে যেতে একটি ভাষা নির্বাচন করুন।',
    back: 'পিছনে',
    continue: 'এগিয়ে যান',

    enterDetails: 'আপনার তথ্য দিন',
    personalize: 'আমরা এটি ব্যবহার করে আপনার অভিজ্ঞতা ব্যক্তিগত করে তুলব।',
    fullName: 'পুরো নাম',
    enterName: 'আপনার নাম লিখুন',
    phoneNumber: 'ফোন নম্বর',
    enterPhone: '10 সংখ্যার নম্বর লিখুন',
    invalidPhone: 'একটি সঠিক 10 সংখ্যার ফোন নম্বর লিখুন।',

    setupPin: 'আপনার PIN সেট করুন',
    pinSubtitle: 'পরে ফ্যামিলি পোর্টালে ঢোকার জন্য 4 সংখ্যার একটি PIN তৈরি করুন।',
    pinLabel: '4 সংখ্যার PIN',
    pinPlaceholder: '4 সংখ্যার PIN লিখুন',
    invalidPin: 'PIN অবশ্যই ঠিক 4 সংখ্যার হতে হবে।',

    setupComplete: 'সেটআপ সম্পূর্ণ!',
    readyToUse: 'আপনি এখন MemorySathi ব্যবহার করতে প্রস্তুত।',
    goToDashboard: 'ড্যাশবোর্ডে যান',

    goodMorning: 'সুপ্রভাত',
    goodAfternoon: 'শুভ অপরাহ্ন',
    goodEvening: 'শুভ সন্ধ্যা',
    memoryTip: 'আজকের স্মৃতি পরামর্শ',
    memoryTipText: 'গত সপ্তাহের 3টি আনন্দের মুহূর্ত মনে করুন',
    yourPortals: 'আপনার পোর্টালগুলি',
    todaysProgress: 'আজকের অগ্রগতি',

    gamesPortal: 'গেমস পোর্টাল',
    gamesSub: 'স্মৃতি ও মস্তিষ্কের অনুশীলন',
    playNow: '▶ এখনই খেলুন',

    familyPortal: 'ফ্যামিলি পোর্টাল',
    familySub: 'কেয়ারগিভার ড্যাশবোর্ড ও ডেটা',
    secureLogin: '🔒 নিরাপদ লগইন',

    carePortal: 'ডিমেনশিয়া যত্ন',
    careSub: 'AI সহায়ক ও যত্নের নির্দেশিকা',
    askAssistant: '🎙 সহায়ককে জিজ্ঞাসা করুন',

    familyTreeBuilder: 'ফ্যামিলি ট্রি বিল্ডার',
    matchFaceName: 'মুখের সঙ্গে নাম মেলান',
    familyCheckIn: 'ফ্যামিলি চেক-ইন',
    placed: '4/5 স্থাপন করা হয়েছে',
    correct: '3/4 সঠিক',
    messages: '2টি বার্তা',

    familyAccess: 'ফ্যামিলি পোর্টাল অ্যাক্সেস',
    secureLoginTitle: 'নিরাপদ লগইন',
    enterYourPin: 'আপনার PIN লিখুন',
    pinAccessLine: 'অ্যাক্সেসের জন্য আপনার 4 সংখ্যার PIN লিখুন',
    verifyPin: 'PIN যাচাই করুন',
    wrongPin: 'ভুল PIN। অনুগ্রহ করে আবার চেষ্টা করুন।',
  },

  // ── Manipuri / Meiteilon (Bengali script) ───────────────────────────────────
  mni: {
    welcome: 'তরাম্না ওকচরি',
    heroTitle1: 'নহাক্কী পুক্নিংগীদমক',
    heroTitle2: 'য়েংশিনবগী মফম অমা',
    heroSubtitle: 'নিংশিংবগী শান্নফম, ইমুং মনুংগা শম্নবা, অমসুং AI-না মতেং পাংবা নুমিৎ খুদিংগী য়েংশিনবা — পুম্নমক এপ অমতদা।',
    letsBegin: 'হৌরসি',
    freeLine: 'ফ্রি · নোর্থ ইষ্ট ইন্দিয়াগীদমক শেম্বা · লোল 9',

    chooseLanguage: 'নহাক্কী লোল খনবিয়ু',
    selectLanguage: 'মখা চত্থনবা লোল অমা খল্লু।',
    back: 'হন্না',
    continue: 'মখা চত্থৌ',

    enterDetails: 'নহাক্কী মরোল হাপচিল্লু',
    personalize: 'মসি নহাক্কী এক্সপিরিয়েন্স অদু পর্সোনেল ওইহন্নবা শীজিন্নগনি।',
    fullName: 'অপুনবা মিং',
    enterName: 'নহাক্কী মিং হাপচিল্লু',
    phoneNumber: 'ফোন নম্বর',
    enterPhone: 'মশিং 10 গী নম্বর হাপচিল্লু',
    invalidPhone: 'অচুম্বা মশিং 10 গী ফোন নম্বর হাপচিল্লু।',

    setupPin: 'নহাক্কী PIN শেম্বিয়ু',
    pinSubtitle: 'মতুংদা ফেমিলি পোর্টেল হাংননবা মশিং 4 গী PIN অমা শেম্মু।',
    pinLabel: 'মশিং 4 গী PIN',
    pinPlaceholder: 'মশিং 4 গী PIN হাপচিল্লু',
    invalidPin: 'PIN অসি মশিং 4 তমক ওইগদবনি।',

    setupComplete: 'শেমগৎপা লোইরে!',
    readyToUse: 'নহাক্না MemorySathi শীজিন্নবা থৌরাং লোইরে।',
    goToDashboard: 'ডেশবোর্ডদা চৎলু',

    goodMorning: 'অয়ুক্কী খুরুমজরি',
    goodAfternoon: 'নুংথিলগী খুরুমজরি',
    goodEvening: 'নুমিদাংগী খুরুমজরি',
    memoryTip: 'ঙসিগী নিংশিংবগী পাউতাক',
    memoryTipText: 'হৌখিবা চয়োলগী নুংঙাইবা মতম 3 নিংশিংউ',
    yourPortals: 'নহাক্কী পোর্টেলশিং',
    todaysProgress: 'ঙসিগী মায় পাকপা',

    gamesPortal: 'গেমস পোর্টেল',
    gamesSub: 'নিংশিংবা অমসুং মগজগী অভ্যাস',
    playNow: '▶ হৌজিক শান্নরো',

    familyPortal: 'ফেমিলি পোর্টেল',
    familySub: 'কেয়ারগিভার ডেশবোর্ড অমসুং ডাটা',
    secureLogin: '🔒 ঙাকথোকপা লগইন',

    carePortal: 'ডিমেনশিয়া য়েংশিনবা',
    careSub: 'AI মতেং পাংবা অমসুং য়েংশিনবগী লমজিং',
    askAssistant: '🎙 মতেং পাংবদা হংলু',

    familyTreeBuilder: 'ফেমিলি ট্রি বিল্দর',
    matchFaceName: 'মায়গা মিংগা চান্নহল্লু',
    familyCheckIn: 'ফেমিলি চেক-ইন',
    placed: '4/5 থম্লে',
    correct: '3/4 অচুম্বা',
    messages: 'পাউ 2',

    familyAccess: 'ফেমিলি পোর্টেল এক্সেস',
    secureLoginTitle: 'ঙাকথোকপা লগইন',
    enterYourPin: 'নহাক্কী PIN হাপচিল্লু',
    pinAccessLine: 'এক্সেস তৌনবা নহাক্কী মশিং 4 গী PIN হাপচিল্লু',
    verifyPin: 'PIN চাংয়েংবিয়ু',
    wrongPin: 'PIN অরানবনি। অমুক হন্না হোৎনবিয়ু।',
  },

  // ── Bodo (Devanagari) ───────────────────────────────────────────────────────
  brx: {
    welcome: 'स्वागत',
    heroTitle1: 'नोंथांनि गोसोनि थाखाय',
    heroTitle2: 'मोनसे गोसो होनाय जायगा',
    heroSubtitle: 'गोसो सानथाव खेलाफोर, नखरजों सोमोन्दो, आरो AI हेफाजाबजों सानफ्रोमबो नाजाबनाय — गासैबो मोनसे एपआव।',
    letsBegin: 'जागाय',
    freeLine: 'बिनामुल्या · नोर्थ ईस्ट इन्डियानि थाखाय बानायखौ · राव 9',

    chooseLanguage: 'नोंथांनि राव सायख',
    selectLanguage: 'लाबोनो मोनसे राव सायख।',
    back: 'फिन',
    continue: 'लाबो',

    enterDetails: 'नोंथांनि खौरां हो',
    personalize: 'बेखौ नोंथांनि अनुभवखौ निजि खालामनो बाहायगोन।',
    fullName: 'गासै मुं',
    enterName: 'नोंथांनि मुं हो',
    phoneNumber: 'फोन नामबार',
    enterPhone: '10 अंकनि नामबार हो',
    invalidPhone: 'थार 10 अंकनि फोन नामबार हो।',

    setupPin: 'नोंथांनि PIN दिन्थि',
    pinSubtitle: 'उनाव नखर पोर्टेल खेवनो 4 अंकनि PIN बानाय।',
    pinLabel: '4 अंकनि PIN',
    pinPlaceholder: '4 अंकनि PIN हो',
    invalidPin: 'PIN आ थार 4 अंकनि जानांगौ।',

    setupComplete: 'दिन्थिनाय जोबबाय!',
    readyToUse: 'नोंथाङा दा MemorySathi बाहायनो थियार जाबाय।',
    goToDashboard: 'डेशबोर्डआव थाङ',

    goodMorning: 'गोजोन फुं',
    goodAfternoon: 'गोजोन सान',
    goodEvening: 'गोजोन बेलासे',
    memoryTip: 'दिनैनि गोसो सानथाव राय',
    memoryTipText: 'जौगानाय सप्ताहनि 3 गोजोनथाव समखौ गोसो खांहो',
    yourPortals: 'नोंथांनि पोर्टेलफोर',
    todaysProgress: 'दिनैनि जौगानाय',

    gamesPortal: 'गेम्स पोर्टेल',
    gamesSub: 'गोसो आरो मगजनि अभ्यास',
    playNow: '▶ दा खेला',

    familyPortal: 'नखर पोर्टेल',
    familySub: 'केयारगिभार डेशबोर्ड आरो डाटा',
    secureLogin: '🔒 रैखाथि लगइन',

    carePortal: 'डिमेन्सिया नाजाबनाय',
    careSub: 'AI हेफाजाब आरो नाजाबनाय गाइड',
    askAssistant: '🎙 हेफाजाबग्राखौ सोंथि',

    familyTreeBuilder: 'नखर बिफां बानायग्रा',
    matchFaceName: 'मोखांजों मुं फोरमाय',
    familyCheckIn: 'नखर चेक-इन',
    placed: '4/5 दोनबाय',
    correct: '3/4 थार',
    messages: '2 खौरां',

    familyAccess: 'नखर पोर्टेल एक्सेस',
    secureLoginTitle: 'रैखाथि लगइन',
    enterYourPin: 'नोंथांनि PIN हो',
    pinAccessLine: 'एक्सेस खालामनो नोंथांनि 4 अंकनि PIN हो',
    verifyPin: 'PIN थारखि',
    wrongPin: 'गोरोन्थि PIN। फिन नाजा।',
  },

  // ── Khasi ───────────────────────────────────────────────────────────────────
  kha: {
    welcome: 'Khublei',
    heroTitle1: 'Ka jaka ba isynei',
    heroTitle2: 'ia ka jingmut jong phi',
    heroSubtitle: 'Ki kai jingkynmaw, ka jingiasnoh bad ka ïing ka sem, bad ka jingsumar da ka AI — baroh ha kawei ka app babha.',
    letsBegin: 'To Sdang',
    freeLine: 'Bym shong dor · Buh na ka bynta ka North East India · 9 ki Ktien',

    chooseLanguage: 'Jied ïa ka ktien jong phi',
    selectLanguage: 'Jied ïa kawei ka ktien ban iaid shaphrang.',
    back: 'Phai Noh',
    continue: 'Iaid Shaphrang',

    enterDetails: 'Buh ïa ki jingtip jong phi',
    personalize: 'Ngin pyndonkam ïa kane ban pynlong ba kyrpang ïa ka jingiohi jong phi.',
    fullName: 'Kyrteng Baroh',
    enterName: 'Buh ïa ka kyrteng jong phi',
    phoneNumber: 'Nombor Phone',
    enterPhone: 'Buh ïa ka nombor 10 tylli',
    invalidPhone: 'Buh ïa ka nombor phone 10 tylli ba lang.',

    setupPin: 'Buh ïa ka PIN jong phi',
    pinSubtitle: 'Thaw ïa ka PIN 4 tylli ban rung sha ka Family Portal hadien.',
    pinLabel: 'PIN 4 tylli',
    pinPlaceholder: 'Buh ïa ka PIN 4 tylli',
    invalidPin: 'Ka PIN ka dei ban long 4 tylli tang.',

    setupComplete: 'La dep ka jingbuh!',
    readyToUse: 'Phi la sngewbha ban pyndonkam ïa ka MemorySathi.',
    goToDashboard: 'Leit sha ka Dashboard',

    goodMorning: 'Khublei Sngi Step',
    goodAfternoon: 'Khublei Sngi',
    goodEvening: 'Khublei Miet',
    memoryTip: 'Jingpyntip Jingkynmaw jong ka Sngi',
    memoryTipText: 'Kynmaw ïa 3 tylli ki por bakmen na ka taiew ba la leit',
    yourPortals: 'Ki Portal jong phi',
    todaysProgress: 'Ka Jingmih Shaphrang mynta ka sngi',

    gamesPortal: 'Portal ki Kai',
    gamesSub: 'Ki jingleh jingkynmaw bad jingmut',
    playNow: '▶ Kai Mynta',

    familyPortal: 'Portal ka Ïing ka Sem',
    familySub: 'Dashboard bad data ki nongsumar',
    secureLogin: '🔒 Login Bakhuid',

    carePortal: 'Jingsumar Dementia',
    careSub: 'Nongiarap AI bad ki jingiakhun sumar',
    askAssistant: '🎙 Kylli ïa u Nongiarap',

    familyTreeBuilder: 'Nongthaw Dieng Ïing Sem',
    matchFaceName: 'Pynlang Khmat bad Kyrteng',
    familyCheckIn: 'Check-in ka Ïing ka Sem',
    placed: '4/5 la buh',
    correct: '3/4 kaba lang',
    messages: '2 ki jingphah',

    familyAccess: 'Jingrung sha ka Portal ka Ïing ka Sem',
    secureLoginTitle: 'Login Bakhuid',
    enterYourPin: 'Buh ïa ka PIN jong phi',
    pinAccessLine: 'Buh ïa ka PIN 4 tylli jong phi ban rung',
    verifyPin: 'Pynshisha ïa ka PIN',
    wrongPin: 'PIN bym dei. Ai sa yn pyrshang biang.',
  },

  // ── Garo (A·chik) ───────────────────────────────────────────────────────────
  grt: {
    welcome: 'Ku·rachakani',
    heroTitle1: 'Na·ni ka·sa ni gimin',
    heroTitle2: 'namgipa jaga sa',
    heroSubtitle: 'Ka·sa nangkuni kamrang, nokdangni sokbaani, aro AI-ni dakchakanichi salsa salsani rakkiani — pilakko sasan app-o.',
    letsBegin: 'Chapatna',
    freeLine: 'Damsa gnang ja · North East India ni gimin daka · Ku·bidik 9',

    chooseLanguage: 'Na·ni ku·bidikko sikna',
    selectLanguage: 'Skang chapna gita ku·bidik sako sikna.',
    back: 'Gisik',
    continue: 'Skang Chapa',

    enterDetails: 'Na·ni bidingko ron·na',
    personalize: 'Ia-ko na·ni nikanichi namgipa dakna an·ching jean·gen.',
    fullName: 'Pilak Bimung',
    enterName: 'Na·ni bimungko ron·na',
    phoneNumber: 'Phone Nambar',
    enterPhone: '10 anko nambarko ron·na',
    invalidPhone: 'Chongmotgipa 10 anko phone nambarko ron·na.',

    setupPin: 'Na·ni PIN-ko dakna',
    pinSubtitle: 'Ja·manoba Family Portal-o chapna gita 4 anko PIN sa dakna.',
    pinLabel: '4 anko PIN',
    pinPlaceholder: '4 anko PIN-ko ron·na',
    invalidPin: 'PIN 4 an-ko ong·na nanga.',

    setupComplete: 'Dakani chuenga!',
    readyToUse: 'Na·a MemorySathi-ko jean·na tarie ong·aha.',
    goToDashboard: 'Dashboard-o Re·anga',

    goodMorning: 'Namgipa Prinang',
    goodAfternoon: 'Namgipa Sal',
    goodEvening: 'Namgipa Attam',
    memoryTip: 'Salni Ka·sa Bidingo Ku·rachak',
    memoryTipText: 'Skang wa·alni 3 namgipa somaiko ka·sana',
    yourPortals: 'Na·ni Portal-rang',
    todaysProgress: 'Salni Skang Chapani',

    gamesPortal: 'Kamrang Portal',
    gamesSub: 'Ka·sa aro sikkeni kamrang',
    playNow: '▶ Da·o Kamna',

    familyPortal: 'Nokdang Portal',
    familySub: 'Rakkigipani dashboard aro data',
    secureLogin: '🔒 Rakkigipa Login',

    carePortal: 'Dementia Rakkiani',
    careSub: 'AI dakchakgipa aro rakkiani gaid',
    askAssistant: '🎙 Dakchakgipako Singna',

    familyTreeBuilder: 'Nokdang Bolgipok Dakgipa',
    matchFaceName: 'Mikkang aro Bimungko Rakna',
    familyCheckIn: 'Nokdang Check-in',
    placed: '4/5 donaha',
    correct: '3/4 chongmot',
    messages: '2 ku·rachak',

    familyAccess: 'Nokdang Portal Chapani',
    secureLoginTitle: 'Rakkigipa Login',
    enterYourPin: 'Na·ni PIN-ko ron·na',
    pinAccessLine: 'Chapna gita na·ni 4 anko PIN-ko ron·na',
    verifyPin: 'PIN-ko Nikna',
    wrongPin: 'PIN chongmot ong·ja. Wal·gipin sikna.',
  },

  // ── Mizo ────────────────────────────────────────────────────────────────────
  lus: {
    welcome: 'I lo kal a lawm e',
    heroTitle1: 'I rilru tân',
    heroTitle2: 'hmun ngaihsak tak',
    heroSubtitle: 'Hriatrengna infiamna, chhûngte nêna inzawmna, leh AI ṭanpuina nêna nî tin enkawlna — app mawi pakhatah a awm vek.',
    letsBegin: 'Ṭan Ila',
    freeLine: 'A thlâwn · North East India tân siam · Ṭawng 9',

    chooseLanguage: 'I ṭawng thlang rawh',
    selectLanguage: 'Kal zêl tûrin ṭawng pakhat thlang rawh.',
    back: 'Hnûngtir',
    continue: 'Kal Zêl',

    enterDetails: 'I chanchin ziak rawh',
    personalize: 'He mi hi i experience ṭha zâwk siam nân kan hmang ang.',
    fullName: 'Hming Kim',
    enterName: 'I hming ziak rawh',
    phoneNumber: 'Phone Number',
    enterPhone: 'Digit 10 number ziak rawh',
    invalidPhone: 'Digit 10 phone number dik ziak rawh.',

    setupPin: 'I PIN siam rawh',
    pinSubtitle: 'Family Portal luh nân digit 4 PIN siam rawh.',
    pinLabel: 'Digit 4 PIN',
    pinPlaceholder: 'Digit 4 PIN ziak rawh',
    invalidPin: 'PIN chu digit 4 vek a ni tûr a ni.',

    setupComplete: 'Siamna a zo ta!',
    readyToUse: 'MemorySathi hman tûrin i inpeih ta.',
    goToDashboard: 'Dashboard-ah Kal Rawh',

    goodMorning: 'Zîngkar Ṭha',
    goodAfternoon: 'Chawhnu Ṭha',
    goodEvening: 'Tlaizawn Ṭha',
    memoryTip: 'Vawiin Hriatrengna Remhriatna',
    memoryTipText: 'Kar kal hun hlimawm 3 hre chhuak rawh',
    yourPortals: 'I Portal-te',
    todaysProgress: 'Vawiin Hmasâwnna',

    gamesPortal: 'Infiamna Portal',
    gamesSub: 'Hriatrengna leh rilru zirtîrna',
    playNow: '▶ Tûnah Infiam Rawh',

    familyPortal: 'Chhûngkaw Portal',
    familySub: 'Enkawltu dashboard leh data',
    secureLogin: '🔒 Login Hîm',

    carePortal: 'Dementia Enkawlna',
    careSub: 'AI ṭanpuitu leh enkawlna kaihhruaina',
    askAssistant: '🎙 Ṭanpuitu Zâwt Rawh',

    familyTreeBuilder: 'Chhûngkaw Thlâi Siamtu',
    matchFaceName: 'Hmêl leh Hming Inrem Tîr',
    familyCheckIn: 'Chhûngkaw Check-in',
    placed: '4/5 dah a ni',
    correct: '3/4 a dik',
    messages: 'Thuchah 2',

    familyAccess: 'Chhûngkaw Portal Luhna',
    secureLoginTitle: 'Login Hîm',
    enterYourPin: 'I PIN ziak rawh',
    pinAccessLine: 'Luh tûrin i digit 4 PIN ziak rawh',
    verifyPin: 'PIN Enfiah Rawh',
    wrongPin: 'PIN a dik lo. Tin tum leh rawh.',
  },
} as const

// ─── Family Portal / Analytics / Manager strings ──────────────────────────────

const PORTAL_TRANSLATIONS = {
  en: {
    fpSubtitle: 'Caregiver Access',
    caregiverVerified: 'Caregiver verified',
    lastLogin: 'Last login',
    today: 'Today',
    manageMonitor: 'Manage & Monitor',
    cognitiveAnalytics: 'Cognitive Analytics',
    analyticsSub: 'Memory scores, attention, AI flags',
    gameManager: 'Custom Game Manager',
    gameManagerSub: 'Upload photos, record audio names',
    familyContacts: 'Family Contacts',

    thisWeek: 'This Week',
    memoryRecall: 'Memory Recall',
    attentionSpan: 'Attention Span',
    dailyPlayTime: 'Daily Play Time',
    aiFlagsLabel: 'AI Flags',
    minShort: 'min',
    mild: 'mild',
    reviewed: 'Reviewed',
    memoryRecallWeek: 'Memory Recall — This Week',
    aiCognitiveFlags: 'AI Cognitive Flags',
    flag1: 'Repeated incorrect answers in Name Match (Tuesday)',
    flag2: 'Shorter play session than usual (Wednesday)',
    sevMild: 'Mild',
    sevLow: 'Low',
    concern: 'concern',
    gamePerformance: 'Game Performance',
    weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

    photoUpload: 'Photo Upload',
    photosAudioNames: 'Family Photos & Audio Names',
    uploadPhoto: 'Upload Photo',
    recordingLabel: 'Recording…',
    recordedLabel: 'Recorded',
    recordName: 'Record Name',
    addFamilyMember: 'Add New Family Member',
    dailyGameReminder: 'Daily Game Reminder',
    saveReminder: 'Save Reminder',
    audioPromptLanguage: 'Audio Prompt Language',

    typeOrTap: 'Type your PIN or use the keypad below',
    clear: 'Clear',

    relSon: 'Son',
    relDaughter: 'Daughter',
    relGrandson: 'Grandson',
    relDaughterInLaw: 'Daughter-in-law',
    relHusband: 'Husband',
    relMother: 'Mother',
    relCareDoctor: 'Care Doctor',
  },

  hi: {
    fpSubtitle: 'केयरगिवर एक्सेस',
    caregiverVerified: 'केयरगिवर सत्यापित',
    lastLogin: 'पिछला लॉगिन',
    today: 'आज',
    manageMonitor: 'प्रबंधन और निगरानी',
    cognitiveAnalytics: 'संज्ञानात्मक विश्लेषण',
    analyticsSub: 'स्मृति स्कोर, ध्यान, AI संकेत',
    gameManager: 'कस्टम गेम मैनेजर',
    gameManagerSub: 'फ़ोटो अपलोड करें, नाम रिकॉर्ड करें',
    familyContacts: 'परिवार के संपर्क',

    thisWeek: 'इस सप्ताह',
    memoryRecall: 'स्मृति पुनःस्मरण',
    attentionSpan: 'ध्यान अवधि',
    dailyPlayTime: 'दैनिक खेल समय',
    aiFlagsLabel: 'AI संकेत',
    minShort: 'मिनट',
    mild: 'हल्के',
    reviewed: 'समीक्षित',
    memoryRecallWeek: 'स्मृति पुनःस्मरण — इस सप्ताह',
    aiCognitiveFlags: 'AI संज्ञानात्मक संकेत',
    flag1: 'नाम मिलान में बार-बार गलत उत्तर (मंगलवार)',
    flag2: 'सामान्य से छोटा खेल सत्र (बुधवार)',
    sevMild: 'हल्की',
    sevLow: 'कम',
    concern: 'चिंता',
    gamePerformance: 'खेल प्रदर्शन',
    weekDays: ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'],

    photoUpload: 'फ़ोटो अपलोड',
    photosAudioNames: 'परिवार की फ़ोटो और नाम की आवाज़',
    uploadPhoto: 'फ़ोटो अपलोड करें',
    recordingLabel: 'रिकॉर्ड हो रहा है…',
    recordedLabel: 'रिकॉर्ड हुआ',
    recordName: 'नाम रिकॉर्ड करें',
    addFamilyMember: 'नया सदस्य जोड़ें',
    dailyGameReminder: 'दैनिक खेल अनुस्मारक',
    saveReminder: 'अनुस्मारक सहेजें',
    audioPromptLanguage: 'ऑडियो प्रॉम्प्ट भाषा',

    typeOrTap: 'अपना PIN टाइप करें या नीचे कीपैड का उपयोग करें',
    clear: 'साफ़ करें',

    relSon: 'बेटा',
    relDaughter: 'बेटी',
    relGrandson: 'पोता',
    relDaughterInLaw: 'बहू',
    relHusband: 'पति',
    relMother: 'माँ',
    relCareDoctor: 'देखभाल डॉक्टर',
  },

  as: {
    fpSubtitle: 'যত্নকাৰীৰ এক্সেছ',
    caregiverVerified: 'যত্নকাৰী নিশ্চিত কৰা হৈছে',
    lastLogin: 'শেষ লগইন',
    today: 'আজি',
    manageMonitor: 'পৰিচালনা আৰু নিৰীক্ষণ',
    cognitiveAnalytics: 'জ্ঞানাত্মক বিশ্লেষণ',
    analyticsSub: 'স্মৃতিৰ নম্বৰ, মনোযোগ, AI সংকেত',
    gameManager: 'কাষ্টম গেম মেনেজাৰ',
    gameManagerSub: "ফটো আপল'ড কৰক, নাম ৰেকৰ্ড কৰক",
    familyContacts: 'পৰিয়ালৰ যোগাযোগ',

    thisWeek: 'এই সপ্তাহ',
    memoryRecall: 'স্মৃতি মনত পেলোৱা',
    attentionSpan: 'মনোযোগৰ সময়',
    dailyPlayTime: 'দৈনিক খেলাৰ সময়',
    aiFlagsLabel: 'AI সংকেত',
    minShort: 'মিনিট',
    mild: 'পাতল',
    reviewed: 'পৰ্যালোচিত',
    memoryRecallWeek: 'স্মৃতি মনত পেলোৱা — এই সপ্তাহ',
    aiCognitiveFlags: 'AI জ্ঞানাত্মক সংকেত',
    flag1: 'নাম মিলোৱাত বাৰে বাৰে ভুল উত্তৰ (মঙলবাৰ)',
    flag2: 'সাধাৰণতকৈ চুটি খেলাৰ সময় (বুধবাৰ)',
    sevMild: 'পাতল',
    sevLow: 'কম',
    concern: 'চিন্তা',
    gamePerformance: 'খেলৰ প্ৰদৰ্শন',
    weekDays: ['সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্ৰ', 'শনি', 'দেও'],

    photoUpload: "ফটো আপল'ড",
    photosAudioNames: 'পৰিয়ালৰ ফটো আৰু নামৰ মাত',
    uploadPhoto: "ফটো আপল'ড কৰক",
    recordingLabel: 'ৰেকৰ্ড হৈ আছে…',
    recordedLabel: "ৰেকৰ্ড হ'ল",
    recordName: 'নাম ৰেকৰ্ড কৰক',
    addFamilyMember: 'নতুন সদস্য যোগ কৰক',
    dailyGameReminder: 'দৈনিক খেলৰ মনত পেলোৱা',
    saveReminder: 'ছেভ কৰক',
    audioPromptLanguage: "অডিঅ' প্ৰম্পটৰ ভাষা",

    typeOrTap: 'আপোনাৰ PIN টাইপ কৰক বা তলৰ কীপেড ব্যৱহাৰ কৰক',
    clear: 'পৰিষ্কাৰ কৰক',

    relSon: 'পুত্ৰ',
    relDaughter: 'জীয়ৰী',
    relGrandson: 'নাতি',
    relDaughterInLaw: 'বোৱাৰী',
    relHusband: 'স্বামী',
    relMother: 'মা',
    relCareDoctor: 'যত্নৰ ডাক্তৰ',
  },

  bn: {
    fpSubtitle: 'কেয়ারগিভার অ্যাক্সেস',
    caregiverVerified: 'কেয়ারগিভার যাচাই করা হয়েছে',
    lastLogin: 'শেষ লগইন',
    today: 'আজ',
    manageMonitor: 'পরিচালনা ও পর্যবেক্ষণ',
    cognitiveAnalytics: 'জ্ঞানীয় বিশ্লেষণ',
    analyticsSub: 'স্মৃতির স্কোর, মনোযোগ, AI সংকেত',
    gameManager: 'কাস্টম গেম ম্যানেজার',
    gameManagerSub: 'ছবি আপলোড করুন, নাম রেকর্ড করুন',
    familyContacts: 'পরিবারের যোগাযোগ',

    thisWeek: 'এই সপ্তাহ',
    memoryRecall: 'স্মৃতি পুনরুদ্ধার',
    attentionSpan: 'মনোযোগের সময়',
    dailyPlayTime: 'দৈনিক খেলার সময়',
    aiFlagsLabel: 'AI সংকেত',
    minShort: 'মিনিট',
    mild: 'মৃদু',
    reviewed: 'পর্যালোচিত',
    memoryRecallWeek: 'স্মৃতি পুনরুদ্ধার — এই সপ্তাহ',
    aiCognitiveFlags: 'AI জ্ঞানীয় সংকেত',
    flag1: 'নাম মেলানোয় বারবার ভুল উত্তর (মঙ্গলবার)',
    flag2: 'স্বাভাবিকের চেয়ে ছোট খেলার সময় (বুধবার)',
    sevMild: 'মৃদু',
    sevLow: 'কম',
    concern: 'উদ্বেগ',
    gamePerformance: 'খেলার পারফরম্যান্স',
    weekDays: ['সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি', 'রবি'],

    photoUpload: 'ছবি আপলোড',
    photosAudioNames: 'পরিবারের ছবি ও নামের অডিও',
    uploadPhoto: 'ছবি আপলোড করুন',
    recordingLabel: 'রেকর্ড হচ্ছে…',
    recordedLabel: 'রেকর্ড হয়েছে',
    recordName: 'নাম রেকর্ড করুন',
    addFamilyMember: 'নতুন সদস্য যোগ করুন',
    dailyGameReminder: 'দৈনিক খেলার রিমাইন্ডার',
    saveReminder: 'রিমাইন্ডার সংরক্ষণ করুন',
    audioPromptLanguage: 'অডিও প্রম্পটের ভাষা',

    typeOrTap: 'আপনার PIN টাইপ করুন বা নিচের কীপ্যাড ব্যবহার করুন',
    clear: 'মুছুন',

    relSon: 'ছেলে',
    relDaughter: 'মেয়ে',
    relGrandson: 'নাতি',
    relDaughterInLaw: 'পুত্রবধূ',
    relHusband: 'স্বামী',
    relMother: 'মা',
    relCareDoctor: 'যত্ন চিকিৎসক',
  },

  mni: {
    fpSubtitle: 'কেয়ারগিভার এক্সেস',
    caregiverVerified: 'কেয়ারগিভার চাংয়েংলে',
    lastLogin: 'অকোনবা লগইন',
    today: 'ঙসি',
    manageMonitor: 'শাসিন-শোয়সিন অমসুং য়েংশিনবা',
    cognitiveAnalytics: 'খংবগী অনালাইসিস',
    analyticsSub: 'নিংশিংবগী মার্ক, পুক্নিং থমজিনবা, AI খুদম',
    gameManager: 'কষ্টম গেম মেনেজর',
    gameManagerSub: 'ফোটো থাদোক্লু, মিং রেকর্ড তৌরো',
    familyContacts: 'ইমুং মনুংগী কন্টেক্ট',

    thisWeek: 'চয়োল অসি',
    memoryRecall: 'নিংশিংবা',
    attentionSpan: 'পুক্নিং থমজিনবগী মতম',
    dailyPlayTime: 'নুমিৎ খুদিংগী শান্নবগী মতম',
    aiFlagsLabel: 'AI খুদম',
    minShort: 'মিনিট',
    mild: 'য়াম্না ওইদ্রবা',
    reviewed: 'য়েংখ্রে',
    memoryRecallWeek: 'নিংশিংবা — চয়োল অসি',
    aiCognitiveFlags: 'AI খংবগী খুদম',
    flag1: 'মিং চান্নহনবদা অরানবা পাউখুম হন্না হন্না (লৈবাকপোকপা)',
    flag2: 'মহৌশাদগী শান্নবগী মতম তংখ্রে (য়ুমশকৈশা)',
    sevMild: 'য়াম্না ওইদ্রবা',
    sevLow: 'মকম',
    concern: 'ৱাখল',
    gamePerformance: 'গেমগী মায় পাকপা',
    weekDays: ['নিংথৌকাপা', 'লৈবাকপোকপা', 'য়ুমশকৈশা', 'শগোলশেন', 'ইরাই', 'থাংজা', 'নোংমাইজিং'],

    photoUpload: 'ফোটো থাদোকপা',
    photosAudioNames: 'ইমুংগী ফোটো অমসুং মিংগী খোঞ্জেল',
    uploadPhoto: 'ফোটো থাদোক্লু',
    recordingLabel: 'রেকর্ড তৌরি…',
    recordedLabel: 'রেকর্ড তৌরে',
    recordName: 'মিং রেকর্ড তৌরো',
    addFamilyMember: 'অনৌবা মেম্বর হাপচিল্লু',
    dailyGameReminder: 'নুমিৎ খুদিংগী গেম নিংশিংহনবা',
    saveReminder: 'নিংশিংহনবা থম্মু',
    audioPromptLanguage: 'অডিও প্রম্পটকী লোল',

    typeOrTap: 'নহাক্কী PIN টাইপ তৌরো নত্ত্রগা মখাগী কীপেড শীজিন্নৌ',
    clear: 'লৌথোক্কু',

    relSon: 'মচানুপা',
    relDaughter: 'মচানুপী',
    relGrandson: 'মচানুপাগী মচানুপা',
    relDaughterInLaw: 'মৌ',
    relHusband: 'মপুরোইবা',
    relMother: 'ইমা',
    relCareDoctor: 'য়েংশিনবগী দক্তর',
  },

  brx: {
    fpSubtitle: 'केयारगिभार एक्सेस',
    caregiverVerified: 'केयारगिभारखौ थारखिबाय',
    lastLogin: 'जोबथा लगइन',
    today: 'दिनै',
    manageMonitor: 'सामलायनाय आरो नायनाय',
    cognitiveAnalytics: 'गोसो सानथावनि बिजिरनाय',
    analyticsSub: 'गोसोनि नामबार, गोसो होनाय, AI सिन',
    gameManager: 'कास्टम गेम मेनेजार',
    gameManagerSub: 'फोटो आपलड खालाम, मुं रेकर्ड खालाम',
    familyContacts: 'नखरनि सोमोन्दो',

    thisWeek: 'बे सप्ताह',
    memoryRecall: 'गोसो खांनाय',
    attentionSpan: 'गोसो होनाय सम',
    dailyPlayTime: 'सानफ्रोमबो खेलानाय सम',
    aiFlagsLabel: 'AI सिन',
    minShort: 'मिनिट',
    mild: 'गोब्राब',
    reviewed: 'नायबाय',
    memoryRecallWeek: 'गोसो खांनाय — बे सप्ताह',
    aiCognitiveFlags: 'AI गोसो सानथाव सिन',
    flag1: 'मुं फोरमायनायाव बारबार गोरोन्थि फिन (मंगलबार)',
    flag2: 'सोलोंथाइनि बादि गोदान खेलानाय सम (बुधबार)',
    sevMild: 'गोब्राब',
    sevLow: 'खमै',
    concern: 'सानग्रा',
    gamePerformance: 'खेलानाय दिन्थिफुंनाय',
    weekDays: ['सोम', 'मंगल', 'बुध', 'बिस्थि', 'सुक्र', 'सनि', 'रबि'],

    photoUpload: 'फोटो आपलड',
    photosAudioNames: 'नखरनि फोटो आरो मुंनि गोदै',
    uploadPhoto: 'फोटो आपलड खालाम',
    recordingLabel: 'रेकर्ड जायो दं…',
    recordedLabel: 'रेकर्ड जाबाय',
    recordName: 'मुं रेकर्ड खालाम',
    addFamilyMember: 'गोदान सोद्रोमा दाजाब हो',
    dailyGameReminder: 'सानफ्रोमबो खेलानाय गोसो खांहोग्रा',
    saveReminder: 'गोसो खांहोग्राखौ दोन',
    audioPromptLanguage: 'अडिअ प्रम्पटनि राव',

    typeOrTap: 'नोंथांनि PIN टाइप खालाम एबा गाहायनि कीपेड बाहाय',
    clear: 'सोलाय',

    relSon: 'फिसाजौ',
    relDaughter: 'फिसाजो',
    relGrandson: 'सुनु',
    relDaughterInLaw: 'नोजों',
    relHusband: 'बिखौरै',
    relMother: 'बिमा',
    relCareDoctor: 'नाजाबग्रा डाक्टर',
  },

  kha: {
    fpSubtitle: 'Jingrung Nongsumar',
    caregiverVerified: 'La pynshisha ïa u nongsumar',
    lastLogin: 'Login banaduh',
    today: 'Mynta ka sngi',
    manageMonitor: 'Synshar bad Peit',
    cognitiveAnalytics: 'Jingsawa Jingmut',
    analyticsSub: 'Ki mark jingkynmaw, jingpeit, ki jingpyntip AI',
    gameManager: 'Nongsynshar Kai',
    gameManagerSub: 'Buh ki dur, thaw ki kyrteng sur',
    familyContacts: 'Ki Jingiasnoh Ïing Sem',

    thisWeek: 'Ka Taiew Kane',
    memoryRecall: 'Jingkynmaw',
    attentionSpan: 'Jingpeit Jingmut',
    dailyPlayTime: 'Por Kai man ka sngi',
    aiFlagsLabel: 'Ki Jingpyntip AI',
    minShort: 'min',
    mild: 'khyndiat',
    reviewed: 'La peit',
    memoryRecallWeek: 'Jingkynmaw — Ka Taiew Kane',
    aiCognitiveFlags: 'Ki Jingpyntip Jingmut AI',
    flag1: 'Ki jingjubab bym dei ba pyrshah ha ka Match Kyrteng (Tuesday)',
    flag2: 'Ka por kai ba khlem bteng khamtam (Wednesday)',
    sevMild: 'Khyndiat',
    sevLow: 'Bym khraw',
    concern: 'jingtrei',
    gamePerformance: 'Ka Jingleh Kai',
    weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

    photoUpload: 'Jingbuh Dur',
    photosAudioNames: 'Ki Dur Ïing Sem bad Ki Kyrteng Sur',
    uploadPhoto: 'Buh Dur',
    recordingLabel: 'Dang thaw…',
    recordedLabel: 'La thaw',
    recordName: 'Thaw Kyrteng',
    addFamilyMember: 'Buh Nong Ïing Sem Bathymmai',
    dailyGameReminder: 'Jingpynkynmaw Kai man ka sngi',
    saveReminder: 'Buh ïa ka Jingpynkynmaw',
    audioPromptLanguage: 'Ka Ktien Sur',

    typeOrTap: 'Thoh ïa ka PIN jong phi lane pyndonkam ïa ka keypad harum',
    clear: 'Sait Noh',

    relSon: 'Khun Shynrang',
    relDaughter: 'Khun Kynthei',
    relGrandson: 'Ksiew Shynrang',
    relDaughterInLaw: 'Kynthei Ksiew',
    relHusband: 'U Tnga',
    relMother: 'Ka Kmie',
    relCareDoctor: 'Doktor Nongsumar',
  },

  grt: {
    fpSubtitle: 'Rakkigipani Chapani',
    caregiverVerified: 'Rakkigipako nikaha',
    lastLogin: 'Ja·mano login',
    today: 'Salo',
    manageMonitor: 'Rakna aro Nikna',
    cognitiveAnalytics: 'Sikkeni Bidingo Bisen',
    analyticsSub: 'Ka·sani mark, gisik ronani, AI-ni sin',
    gameManager: 'Kastam Kamrang Rakgipa',
    gameManagerSub: 'Chitrako donna, bimungko rekord dakna',
    familyContacts: 'Nokdangni Sokbaani',

    thisWeek: 'Ia Wa·alo',
    memoryRecall: 'Ka·sa Nangkuni',
    attentionSpan: 'Gisik Ronani Somai',
    dailyPlayTime: 'Salsa Kamani Somai',
    aiFlagsLabel: 'AI-ni Sin',
    minShort: 'min',
    mild: 'gitchamgipa',
    reviewed: 'Nikaha',
    memoryRecallWeek: 'Ka·sa Nangkuni — Ia Wa·alo',
    aiCognitiveFlags: 'AI Sikkeni Sinrang',
    flag1: 'Bimung Rakanio chongmot ong·gipa jubab dingtangbate (Tuesday)',
    flag2: 'Sengganirikon kamani somai gitcham (Wednesday)',
    sevMild: 'Gitchamgipa',
    sevLow: 'Dalgipa ong·ja',
    concern: 'sanani',
    gamePerformance: 'Kamrangni Dakani',
    weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

    photoUpload: 'Chitra Donani',
    photosAudioNames: 'Nokdangni Chitrarang aro Bimungni Ku·rang',
    uploadPhoto: 'Chitrako Donna',
    recordingLabel: 'Rekord daka…',
    recordedLabel: 'Rekord dakaha',
    recordName: 'Bimungko Rekord Dakna',
    addFamilyMember: 'Gital Nokdang Sa-ko Dakchakna',
    dailyGameReminder: 'Salsa Kamani Ka·sarik',
    saveReminder: 'Ka·sarikko Donna',
    audioPromptLanguage: 'Ku·ni Ku·bidik',

    typeOrTap: 'Na·ni PIN-ko taip dakna ba dingtango keypad-ko jean·na',
    clear: 'Rakbeana',

    relSon: 'De·pante',
    relDaughter: 'De·mechik',
    relGrandson: 'Su·pante',
    relDaughterInLaw: 'Nokdang Mechik',
    relHusband: 'Se·gipa',
    relMother: 'Ama',
    relCareDoctor: 'Rakkiani Daktar',
  },

  lus: {
    fpSubtitle: 'Enkawltu Luhna',
    caregiverVerified: 'Enkawltu enfiah a ni',
    lastLogin: 'Login hnuhnung',
    today: 'Vawiin',
    manageMonitor: 'Enkawl leh Enfiah',
    cognitiveAnalytics: 'Rilru Hriatthiamna Enfiahna',
    analyticsSub: 'Hriatrengna mark, ngaihvenna, AI kawhhmuhna',
    gameManager: 'Infiamna Enkawltu',
    gameManagerSub: 'Milem dah, hming aw record',
    familyContacts: 'Chhûngkaw Inbiakpawhna',

    thisWeek: 'He Kar Hi',
    memoryRecall: 'Hriatrengna',
    attentionSpan: 'Ngaihvenna Hun',
    dailyPlayTime: 'Nî Tin Infiamna Hun',
    aiFlagsLabel: 'AI Kawhhmuhna',
    minShort: 'min',
    mild: 'a tlêm',
    reviewed: 'Enfiah a ni',
    memoryRecallWeek: 'Hriatrengna — He Kar Hi',
    aiCognitiveFlags: 'AI Rilru Kawhhmuhna',
    flag1: 'Hming Inrem Tîrnaah chhânna dik lo a lo let leh (Tuesday)',
    flag2: 'Infiamna hun a tawi zâwk (Wednesday)',
    sevMild: 'A tlêm',
    sevLow: 'Hniam',
    concern: 'ngaihtuahna',
    gamePerformance: 'Infiamna Hlawhtlinna',
    weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

    photoUpload: 'Milem Dahluhna',
    photosAudioNames: 'Chhûngkaw Milem leh Hming Aw',
    uploadPhoto: 'Milem Dah Luh',
    recordingLabel: 'Record mêk…',
    recordedLabel: 'Record tawh',
    recordName: 'Hming Record Rawh',
    addFamilyMember: 'Chhûngte Thar Belh Rawh',
    dailyGameReminder: 'Nî Tin Infiamna Hriattîrna',
    saveReminder: 'Hriattîrna Dah Rawh',
    audioPromptLanguage: 'Aw Ṭawng',

    typeOrTap: 'I PIN ziak rawh emaw a hnuaia keypad hmang rawh',
    clear: 'Paih Rawh',

    relSon: 'Fapa',
    relDaughter: 'Fanu',
    relGrandson: 'Tupa',
    relDaughterInLaw: 'Mo',
    relHusband: 'Pasal',
    relMother: 'Nu',
    relCareDoctor: 'Enkawltu Doctor',
  },
} as const

function portalT(language: LangCode) {
  return PORTAL_TRANSLATIONS[language] ?? PORTAL_TRANSLATIONS.en
}

const FAMILY_MEMBERS = [
  { id: 1, name: 'Rohan', relation: 'Son', relKey: 'relSon', emoji: '👨', color: '#355FC7' },
  { id: 2, name: 'Priya', relation: 'Daughter', relKey: 'relDaughter', emoji: '👩', color: '#4A7C59' },
  { id: 3, name: 'Aman', relation: 'Grandson', relKey: 'relGrandson', emoji: '👦', color: '#C4622D' },
  { id: 4, name: 'Meena', relation: 'Daughter-in-law', relKey: 'relDaughterInLaw', emoji: '👩‍🦱', color: '#7B5EA7' },
  { id: 5, name: 'Baba', relation: 'Husband', relKey: 'relHusband', emoji: '👴', color: '#1D2B49' },
  { id: 6, name: 'Nani', relation: 'Mother', relKey: 'relMother', emoji: '👵', color: '#C4622D' },
] as const

const TREE_SLOTS = [
  { id: 1, label: 'Husband', branch: 'spouse', x: 50, y: 28 },
  { id: 2, label: 'Son', branch: 'children', x: 22, y: 58 },
  { id: 3, label: 'Daughter', branch: 'children', x: 78, y: 58 },
  { id: 4, label: 'Grandson', branch: 'grandchildren', x: 12, y: 82 },
  { id: 5, label: 'Daughter-in-law', branch: 'grandchildren', x: 38, y: 82 },
]

const MATCH_CARDS = [
  { id: 1, name: 'Rohan', emoji: '👨', options: ['Rohan', 'Aman', 'Baba'] },
  { id: 2, name: 'Priya', emoji: '👩', options: ['Meena', 'Priya', 'Nani'] },
  { id: 3, name: 'Aman', emoji: '👦', options: ['Aman', 'Rohan', 'Baba'] },
  { id: 4, name: 'Meena', emoji: '👩‍🦱', options: ['Priya', 'Nani', 'Meena'] },
]

const WEEKLY_SCORES = [62, 70, 58, 80, 75, 88, 91]
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const FAQ_TILES = [
  { q: "What is dementia?", icon: '🧠', color: '#355FC7', bg: '#EEF2FF' },
  { q: "How to manage memory loss?", icon: '💡', color: '#4A7C59', bg: '#EBF5EE' },
  { q: "Local care contacts", icon: '📞', color: '#C4622D', bg: '#FEF3ED' },
  { q: "Daily routine tips", icon: '📋', color: '#7B5EA7', bg: '#F3EEF9' },
  { q: "Medicine side effects", icon: '💊', color: '#1D2B49', bg: '#EFF2F8' },
  { q: "Caregiver support groups", icon: '🤝', color: '#4A7C59', bg: '#EBF5EE' },
]

const REMINDERS = [
  { time: '7:00 AM', label: 'Donepezil tablet', icon: '💊', done: true, color: '#4A7C59' },
  { time: '8:00 AM', label: 'Breakfast + Vitamin B12', icon: '🍽️', done: true, color: '#4A7C59' },
  { time: '10:00 AM', label: 'Brain game session', icon: '🧩', done: false, color: '#355FC7' },
  { time: '12:00 PM', label: 'Drink water (2 glasses)', icon: '💧', done: false, color: '#355FC7' },
  { time: '2:00 PM', label: 'Rest & breathing exercise', icon: '🌿', done: false, color: '#4A7C59' },
  { time: '6:00 PM', label: 'Evening medicine', icon: '💊', done: false, color: '#C4622D' },
  { time: '8:30 PM', label: 'Family video call', icon: '📞', done: false, color: '#7B5EA7' },
]

// ─── Icons ────────────────────────────────────────────────────────────────────

function MicIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
      <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

// ─── Voice Button ─────────────────────────────────────────────────────────────

function VoiceButton({ active, onToggle, size = 64 }: { active: boolean; onToggle: () => void; size?: number }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex shrink-0 items-center justify-center rounded-full shadow-lg transition-all duration-300"
      style={{
        width: size, height: size,
        background: active ? '#355FC7' : '#1D2B49',
        transform: active ? 'scale(1.08)' : 'scale(1)',
      }}
      aria-label="Voice Assistant"
    >
      {active && <span className="mic-pulse" />}
      <span className="text-white"><MicIcon size={size * 0.38} /></span>
    </button>
  )
}

// ─── Screen Header ────────────────────────────────────────────────────────────

function ScreenHeader({
  title, subtitle, bg, onBack, micActive, onMicToggle, showMic = true,
}: {
  title: string; subtitle?: string; bg: string;
  onBack?: () => void; micActive: boolean; onMicToggle: () => void; showMic?: boolean;
}) {
  return (
    <div className="shrink-0 px-5 pb-5 pt-10" style={{ background: bg }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              <BackIcon />
            </button>
          )}
          <div>
            {subtitle && <p className="mb-0.5 text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(241,227,164,0.8)', fontFamily: 'DM Sans, sans-serif' }}>{subtitle}</p>}
            <h1 className="text-2xl font-extrabold leading-tight" style={{ color: '#FBF8F0' }}>{title}</h1>
          </div>
        </div>
        {showMic && <VoiceButton active={micActive} onToggle={onMicToggle} />}
      </div>
    </div>
  )
}

// ─── PIN Verification Screen ───────────────────────────────────────────────────

function PinVerificationScreen({
  onSuccess,
  onBack,
  patientName,
  correctPin,
  language,
}: {
  onSuccess: () => void;
  onBack: () => void;
  patientName: string;
  correctPin: string;
  language: LangCode;
}) {
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;
  const p = portalT(language);

  const setPin = (value: string) => {
    setEnteredPin(value.replace(/\D/g, '').slice(0, 4));
    setError('');
  };

  const handlePinSubmit = () => {
    if (enteredPin === correctPin) {
      setError('');
      onSuccess();
    } else {
      setError(t.wrongPin);
      setEnteredPin('');
      setShake(true);
      setTimeout(() => setShake(false), 420);
    }
  };

  // Focus the hidden field so the mobile numeric keypad opens on arrival.
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Physical keyboard: listen on the document so typing works even when the
  // hidden input has lost focus (clicking elsewhere, preview iframes, etc).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        setEnteredPin(prev => (prev.length >= 4 ? prev : prev + e.key));
        setError('');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setEnteredPin(prev => prev.slice(0, -1));
        setError('');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (enteredPin.length === 4) handlePinSubmit();
      } else if (e.key === 'Escape') {
        setEnteredPin('');
        setError('');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [enteredPin, correctPin]);

  const ready = enteredPin.length === 4;

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: 'linear-gradient(168deg, #4A7C59 0%, #2C4A54 48%, #1D2B49 100%)' }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Hidden field drives the on-screen keyboard on touch devices */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={4}
        value={enteredPin}
        onChange={(e) => setPin(e.target.value)}
        aria-label={t.enterYourPin}
        className="absolute h-px w-px opacity-0"
        style={{ top: '40%', left: '50%' }}
      />

      {/* Back */}
      <div className="shrink-0 px-5 pt-10">
        <button
          onClick={onBack}
          aria-label={t.back}
          className="flex h-10 w-10 items-center justify-center rounded-full transition active:scale-90"
          style={{ background: 'rgba(251,248,240,0.10)', color: '#FBF8F0' }}
        >
          <BackIcon />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-7 pb-8">
        {/* Lock emblem */}
        <div
          className="lock-halo relative mb-7 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: 'rgba(241,227,164,0.12)', border: '1px solid rgba(241,227,164,0.3)' }}
        >
          <span className="text-2xl">🔒</span>
        </div>

        {/* Who this portal belongs to */}
        <p className="text-sm font-semibold" style={{ color: 'rgba(241,227,164,0.7)', fontFamily: 'DM Sans, sans-serif' }}>
          {t.familyPortal}
        </p>
        <h1 className="mt-1 text-center text-3xl font-extrabold leading-tight" style={{ color: '#FBF8F0' }}>
          {patientName}
        </h1>
        <p className="mt-2.5 max-w-[17rem] text-center text-sm leading-relaxed" style={{ color: 'rgba(251,248,240,0.6)' }}>
          {t.pinAccessLine}
        </p>

        {/* PIN dots */}
        <div className={`mb-2 mt-9 flex gap-4 ${shake ? 'pin-shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => {
            const filled = enteredPin.length > i;
            const isNext = enteredPin.length === i && !error;
            return (
              <div
                key={i}
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full transition-all duration-200"
                style={{
                  background: filled ? (error ? '#E0A08A' : '#F1E3A4') : 'transparent',
                  border: `1.5px solid ${
                    error ? 'rgba(224,160,138,0.75)'
                    : filled ? '#F1E3A4'
                    : isNext ? 'rgba(241,227,164,0.75)'
                    : 'rgba(251,248,240,0.28)'
                  }`,
                  transform: isNext ? 'scale(1.25)' : 'scale(1)',
                }}
              >
                {filled && <span key={enteredPin.length} className="pin-fill block h-full w-full rounded-full" style={{ background: error ? '#E0A08A' : '#F1E3A4' }} />}
              </div>
            );
          })}
        </div>

        {/* Error / hint — same slot, so nothing jumps */}
        <p
          className="mt-3 h-5 text-center text-xs font-semibold"
          style={{ color: error ? '#F0BCA8' : 'rgba(251,248,240,0.42)', fontFamily: 'DM Sans, sans-serif' }}
        >
          {error || `⌨ ${p.typeOrTap}`}
        </p>

        {/* Keypad */}
        <div className="mt-7 grid grid-cols-3 gap-x-7 gap-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => { setPin(enteredPin + num); inputRef.current?.focus(); }}
              className="flex h-14 w-14 items-center justify-center rounded-full text-2xl font-semibold transition active:scale-90"
              style={{
                background: 'rgba(251,248,240,0.07)',
                border: '1px solid rgba(251,248,240,0.14)',
                color: '#FBF8F0',
              }}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => { setPin(''); inputRef.current?.focus(); }}
            className="flex h-14 w-14 items-center justify-center rounded-full text-xs font-bold transition active:scale-90"
            style={{ color: 'rgba(251,248,240,0.45)', fontFamily: 'DM Sans, sans-serif' }}
          >
            {p.clear}
          </button>

          <button
            onClick={() => { setPin(enteredPin + '0'); inputRef.current?.focus(); }}
            className="flex h-14 w-14 items-center justify-center rounded-full text-2xl font-semibold transition active:scale-90"
            style={{
              background: 'rgba(251,248,240,0.07)',
              border: '1px solid rgba(251,248,240,0.14)',
              color: '#FBF8F0',
            }}
          >
            0
          </button>

          <button
            onClick={() => { setPin(enteredPin.slice(0, -1)); inputRef.current?.focus(); }}
            aria-label="Backspace"
            className="flex h-14 w-14 items-center justify-center rounded-full text-xl transition active:scale-90"
            style={{ color: 'rgba(251,248,240,0.45)' }}
          >
            ⌫
          </button>
        </div>

        {/* Unlock */}
        <button
          onClick={handlePinSubmit}
          disabled={!ready}
          className="mt-9 w-full max-w-xs rounded-full py-4 text-base font-extrabold transition active:scale-95"
          style={{
            background: ready ? '#F1E3A4' : 'rgba(251,248,240,0.08)',
            color: ready ? '#1D2B49' : 'rgba(251,248,240,0.35)',
            border: ready ? 'none' : '1px solid rgba(251,248,240,0.12)',
            cursor: ready ? 'pointer' : 'default',
          }}
        >
          {t.verifyPin}
        </button>
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────

function HomeScreen({ onNavigate, patientName, language }: {
  onNavigate: (s: Screen) => void; patientName: string; language: LangCode;
}) {
  const hour = new Date().getHours()
  
  const t =
    TRANSLATIONS[language as keyof typeof TRANSLATIONS] ??
    TRANSLATIONS.en;

  const greeting = hour < 12 ? t.goodMorning : hour < 17 ? t.goodAfternoon : t.goodEvening

  return (
    <div className="scrollbar-hide flex h-full flex-col overflow-y-auto" style={{ background: '#FBF8F0' }}>
      <div className="shrink-0 px-5 pb-4 pt-10" style={{ background: '#1D2B49' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: '#F1E3A4', fontFamily: 'DM Sans, sans-serif' }}>{greeting}</p>
            <h1 className="text-3xl font-extrabold leading-tight" style={{ color: '#FBF8F0' }}>{patientName}</h1>
          </div>
        </div>
        <div className="bamboo-texture mt-4 flex items-center justify-between rounded-xl px-4 py-2.5" style={{ background: 'rgba(241,227,164,0.1)', border: '1px solid rgba(241,227,164,0.18)' }}>
          <span className="text-sm font-bold" style={{ color: '#F1E3A4' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <span className="text-sm font-semibold" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>9:41 AM</span>
        </div>
      </div>

      <div className="mx-5 mt-4 flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: '#F1E3A4', border: '1.5px solid #D4C47A' }}>
        <span className="text-2xl">🧠</span>
        <div>
          <p className="text-xs font-bold" style={{ color: '#1D2B49', fontFamily: 'DM Sans, sans-serif' }}>{t.memoryTip}</p>
          <p className="text-sm font-bold leading-snug" style={{ color: '#3D4F2E' }}>{t.memoryTipText}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5 pb-6 pt-5">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>{t.yourPortals}</p>

        {[
          { screen: 'games' as Screen, bg: '#355FC7', emoji: '🧩', title: t.gamesPortal, sub: t.gamesSub, tag: t.playNow, tagBg: 'rgba(241,227,164,0.25)', tagColor: '#F1E3A4' },
          { screen: 'family' as Screen, bg: '#EFE0C8', emoji: '👨‍👩‍👧', title: t.familyPortal, sub: t.familySub, tag: t.secureLogin, tagBg: 'rgba(74,124,89,0.15)', tagColor: '#4A7C59', dark: true },
          { screen: 'care' as Screen, bg: '#FBF8F0', emoji: '🤖', title: t.carePortal, sub: t.careSub, tag: t.askAssistant, tagBg: 'rgba(196,98,45,0.12)', tagColor: '#C4622D', dark: true, border: '#E8D5B8' },
        ].map((item) => (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className="flex w-full items-center gap-4 rounded-2xl p-4 text-left shadow-sm transition-all duration-150 active:scale-95"
            style={{ background: item.bg, minHeight: 80, border: item.border ? `1.5px solid ${item.border}` : undefined }}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl" style={{ background: item.dark ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.15)' }}>
              {item.emoji}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-extrabold leading-tight" style={{ color: item.dark ? '#1D2B49' : '#FBF8F0' }}>{item.title}</h2>
              <p className="mt-0.5 text-sm font-medium" style={{ color: item.dark ? '#7A6A5A' : 'rgba(241,227,164,0.9)' }}>{item.sub}</p>
              <span className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: item.tagBg, color: item.tagColor, fontFamily: 'DM Sans, sans-serif' }}>{item.tag}</span>
            </div>
            <span style={{ color: item.dark ? '#1D2B4955' : 'rgba(255,255,255,0.5)' }}><ChevronRight /></span>
          </button>
        ))}
      </div>

      <div className="px-5 pb-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>{t.todaysProgress}</p>
        <div className="rounded-2xl p-4" style={{ background: '#FFF', border: '1.5px solid #E8D5B8' }}>
          {[
            { label: t.familyTreeBuilder, value: t.placed, icon: '🌳', color: '#355FC7' },
            { label: t.matchFaceName, value: t.correct, icon: '🃏', color: '#4A7C59' },
            { label: t.familyCheckIn, value: t.messages, icon: '👨‍👩‍👧', color: '#C4622D' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 border-b py-2.5 last:border-0" style={{ borderColor: '#F0E8D8' }}>
              <span className="w-8 text-center text-xl">{item.icon}</span>
              <span className="flex-1 text-sm font-semibold" style={{ color: '#1D2B49' }}>{item.label}</span>
              <span className="text-xs font-bold" style={{ color: item.color, fontFamily: 'DM Sans, sans-serif' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── GAMES SELECTION ──────────────────────────────────────────────────────────

function GamesScreen({ onNavigate, onBack, micActive, onMicToggle }: {
  onNavigate: (s: Screen) => void; onBack: () => void; micActive: boolean; onMicToggle: () => void;
}) {
  return (
    <div className="flex h-full flex-col" style={{ background: '#FBF8F0' }}>
      <ScreenHeader title="Games Portal" subtitle="Let's Play" bg="#355FC7" onBack={onBack} micActive={micActive} onMicToggle={onMicToggle} />

      <div className="mx-5 mt-4 flex items-center gap-3 rounded-xl p-3" style={{ background: '#1D2B49' }}>
        <span className="text-xl">⭐</span>
        <div>
          <p className="text-sm font-bold" style={{ color: '#F1E3A4' }}>Daily Streak: 7 Days</p>
          <p className="text-xs font-medium" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>Keep going, Asha Devi! Great work.</p>
        </div>
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto px-5 pb-6 pt-5">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>Choose a Game</p>

        {/* Featured games */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onNavigate('game-folk-music')}
            className="w-full overflow-hidden rounded-3xl text-left shadow-sm transition-all duration-150 active:scale-95"
            style={{ background: '#355FC7' }}
          >
            <div className="p-5">
              <div className="mb-3 text-4xl">🎵</div>

              <h2 className="text-xl font-extrabold text-white">
                North-East Folk Music
              </h2>

              <p
                className="mt-1 text-sm font-medium"
                style={{
                  color: '#DCE6FF',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Listen to traditional music and match it with its story.
              </p>

              <div className="mt-4 inline-flex rounded-xl bg-white/15 px-4 py-2 text-sm font-bold text-white">
                ▶ Start Game
              </div>
            </div>
          </button>          
          {/* Family Tree */}
          <button
            onClick={() => onNavigate('game-tree')}
            className="w-full overflow-hidden rounded-3xl text-left shadow-sm transition-all duration-150 active:scale-95"
            style={{ background: '#4A7C59' }}
          >
            <div className="p-5">
              <div className="mb-3 text-4xl">🌳</div>

              <h2 className="text-xl font-extrabold text-white">
                Family Tree Builder
              </h2>

              <p
                className="mt-1 text-sm font-medium"
                style={{
                  color: '#E1F0E4',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Build and explore your family tree.
              </p>

              <div className="mt-4 inline-flex rounded-xl bg-white/15 px-4 py-2 text-sm font-bold text-white">
                ▶ Start Game
              </div>
            </div>
          </button>
          {/* Coconut Mallet */}
          <button
            onClick={() => onNavigate('game-coconut-mallet')}
            className="w-full overflow-hidden rounded-3xl text-left shadow-sm transition-all duration-150 active:scale-95"
            style={{ background: '#355FC7' }}
          >
            <div className="p-5">
              <div className="mb-3 text-4xl">🥥</div>

              <h2 className="text-xl font-extrabold text-white">
                Coconut Mallet
              </h2>

              <p
                className="mt-1 text-sm font-medium"
                style={{
                  color: '#D8E3FF',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Tap and drag to play this fun coordination game.
              </p>

              <div className="mt-4 inline-flex rounded-xl bg-white/15 px-4 py-2 text-sm font-bold text-white">
                ▶ Start Game
              </div>
            </div>
</button>

          {/* Match Face */}
          <button
            onClick={() => onNavigate('game-match')}
            className="w-full overflow-hidden rounded-3xl text-left shadow-sm transition-all duration-150 active:scale-95"
            style={{ background: '#EFE0C8', border: '1.5px solid #D4C47A' }}
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="mb-2 block text-4xl">🃏</span>
                  <h2 className="text-xl font-extrabold" style={{ color: '#1D2B49' }}>Match Face to Name</h2>
                  <p className="mt-1 text-sm font-semibold leading-snug" style={{ color: '#5A6F5A' }}>
                    See a family photo and tap the correct name from 3 large buttons
                  </p>
                </div>
                <span className="ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(74,124,89,0.18)', color: '#4A7C59', fontFamily: 'DM Sans, sans-serif' }}>Medium</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['👂 Voice hints', '💬 Encouragement', '🔄 Adaptive'].map(f => (
                  <span key={f} className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: 'rgba(53,95,199,0.1)', color: '#355FC7', fontFamily: 'DM Sans, sans-serif' }}>{f}</span>
                ))}
              </div>
              <div className="mt-4 rounded-xl py-3 text-center text-base font-extrabold" style={{ background: '#1D2B49', color: '#F1E3A4' }}>▶  Start Game</div>
            </div>
          </button>

          {/* More games coming */}
          <div className="rounded-2xl p-4" style={{ background: '#FFF', border: '1.5px solid #E8D5B8' }}>
            <p className="text-center text-sm font-bold" style={{ color: '#8499BC' }}>🎵 NE Music Quiz &nbsp;·&nbsp; 🔤 Assamese Words</p>
            <p className="mt-1 text-center text-xs font-semibold" style={{ color: '#C4622D', fontFamily: 'DM Sans, sans-serif' }}>Coming soon · Upload photos to unlock</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── GAME 1: FAMILY TREE BUILDER ─────────────────────────────────────────────

function FamilyTreeGame({ onBack, micActive, onMicToggle }: {
  onBack: () => void; micActive: boolean; onMicToggle: () => void;
}) {
  const [placed, setPlaced] = useState<Record<number, number>>({}) // slotId → memberId
  const [selected, setSelected] = useState<number | null>(null)
  const [celebrate, setCelebrate] = useState(false)

  const placedMemberIds = Object.values(placed)
  const available = FAMILY_MEMBERS.filter(m => !placedMemberIds.includes(m.id))
  const complete = Object.keys(placed).length >= TREE_SLOTS.length

  useEffect(() => {
    if (complete) { setCelebrate(true); setTimeout(() => setCelebrate(false), 3000) }
  }, [complete])

  function handleSlotTap(slotId: number) {
    if (selected === null) return
    setPlaced(prev => ({ ...prev, [slotId]: selected }))
    setSelected(null)
  }

  function handleRemove(slotId: number) {
    setPlaced(prev => { const n = { ...prev }; delete n[slotId]; return n })
  }

  function getSlotMember(slotId: number) {
    const mid = placed[slotId]
    return mid ? FAMILY_MEMBERS.find(m => m.id === mid) : null
  }

  return (
    <div className="flex h-full flex-col" style={{ background: '#FBF8F0' }}>
      <ScreenHeader title="Family Tree Builder" subtitle="Game 1" bg="#355FC7" onBack={onBack} micActive={micActive} onMicToggle={onMicToggle} />

      {/* Instruction */}
      <div className="mx-5 mt-3 flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: '#F1E3A4', border: '1.5px solid #D4C47A' }}>
        <span className="text-xl">👆</span>
        <p className="text-sm font-bold leading-snug" style={{ color: '#1D2B49' }}>
          {selected ? `Now tap a branch to place ${FAMILY_MEMBERS.find(m => m.id === selected)?.name}` : 'Tap a photo below, then tap the correct branch'}
        </p>
      </div>

      {/* Tree SVG area */}
      <div className="relative mx-5 mt-3 overflow-hidden rounded-3xl" style={{ background: '#EBF5EE', border: '1.5px solid #C5DFC9', height: 280 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
          {/* Trunk */}
          <rect x="48" y="88" width="4" height="12" fill="#8B5E3C" rx="1" />
          {/* Main branches */}
          <path d="M50 88 L50 30" stroke="#8B5E3C" strokeWidth="1.5" fill="none" />
          <path d="M50 45 L22 62" stroke="#8B5E3C" strokeWidth="1" fill="none" />
          <path d="M50 45 L78 62" stroke="#8B5E3C" strokeWidth="1" fill="none" />
          <path d="M22 62 L12 85" stroke="#8B5E3C" strokeWidth="0.8" fill="none" opacity="0.7" />
          <path d="M22 62 L38 85" stroke="#8B5E3C" strokeWidth="0.8" fill="none" opacity="0.7" />
          {/* Leaves bg */}
          <ellipse cx="50" cy="20" rx="18" ry="12" fill="#4A7C59" opacity="0.18" />
        </svg>

        {/* Center label */}
        <div className="absolute text-center" style={{ left: '50%', top: '8%', transform: 'translateX(-50%)' }}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ background: '#1D2B49' }}>👵</div>
          <p className="mt-0.5 text-xs font-extrabold" style={{ color: '#1D2B49' }}>Asha Devi</p>
          <p className="text-xs font-semibold" style={{ color: '#4A7C59', fontFamily: 'DM Sans, sans-serif' }}>You</p>
        </div>

        {/* Slots */}
        {TREE_SLOTS.map(slot => {
          const member = getSlotMember(slot.id)
          return (
            <button
              key={slot.id}
              onClick={() => member ? handleRemove(slot.id) : handleSlotTap(slot.id)}
              className="absolute flex flex-col items-center transition-all duration-200"
              style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl shadow-sm transition-all"
                style={{
                  background: member ? (member.color + '22') : 'rgba(255,255,255,0.7)',
                  borderColor: member ? member.color : '#C5DFC9',
                  borderStyle: selected && !member ? 'dashed' : 'solid',
                }}
              >
                {member ? member.emoji : <span style={{ color: '#C5DFC9', fontSize: 20 }}>+</span>}
              </div>
              <p className="mt-0.5 text-xs font-bold leading-none" style={{ color: member ? '#1D2B49' : '#8499BC', fontFamily: 'DM Sans, sans-serif', fontSize: 9 }}>
                {member ? member.name : slot.label}
              </p>
            </button>
          )
        })}

        {/* Celebrate overlay */}
        {celebrate && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl" style={{ background: 'rgba(74,124,89,0.92)' }}>
            <p className="mb-2 text-4xl">🎉</p>
            <p className="text-xl font-extrabold" style={{ color: '#F1E3A4' }}>Well done!</p>
            <p className="mt-1 text-sm font-bold" style={{ color: '#FBF8F0' }}>You built your family tree!</p>
          </div>
        )}
      </div>

      {/* Member picker */}
      <div className="scrollbar-hide mt-3 flex-1 overflow-y-auto px-5 pb-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>
          {available.length > 0 ? 'Tap a family member to place' : '✅ All placed!'}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {FAMILY_MEMBERS.map(m => {
            const isPlaced = placedMemberIds.includes(m.id)
            const isSelected = selected === m.id
            return (
              <button
                key={m.id}
                onClick={() => !isPlaced && setSelected(isSelected ? null : m.id)}
                disabled={isPlaced}
                className="flex flex-col items-center gap-1 rounded-2xl p-3 transition-all duration-150 active:scale-95"
                style={{
                  background: isSelected ? m.color : isPlaced ? '#F0EBE3' : '#FFF',
                  border: `2px solid ${isSelected ? m.color : isPlaced ? '#E8D5B8' : '#E8D5B8'}`,
                  opacity: isPlaced ? 0.45 : 1,
                }}
              >
                <span className="text-2xl">{m.emoji}</span>
                <p className="text-xs font-extrabold" style={{ color: isSelected ? '#FFF' : '#1D2B49' }}>{m.name}</p>
                <p className="text-xs font-semibold" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : '#8499BC', fontFamily: 'DM Sans, sans-serif', fontSize: 9 }}>{m.relation}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── GAME 2: MATCH FACE TO NAME ───────────────────────────────────────────────

function MatchFaceGame({ onBack, micActive, onMicToggle }: {
  onBack: () => void; micActive: boolean; onMicToggle: () => void;
}) {
  const [cardIdx, setCardIdx] = useState(0)
  const [answered, setAnswered] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const card = MATCH_CARDS[cardIdx]

  function handleAnswer(name: string) {
    if (answered) return
    setAnswered(name)
    if (name === card.name) setScore(s => s + 1)
    setTimeout(() => {
      if (cardIdx + 1 >= MATCH_CARDS.length) { setDone(true) }
      else { setCardIdx(i => i + 1); setAnswered(null); setShowHint(false) }
    }, 1400)
  }

  function restart() { setCardIdx(0); setAnswered(null); setScore(0); setDone(false); setShowHint(false) }

  const member = FAMILY_MEMBERS.find(m => m.name === card?.name)

  return (
    <div className="flex h-full flex-col" style={{ background: '#FBF8F0' }}>
      <ScreenHeader title="Match Face to Name" subtitle="Game 2" bg="#4A7C59" onBack={onBack} micActive={micActive} onMicToggle={onMicToggle} />

      {done ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="text-6xl">{score >= 3 ? '🏆' : '🌟'}</span>
          <h2 className="text-3xl font-extrabold" style={{ color: '#1D2B49' }}>
            {score >= 3 ? 'Excellent!' : 'Good effort!'}
          </h2>
          <p className="text-xl font-bold" style={{ color: '#4A7C59' }}>Score: {score} / {MATCH_CARDS.length}</p>
          <p className="text-base font-semibold" style={{ color: '#7A6A5A' }}>
            {score === MATCH_CARDS.length ? "Perfect score! You remembered everyone!" : "Great job playing today, Asha Devi!"}
          </p>
          <button onClick={restart} className="mt-4 w-full rounded-2xl py-4 text-lg font-extrabold" style={{ background: '#355FC7', color: '#FBF8F0' }}>
            Play Again
          </button>
          <button onClick={onBack} className="w-full rounded-2xl py-4 text-lg font-extrabold" style={{ background: '#EFE0C8', color: '#1D2B49' }}>
            Back to Games
          </button>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="mx-5 mt-3 flex gap-1">
            {MATCH_CARDS.map((_, i) => (
              <div key={i} className="h-2 flex-1 rounded-full" style={{ background: i < cardIdx ? '#4A7C59' : i === cardIdx ? '#F1E3A4' : '#E8D5B8' }} />
            ))}
          </div>
          <p className="mt-2 text-center text-xs font-bold" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>
            Question {cardIdx + 1} of {MATCH_CARDS.length} · Score: {score}
          </p>

          {/* Photo card */}
          <div className="mx-5 mt-3 flex flex-col items-center rounded-3xl p-6" style={{ background: '#FFF', border: '1.5px solid #E8D5B8' }}>
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl text-6xl shadow-sm" style={{ background: member ? (member.color + '18') : '#EFE0C8' }}>
              {card.emoji}
            </div>
            <p className="mt-4 text-center text-lg font-bold" style={{ color: '#7A6A5A' }}>Who is this person?</p>
            {showHint && (
              <div className="mt-3 rounded-xl px-4 py-2" style={{ background: '#F1E3A4' }}>
                <p className="text-center text-sm font-bold" style={{ color: '#1D2B49' }}>
                  💡 Hint: This is your {FAMILY_MEMBERS.find(m => m.name === card.name)?.relation}
                </p>
              </div>
            )}
          </div>

          {/* Answer buttons */}
          <div className="mx-5 mt-4 flex flex-col gap-3">
            {card.options.map(opt => {
              const isCorrect = opt === card.name
              const isSelected = answered === opt
              let bg = '#FFF'
              let border = '#E8D5B8'
              let color = '#1D2B49'
              if (answered) {
                if (isCorrect) { bg = '#4A7C59'; border = '#4A7C59'; color = '#FBF8F0' }
                else if (isSelected) { bg = '#C4622D'; border = '#C4622D'; color = '#FBF8F0' }
                else { bg = '#F5F0EA'; color = '#B0A898' }
              }
              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className="w-full rounded-2xl py-4 text-lg font-extrabold transition-all duration-200 active:scale-95"
                  style={{ background: bg, border: `2px solid ${border}`, color }}
                >
                  {answered && isCorrect && '✓ '}{opt}
                  {answered && isSelected && !isCorrect && ' ✗'}
                </button>
              )
            })}
          </div>

          {/* Hint button */}
          {!answered && (
            <button onClick={() => setShowHint(true)} className="mx-5 mt-3 rounded-2xl py-3 text-base font-bold" style={{ background: '#EFE0C8', color: '#C4622D' }}>
              💡 Show Hint
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ─── FAMILY PORTAL ────────────────────────────────────────────────────────────

function FamilyPortalScreen({ onNavigate, onBack, language }: {
  onNavigate: (s: Screen) => void; onBack: () => void; language: LangCode;
}) {
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en
  const p = portalT(language)
  return (
    <div className="flex h-full flex-col" style={{ background: '#FBF8F0' }}>
      <ScreenHeader title={t.familyPortal} subtitle={p.fpSubtitle} bg="#4A7C59" onBack={onBack} micActive={false} onMicToggle={() => {}} showMic={false} />

      <div className="scrollbar-hide flex-1 overflow-y-auto px-5 pb-6 pt-5">
        {/* Auth badge */}
        <div className="mb-5 flex items-center gap-3 rounded-2xl p-3" style={{ background: '#1D2B49' }}>
          <span className="text-2xl">🔒</span>
          <div>
            <p className="text-sm font-extrabold" style={{ color: '#F1E3A4' }}>{p.caregiverVerified} · Rohan Sharma</p>
            <p className="text-xs font-semibold" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>{p.lastLogin}: {p.today} 8:12 AM</p>
          </div>
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>{p.manageMonitor}</p>

        <div className="flex flex-col gap-3">
          {/* Analytics */}
          <button onClick={() => onNavigate('family-analytics')} className="flex w-full items-center gap-4 rounded-2xl p-5 text-left shadow-sm transition-all active:scale-95" style={{ background: '#355FC7' }}>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl" style={{ background: 'rgba(255,255,255,0.15)' }}>📊</div>
            <div className="flex-1">
              <h2 className="text-lg font-extrabold" style={{ color: '#FBF8F0' }}>{p.cognitiveAnalytics}</h2>
              <p className="mt-0.5 text-sm font-medium" style={{ color: 'rgba(241,227,164,0.85)' }}>{p.analyticsSub}</p>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}><ChevronRight /></span>
          </button>

          {/* Photo Manager */}
          <button onClick={() => onNavigate('family-photos')} className="flex w-full items-center gap-4 rounded-2xl p-5 text-left shadow-sm transition-all active:scale-95" style={{ background: '#EFE0C8', border: '1.5px solid #D4C47A' }}>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl" style={{ background: 'rgba(196,98,45,0.1)' }}>📸</div>
            <div className="flex-1">
              <h2 className="text-lg font-extrabold" style={{ color: '#1D2B49' }}>{p.gameManager}</h2>
              <p className="mt-0.5 text-sm font-medium" style={{ color: '#7A6A5A' }}>{p.gameManagerSub}</p>
            </div>
            <span style={{ color: '#1D2B4955' }}><ChevronRight /></span>
          </button>

          {/* Quick contacts */}
          <div className="rounded-2xl p-4" style={{ background: '#FFF', border: '1.5px solid #E8D5B8' }}>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>{p.familyContacts}</p>
            {[
              { name: 'Rohan Sharma', role: p.relSon, emoji: '👨', online: true },
              { name: 'Priya Devi', role: p.relDaughter, emoji: '👩', online: false },
              { name: 'Dr. Anjali Singh', role: p.relCareDoctor, emoji: '👩‍⚕️', online: true },
            ].map(m => (
              <div key={m.name} className="flex items-center gap-3 border-b py-2.5 last:border-0" style={{ borderColor: '#F0E8D8' }}>
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: '#EFE0C8' }}>
                  {m.emoji}
                  {m.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white" style={{ background: '#4A7C59' }} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold" style={{ color: '#1D2B49' }}>{m.name}</p>
                  <p className="text-xs font-semibold" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>{m.role}</p>
                </div>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#355FC7' }}>
                  <span className="text-base">📞</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ANALYTICS DASHBOARD ──────────────────────────────────────────────────────

function AnalyticsDashboard({ onBack, micActive, onMicToggle, language }: {
  onBack: () => void; micActive: boolean; onMicToggle: () => void; language: LangCode;
}) {
  const maxScore = Math.max(...WEEKLY_SCORES)
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en
  const p = portalT(language)

  return (
    <div className="flex h-full flex-col" style={{ background: '#FBF8F0' }}>
      <ScreenHeader title={p.cognitiveAnalytics} subtitle={p.thisWeek} bg="#1D2B49" onBack={onBack} micActive={micActive} onMicToggle={onMicToggle} />

      <div className="scrollbar-hide flex-1 overflow-y-auto px-5 pb-6 pt-5">
        {/* KPI cards */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          {[
            { label: p.memoryRecall, value: '88%', delta: '+6%', icon: '🧠', color: '#355FC7', bg: '#EEF2FF' },
            { label: p.attentionSpan, value: `14 ${p.minShort}`, delta: `+2 ${p.minShort}`, icon: '🎯', color: '#4A7C59', bg: '#EBF5EE' },
            { label: p.dailyPlayTime, value: `32 ${p.minShort}`, delta: p.today, icon: '⏱', color: '#C4622D', bg: '#FEF3ED' },
            { label: p.aiFlagsLabel, value: `2 ${p.mild}`, delta: p.reviewed, icon: '🚩', color: '#7B5EA7', bg: '#F3EEF9' },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-2xl p-4" style={{ background: kpi.bg, border: `1.5px solid ${kpi.color}22` }}>
              <span className="mb-2 block text-2xl">{kpi.icon}</span>
              <p className="text-xl font-extrabold" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="mt-0.5 text-xs font-bold" style={{ color: '#1D2B49' }}>{kpi.label}</p>
              <p className="mt-0.5 text-xs font-semibold" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>{kpi.delta}</p>
            </div>
          ))}
        </div>

        {/* Memory score chart */}
        <div className="mb-4 rounded-2xl p-4" style={{ background: '#FFF', border: '1.5px solid #E8D5B8' }}>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>{p.memoryRecallWeek}</p>
          <div className="flex h-28 items-end gap-2">
            {WEEKLY_SCORES.map((score, i) => {
              const isToday = i === WEEKLY_SCORES.length - 1
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-bold" style={{ color: isToday ? '#355FC7' : '#8499BC', fontFamily: 'DM Sans, sans-serif', fontSize: 9 }}>{score}</span>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${(score / maxScore) * 88}px`,
                      background: isToday ? '#355FC7' : '#D6E2F8',
                    }}
                  />
                  <span className="text-xs font-bold" style={{ color: isToday ? '#355FC7' : '#B0A898', fontFamily: 'DM Sans, sans-serif', fontSize: 9 }}>{p.weekDays[i]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Flags */}
        <div className="mb-4 rounded-2xl p-4" style={{ background: '#FEF3ED', border: '1.5px solid #F5C9AA' }}>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#C4622D', fontFamily: 'DM Sans, sans-serif' }}>🚩 {p.aiCognitiveFlags}</p>
          {[
            { flag: p.flag1, severity: p.sevMild },
            { flag: p.flag2, severity: p.sevLow },
          ].map(f => (
            <div key={f.flag} className="flex items-start gap-3 border-b py-2.5 last:border-0" style={{ borderColor: '#F5C9AA' }}>
              <span className="mt-0.5 text-base">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold leading-snug" style={{ color: '#1D2B49' }}>{f.flag}</p>
                <span className="text-xs font-bold" style={{ color: '#C4622D', fontFamily: 'DM Sans, sans-serif' }}>{f.severity} {p.concern}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Game breakdown */}
        <div className="rounded-2xl p-4" style={{ background: '#FFF', border: '1.5px solid #E8D5B8' }}>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>{p.gamePerformance}</p>
          {[
            { name: t.familyTreeBuilder, score: 92, color: '#355FC7' },
            { name: t.matchFaceName, score: 78, color: '#4A7C59' },
          ].map(g => (
            <div key={g.name} className="mb-3 last:mb-0">
              <div className="mb-1 flex justify-between">
                <span className="text-sm font-bold" style={{ color: '#1D2B49' }}>{g.name}</span>
                <span className="text-sm font-extrabold" style={{ color: g.color, fontFamily: 'DM Sans, sans-serif' }}>{g.score}%</span>
              </div>
              <div className="h-3 rounded-full" style={{ background: '#F0E8D8' }}>
                <div className="h-3 rounded-full transition-all" style={{ width: `${g.score}%`, background: g.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── PHOTO MANAGER ────────────────────────────────────────────────────────────

function PhotoManager({ onBack, micActive, onMicToggle, language, onLanguageChange }: {
  onBack: () => void; micActive: boolean; onMicToggle: () => void;
  language: LangCode; onLanguageChange: (l: LangCode) => void;
}) {
  const [recording, setRecording] = useState<number | null>(null)
  const [recorded, setRecorded] = useState<number[]>([])
  const [reminder, setReminder] = useState('10:00 AM')
  const p = portalT(language)

  function toggleRecord(id: number) {
    if (recording === id) {
      setRecording(null)
      setRecorded(prev => [...prev, id])
    } else {
      setRecording(id)
      setTimeout(() => { setRecording(null); setRecorded(prev => [...prev, id]) }, 2000)
    }
  }

  return (
    <div className="flex h-full flex-col" style={{ background: '#FBF8F0' }}>
      <ScreenHeader title={p.gameManager} subtitle={p.photoUpload} bg="#C4622D" onBack={onBack} micActive={micActive} onMicToggle={onMicToggle} />

      <div className="scrollbar-hide flex-1 overflow-y-auto px-5 pb-6 pt-5">
        {/* Upload section */}
        <div className="mb-4 rounded-2xl p-4" style={{ background: '#FFF', border: '1.5px solid #E8D5B8' }}>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>{p.photosAudioNames}</p>
          <div className="grid grid-cols-2 gap-3">
            {FAMILY_MEMBERS.map(m => (
              <div key={m.id} className="flex flex-col items-center gap-2 rounded-2xl p-3" style={{ background: '#F8F4EE', border: '1.5px solid #E8D5B8' }}>
                {/* Photo slot */}
                <div className="flex aspect-square w-full items-center justify-center rounded-xl text-4xl" style={{ background: m.color + '18', border: `1.5px dashed ${m.color}55` }}>
                  {m.emoji}
                </div>
                <p className="text-center text-sm font-extrabold" style={{ color: '#1D2B49' }}>{m.name}</p>
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: m.color + '18', color: m.color, fontFamily: 'DM Sans, sans-serif' }}>{p[m.relKey]}</span>

                {/* Upload button */}
                <button className="w-full rounded-xl py-2 text-xs font-bold" style={{ background: '#EFE0C8', color: '#1D2B49' }}>
                  📷 {p.uploadPhoto}
                </button>

                {/* Record audio */}
                <button
                  onClick={() => toggleRecord(m.id)}
                  className="w-full rounded-xl py-2 text-xs font-bold transition-all"
                  style={{
                    background: recording === m.id ? '#C4622D' : recorded.includes(m.id) ? '#4A7C59' : '#1D2B49',
                    color: '#FBF8F0',
                  }}
                >
                  {recording === m.id ? `⏺ ${p.recordingLabel}` : recorded.includes(m.id) ? `✓ ${p.recordedLabel}` : `🎙 ${p.recordName}`}
                </button>
              </div>
            ))}
          </div>

          {/* Add new member */}
          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-extrabold" style={{ background: '#355FC7', color: '#FBF8F0' }}>
            <span className="text-xl">+</span> {p.addFamilyMember}
          </button>
        </div>

        {/* Game reminder */}
        <div className="mb-4 rounded-2xl p-4" style={{ background: '#F1E3A4', border: '1.5px solid #D4C47A' }}>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#7A6A5A', fontFamily: 'DM Sans, sans-serif' }}>⏰ {p.dailyGameReminder}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-xl px-4 py-3 text-lg font-extrabold" style={{ background: '#FFF', color: '#1D2B49' }}>
              {reminder}
            </div>
            <div className="flex flex-col gap-1">
              {['9:00 AM', '10:00 AM', '3:00 PM', '6:00 PM'].map(t => (
                <button key={t} onClick={() => setReminder(t)} className="rounded-xl px-3 py-1.5 text-xs font-bold transition-all" style={{ background: reminder === t ? '#1D2B49' : 'rgba(255,255,255,0.6)', color: reminder === t ? '#F1E3A4' : '#7A6A5A', fontFamily: 'DM Sans, sans-serif' }}>{t}</button>
              ))}
            </div>
          </div>
          <button className="mt-3 w-full rounded-xl py-3 text-sm font-extrabold" style={{ background: '#1D2B49', color: '#F1E3A4' }}>
            ✓ {p.saveReminder}
          </button>
        </div>

        {/* Language selection */}
        <div className="rounded-2xl p-4" style={{ background: '#FFF', border: '1.5px solid #E8D5B8' }}>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>🗣 {p.audioPromptLanguage}</p>
          <div className="grid grid-cols-2 gap-2">
            {ONBOARD_LANGUAGES.map(l => {
              const active = language === l.code;
              return (
                <button key={l.code} onClick={() => onLanguageChange(l.code)} className="flex items-center gap-2 rounded-xl px-3 py-3 text-left transition-all" style={{ background: active ? '#355FC7' : '#F8F4EE', border: `1.5px solid ${active ? '#355FC7' : '#E8D5B8'}` }}>
                  <span className="text-xl">{LANGUAGE_ICONS[l.code]}</span>
                  <span className="text-sm font-extrabold leading-tight" style={{ color: active ? '#FBF8F0' : '#1D2B49' }}>{l.sub}</span>
                  {active && <span className="ml-auto text-xs" style={{ color: '#F1E3A4' }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CARE / AI ASSISTANT ──────────────────────────────────────────────────────

function CareScreen({ onBack, micActive, onMicToggle }: {
  onBack: () => void; micActive: boolean; onMicToggle: () => void;
}) {
  const [voiceActive, setVoiceActive] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Namaste, Asha Devi! I am your care assistant. How are you feeling today?' },
    { from: 'user', text: 'I feel a little confused about my morning medicines.' },
    { from: 'ai', text: "That's okay! Your morning medicines are: 1 white tablet (Donepezil) and 1 pink tablet (Vitamin B12). Take them after breakfast with water." },
  ])
  const [input, setInput] = useState('')
  const [tab, setTab] = useState<'chat' | 'faq' | 'reminders'>('chat')
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, tab])

  function send() {
    if (!input.trim()) return
    setMessages(prev => [
      ...prev,
      { from: 'user', text: input },
      { from: 'ai', text: "Thank you for sharing that. I am here to help you. Please speak slowly or type your question and I will assist you." },
    ])
    setInput('')
  }

  const [reminderDone, setReminderDone] = useState<number[]>([0, 1])

  return (
    <div className="flex h-full flex-col" style={{ background: '#FBF8F0' }}>
      <ScreenHeader title="Dementia Care" subtitle="AI Companion" bg="#C4622D" onBack={onBack} micActive={micActive} onMicToggle={onMicToggle} />

      {/* Voice orb */}
      <div className="mx-5 mt-3 flex items-center gap-4 rounded-2xl p-4" style={{ background: '#1D2B49' }}>
        <button
          onClick={() => setVoiceActive(v => !v)}
          className="relative flex shrink-0 items-center justify-center rounded-full transition-all duration-300"
          style={{ width: 64, height: 64, background: voiceActive ? '#C4622D' : '#355FC7' }}
        >
          {voiceActive && <span className="mic-pulse" />}
          <MicIcon size={26} />
        </button>
        <div className="flex-1">
          {voiceActive ? (
            <div className="flex h-8 items-center gap-1">
              {[4, 7, 5, 9, 6, 8, 4, 6, 7, 5].map((h, i) => (
                <div key={i} className="flex-1 animate-pulse rounded-full" style={{ height: `${h * 4}px`, background: '#F1E3A4', animationDelay: `${i * 0.07}s` }} />
              ))}
            </div>
          ) : (
            <p className="text-base font-bold" style={{ color: '#FBF8F0' }}>Tap to speak to assistant</p>
          )}
          <p className="mt-1 text-xs font-semibold" style={{ color: voiceActive ? '#F1E3A4' : '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>
            {voiceActive ? 'Listening… speak now' : 'Available 24 hours · Local language supported'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-5 mt-3 flex gap-2">
        {([['chat', '💬 Chat'], ['faq', '❓ FAQ'], ['reminders', '⏰ Reminders']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className="flex-1 rounded-xl py-2 text-xs font-extrabold transition-all" style={{ background: tab === key ? '#355FC7' : '#EFE0C8', color: tab === key ? '#FBF8F0' : '#7A6A5A', fontFamily: 'DM Sans, sans-serif' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'chat' && (
        <>
          <div ref={chatRef} className="scrollbar-hide flex flex-1 flex-col gap-3 overflow-y-auto px-5 pt-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.from === 'ai' && (
                  <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm" style={{ background: '#C4622D' }}>🤖</div>
                )}
                <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm font-semibold leading-snug"
                  style={{
                    background: m.from === 'ai' ? '#FFF' : '#355FC7',
                    color: m.from === 'ai' ? '#1D2B49' : '#FBF8F0',
                    border: m.from === 'ai' ? '1.5px solid #E8D5B8' : 'none',
                    borderBottomLeftRadius: m.from === 'ai' ? 4 : 16,
                    borderBottomRightRadius: m.from === 'user' ? 4 : 16,
                  }}
                >{m.text}</div>
              </div>
            ))}
            <div className="pb-2" />
          </div>
          <div className="flex gap-2 px-5 pb-3 pt-2" style={{ borderTop: '1.5px solid #E8D5B8' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type your question…"
              className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold outline-none"
              style={{ background: '#FFF', border: '1.5px solid #E8D5B8', color: '#1D2B49', fontFamily: 'Nunito, sans-serif' }}
            />
            <button onClick={send} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: '#C4622D' }}>➤</button>
          </div>
        </>
      )}

      {tab === 'faq' && (
        <div className="scrollbar-hide flex-1 overflow-y-auto px-5 pb-6 pt-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>Common Questions</p>
          <div className="grid grid-cols-2 gap-3">
            {FAQ_TILES.map(f => (
              <button key={f.q} className="flex flex-col gap-2 rounded-2xl p-4 text-left shadow-sm transition-all active:scale-95" style={{ background: f.bg, border: `1.5px solid ${f.color}22`, minHeight: 90 }}>
                <span className="text-3xl">{f.icon}</span>
                <p className="text-sm font-extrabold leading-snug" style={{ color: '#1D2B49' }}>{f.q}</p>
              </button>
            ))}
          </div>

          {/* Local health contacts */}
          <p className="mb-3 mt-5 text-xs font-bold uppercase tracking-widest" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>Local Health Contacts</p>
          <div className="rounded-2xl p-4" style={{ background: '#FFF', border: '1.5px solid #E8D5B8' }}>
            {[
              { name: 'GNRC Hospitals, Guwahati', num: '0361-260 0000', icon: '🏥' },
              { name: 'Dementia India Alliance', num: '1800-102-2225', icon: '🧠' },
              { name: 'AIIMS Guwahati Helpline', num: '0361-232 5252', icon: '📞' },
            ].map(c => (
              <div key={c.name} className="flex items-center gap-3 border-b py-2.5 last:border-0" style={{ borderColor: '#F0E8D8' }}>
                <span className="text-xl">{c.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-extrabold" style={{ color: '#1D2B49' }}>{c.name}</p>
                  <p className="text-xs font-semibold" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>{c.num}</p>
                </div>
                <button className="rounded-xl px-3 py-1.5 text-xs font-bold" style={{ background: '#355FC7', color: '#FBF8F0', fontFamily: 'DM Sans, sans-serif' }}>Call</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'reminders' && (
        <div className="scrollbar-hide flex-1 overflow-y-auto px-5 pb-6 pt-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>Medicine & Hydration Timeline</p>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute bottom-0 left-5 top-0 w-0.5" style={{ background: '#E8D5B8' }} />
            <div className="flex flex-col gap-1">
              {REMINDERS.map((r, i) => {
                const isDone = reminderDone.includes(i)
                return (
                  <button key={i} onClick={() => setReminderDone(prev => isDone ? prev.filter(x => x !== i) : [...prev, i])} className="relative flex items-center gap-4 py-2 pl-2 transition-all active:scale-95" style={{ textAlign: 'left' }}>
                    {/* Dot */}
                    <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: isDone ? r.color : '#FFF', border: `2px solid ${r.color}` }}>
                      {isDone && <span className="text-xs font-bold text-white">✓</span>}
                    </div>
                    <div className="flex-1 rounded-2xl px-4 py-3" style={{ background: isDone ? '#F0EBE3' : '#FFF', border: `1.5px solid ${isDone ? '#E8D5B8' : r.color + '44'}` }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{r.icon}</span>
                          <div>
                            <p className="text-sm font-extrabold" style={{ color: isDone ? '#B0A898' : '#1D2B49', textDecoration: isDone ? 'line-through' : 'none' }}>{r.label}</p>
                            <p className="text-xs font-bold" style={{ color: isDone ? '#C0B8AE' : r.color, fontFamily: 'DM Sans, sans-serif' }}>{r.time}</p>
                          </div>
                        </div>
                        {!isDone && <span className="h-7 w-7 shrink-0 rounded-full border-2" style={{ borderColor: r.color }} />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

function BottomNav({ screen, onNavigate }: { screen: Screen; onNavigate: (s: Screen) => void }) {
  const tabs: { id: Screen; label: string; emoji: string; root: Screen[] }[] = [
    { id: 'home', label: 'Home', emoji: '🏠', root: ['home'] },
    { id: 'games', label: 'Games', emoji: '🧩', root: ['games', 'game-tree', 'game-match'] },
    { id: 'family', label: 'Family', emoji: '👨‍👩‍👧', root: ['family', 'family-analytics', 'family-photos'] },
    { id: 'care', label: 'Care', emoji: '🤖', root: ['care'] },
  ]

  return (
    <div className="flex shrink-0 items-center justify-around px-2 pb-3 pt-2" style={{ background: '#FBF8F0', borderTop: '1.5px solid #E8D5B8' }}>
      {tabs.map(({ id, label, emoji, root }) => {
        const active = root.includes(screen)
        return (
          <button key={id} onClick={() => onNavigate(id)} className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1 transition-all" style={{ minHeight: 54 }}>
            <span className="text-2xl" style={{ opacity: active ? 1 : 0.4 }}>{emoji}</span>
            <span className="text-xs font-bold" style={{ color: active ? '#355FC7' : '#8499BC', fontFamily: 'DM Sans, sans-serif', fontSize: 10 }}>{label}</span>
            {active && <span className="h-1 w-4 rounded-full" style={{ background: '#355FC7' }} />}
          </button>
        )
      })}
    </div>
  )
}

// ─── STATUS BAR COLOR ─────────────────────────────────────────────────────────

function statusColor(screen: Screen) {
  if (['home'].includes(screen)) return '#1D2B49'
  if (['games', 'game-tree'].includes(screen)) return '#355FC7'
  if (['game-match', 'family', 'family-analytics'].includes(screen)) return '#4A7C59'
  if (['family-photos', 'care'].includes(screen)) return '#C4622D'
  return '#1D2B49'
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [flow, setFlow] = useState<AppFlow>('onboarding')
  const [showPinScreen, setShowPinScreen] = useState(false)

  // Onboarding state
  const [onboardStep, setOnboardStep] = useState<OnboardStep>("welcome");
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'as' | 'mni' | 'kha' | 'bn'>('en');
  const [onboardName, setOnboardName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  const isPhoneValid = useMemo(() => /^[0-9]{10}$/.test(phone), [phone]);
  const isPinValid = useMemo(() => /^[0-9]{4}$/.test(pin), [pin]);
  const canContinueDetails = onboardName.trim().length > 1 && isPhoneValid;

  // Translation helper
  const t = TRANSLATIONS[selectedLanguage] ?? TRANSLATIONS.en;

  // Portal state
  const [screen, setScreen] = useState<Screen>('home')
  const [micActive, setMicActive] = useState(false)
  const [history, setHistory] = useState<Screen[]>([])

  function navigate(s: Screen) {
    // Check if trying to access Family Portal
    if (s === 'family') {
      setShowPinScreen(true)
      return
    }

    setHistory(prev => [...prev, screen])
    setScreen(s)
    setMicActive(false)
  }

  function goBack() {
    const prev = history[history.length - 1]
    if (prev) {
      setHistory(h => h.slice(0, -1))
      setScreen(prev)
    }
  }

  function navTab(s: Screen) {
    // Check if trying to access Family Portal
    if (s === 'family') {
      setShowPinScreen(true)
      return
    }

    setHistory([])
    setScreen(s)
    setMicActive(false)
  }

  const mic = { micActive, onMicToggle: () => setMicActive(v => !v) }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden" style={{ background: '#FBF8F0', fontFamily: 'Nunito, sans-serif' }}>

      <div className="relative flex flex-1 flex-col overflow-hidden w-full h-full">
        {flow === 'onboarding' ? (
          // ONBOARDING FLOW
          <div className="h-full w-full bg-neutral-100 text-white">
            {onboardStep === "welcome" && (
              <section className="relative flex h-full flex-col justify-between overflow-hidden" style={{ background: '#FBF8F0' }}>
                {/* Fluid background blobs */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 390 760" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.9 }}>
                  <defs>
                    <radialGradient id="blob1" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#355FC7" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#355FC7" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="blob2" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#F1E3A4" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#F1E3A4" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="blob3" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#C4622D" stopOpacity="0.13" />
                      <stop offset="100%" stopColor="#C4622D" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="blob4" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#4A7C59" stopOpacity="0.14" />
                      <stop offset="100%" stopColor="#4A7C59" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="320" cy="80" rx="220" ry="200" fill="url(#blob1)" />
                  <ellipse cx="60" cy="320" rx="180" ry="160" fill="url(#blob2)" />
                  <ellipse cx="340" cy="500" rx="200" ry="180" fill="url(#blob3)" />
                  <ellipse cx="80" cy="680" rx="160" ry="140" fill="url(#blob4)" />
                  <ellipse cx="200" cy="200" rx="120" ry="100" fill="url(#blob2)" />
                </svg>

                {/* Top wordmark */}
                <div className="relative px-8 pt-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#355FC7' }}>
                      <span className="text-white text-sm font-black">M</span>
                    </div>
                    <span className="text-sm font-black tracking-widest uppercase" style={{ color: '#1D2B49', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.18em' }}>MemorySathi</span>
                  </div>
                </div>

                {/* Center hero */}
                <div className="relative flex flex-1 flex-col items-center justify-center px-8 text-center">
                  <div className="relative mb-8">
                    <div className="w-36 h-36 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(53,95,199,0.08)', border: '1.5px solid rgba(53,95,199,0.18)' }}>
                      <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'rgba(53,95,199,0.12)', border: '1.5px solid rgba(53,95,199,0.22)' }}>
                        <span className="text-5xl">🧠</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-bold tracking-[0.28em] uppercase mb-3" style={{ color: '#8499BC', fontFamily: 'DM Sans, sans-serif' }}>{t.welcome}</p>
                  <h1 className="text-4xl font-extrabold leading-tight mb-4" style={{ color: '#1D2B49' }}>
                    {t.heroTitle1}<br />{t.heroTitle2}
                  </h1>
                  <p className="text-base font-semibold leading-relaxed max-w-[260px]" style={{ color: '#7A6A5A' }}>
                    {t.heroSubtitle}
                  </p>
                </div>

                {/* Bottom CTA */}
                <div className="relative px-6 pb-10">
                  <button
                    onClick={() => setOnboardStep("language")}
                    className="w-full rounded-2xl px-5 py-5 text-lg font-extrabold transition-all active:scale-95"
                    style={{ background: '#1D2B49', color: '#F1E3A4' }}
                  >
                    {t.letsBegin}
                  </button>
                  <p className="text-center text-xs font-semibold mt-4" style={{ color: '#B0A898', fontFamily: 'DM Sans, sans-serif' }}>
                    {t.freeLine}
                  </p>
                </div>
              </section>
            )}

            {onboardStep !== "welcome" && (
              <main className="flex h-full items-center justify-center bg-gradient-to-br from-[#1D2B49] via-[#355FC7] to-[#4A7C59] px-5 pt-6">
                <div className="w-full max-w-md rounded-3xl bg-[#FBF8F0] p-6 text-gray-900 shadow-2xl">
                  {onboardStep === "language" && (
                    <>
                      <h2 className="text-xl font-bold text-[#1D2B49]">{t.chooseLanguage}</h2>
                      <p className="mt-1 text-sm text-[#7A6A5A]">{t.selectLanguage}</p>

                      <div className="mt-6 grid gap-2">
                        {ONBOARD_LANGUAGES.map((language) => {
                          const active = selectedLanguage === language.code;
                          return (
                            <button
                              key={language.code}
                              onClick={() => setSelectedLanguage(language.code as 'en' | 'hi' | 'as' | 'mni' | 'kha' | 'bn')}
                              className={`rounded-2xl border px-4 py-3 text-left font-bold transition ${
                                active
                                  ? "border-[#355FC7] bg-[#EEF2FF] text-[#355FC7]"
                                  : "border-[#E8D5B8] bg-white text-[#1D2B49] hover:bg-gray-50"
                              }`}
                            >
                              {language.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => setOnboardStep("welcome")}
                          className="w-1/3 rounded-2xl border border-[#E8D5B8] bg-white px-4 py-3 font-bold text-[#1D2B49]"
                        >
                          {t.back}
                        </button>
                        <button
                          onClick={() => setOnboardStep("details")}
                          disabled={!selectedLanguage}
                          className="w-2/3 rounded-2xl bg-[#355FC7] px-4 py-3 font-bold text-white disabled:bg-[#8499BC]"
                        >
                          {t.continue}
                        </button>
                      </div>
                    </>
                  )}

                  {onboardStep === "details" && (
                    <>
                      <h2 className="text-xl font-bold text-[#1D2B49]">{t.enterDetails}</h2>
                      <p className="mt-1 text-sm text-[#7A6A5A]">{t.personalize}</p>

                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="mb-1 block text-sm font-bold text-[#1D2B49]">{t.fullName}</label>
                          <input
                            type="text"
                            value={onboardName}
                            onChange={(e) => setOnboardName(e.target.value)}
                            placeholder={t.enterName}
                            className="w-full rounded-2xl border border-[#E8D5B8] bg-white px-4 py-3 font-semibold text-[#1D2B49] outline-none focus:border-[#355FC7]"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-bold text-[#1D2B49]">{t.phoneNumber}</label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            placeholder={t.enterPhone}
                            className="w-full rounded-2xl border border-[#E8D5B8] bg-white px-4 py-3 font-semibold text-[#1D2B49] outline-none focus:border-[#355FC7]"
                          />
                          {phone.length > 0 && !isPhoneValid && (
                            <p className="mt-2 text-xs font-bold text-[#C4622D]">{t.invalidPhone}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => setOnboardStep("language")}
                          className="w-1/3 rounded-2xl border border-[#E8D5B8] bg-white px-4 py-3 font-bold text-[#1D2B49]"
                        >
                          {t.back}
                        </button>
                        <button
                          onClick={() => setOnboardStep("pin")}
                          disabled={!canContinueDetails}
                          className="w-2/3 rounded-2xl bg-[#355FC7] px-4 py-3 font-bold text-white disabled:bg-[#8499BC]"
                        >
                          {t.continue}
                        </button>
                      </div>
                    </>
                  )}

                  {onboardStep === "pin" && (
                    <>
                      <h2 className="text-xl font-bold text-[#1D2B49]">{t.setupPin}</h2>
                      <p className="mt-1 text-sm text-[#7A6A5A]">{t.pinSubtitle}</p>

                      <div className="mt-6">
                        <label className="mb-1 block text-sm font-bold text-[#1D2B49]">{t.pinLabel}</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          value={pin}
                          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                          placeholder={t.pinPlaceholder}
                          className="w-full rounded-2xl border border-[#E8D5B8] bg-white px-4 py-3 text-center text-xl font-bold tracking-[0.5em] text-[#1D2B49] outline-none focus:border-[#355FC7]"
                        />
                        {pin.length > 0 && !isPinValid && (
                          <p className="mt-2 text-xs font-bold text-[#C4622D]">{t.invalidPin}</p>
                        )}
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => setOnboardStep("details")}
                          className="w-1/3 rounded-2xl border border-[#E8D5B8] bg-white px-4 py-3 font-bold text-[#1D2B49]"
                        >
                          {t.back}
                        </button>
                        <button
                          onClick={() => setOnboardStep("done")}
                          disabled={!isPinValid}
                          className="w-2/3 rounded-2xl bg-[#4A7C59] px-4 py-3 font-bold text-white disabled:bg-[#8499BC]"
                        >
                          Finish
                        </button>
                      </div>
                    </>
                  )}

                  {onboardStep === "done" && (
                    <>
                      <div className="text-center">
                        <span className="mb-2 block text-5xl">🎉</span>
                        <h2 className="text-xl font-extrabold text-[#1D2B49]">{t.setupComplete}</h2>
                        <p className="mt-2 text-sm font-semibold text-[#7A6A5A]">{t.readyToUse}</p>
                      </div>
                      <button
                        onClick={() => setFlow("portal")}
                        className="mt-6 w-full rounded-2xl bg-[#355FC7] px-4 py-4 text-lg font-extrabold text-white"
                      >
                        {t.goToDashboard}
                      </button>
                    </>
                  )}
                </div>
              </main>
            )}
          </div>
        ) : (
          // PORTAL FLOW
          <>
            {showPinScreen ? (
              <PinVerificationScreen
                onSuccess={() => {
                  setShowPinScreen(false)
                  setScreen('family')
                }}
                onBack={() => setShowPinScreen(false)}
                patientName={onboardName}
                correctPin={pin}
                language={selectedLanguage}
              />
            ) : (
              <>
                <div className="flex-1 overflow-hidden">
                  {screen === 'home' && (
                    <HomeScreen
                      onNavigate={navigate}
                      {...mic}
                      patientName={onboardName}
                      language={selectedLanguage}
                    />
                  )}
                  {screen === 'games' && <GamesScreen onNavigate={navigate} onBack={goBack} {...mic} />}
                  {screen === 'game-tree' && <FamilyTreeGame onBack={goBack} {...mic} />}
                  {screen === 'game-match' && <MatchFaceGame onBack={goBack} {...mic} />}
                  {screen === 'game-coconut-mallet' && <CoconutMalletGame />}
                  {screen === 'game-folk-music' && <FolkMusicPortal />}
                  {screen === 'family' && <FamilyPortalScreen onNavigate={navigate} onBack={goBack} {...mic} />}
                  {screen === 'family-analytics' && <AnalyticsDashboard onBack={goBack} {...mic} />}
                  {screen === 'family-photos' && <PhotoManager onBack={goBack} {...mic} />}
                  {screen === 'care' && <CareScreen onBack={goBack} {...mic} />}
                </div>

                <BottomNav screen={screen} onNavigate={navTab} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}