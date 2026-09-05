'use client';

import { AlertCircle, Sparkles, MessageCircleHeart, Heart, MessageSquare, ExternalLink, ArrowRight } from 'lucide-react';
import { MoodEventWithDetails, Profile } from '@/lib/types';
import {
  MOODS,
  NEEDS,
  INTIMACY_MOODS,
  STRINGS_BN,
  DEFAULT_GHOST_APP_URL,
  formatTimeAgoBengali,
  toBengaliNumber,
} from '@/lib/constants/strings.bn';

interface NowViewProps {
  partnerMood: MoodEventWithDetails | null;
  myMood: MoodEventWithDetails | null;
  partnerProfile: Profile | null;
  todayCount: number;
  activeChatInvite?: {
    eventId: string;
    senderName: string;
    url: string;
    message: string;
    time: string;
  } | null;
  onOpenMoodModal: () => void;
  onOpenFightModal: () => void;
  onOpenNudgeModal: () => void;
  onOpenLetsTalk?: () => void;
  onOpenInAppChat?: (url: string) => void;
  onQuickNudge: (emoji: string, text: string) => void;
  onViewHistory?: () => void;
}

export default function NowView({
  partnerMood,
  myMood,
  partnerProfile,
  todayCount,
  activeChatInvite,
  onOpenMoodModal,
  onOpenFightModal,
  onOpenNudgeModal,
  onOpenLetsTalk,
  onOpenInAppChat,
  onQuickNudge,
  onViewHistory,
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

  const partnerDisplayName = partnerProfile?.name || STRINGS_BN.nowScreen.partner || 'সঙ্গী';

  return (
    <div className="space-y-2.5 pb-20 pt-1">
      {/* 0. Active Chat Invite from Partner (Requirement 5) */}
      {activeChatInvite && (
        <section className="relative overflow-hidden rounded-3xl border-2 border-violet-500 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-4 text-white shadow-lg animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shrink-0 animate-bounce">
                👻
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-bold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  চ্যাট ইনভাইটেশন
                </span>
                <h3 className="text-sm font-bold mt-0.5 leading-snug">
                  {activeChatInvite.senderName} কথা বলতে চাইছে! 💬
                </h3>
              </div>
            </div>
            <span className="text-[10px] text-violet-200 shrink-0">
              {formatTimeAgoBengali(activeChatInvite.time)}
            </span>
          </div>

          {activeChatInvite.message && (
            <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-black/20 text-xs text-violet-100 italic">
              “{activeChatInvite.message}”
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onOpenInAppChat) {
                  onOpenInAppChat(activeChatInvite.url || DEFAULT_GHOST_APP_URL);
                } else if (typeof window !== 'undefined') {
                  window.open(activeChatInvite.url || DEFAULT_GHOST_APP_URL, '_blank');
                }
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-violet-50 text-violet-900 font-extrabold text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
            >
              <span>👉 চ্যাটে জয়েন করো (Join Chat) 🚀</span>
            </button>
          </div>
        </section>
      )}

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
            <h2 className="text-xl font-bold text-[var(--foreground)] leading-snug">
              {partnerMoodDef.name}
            </h2>

            {/* Short Description */}
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-300 font-normal max-w-xs mx-auto leading-relaxed">
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
                <p className="text-xs text-stone-700 dark:text-stone-200 italic leading-relaxed break-words">
                  “{partnerMood.note}”
                </p>
              </div>
            )}

            {/* Contextual Let's Talk callout when partner needs talk or feels low */}
            {(partnerNeedDef?.id === 'talk' || ['sad', 'very_bad', 'angry', 'hurt'].includes(partnerMoodDef.id)) && onOpenLetsTalk && (
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={onOpenLetsTalk}
                  className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-violet-500/15 via-purple-500/15 to-violet-500/15 hover:from-violet-500/25 hover:to-purple-500/25 border border-violet-300/80 dark:border-violet-800/60 text-violet-900 dark:text-violet-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>💬</span>
                  <span>সঙ্গীর সাথে কথা বলবে? ঘোস্ট চ্যাট শুরু করো 👻</span>
                </button>
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
          <div className="flex items-center gap-1.5">
            {onViewHistory && (
              <button
                type="button"
                onClick={onViewHistory}
                className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-white flex items-center gap-1 transition-all active:scale-95 px-2.5 py-1 rounded-full bg-white/70 dark:bg-stone-800/70 border border-stone-200/60 dark:border-stone-700/60 shadow-2xs cursor-pointer"
                title="কুইক মেসেজ হিস্ট্রি"
              >
                <span>হিস্ট্রি 📜</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenNudgeModal}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 transition-all active:scale-95 px-2.5 py-1 rounded-full bg-white/80 dark:bg-stone-800/80 border border-rose-200 dark:border-rose-800/50 shadow-2xs cursor-pointer"
            >
              <span>মিস ইউ বোম্ব 💣</span>
            </button>
          </div>
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
              onClick={() => {
                if (chip.text === 'কথা বলো' && onOpenLetsTalk) {
                  onOpenLetsTalk();
                } else {
                  onQuickNudge(chip.emoji, chip.text);
                }
              }}
              className="py-2.5 px-1 rounded-2xl bg-white/90 dark:bg-stone-900/80 border border-rose-200/70 dark:border-rose-900/50 hover:border-rose-400 dark:hover:border-rose-600 active:scale-90 transition-all text-center shadow-2xs cursor-pointer"
              title={chip.text === 'কথা বলো' ? 'চলো কথা বলি (ঘোস্ট চ্যাট)' : `১ চাপে "${chip.text}" পাঠাও`}
            >
              <div className="text-xl select-none">{chip.emoji}</div>
              <div className="text-[10px] sm:text-[11px] font-bold text-rose-900 dark:text-rose-200 leading-normal mt-0.5 whitespace-nowrap">
                {chip.text}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 2.5 Dedicated Ghost Chat Card (Requirement 3: Fix small button with spacious card) */}
      <section className="rounded-3xl border border-violet-200/90 dark:border-violet-900/60 bg-gradient-to-r from-violet-50/80 via-purple-50/50 to-indigo-50/70 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-indigo-950/30 p-3.5 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-violet-200/80 dark:bg-violet-900/60 flex items-center justify-center text-xl shrink-0 shadow-2xs">
              👻
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-violet-950 dark:text-violet-100 flex items-center gap-1.5">
                <span>চলো কথা বলি</span>
                <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/50 px-2 py-0.5 rounded-full">
                  গোপন চ্যাট
                </span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight mt-0.5 truncate">
                এনক্রিপ্টেড • কোনো মেসেজ জমা থাকে না
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {onOpenLetsTalk && (
            <button
              type="button"
              onClick={onOpenLetsTalk}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-bold shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <span>আমন্ত্রণ পাঠাও 🚀</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onOpenInAppChat) {
                onOpenInAppChat(DEFAULT_GHOST_APP_URL);
              } else if (typeof window !== 'undefined') {
                window.open(DEFAULT_GHOST_APP_URL, '_blank');
              }
            }}
            className="py-2.5 px-3 rounded-2xl border border-violet-200 dark:border-violet-800/80 bg-white/90 dark:bg-stone-900/90 hover:bg-violet-50 dark:hover:bg-stone-800 text-violet-900 dark:text-violet-200 text-xs font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <span>সরাসরি চ্যাটে যাও 💬</span>
          </button>
        </div>
      </section>

      {/* 3. Your Current Status & Instant Mood Update Bar (Compact UX) */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-2xs space-y-2">
        {/* Compact Mood Status Row */}
        <div className="flex items-center justify-between px-1 text-xs gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 py-0.5">
            <span className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
              {STRINGS_BN.nowScreen.you}:
            </span>
            {myMood && myMoodDef ? (
              <span className="font-medium text-[var(--foreground)] truncate leading-normal">
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
                {myMood.isOfflinePending && (
                  <span className="ml-1 text-amber-600 dark:text-amber-400 font-semibold">
                    • ⏳ সিঙ্ক বাকি
                  </span>
                )}
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
