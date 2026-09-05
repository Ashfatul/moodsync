'use client';

import { AlertCircle, Sparkles, MessageCircleHeart, Heart } from 'lucide-react';
import { MoodEventWithDetails, Profile } from '@/lib/types';
import { MOODS, NEEDS, INTIMACY_MOODS, STRINGS_BN, formatTimeAgoBengali, toBengaliNumber } from '@/lib/constants/strings.bn';

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
  const getIntimacyDef = (intimacyId?: string | null) => INTIMACY_MOODS.find((i) => i.id === intimacyId);

  const partnerMoodDef = getMoodDef(partnerMood?.mood_id);
  const partnerNeedDef = getNeedDef(partnerMood?.need_id);
  const partnerIntimacyDef = getIntimacyDef(partnerMood?.intimacy_mood_id);

  const myMoodDef = getMoodDef(myMood?.mood_id);
  const myNeedDef = getNeedDef(myMood?.need_id);
  const myIntimacyDef = getIntimacyDef(myMood?.intimacy_mood_id);

  const partnerDisplayName = partnerProfile?.name || 'সঙ্গী';

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Partner Current Mood Card */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm mood-transition">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)]/60">
          <span className="text-xs uppercase tracking-wider font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {partnerDisplayName}-র এখনকার মুড
          </span>
          {partnerMood && (
            <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">
              {formatTimeAgoBengali(partnerMood.created_at)}
            </span>
          )}
        </div>

        {partnerMood && partnerMoodDef ? (
          <div className="pt-5 text-center">
            {/* Big Emoji */}
            <div className="inline-block transition-transform duration-300 hover:scale-110 active:scale-95 text-6xl md:text-7xl mb-3 drop-shadow-sm select-none animate-in fade-in zoom-in-95 duration-500">
              {partnerMoodDef.emoji}
            </div>

            {/* Mood Name */}
            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
              {partnerMoodDef.name}
            </h2>

            {/* Short Description */}
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-300 font-normal max-w-xs mx-auto leading-relaxed">
              {partnerMoodDef.shortDesc}
            </p>

            {/* Need & Intimacy Badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {partnerNeedDef && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-medium text-amber-800 dark:text-amber-200">
                  <span>{partnerNeedDef.emoji}</span>
                  <span>{partnerNeedDef.name}</span>
                </div>
              )}
              {partnerIntimacyDef && partnerIntimacyDef.id !== 'prefer_not_to_say' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs font-medium text-rose-800 dark:text-rose-200">
                  <span>{partnerIntimacyDef.emoji}</span>
                  <span>{partnerIntimacyDef.name}</span>
                </div>
              )}
            </div>

            {/* Optional Note */}
            {partnerMood.note && (
              <div className="mt-4 p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-left">
                <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold mb-1 flex items-center gap-1">
                  <MessageCircleHeart className="w-3.5 h-3.5 text-rose-400" />
                  {STRINGS_BN.nowScreen.noteLabel}
                </p>
                <p className="text-sm text-stone-700 dark:text-stone-200 italic leading-relaxed">
                  “{partnerMood.note}”
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-2xl mb-3">
              🍃
            </div>
            <p className="text-stone-600 dark:text-stone-300 text-sm font-medium">
              {STRINGS_BN.nowScreen.noMoodYet}
            </p>
            <p className="text-stone-600 dark:text-stone-300 text-xs mt-1">
              সঙ্গী যখনই মুড জানাবে, এখানে সাথে সাথে দেখাবে।
            </p>
          </div>
        )}
      </section>

      {/* Your Current Mood Card */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm mood-transition">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--card-border)]/60">
          <span className="text-xs uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            {STRINGS_BN.nowScreen.you}
          </span>
          {myMood && (
            <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">
              {formatTimeAgoBengali(myMood.created_at)}
            </span>
          )}
        </div>

        {myMood && myMoodDef ? (
          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="text-4xl select-none">{myMoodDef.emoji}</div>
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">{myMoodDef.name}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                  {myMoodDef.shortDesc}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {myNeedDef && (
                    <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                      {myNeedDef.emoji} {myNeedDef.name}
                    </span>
                  )}
                  {myIntimacyDef && myIntimacyDef.id !== 'prefer_not_to_say' && (
                    <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                      {myIntimacyDef.emoji} {myIntimacyDef.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-stone-600 dark:text-stone-300 text-sm">
              তুমি এখনো তোমার মুড জানাওনি
            </p>
          </div>
        )}
      </section>

      {/* Quick Miss You & Love You Nudge Section */}
      <section className="rounded-3xl border border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-r from-rose-50/70 via-pink-50/40 to-rose-50/70 dark:from-rose-950/20 dark:via-pink-950/10 dark:to-rose-950/20 p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-200">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
            <span>কুইক পিং ও মিস ইউ</span>
          </div>
          <button
            type="button"
            onClick={onOpenNudgeModal}
            className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 transition-all active:scale-95 px-2 py-0.5 rounded-full bg-white/70 dark:bg-stone-800/60 border border-rose-200/60 dark:border-rose-800/40 shadow-2xs"
          >
            <span>মিস ইউ বোম্ব 💣</span>
          </button>
        </div>

        {/* 1-Tap Quick Action Chips */}
        <div className="grid grid-cols-4 gap-2">
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
              className="py-2.5 px-1 rounded-2xl bg-white/90 dark:bg-stone-900/80 border border-rose-200/70 dark:border-rose-900/50 hover:border-rose-400 dark:hover:border-rose-600 active:scale-90 transition-all text-center shadow-xs"
              title={`১ চাপে "${chip.text}" পাঠাও`}
            >
              <div className="text-xl select-none">{chip.emoji}</div>
              <div className="text-[10px] font-bold text-rose-900 dark:text-rose-200 truncate mt-0.5">
                {chip.text}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1">
        {/* Main Mood Update Button */}
        <button
          onClick={onOpenMoodModal}
          className="w-full py-4 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-semibold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 min-h-[52px]"
        >
          <Sparkles className="w-5 h-5 text-rose-100" />
          <span>{STRINGS_BN.nowScreen.updateMoodBtn}</span>
        </button>

        {/* Difficult moment button */}
        <button
          onClick={onOpenFightModal}
          className="w-full py-3 px-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-[var(--card)] hover:bg-stone-50 dark:hover:bg-stone-900 active:scale-[0.98] text-stone-700 dark:text-stone-300 font-medium text-sm transition-all flex items-center justify-center gap-2 min-h-[48px]"
        >
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>{STRINGS_BN.nowScreen.fightBtn}</span>
        </button>
      </div>

      {/* Today's Update Counter */}
      <div className="pt-2 text-center">
        <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
          {STRINGS_BN.nowScreen.todayUpdatesPrefix}:{' '}
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {toBengaliNumber(todayCount)}টি
          </span>
        </p>
      </div>
    </div>
  );
}
