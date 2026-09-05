'use client';

import { Heart, WifiOff, RefreshCw } from 'lucide-react';
import { STRINGS_BN, MOODS } from '@/lib/constants/strings.bn';
import { UserPresenceState, MoodEventWithDetails } from '@/lib/types';

interface HeaderProps {
  isOnline: boolean;
  isSyncing: boolean;
  partnerPresence: UserPresenceState | null;
  partnerName?: string;
  partnerMood?: MoodEventWithDetails | null;
  myMood?: MoodEventWithDetails | null;
  onOpenMoodModal?: () => void;
}

export default function Header({
  isOnline,
  isSyncing,
  partnerPresence,
  partnerName,
  partnerMood,
  myMood,
  onOpenMoodModal,
}: HeaderProps) {
  const getMoodEmoji = (moodId?: string | null) => {
    if (!moodId) return null;
    const mood = MOODS.find((m) => m.id === moodId);
    return mood?.emoji || null;
  };

  const myEmoji = getMoodEmoji(myMood?.mood_id);
  const partnerEmoji = getMoodEmoji(partnerMood?.mood_id);
  const partnerDisplayName = partnerName || 'সঙ্গী';

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[var(--background)]/90 border-b border-[var(--card-border)] px-3 py-2 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500 shadow-2xs">
            <Heart className="w-3.5 h-3.5 fill-rose-500 stroke-rose-500 animate-pulse" />
          </div>
          <span className="text-sm font-bold tracking-tight text-[var(--foreground)] hidden xs:inline">
            {STRINGS_BN.appName}
          </span>
        </div>

        {/* Dual Quick Shortcut Mood Indicator */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--card)] border border-[var(--card-border)] shadow-2xs text-xs">
          {/* My Mood Pill (clickable to update) */}
          <button
            type="button"
            onClick={onOpenMoodModal}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition-all text-xs font-medium text-stone-700 dark:text-stone-300"
            title="তোমার মুড আপডেট করো"
          >
            <span className="text-sm leading-none select-none">{myEmoji || '✍️'}</span>
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
              তুমি
            </span>
          </button>

          <span className="text-stone-300 dark:text-stone-700 text-xs select-none">|</span>

          {/* Partner Mood Pill */}
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium text-stone-700 dark:text-stone-300"
            title={`${partnerDisplayName}-র এখনকার মুড`}
          >
            <span className="text-sm leading-none select-none">{partnerEmoji || '🍃'}</span>
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 max-w-[65px] truncate">
              {partnerDisplayName}
            </span>
            {partnerPresence && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" title="অনলাইন" />
            )}
          </div>
        </div>

        {/* Mini Connection Status */}
        <div className="flex items-center gap-1 shrink-0">
          {!isOnline ? (
            <div
              className="p-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
              title={STRINGS_BN.status.offline}
            >
              <WifiOff className="w-3.5 h-3.5" />
            </div>
          ) : isSyncing ? (
            <div
              className="p-1 rounded-full text-blue-600 dark:text-blue-400 animate-spin"
              title={STRINGS_BN.status.syncing}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div
              className="w-2 h-2 rounded-full bg-emerald-500"
              title={STRINGS_BN.status.connected}
            />
          )}
        </div>
      </div>
    </header>
  );
}
