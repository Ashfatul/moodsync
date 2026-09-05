'use client';

import { AlertCircle, Sparkles, MessageCircleHeart, Heart } from 'lucide-react';
import { MoodEventWithDetails, Profile } from '@/lib/types';
import {
  MOODS,
  NEEDS,
  INTIMACY_MOODS,
  STRINGS_BN,
  formatTimeAgoBengali,
  toBengaliNumber,
} from '@/lib/constants/strings.bn';

interface NowViewProps {
  partnerMood: MoodEventWithDetails | null;
  myMood: MoodEventWithDetails | null;
  partnerProfile: Profile | null;
  todayCount: number;
  onOpenMoodModal: () => void;
  onOpenFightModal: () => void;
  onOpenNudgeModal: () => void;
  onQuickNudge: (emoji: string, text: string) => void;
}

export default function NowView({
  partnerMood,
  myMood,
  partnerProfile,
  todayCount,
  onOpenMoodModal,
  onOpenFightModal,
  onOpenNudgeModal,
  onQuickNudge,
}: NowViewProps) {
  const getMoodDef = (moodId?: string | null) => MOODS.find((m) => m.id === moodId);
  const getNeedDef = (needId?: string | null) => NEEDS.find((n) => n.id === needId);
  const getIntimacyDef = (intimacyId?: string | null) =>
    INTIMACY_MOODS.find((i) => i.id === intimacyId);

  const partnerMoodDef = getMoodDef(partnerMood?.mood_id);
  const partnerNeedDef = getNeedDef(partnerMood?.need_id);
  const partnerIntimacyDef = getIntimacyDef(partnerMood?.intimacy_mood_id);

  const myMoodDef = getMoodDef(myMood?.mood_id);
  const myNeedDef = getNeedDef(myMood?.need_id);
  const myIntimacyDef = getIntimacyDef(myMood?.intimacy_mood_id);

  const partnerDisplayName = partnerProfile?.name || 'সঙ্গী';

  return (
    <div className="space-y-2.5 pb-20 pt-1">
      {/* 1. Partner Current Mood Card (Hero) */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-5 shadow-sm mood-transition">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--card-border)]/60 text-xs">
          <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            {partnerDisplayName}-র এখনকার মুড
          </span>
          {partnerMood && (
            <span className="text-stone-500 dark:text-stone-400 font-medium">
              {formatTimeAgoBengali(partnerMood.created_at)}
            </span>
          )}
        </div>

        {partnerMood && partnerMoodDef ? (
          <div className="pt-3 text-center">
            {/* Main Animated Emoji */}
            <div className="inline-block transition-transform duration-300 hover:scale-110 active:scale-95 text-5xl sm:text-6xl mb-1.5 drop-shadow-xs select-none animate-in fade-in zoom-in-95 duration-300">
              {partnerMoodDef.emoji}
            </div>

            {/* Mood Name */}
            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
              {partnerMoodDef.name}
            </h2>

            {/* Short Description */}
            <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-300 font-normal max-w-xs mx-auto leading-relaxed line-clamp-2">
              {partnerMoodDef.shortDesc}
            </p>

            {/* Need & Intimacy Badges */}
            {(partnerNeedDef || (partnerIntimacyDef && partnerIntimacyDef.id !== 'prefer_not_to_say')) && (
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
                {partnerNeedDef && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] font-medium text-amber-800 dark:text-amber-200">
                    <span>{partnerNeedDef.emoji}</span>
                    <span>{partnerNeedDef.name}</span>
                  </div>
                )}
                {partnerIntimacyDef && partnerIntimacyDef.id !== 'prefer_not_to_say' && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-[11px] font-medium text-rose-800 dark:text-rose-200">
                    <span>{partnerIntimacyDef.emoji}</span>
                    <span>{partnerIntimacyDef.name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Optional Note */}
            {partnerMood.note && (
              <div className="mt-2.5 p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-left">
                <p className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold mb-0.5 flex items-center gap-1">
                  <MessageCircleHeart className="w-3 h-3 text-rose-400" />
                  {STRINGS_BN.nowScreen.noteLabel}
                </p>
                <p className="text-xs text-stone-700 dark:text-stone-200 italic leading-relaxed line-clamp-3">
                  “{partnerMood.note}”
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-xl mb-2">
              🍃
            </div>
            <p className="text-stone-700 dark:text-stone-200 text-xs font-semibold">
              {STRINGS_BN.nowScreen.noMoodYet}
            </p>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">
              সঙ্গী যখনই মুড জানাবে, এখানে সাথে সাথে দেখতে পাবে।
            </p>
          </div>
        )}
      </section>

      {/* 2. Quick Miss You & Love You Nudge Section */}
      <section className="rounded-3xl border border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-r from-rose-50/70 via-pink-50/40 to-rose-50/70 dark:from-rose-950/20 dark:via-pink-950/10 dark:to-rose-950/20 p-3 shadow-2xs space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1 text-xs font-bold text-rose-800 dark:text-rose-200">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
            <span>কুইক পিং</span>
          </div>
          <button
            type="button"
            onClick={onOpenNudgeModal}
            className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 transition-all active:scale-95 px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-stone-800/80 border border-rose-200 dark:border-rose-800/50 shadow-2xs"
          >
            <span>মিস ইউ বোম্ব 💣</span>
          </button>
        </div>

        {/* 1-Tap Quick Action Chips */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { emoji: '🥺', text: 'মিস করছি' },
            { emoji: '💖', text: 'ভালোবাসি' },
            { emoji: '🫂', text: 'একটু আদর' },
            { emoji: '💬', text: 'কথা বলো' },
          ].map((chip) => (
            <button
              key={chip.text}
              type="button"
              onClick={() => onQuickNudge(chip.emoji, chip.text)}
              className="py-2 px-1 rounded-2xl bg-white/90 dark:bg-stone-900/80 border border-rose-200/70 dark:border-rose-900/50 hover:border-rose-400 dark:hover:border-rose-600 active:scale-90 transition-all text-center shadow-2xs"
              title={`১ চাপে "${chip.text}" পাঠাও`}
            >
              <div className="text-lg select-none">{chip.emoji}</div>
              <div className="text-[10px] font-bold text-rose-900 dark:text-rose-200 truncate mt-0.5">
                {chip.text}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Your Current Status & Instant Mood Update Bar (Compact UX) */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-2xs space-y-2">
        {/* Compact Mood Status Row */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
              {STRINGS_BN.nowScreen.you}:
            </span>
            {myMood && myMoodDef ? (
              <span className="font-medium text-[var(--foreground)] truncate">
                {myMoodDef.emoji} {myMoodDef.name}
              </span>
            ) : (
              <span className="text-stone-400 dark:text-stone-500 italic">
                এখনো জানানো হয়নি
              </span>
            )}
            {myMood && (
              <span className="text-[10px] text-stone-400 dark:text-stone-500 shrink-0">
                ({formatTimeAgoBengali(myMood.created_at)})
              </span>
            )}
          </div>

          {/* Any Need badge if set */}
          {myNeedDef && (
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 shrink-0 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/40">
              {myNeedDef.emoji} {myNeedDef.name}
            </span>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 pt-0.5">
          {/* Main Mood Update Button */}
          <button
            type="button"
            onClick={onOpenMoodModal}
            className="flex-1 py-3 px-3 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-rose-100" />
            <span>{STRINGS_BN.nowScreen.updateMoodBtn}</span>
          </button>

          {/* Difficult moment button */}
          <button
            type="button"
            onClick={onOpenFightModal}
            className="py-3 px-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-[var(--background)] hover:bg-stone-50 dark:hover:bg-stone-900 active:scale-[0.98] text-stone-700 dark:text-stone-300 font-semibold text-xs transition-all flex items-center justify-center gap-1 min-h-[44px] shrink-0"
            title="কিছু একটা হয়েছে?"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>কিছু হয়েছে?</span>
          </button>
        </div>
      </section>

      {/* 4. Subtle Counter Footer */}
      <div className="pt-0.5 text-center">
        <p className="text-[11px] text-stone-400 dark:text-stone-500">
          {STRINGS_BN.nowScreen.todayUpdatesPrefix}:{' '}
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {toBengaliNumber(todayCount)}টি
          </span>
        </p>
      </div>
    </div>
  );
}
