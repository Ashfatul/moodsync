import content from '@/config/content.json';

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
