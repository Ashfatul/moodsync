'use client';

import { useState } from 'react';
import { X, ArrowLeft, Check } from 'lucide-react';
import { MOODS, NEEDS, INTIMACY_MOODS, STRINGS_BN } from '@/lib/constants/strings.bn';

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    moodId: string;
    needId?: string | null;
    intimacyMoodId?: string | null;
    note?: string | null;
  }) => Promise<{ success: boolean }>;
}

export default function MoodModal({ isOpen, onClose, onSubmit }: MoodModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null);
  const [selectedIntimacyId, setSelectedIntimacyId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectMood = (moodId: string) => {
    setSelectedMoodId(moodId);
    // Smooth automatic transition to next step after subtle tactile pause
    setTimeout(() => {
      setStep(2);
    }, 280);
  };

  const handleSelectNeed = (needId: string) => {
    setSelectedNeedId(needId);
    setTimeout(() => {
      setStep(3);
    }, 280);
  };

  const handleSelectIntimacy = (intimacyId: string) => {
    setSelectedIntimacyId(intimacyId);
    setTimeout(() => {
      setStep(4);
    }, 280);
  };

  const handleFinish = async () => {
    if (!selectedMoodId) return;
    setSubmitting(true);
    try {
      const res = await onSubmit({
        moodId: selectedMoodId,
        needId: selectedNeedId,
        intimacyMoodId: selectedIntimacyId,
        note: note.trim() || null,
      });

      if (res.success) {
        // Reset state & close
        setStep(1);
        setSelectedMoodId(null);
        setSelectedNeedId(null);
        setSelectedIntimacyId(null);
        setNote('');
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMoodDef = MOODS.find((m) => m.id === selectedMoodId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full sm:max-w-md max-h-[92vh] max-h-[92dvh] flex flex-col bg-[var(--card)] rounded-t-3xl sm:rounded-3xl border border-[var(--card-border)] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => ((prev - 1) as 1 | 2 | 3 | 4))}
                className="p-1.5 -ml-1.5 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
                aria-label="আগের ধাপ"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : null}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-6 bg-rose-500'
                      : i < step
                      ? 'w-3 bg-rose-300 dark:bg-rose-900'
                      : 'w-2 bg-stone-200 dark:bg-stone-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            aria-label="বন্ধ করো"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto min-h-0 flex-1 pb-10 sm:pb-6 pb-safe">
          {/* STEP 1: এখন কেমন লাগছে? */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="text-center">
                <h3 className="text-xl font-bold text-[var(--foreground)] leading-snug">
                  {STRINGS_BN.questionFlow.step1Title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                  {STRINGS_BN.questionFlow.step1Subtitle}
                </p>
              </div>

              {/* Grid of Emojis */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {MOODS.map((mood) => {
                  const isSelected = selectedMoodId === mood.id;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => handleSelectMood(mood.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-200 active:scale-95 flex flex-col items-center sm:items-start text-center sm:text-left ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 ring-2 ring-rose-400'
                          : 'border-stone-200/80 dark:border-stone-800/80 hover:border-rose-200 bg-[var(--background)]'
                      }`}
                    >
                      <span className="text-4xl select-none mb-1.5 transform transition-transform group-hover:scale-110">
                        {mood.emoji}
                      </span>
                      <span className="text-sm font-bold text-[var(--foreground)] leading-snug">
                        {mood.name}
                      </span>
                      <span className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5 leading-normal">
                        {mood.shortDesc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: এই মুহূর্তে তোমার কী দরকার? */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="text-center">
                {selectedMoodDef && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-xs font-semibold text-rose-700 dark:text-rose-300 mb-2">
                    <span>{selectedMoodDef.emoji}</span>
                    <span>{selectedMoodDef.name}</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-[var(--foreground)] leading-snug">
                  {STRINGS_BN.questionFlow.step2Title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                  {STRINGS_BN.questionFlow.step2Subtitle}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                {NEEDS.map((need) => {
                  const isSelected = selectedNeedId === need.id;
                  return (
                    <button
                      key={need.id}
                      type="button"
                      onClick={() => handleSelectNeed(need.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-400'
                          : 'border-stone-200 dark:border-stone-800 hover:border-amber-300 bg-[var(--background)]'
                      }`}
                    >
                      <span className="text-2xl select-none">{need.emoji}</span>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-[var(--foreground)] leading-snug">
                          {need.name}
                        </div>
                        <div className="text-xs text-stone-600 dark:text-stone-300 leading-normal">
                          {need.shortDesc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors py-2 px-4"
                >
                  {STRINGS_BN.questionFlow.skip} →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: আজ একটু closeness-এর mood কেমন? */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="text-center">
                <h3 className="text-xl font-bold text-[var(--foreground)] leading-snug">
                  {STRINGS_BN.questionFlow.step3Title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                  {STRINGS_BN.questionFlow.step3Subtitle}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                {INTIMACY_MOODS.map((item) => {
                  const isSelected = selectedIntimacyId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectIntimacy(item.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 ring-2 ring-rose-400'
                          : 'border-stone-200 dark:border-stone-800 hover:border-rose-300 bg-[var(--background)]'
                      }`}
                    >
                      <span className="text-2xl select-none">{item.emoji}</span>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-[var(--foreground)] leading-snug">
                          {item.name}
                        </div>
                        <div className="text-xs text-stone-600 dark:text-stone-300 leading-normal">
                          {item.shortDesc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors py-2 px-4"
                >
                  {STRINGS_BN.questionFlow.skip} →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: কিছু বলতে চাও? (চিরকুট) */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="text-center">
                <h3 className="text-xl font-bold text-[var(--foreground)] leading-snug">
                  {STRINGS_BN.questionFlow.step4Title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                  {STRINGS_BN.questionFlow.step4Subtitle}
                </p>
              </div>

              <div className="pt-2">
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={STRINGS_BN.questionFlow.step4Placeholder}
                  className="w-full p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>{STRINGS_BN.questionFlow.saving}</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{STRINGS_BN.questionFlow.save}</span>
                    </>
                  )}
                </button>

                {!note.trim() && (
                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={submitting}
                    className="w-full py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 text-center"
                  >
                    চিরকুট ছাড়া সংরক্ষণ করো
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
