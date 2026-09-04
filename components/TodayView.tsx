'use client';

import { MoodEventWithDetails, Profile } from '@/lib/types';
import { MOODS, NEEDS, INTIMACY_MOODS, STRINGS_BN, formatTimeBengali } from '@/lib/constants/strings.bn';
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
  const getIntimacy = (id?: string | null) => (id ? INTIMACY_MOODS.find((i) => i.id === id) : null);

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          {STRINGS_BN.todayScreen.title}
        </h2>
        <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
          {STRINGS_BN.todayScreen.subtitle}
        </p>
      </div>

      {todayEvents.length === 0 ? (
        <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-stone-400 mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[var(--foreground)]">
            {STRINGS_BN.todayScreen.emptyTitle}
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 max-w-xs mx-auto">
            {STRINGS_BN.todayScreen.emptyDesc}
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-rose-200 dark:before:bg-rose-950">
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
                  className={`absolute -left-[27px] top-4 w-4 h-4 rounded-full border-2 border-[var(--background)] ${
                    isMe ? 'bg-teal-500' : 'bg-rose-500'
                  } ring-4 ring-[var(--card)]`}
                />

                {/* Timeline Card */}
                <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm transition-all hover:border-rose-200 dark:hover:border-rose-900">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--card-border)]/50 text-xs">
                    <span
                      className={`font-semibold ${
                        isMe ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {author}
                    </span>
                    <span className="text-stone-600 dark:text-stone-300 font-medium">
                      {formatTimeBengali(event.created_at)}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-start gap-3">
                    <div className="text-3xl select-none">{mood?.emoji || '🤍'}</div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-[var(--foreground)]">
                        {mood?.name || 'মুড'}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {mood?.shortDesc}
                      </p>

                      {/* Needs & intimacy if present */}
                      {(need || (intimacy && intimacy.id !== 'prefer_not_to_say')) && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {need && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[11px] font-medium text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50">
                              <span>{need.emoji}</span>
                              <span>{need.name}</span>
                            </span>
                          )}
                          {intimacy && intimacy.id !== 'prefer_not_to_say' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[11px] font-medium text-rose-800 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50">
                              <span>{intimacy.emoji}</span>
                              <span>{intimacy.name}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Note */}
                      {event.note && (
                        <div className="mt-2 text-xs bg-stone-50 dark:bg-stone-900/60 p-2.5 rounded-xl text-stone-700 dark:text-stone-300 italic flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          <span>“{event.note}”</span>
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
