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
  const { dayCards, moodCounts, totalEvents } = useMemo(() => {
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

      // Find the latest mood for that day (skipping quick messages)
      let dominantEmoji = '—';
      const latestMoodEvt = dayEvents.find((e) => Boolean(e.mood_id));
      if (latestMoodEvt && latestMoodEvt.mood_id) {
        const moodDef = MOODS.find((m) => m.id === latestMoodEvt.mood_id);
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
      if (e.mood_id) {
        countsMap[e.mood_id] = (countsMap[e.mood_id] || 0) + 1;
      }
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

    return { dayCards: cards, moodCounts: sortedCounts, totalEvents: eventsLast7Days.length };
  }, [events]);

  return (
    <div className="space-y-3 pb-20 pt-1">
      {/* Header */}
      <div className="px-1 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {STRINGS_BN.weekScreen.title}
          </h2>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            {STRINGS_BN.weekScreen.subtitle}
          </p>
        </div>
        {totalEvents > 0 && (
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-800/40">
            {toBengaliNumber(totalEvents)}টি মুড রেকর্ড
          </span>
        )}
      </div>

      {/* 7-Day Horizontal Strip */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-2xs">
        <div className="grid grid-cols-7 gap-1 text-center">
          {dayCards.map((card, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all ${
                card.isToday
                  ? 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 ring-1 ring-rose-400'
                  : 'bg-stone-50/70 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800/50'
              }`}
            >
              <span
                className={`text-[10px] ${
                  card.isToday
                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-stone-500 dark:text-stone-400 font-medium'
                }`}
              >
                {card.dayName}
              </span>
              <span className="text-[9px] text-stone-400 dark:text-stone-500">
                {toBengaliNumber(card.date)}
              </span>
              <div className="mt-1 text-xl select-none min-h-[26px] flex items-center justify-center">
                {card.emoji}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summary Proportions */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-2xs space-y-2.5">
        <h3 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          {STRINGS_BN.weekScreen.summaryTitle}
        </h3>

        {moodCounts.length === 0 ? (
          <p className="text-xs text-stone-500 dark:text-stone-400 py-3 text-center">
            {STRINGS_BN.weekScreen.noDataWeek}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-1.5">
            {moodCounts.map((item) => (
              <div
                key={item.moodId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800/60"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl select-none">{item.emoji}</span>
                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    {item.name}
                  </span>
                </div>
                <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  {toBengaliNumber(item.count)} বার
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-[var(--card-border)]/70 text-center">
          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
            {STRINGS_BN.weekScreen.calmMessage}
          </p>
        </div>
      </section>
    </div>
  );
}
