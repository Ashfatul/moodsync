'use client';

import { useMemo } from 'react';
import { MoodEventWithDetails } from '@/lib/types';
import { MOODS, STRINGS_BN, toBengaliNumber } from '@/lib/constants/strings.bn';
import { Heart } from 'lucide-react';

interface WeekViewProps {
  events: MoodEventWithDetails[];
}

export default function WeekView({ events }: WeekViewProps) {
  // Compute last 7 days summary
  const { dayCards, moodCounts } = useMemo(() => {
    const daysNameBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];
    const now = new Date();
    const cards = [];

    // Group events for last 7 days
    const eventsLast7Days = events.filter((e) => {
      const diffMs = now.getTime() - new Date(e.created_at).getTime();
      return diffMs <= 7 * 24 * 60 * 60 * 1000;
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toDateString();
      const dayName = daysNameBn[d.getDay()];

      const dayEvents = eventsLast7Days.filter(
        (e) => new Date(e.created_at).toDateString() === dateStr
      );

      // Find the most frequent or latest mood for that day
      let dominantEmoji = '—';
      if (dayEvents.length > 0) {
        const latestMoodId = dayEvents[0].mood_id;
        const moodDef = MOODS.find((m) => m.id === latestMoodId);
        if (moodDef) dominantEmoji = moodDef.emoji;
      }

      cards.push({
        dayName,
        date: d.getDate(),
        emoji: dominantEmoji,
        isToday: i === 0,
        hasEvents: dayEvents.length > 0,
      });
    }

    // Count frequency of moods in the last 7 days
    const countsMap: Record<string, number> = {};
    eventsLast7Days.forEach((e) => {
      countsMap[e.mood_id] = (countsMap[e.mood_id] || 0) + 1;
    });

    const sortedCounts = Object.entries(countsMap)
      .map(([moodId, count]) => {
        const mood = MOODS.find((m) => m.id === moodId);
        return {
          moodId,
          emoji: mood?.emoji || '🤍',
          name: mood?.name || 'অন্যান্য',
          count,
        };
      })
      .sort((a, b) => b.count - a.count);

    return { dayCards: cards, moodCounts: sortedCounts };
  }, [events]);

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          {STRINGS_BN.weekScreen.title}
        </h2>
        <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
          {STRINGS_BN.weekScreen.subtitle}
        </p>
      </div>

      {/* 7-Day Horizontal Strip */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {dayCards.map((card, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
                card.isToday
                  ? 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800'
                  : 'bg-stone-50/70 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800/50'
              }`}
            >
              <span
                className={`text-[11px] font-medium ${
                  card.isToday
                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-stone-500 dark:text-stone-400'
                }`}
              >
                {card.dayName}
              </span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                {toBengaliNumber(card.date)}
              </span>
              <div className="mt-1.5 text-2xl select-none min-h-[32px] flex items-center justify-center">
                {card.emoji}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summary Proportions */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          {STRINGS_BN.weekScreen.summaryTitle}
        </h3>

        {moodCounts.length === 0 ? (
          <p className="text-xs text-stone-600 dark:text-stone-300 py-4 text-center">
            {STRINGS_BN.weekScreen.noDataWeek}
          </p>
        ) : (
          <div className="space-y-2">
            {moodCounts.map((item) => (
              <div
                key={item.moodId}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl select-none">{item.emoji}</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {item.name}
                  </span>
                </div>
                <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {toBengaliNumber(item.count)} বার
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-[var(--card-border)]/70 text-center">
          <p className="text-xs text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
            {STRINGS_BN.weekScreen.calmMessage}
          </p>
        </div>
      </section>
    </div>
  );
}
