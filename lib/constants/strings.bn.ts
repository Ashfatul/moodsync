export interface MoodItem {
  id: string;
  emoji: string;
  name: string;
  shortDesc: string;
  color: string;
  bgLight: string;
}

export interface NeedItem {
  id: string;
  emoji: string;
  name: string;
  shortDesc: string;
}

export interface IntimacyItem {
  id: string;
  emoji: string;
  name: string;
  shortDesc: string;
}

export interface FightItem {
  id: string;
  emoji: string;
  name: string;
  shortDesc: string;
}

export const MOODS: MoodItem[] = [
  {
    id: 'very_good',
    emoji: '😄',
    name: 'খুব ভালো',
    shortDesc: 'মন খুব প্রফুল্ল আর হালকা লাগছে।',
    color: 'text-amber-500',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
  },
  {
    id: 'good',
    emoji: '🙂',
    name: 'ভালো',
    shortDesc: 'সবকিছু বেশ স্বাভাবিক আর সুন্দর কাটছে।',
    color: 'text-emerald-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
  },
  {
    id: 'peaceful',
    emoji: '😌',
    name: 'শান্ত',
    shortDesc: 'এখন মনটা বেশ স্থির ও স্বস্তিতে আছে।',
    color: 'text-teal-500',
    bgLight: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60',
  },
  {
    id: 'neutral',
    emoji: '😐',
    name: 'মোটামুটি',
    shortDesc: 'বিশেষ কোনো অনুভূতি নেই, সাধারণ সময়।',
    color: 'text-slate-500',
    bgLight: 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800',
  },
  {
    id: 'sad',
    emoji: '😔',
    name: 'মন খারাপ',
    shortDesc: 'মনটা একটু ভার লাগছে। হয়তো নির্দিষ্ট কারণ আছে, হয়তো নেই।',
    color: 'text-indigo-500',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
  },
  {
    id: 'very_bad',
    emoji: '😣',
    name: 'খুব খারাপ',
    shortDesc: 'ভেতরটা কেমন যেন ছটফট করছে, একদম ভালো লাগছে না।',
    color: 'text-rose-500',
    bgLight: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
  },
  {
    id: 'angry',
    emoji: '😡',
    name: 'রাগ লাগছে',
    shortDesc: 'কোনো কিছু নিয়ে বিরক্ত, রাগ বা ক্ষোভ অনুভব করছি।',
    color: 'text-red-500',
    bgLight: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60',
  },
  {
    id: 'hurt',
    emoji: '🥺',
    name: 'কষ্ট লাগছে',
    shortDesc: 'মন খুব আঘাত পেয়েছে বা ভীষণ অভিমান হচ্ছে।',
    color: 'text-purple-500',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60',
  },
];

export const NEEDS: NeedItem[] = [
  {
    id: 'affection',
    emoji: '🫂',
    name: 'একটু আদর',
    shortDesc: 'কাছে আসতে বা একটু affection পেতে ইচ্ছে করছে।',
  },
  {
    id: 'talk',
    emoji: '💬',
    name: 'কথা বলতে চাই',
    shortDesc: 'আমার সাথে কথা বলতে ভালো লাগবে।',
  },
  {
    id: 'listen',
    emoji: '👂',
    name: 'শুধু শুনো',
    shortDesc: 'সমাধান নয়, শুধু চাই তুমি আমাকে শুনো।',
  },
  {
    id: 'space',
    emoji: '🧘',
    name: 'একটু space',
    shortDesc: 'এখন কিছুটা একা থাকতে চাই।',
  },
  {
    id: 'be_there',
    emoji: '🤍',
    name: 'পাশে থাকো',
    shortDesc: 'কিছু বলতে হবে না, শুধু পাশে থাকলেই ভালো লাগবে।',
  },
  {
    id: 'not_sure',
    emoji: '🤷',
    name: 'জানি না',
    shortDesc: 'নিজেরও ঠিক বুঝতে পারছি না কী দরকার।',
  },
];

export const INTIMACY_MOODS: IntimacyItem[] = [
  {
    id: 'cuddle',
    emoji: '🤍',
    name: 'আদর চাই',
    shortDesc: 'একটু উষ্ণ স্পর্শ বা জড়িয়ে থাকা চাই।',
  },
  {
    id: 'stay_close',
    emoji: '🫂',
    name: 'কাছে থাকতে চাই',
    shortDesc: 'কাছাকাছি সময় কাটাতে ইচ্ছা করছে।',
  },
  {
    id: 'romantic',
    emoji: '❤️',
    name: 'রোমান্টিক লাগছে',
    shortDesc: 'মনটা বেশ প্রণয়ময় ও রোমান্টিক।',
  },
  {
    id: 'intimate',
    emoji: '🔥',
    name: 'Intimate mood',
    shortDesc: 'শারীরিক ও মানসিক ঘনিষ্ঠতা অনুভব করছি।',
  },
  {
    id: 'nothing_special',
    emoji: '😐',
    name: 'বিশেষ কিছু না',
    shortDesc: 'আজ সাধারণ দিনের মতোই স্বাভাবিক।',
  },
  {
    id: 'prefer_not_to_say',
    emoji: '—',
    name: 'বলতে চাই না',
    shortDesc: 'এই মুহূর্তে বিষয়টি শেয়ার করতে চাইছি না।',
  },
];

export const FIGHT_MOMENTS: FightItem[] = [
  {
    id: 'angry',
    emoji: '😡',
    name: 'রাগ',
    shortDesc: 'খুব রাগ আর বিরক্তি লাগছে',
  },
  {
    id: 'hurt',
    emoji: '😔',
    name: 'কষ্ট',
    shortDesc: 'মনে খুব আঘাত পেয়েছি',
  },
  {
    id: 'sulking',
    emoji: '🥺',
    name: 'অভিমান',
    shortDesc: 'তোমার উপর ভীষণ অভিমান হচ্ছে',
  },
  {
    id: 'silent',
    emoji: '😶',
    name: 'চুপ থাকতে চাই',
    shortDesc: 'এখন কোনো কথা বলতে ইচ্ছে করছে না',
  },
  {
    id: 'need_time',
    emoji: '🧘',
    name: 'একটু সময় চাই',
    shortDesc: 'একটু একা থেকে শান্ত হতে চাই',
  },
  {
    id: 'need_talk',
    emoji: '💬',
    name: 'কথা বলতে চাই',
    shortDesc: 'বসে ঠান্ডা মাথায় বোঝাপড়া করা দরকার',
  },
];

export interface NudgeOption {
  id: string;
  emoji: string;
  text: string;
  subtext: string;
}

export const QUICK_NUDGES: NudgeOption[] = [
  { id: 'miss_you', emoji: '🥺', text: 'মিস করছি', subtext: 'তোমাকে খুব মিস করছি' },
  { id: 'love_you', emoji: '💖', text: 'ভালোবাসি', subtext: 'অনেক অনেক ভালোবাসি' },
  { id: 'hug', emoji: '🫂', text: 'একটু আদর', subtext: 'উষ্ণ আদর ও জড়িয়ে থাকা' },
  { id: 'talk', emoji: '💬', text: 'কথা বলো না', subtext: 'একটু কথা বলো প্লিজ' },
  { id: 'thinking', emoji: '☕', text: 'কী করছো?', subtext: 'তোমার কথাই ভাবছি' },
  { id: 'kiss', emoji: '😘', text: 'উম্মাহ', subtext: 'মিষ্টি চুমু' },
];

export const STRINGS_BN = {
  appName: 'মুডসিঙ্ক',
  appTagline: 'মুড লুকানোর জন্য নয়। মুড বোঝার জন্য। ❤️',
  
  // Navigation Tabs
  tabs: {
    now: 'এখন',
    today: 'আজ',
    week: 'এই সপ্তাহ',
    settings: 'সেটিংস',
  },

  // Connection status
  status: {
    connected: 'সংযুক্ত',
    offline: 'অফলাইন',
    syncing: 'সিঙ্ক হচ্ছে...',
    onlineNow: 'এখন অনলাইন',
    lastSeen: 'শেষ দেখা',
  },

  // Home / Now Screen
  nowScreen: {
    you: 'তুমি',
    partner: 'ওর এখনকার মুড',
    noMoodYet: 'এখনো মুড জানানো হয়নি',
    tapToShare: 'কেমন অনুভব করছো বলো...',
    updateMoodBtn: 'আমার মুড বদলাও',
    fightBtn: 'কিছু একটা হয়েছে',
    todayUpdatesPrefix: 'আজকের আপডেট',
    noUpdatesToday: 'আজ এখনো কোনো আপডেট নেই',
    whatNeeded: 'যা প্রয়োজন:',
    closenessMood: 'কাছাকাছি অনুভূতি:',
    noteLabel: 'চিরকুট:',
  },

  // Question Flow
  questionFlow: {
    step1Title: 'এখন কেমন লাগছে?',
    step1Subtitle: 'যে কোনো একটি বেছে নাও',
    step2Title: 'এই মুহূর্তে তোমার কী দরকার?',
    step2Subtitle: 'ঐচ্ছিক — চাইলে এড়িয়ে যেতে পারো',
    step3Title: 'আজ একটু closeness-এর mood কেমন?',
    step3Subtitle: 'ঐচ্ছিক — তোমার মনের অনুভূতি',
    step4Title: 'কিছু বলতে চাও?',
    step4Subtitle: 'একটি ছোট চিরকুট লিখতে পারো (ঐচ্ছিক)',
    step4Placeholder: 'যেমন: আজকে অফিসে একটু ব্যস্ততা ছিল...',
    skip: 'এগিয়ে যাও',
    save: 'মুড সংরক্ষণ করো',
    saving: 'সংরক্ষণ হচ্ছে...',
    next: 'পরবর্তী',
    back: 'আগের ধাপ',
  },

  // Difficult Moment Flow
  fightFlow: {
    title: 'কিছু একটা হয়েছে',
    subtitle: 'এখন ঠিক কী অনুভব করছো? শান্তভাবে জানিয়ে দাও।',
    notePlaceholder: 'কিছু বলতে চাইলে লিখতে পারো...',
    submitBtn: 'জানিয়ে দাও',
  },

  // Today Timeline Screen
  todayScreen: {
    title: 'আজকের টাইমলাইন',
    subtitle: 'সারাদিনের মনের পরিবর্তন',
    emptyTitle: 'আজ এখনো কোনো আপডেট নেই',
    emptyDesc: 'মুড আপডেট করলে এখানে সময়ের সাথে সাথে দেখাবে।',
  },

  // Weekly Screen
  weekScreen: {
    title: 'এই সপ্তাহের চিত্র',
    subtitle: 'গত ৭ দিনের অনুভূতিগুলোর এক শান্ত চোখবুলানো',
    summaryTitle: 'অনুভূতির অনুপাত',
    daysCountSuffix: 'দিন',
    calmMessage: 'প্রতিটি অনুভূতিই স্বাভাবিক। পরস্পরকে সময় ও বোঝাপড়া দাও। ❤️',
    noDataWeek: 'এই সপ্তাহের পর্যাপ্ত তথ্য এখনো জমা হয়নি।',
  },

  // Settings Screen
  settingsScreen: {
    title: 'সেটিংস',
    profileSection: 'প্রোফাইল',
    yourName: 'তোমার নাম',
    namePlaceholder: 'তোমার নাম লেখো',
    saveName: 'সংরক্ষণ করো',
    partnerSection: 'সঙ্গীর সাথে সংযোগ',
    partnerConnected: 'তোমরা সংযুক্ত আছো ❤️',
    waitingPartner: 'সঙ্গীর জন্য অপেক্ষা করা হচ্ছে...',
    shareCodeNotice: 'তোমার সঙ্গীকে এই কোডটি দিয়ে অ্যাপে যুক্ত হতে বলো:',
    copyCode: 'কোড কপি করো',
    codeCopied: 'কপি করা হয়েছে!',
    retentionSection: 'ডাটা সংরক্ষণ সময়কাল',
    retentionDesc: 'কতদিন আগের টাইমলাইন স্বয়ংক্রিয়ভাবে মুছে যাবে?',
    days7: '৭ দিন',
    days14: '১৪ দিন',
    days30: '৩০ দিন (ডিফল্ট)',
    notificationsSection: 'নোটিফিকেশন (Web Push)',
    notificationsDesc: 'সঙ্গী মুড আপডেট করলে নোটিফিকেশন পেতে চাও?',
    enablePush: 'নোটিফিকেশন চালু করো',
    pushEnabled: 'নোটিফিকেশন সক্রিয় আছে',
    pushNotSupported: 'এই ব্রাউজারে পুশ নোটিফিকেশন সমর্থিত নয়',
    privacySection: 'প্রাইভেসি ও ডাটা অধিকার',
    privacyGuarantee: 'কোনো গোপন ট্র্যাকিং, লোকেশন বা থার্ড-পার্টি সার্ভিস নেই।',
    exportData: 'আমার সব ডাটা ডাউনলোড করো (JSON)',
    deleteHistory: 'ইতিহাস মুছে ফেলো',
    confirmDeleteHistory: 'তুমি কি নিশ্চিত যে সব টাইমলাইন মুছে ফেলতে চাও? এটি ফিরিয়ে আনা যাবে না।',
    signOut: 'লগআউট',
  },

  // Onboarding
  onboarding: {
    step1Title: 'আমাদের মুড',
    step1Desc: 'দুজনের মনের খবর একটু সহজভাবে জানার জন্য একটি নিভৃত স্থান।',
    step2Title: 'কীভাবে কাজ করে?',
    step2Desc1: 'তুমি তোমার মুড আপডেট করবে।',
    step2Desc2: 'তোমার সঙ্গী সেটা সঙ্গে সঙ্গে দেখতে পারবে।',
    step2Desc3: 'তুমিও তার আপডেট সাথে সাথে দেখবে—বারবার জিজ্ঞেস করার প্রয়োজন নেই।',
    step3Title: 'নিরাপত্তা ও প্রাইভেসি',
    step3Desc1: 'অ্যাপ শুধু তুমি যা স্বেচ্ছায় শেয়ার করবে সেটাই জানবে।',
    step3Desc2: 'কোনো লোকেশন ট্র্যাকিং নেই, কোনো গোপন নজরদারি নেই।',
    step3Desc3: 'সম্পূর্ণ এনক্রিপ্ট করা ও কেবল তোমাদের দুজনের মাঝেই সীমাবদ্ধ।',
    startBtn: 'শুরু করি ❤️',
    nextBtn: 'পরবর্তী',
  },

  // Pairing Screen
  pairing: {
    title: 'দুজনে যুক্ত হও',
    subtitle: 'অ্যাপটি কেবল দুজনের জন্য। একটি কোড তৈরি করো অথবা তোমার সঙ্গীর কোড দাও।',
    createTitle: 'নতুন কোড তৈরি করো',
    createBtn: 'কোড তৈরি করো',
    or: 'অথবা',
    joinTitle: 'কোড দিয়ে যুক্ত হও',
    codePlaceholder: '৬ অক্ষরের কোড (যেমন: K7M4Q9)',
    joinBtn: 'যুক্ত হও',
    joining: 'যুক্ত হচ্ছি...',
    codeInvalid: 'সঠিক ৬ অক্ষরের কোড লিখুন।',
  },

  // Errors
  errors: {
    generic: 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করছি...',
    network: 'ইন্টারনেট সংযোগ পাওয়া যাচ্ছে না। অফলাইনে সংরক্ষিত হচ্ছে।',
    authFailed: 'লগইন ব্যর্থ হয়েছে। ইমেইল বা পাসওয়ার্ড পরীক্ষা করুন।',
    codeExpired: 'আমন্ত্রণ কোডটির মেয়াদ শেষ হয়ে গেছে বা এটি ভুল।',
    coupleFull: 'এই কাপলে ইতোমধ্যে ২ জন সদস্য যুক্ত আছেন।',
  }
};

export function toBengaliNumber(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .replace(/\d/g, (digit) => bnDigits[parseInt(digit, 10)]);
}

export function formatTimeAgoBengali(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'এইমাত্র';
  }
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) {
    return `${toBengaliNumber(minutes)} মিনিট আগে`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${toBengaliNumber(hours)} ঘণ্টা আগে`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return 'গতকাল';
  }
  return `${toBengaliNumber(days)} দিন আগে`;
}

export function formatTimeBengali(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${toBengaliNumber(hours)}:${toBengaliNumber(minutes)}`;
}
