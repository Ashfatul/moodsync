'use client';

import { useState } from 'react';
import { AlertCircle, X, Check } from 'lucide-react';
import { STRINGS_BN, FIGHT_MOMENTS } from '@/lib/constants/strings.bn';

interface FightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    moodId: string;
    needId?: string | null;
    intimacyMoodId?: string | null;
    note?: string | null;
  }) => Promise<any>;
}

export default function FightModal({
  isOpen,
  onClose,
  onSubmit,
}: FightModalProps) {
  const [selectedFightId, setSelectedFightId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedFightId || submitting) return;

    setSubmitting(true);
    try {
      // Map fight moment to mood/need
      let moodId = 'very_bad';
      let needId: string | undefined = undefined;

      switch (selectedFightId) {
        case 'angry':
          moodId = 'angry';
          needId = 'space';
          break;
        case 'hurt':
          moodId = 'hurt';
          needId = 'listen';
          break;
        case 'sulking':
          moodId = 'sad';
          needId = 'affection';
          break;
        case 'silent':
          moodId = 'hurt';
          needId = 'space';
          break;
        case 'need_time':
          moodId = 'peaceful';
          needId = 'space';
          break;
        case 'need_talk':
          moodId = 'neutral';
          needId = 'talk';
          break;
        default:
          moodId = 'hurt';
      }

      await onSubmit({
        moodId,
        needId,
        note: note.trim() || undefined,
      });

      // Reset
      setSelectedFightId(null);
      setNote('');
      onClose();
    } catch (err) {
      console.error('Failed to submit fight moment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full sm:max-w-md max-h-[90dvh] flex flex-col bg-[var(--card)] rounded-t-3xl sm:rounded-3xl border border-[var(--card-border)] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-[var(--card-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              {STRINGS_BN.fightFlow.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto min-h-0 flex-1 space-y-3.5">
          <div className="text-center">
            <h4 className="text-base font-bold text-[var(--foreground)]">
              এখন কী অনুভব করছো?
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              {STRINGS_BN.fightFlow.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            {FIGHT_MOMENTS.map((moment) => {
              const isSelected = selectedFightId === moment.id;
              return (
                <button
                  key={moment.id}
                  type="button"
                  onClick={() => setSelectedFightId(moment.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all active:scale-[0.97] ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-400'
                      : 'border-stone-200 dark:border-stone-800 bg-[var(--background)] hover:border-amber-300'
                  }`}
                >
                  <span className="text-xl select-none">{moment.emoji}</span>
                  <div className="text-xs font-bold text-[var(--foreground)] mt-0.5">
                    {moment.name}
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                    {moment.shortDesc}
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={STRINGS_BN.fightFlow.notePlaceholder}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Sticky Action Footer with Safe Area */}
        <div className="p-4 pt-2.5 pb-8 sm:pb-4 border-t border-[var(--card-border)] bg-[var(--card)] shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFightId || submitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>পাঠানো হচ্ছে...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{STRINGS_BN.fightFlow.submitBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
