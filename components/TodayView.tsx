'use client';

import { MoodEventWithDetails, Profile } from '@/lib/types';
import {
  MOODS,
  NEEDS,
  INTIMACY_MOODS,
  STRINGS_BN,
  formatTimeBengali,
} from '@/lib/constants/strings.bn';
import { Calendar, MessageSquare } from 'lucide-react';

interface TodayViewProps {
  events: MoodEventWithDetails[];
  partnerProfile: Profile | null;
}

export default function TodayView({ events, partnerProfile }: TodayViewProps) {
  // Filter events for today (local calendar date)
  const today = new Date().toDateString();
  const todayEvents = events.filter((e) => new Date(e.created_at).toDateString() === today);

  const getMood = (id: string) => MOODS.find((m) => m.id === id);
  const getNeed = (id?: string | null) => (id ? NEEDS.find((n) => n.id === id) : null);
  const getIntimacy = (id?: string | null) =>
    id ? INTIMACY_MOODS.find((i) => i.id === id) : null;

  return (
    <div className="space-y-3 pb-20 pt-1">
      {/* Header */}
      <div className="px-1 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {STRINGS_BN.todayScreen.title}
          </h2>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            {STRINGS_BN.todayScreen.subtitle}
          </p>
        </div>
        {todayEvents.length > 0 && (
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-800/40">
            {todayEvents.length}টি আপডেট
          </span>
        )}
      </div>

      {todayEvents.length === 0 ? (
        <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center shadow-2xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-stone-400 mb-2">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            {STRINGS_BN.todayScreen.emptyTitle}
          </h3>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 max-w-xs mx-auto">
            {STRINGS_BN.todayScreen.emptyDesc}
          </p>
        </div>
      ) : (
        <div className="relative pl-5 space-y-2.5 before:absolute before:left-2 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-rose-200 dark:before:bg-rose-950">
          {todayEvents.map((event, idx) => {
            const mood = getMood(event.mood_id);
            const need = getNeed(event.need_id);
            const intimacy = getIntimacy(event.intimacy_mood_id);
            const isMe = event.isCurrentUser;
            const author = isMe ? STRINGS_BN.nowScreen.you : (partnerProfile?.name || 'সঙ্গী');

            return (
              <div key={event.id || idx} className="relative group">
                {/* Bullet point on vertical line */}
                <div
                  className={`absolute -left-[23px] top-3.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--background)] ${
                    isMe ? 'bg-teal-500' : 'bg-rose-500'
                  } ring-2 ring-[var(--card)]`}
                />

                {/* Timeline Card */}
                <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-2xs transition-all hover:border-rose-200 dark:hover:border-rose-900">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[var(--card-border)]/50 text-[11px]">
                    <span
                      className={`font-bold flex items-center gap-1.5 ${
                        isMe ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      <span>{author}</span>
                      {event.isOfflinePending && (
                        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-200/80 dark:border-amber-800/60">
                          ⏳ সিঙ্ক বাকি
                        </span>
                      )}
                    </span>
                    <span className="text-stone-500 dark:text-stone-400 font-medium">
                      {formatTimeBengali(event.created_at)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-start gap-2.5">
                    <div className="text-2xl select-none leading-none shrink-0">
                      {mood?.emoji || '🤍'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <h4 className="text-sm font-bold text-[var(--foreground)] truncate">
                          {mood?.name || 'মুড'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
                        {mood?.shortDesc}
                      </p>

                      {/* Needs & intimacy if present */}
                      {(need || (intimacy && intimacy.id !== 'prefer_not_to_say')) && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {need && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[10px] font-medium text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50">
                              <span>{need.emoji}</span>
                              <span>{need.name}</span>
                            </span>
                          )}
                          {intimacy && intimacy.id !== 'prefer_not_to_say' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[10px] font-medium text-rose-800 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50">
                              <span>{intimacy.emoji}</span>
                              <span>{intimacy.name}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Note */}
                      {event.note && (
                        <div className="mt-1.5 text-[11px] bg-stone-50 dark:bg-stone-900/60 p-2 rounded-xl text-stone-700 dark:text-stone-300 italic flex items-start gap-1">
                          <MessageSquare className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">“{event.note}”</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
