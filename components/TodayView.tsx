'use client';

import { useState, useMemo } from 'react';
import { MoodEventWithDetails, Profile } from '@/lib/types';
import {
  MOODS,
  NEEDS,
  INTIMACY_MOODS,
  STRINGS_BN,
  DEFAULT_GHOST_APP_URL,
  formatTimeBengali,
  formatDateBengali,
  toBengaliNumber,
  isQuickMessage,
  parseQuickMessage,
} from '@/lib/constants/strings.bn';
import {
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  MessageCircle,
  ExternalLink,
  Clock,
} from 'lucide-react';

interface TodayViewProps {
  events: MoodEventWithDetails[];
  partnerProfile: Profile | null;
  onOpenInAppChat?: (url: string) => void;
  initialFilter?: 'all' | 'moods' | 'quick_messages';
}

type FilterType = 'all' | 'moods' | 'quick_messages';

export default function TodayView({
  events,
  partnerProfile,
  onOpenInAppChat,
  initialFilter = 'all',
}: TodayViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [filter, setFilter] = useState<FilterType>(initialFilter);

  const today = useMemo(() => new Date(), []);

  // Generate the last 7 days list for quick navigation pills (Default 7-day history window)
  const last7Days = useMemo(() => {
    const days = [];
    const daysNameBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const isCurrentToday = i === 0;
      const isYesterday = i === 1;

      let label = daysNameBn[d.getDay()];
      if (isCurrentToday) label = 'আজ';
      else if (isYesterday) label = 'গতকাল';

      // Check if this date has any events
      const dateStr = d.toDateString();
      const hasEvents = events.some(
        (e) => new Date(e.created_at).toDateString() === dateStr
      );

      days.push({
        date: d,
        dateStr,
        dayNum: d.getDate(),
        label,
        hasEvents,
      });
    }
    return days;
  }, [today, events]);

  const isSelectedToday = selectedDate.toDateString() === today.toDateString();

  // Navigate back/forward by day
  const handlePrevDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() - 1);
    setSelectedDate(next);
  };

  const handleNextDay = () => {
    if (isSelectedToday) return;
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(new Date(date));
  };

  // Filter events for the selected calendar date
  const selectedDateStr = selectedDate.toDateString();
  const dayEvents = useMemo(() => {
    return events.filter(
      (e) => new Date(e.created_at).toDateString() === selectedDateStr
    );
  }, [events, selectedDateStr]);

  // Counts for tabs
  const moodCount = useMemo(
    () => dayEvents.filter((e) => !isQuickMessage(e) && Boolean(e.mood_id)).length,
    [dayEvents]
  );
  const quickMsgCount = useMemo(
    () => dayEvents.filter((e) => isQuickMessage(e)).length,
    [dayEvents]
  );

  // Apply category filter
  const displayedEvents = useMemo(() => {
    if (filter === 'moods') {
      return dayEvents.filter((e) => !isQuickMessage(e) && Boolean(e.mood_id));
    }
    if (filter === 'quick_messages') {
      return dayEvents.filter((e) => isQuickMessage(e));
    }
    return dayEvents;
  }, [dayEvents, filter]);

  const getMood = (id?: string | null) => (id ? MOODS.find((m) => m.id === id) : null);
  const getNeed = (id?: string | null) => (id ? NEEDS.find((n) => n.id === id) : null);
  const getIntimacy = (id?: string | null) =>
    id ? INTIMACY_MOODS.find((i) => i.id === id) : null;

  return (
    <div className="space-y-3 pb-24 pt-1">
      {/* 1. Header with Bengali Date Navigator */}
      <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-3.5 shadow-2xs space-y-3">
        {/* Date Selector Banner */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePrevDay}
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-[var(--background)] hover:bg-stone-100 dark:hover:bg-stone-900 active:scale-90 text-stone-600 dark:text-stone-300 transition-all cursor-pointer"
            title="পূর্ববর্তী দিন"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate leading-snug">
              {formatDateBengali(selectedDate)}
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                {dayEvents.length > 0
                  ? `${toBengaliNumber(dayEvents.length)}টি রেকর্ড`
                  : 'কোনো রেকর্ড নেই'}
              </span>
              {!isSelectedToday && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date())}
                  className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer ml-1"
                >
                  (আজকে ফিরুন)
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            disabled={isSelectedToday}
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-[var(--background)] hover:bg-stone-100 dark:hover:bg-stone-900 active:scale-90 text-stone-600 dark:text-stone-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title="পরবর্তী দিন"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Day Horizontal Strip for Instant Jumping */}
        <div className="grid grid-cols-7 gap-1 text-center pt-1 border-t border-[var(--card-border)]/60">
          {last7Days.map((item) => {
            const isSelected = item.dateStr === selectedDateStr;
            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => handleSelectDate(item.date)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all active:scale-95 cursor-pointer relative ${
                  isSelected
                    ? 'bg-rose-500 text-white font-bold shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-900/60 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 text-stone-600 dark:text-stone-300'
                }`}
              >
                <span className="text-[9px] leading-tight opacity-90">{item.label}</span>
                <span className="text-xs font-bold leading-tight mt-0.5">
                  {toBengaliNumber(item.dayNum)}
                </span>
                {item.hasEvents && (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isSelected ? 'bg-white' : 'bg-rose-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Timeline Category Filter Tabs (Segmented Control) */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center cursor-pointer ${
            filter === 'all'
              ? 'bg-white dark:bg-stone-800 text-[var(--foreground)] shadow-xs'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <span>সকল টাইমলাইন</span>
          <span className="ml-1 text-[10px] font-normal opacity-75">
            ({toBengaliNumber(dayEvents.length)})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('moods')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center cursor-pointer ${
            filter === 'moods'
              ? 'bg-white dark:bg-stone-800 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <span>মুড</span>
          <span className="ml-1 text-[10px] font-normal opacity-75">
            ({toBengaliNumber(moodCount)})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('quick_messages')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center cursor-pointer ${
            filter === 'quick_messages'
              ? 'bg-white dark:bg-stone-800 text-violet-600 dark:text-violet-400 shadow-xs'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <span>কুইক পিং</span>
          <span className="ml-1 text-[10px] font-normal opacity-75">
            ({toBengaliNumber(quickMsgCount)})
          </span>
        </button>
      </div>

      {/* 3. Timeline Events List */}
      {displayedEvents.length === 0 ? (
        <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center shadow-2xs space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-stone-400 text-xl">
            {filter === 'quick_messages' ? '💬' : filter === 'moods' ? '🍃' : '📅'}
          </div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            {filter === 'quick_messages'
              ? 'এই তারিখে কোনো কুইক মেসেজ নেই'
              : filter === 'moods'
              ? 'এই তারিখে কোনো মুড আপডেট নেই'
              : 'এই তারিখে কোনো রেকর্ড পাওয়া যায়নি'}
          </h3>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
            {isSelectedToday
              ? 'হোম থেকে মুড আপডেট করুন বা সঙ্গীকে কুইক পিং পাঠান।'
              : 'অন্য তারিখ বেছে নিন অথবা আজকের তারিখে ফিরে যান।'}
          </p>
          {!isSelectedToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(new Date())}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <span>আজকের তারিখে যাও ↗</span>
            </button>
          )}
        </div>
      ) : (
        <div className="relative pl-5 space-y-2.5 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-rose-300 before:via-violet-300 before:to-rose-200 dark:before:from-rose-900 dark:before:via-violet-900 dark:before:to-rose-950">
          {displayedEvents.map((event, idx) => {
            const isQuickMsg = isQuickMessage(event);
            const qmData = isQuickMsg ? parseQuickMessage(event) : null;
            const mood = !isQuickMsg ? getMood(event.mood_id) : null;
            const need = !isQuickMsg ? getNeed(event.need_id) : null;
            const intimacy = !isQuickMsg ? getIntimacy(event.intimacy_mood_id) : null;
            const isMe = event.isCurrentUser;
            const author = isMe ? STRINGS_BN.nowScreen.you : (partnerProfile?.name || 'সঙ্গী');

            return (
              <div key={event.id || idx} className="relative group animate-in fade-in duration-200">
                {/* Timeline Pin/Bullet */}
                <div
                  className={`absolute -left-[23px] top-3.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--background)] ${
                    isQuickMsg
                      ? 'bg-violet-500 ring-2 ring-violet-200 dark:ring-violet-950'
                      : isMe
                      ? 'bg-teal-500 ring-2 ring-teal-200 dark:ring-teal-950'
                      : 'bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-950'
                  }`}
                />

                {/* Timeline Card */}
                {isQuickMsg && qmData ? (
                  /* --- QUICK MESSAGE CARD --- */
                  <div className="rounded-2xl border border-violet-200/80 dark:border-violet-900/60 bg-gradient-to-r from-violet-50/40 via-[var(--card)] to-[var(--card)] p-3 shadow-2xs transition-all hover:border-violet-400">
                    <div className="flex items-center justify-between pb-1.5 border-b border-violet-100 dark:border-violet-900/40 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold ${
                            isMe ? 'text-teal-600 dark:text-teal-400' : 'text-violet-600 dark:text-violet-400'
                          }`}
                        >
                          {author}
                        </span>
                        <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-100/80 dark:bg-violet-950/60 px-2 py-0.5 rounded-full border border-violet-200/80 dark:border-violet-800/60">
                          {qmData.url ? 'চ্যাট ইনভাইট 👻' : qmData.count > 1 ? `বোম্ব x${toBengaliNumber(qmData.count)} 💣` : 'কুইক পিং 💬'}
                        </span>
                        {event.isOfflinePending && (
                          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-200/80">
                            ⏳ সিঙ্ক বাকি
                          </span>
                        )}
                      </div>
                      <span className="text-stone-500 dark:text-stone-400 font-medium">
                        {formatTimeBengali(event.created_at)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-start gap-2.5">
                      <div className="text-2xl select-none leading-none shrink-0">
                        {qmData.emoji || '💬'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] leading-snug">
                          {qmData.text}
                          {qmData.count > 1 && (
                            <span className="text-xs text-rose-500 ml-1">
                              (x{toBengaliNumber(qmData.count)} বার)
                            </span>
                          )}
                        </h4>

                        {/* Optional Custom Note */}
                        {qmData.customMessage && (
                          <div className="mt-1.5 text-xs bg-stone-50 dark:bg-stone-900/60 p-2 rounded-xl text-stone-700 dark:text-stone-300 italic flex items-start gap-1 border border-stone-200/50 dark:border-stone-800">
                            <MessageSquare className="w-3 h-3 text-violet-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed break-words">
                              “{qmData.customMessage}”
                            </span>
                          </div>
                        )}

                        {/* Quick Join Chat Button if it has a room URL or chat intent */}
                        {(qmData.url || qmData.text.includes('কথা')) && (
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                const targetUrl = qmData.url || DEFAULT_GHOST_APP_URL;
                                if (onOpenInAppChat) {
                                  onOpenInAppChat(targetUrl);
                                } else if (typeof window !== 'undefined') {
                                  window.open(targetUrl, '_blank');
                                }
                              }}
                              className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 text-white font-bold text-[11px] shadow-xs active:scale-95 transition-all cursor-pointer"
                            >
                              <span>চ্যাটে জয়েন করো 🚀</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* --- MOOD EVENT CARD --- */
                  <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-2xs transition-all hover:border-rose-200 dark:hover:border-rose-900">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[var(--card-border)]/50 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold ${
                            isMe ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {author}
                        </span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500">
                          (মুড আপডেট)
                        </span>
                        {event.isOfflinePending && (
                          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-200/80 dark:border-amber-800/60">
                            ⏳ সিঙ্ক বাকি
                          </span>
                        )}
                      </div>
                      <span className="text-stone-500 dark:text-stone-400 font-medium">
                        {formatTimeBengali(event.created_at)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-start gap-2.5">
                      <div className="text-2xl select-none leading-none shrink-0">
                        {mood?.emoji || '🤍'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[var(--foreground)] leading-snug">
                          {mood?.name || 'মুড'}
                        </h4>
                        {mood?.shortDesc && (
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed break-words">
                            {mood.shortDesc}
                          </p>
                        )}

                        {/* Needs & intimacy badges if present */}
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
                            <span className="leading-relaxed break-words">“{event.note}”</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Subtle Footer info about 7-day default retention */}
      <div className="pt-2 text-center">
        <p className="text-[10px] text-stone-400 dark:text-stone-500">
          🔒 স্বয়ংক্রিয় ডাটা সংরক্ষণ: ডিফল্ট ৭ দিন (সেটিংস থেকে পরিবর্তন করা যাবে)
        </p>
      </div>
    </div>
  );
}
