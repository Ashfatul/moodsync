import content from '@/config/content.json';
import { QuickMessagePayload } from '@/lib/types';

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

export interface NudgeOption {
  id: string;
  emoji: string;
  text: string;
  subtext: string;
}

export const MOODS: MoodItem[] = content.moods;
export const NEEDS: NeedItem[] = content.needs;
export const INTIMACY_MOODS: IntimacyItem[] = content.intimacyMoods;
export const FIGHT_MOMENTS: FightItem[] = content.fightMoments;
export const QUICK_NUDGES: NudgeOption[] = content.quickNudges;

export const STRINGS_BN = {
  appName: content.appName,
  appTagline: content.appTagline,
  ...content.ui,
};

export const CONTENT = content;

export const DEFAULT_GHOST_APP_URL =
  'https://ghost-message-13rh.onrender.com/room/17cdveb7qndie4eq#BhIhu3h3Zy489uDfkuiCyYEbXKeFDBBiDupYhrLxKQI';

export function isQuickMessage(event: { mood_id?: string | null; note?: string | null }): boolean {
  if (event.mood_id) return false;
  if (!event.note) return false;
  try {
    const parsed = JSON.parse(event.note);
    return Boolean(parsed && parsed.type === 'quick_message');
  } catch {
    return false;
  }
}

export function parseQuickMessage(event: { note?: string | null }): QuickMessagePayload | null {
  if (!event.note) return null;
  try {
    const parsed = JSON.parse(event.note);
    if (parsed && parsed.type === 'quick_message') {
      return {
        type: 'quick_message',
        emoji: parsed.emoji || '❤️',
        text: parsed.text || 'মেসেজ',
        count: typeof parsed.count === 'number' ? parsed.count : 1,
        customMessage: parsed.customMessage || null,
        url: parsed.url || null,
      };
    }
  } catch {}
  return null;
}

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

const BN_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const BN_DAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];

export function formatDateBengali(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `আজ, ${toBengaliNumber(date.getDate())} ${BN_MONTHS[date.getMonth()]}`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `গতকাল, ${toBengaliNumber(date.getDate())} ${BN_MONTHS[date.getMonth()]}`;
  }

  const dayName = BN_DAYS[date.getDay()];
  const day = toBengaliNumber(date.getDate());
  const month = BN_MONTHS[date.getMonth()];
  const year = toBengaliNumber(date.getFullYear());

  return `${dayName}, ${day} ${month} ${year}`;
}

