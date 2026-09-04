'use client';

import { useState } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';
import { FIGHT_MOMENTS, STRINGS_BN } from '@/lib/constants/strings.bn';

interface FightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    moodId: string;
    needId?: string | null;
    note?: string | null;
  }) => Promise<{ success: boolean }>;
}

export default function FightModal({ isOpen, onClose, onSubmit }: FightModalProps) {
  const [selectedFightId, setSelectedFightId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedFightId) return;
    setSubmitting(true);

    // Map fight moment to mood and need IDs
    let moodId = 'sad';
    let needId: string | null = null;

    if (selectedFightId === 'angry') {
      moodId = 'angry';
      needId = 'space';
    } else if (selectedFightId === 'hurt' || selectedFightId === 'sulking') {
      moodId = 'hurt';
      needId = 'be_there';
    } else if (selectedFightId === 'silent') {
      moodId = 'neutral';
      needId = 'space';
    } else if (selectedFightId === 'need_time') {
      moodId = 'peaceful';
      needId = 'space';
    } else if (selectedFightId === 'need_talk') {
      moodId = 'neutral';
      needId = 'talk';
    }

    try {
      const res = await onSubmit({
        moodId,
        needId,
        note: note.trim()
          ? `[কঠিন মুহূর্ত] ${note.trim()}`
          : `[কঠিন মুহূর্ত] ${FIGHT_MOMENTS.find((f) => f.id === selectedFightId)?.name || ''}`,
      });

      if (res.success) {
        setSelectedFightId(null);
        setNote('');
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full sm:max-w-md max-h-[90vh] flex flex-col bg-[var(--card)] rounded-t-3xl sm:rounded-3xl border border-[var(--card-border)] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              {STRINGS_BN.fightFlow.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-bold text-[var(--foreground)]">
              এখন কী অনুভব করছো?
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
              {STRINGS_BN.fightFlow.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {FIGHT_MOMENTS.map((moment) => {
              const isSelected = selectedFightId === moment.id;
              return (
                <button
                  key={moment.id}
                  type="button"
                  onClick={() => setSelectedFightId(moment.id)}
                  className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.97] ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-400'
                      : 'border-stone-200 dark:border-stone-800 bg-[var(--background)] hover:border-amber-300'
                  }`}
                >
                  <span className="text-2xl select-none">{moment.emoji}</span>
                  <div className="text-sm font-bold text-[var(--foreground)] mt-1">
                    {moment.name}
                  </div>
                  <div className="text-[11px] text-stone-600 dark:text-stone-300 line-clamp-1 mt-0.5">
                    {moment.shortDesc}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={STRINGS_BN.fightFlow.notePlaceholder}
              className="w-full p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

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
