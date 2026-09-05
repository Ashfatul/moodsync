'use client';

import { useState } from 'react';
import { Heart, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { STRINGS_BN } from '@/lib/constants/strings.bn';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [slide, setSlide] = useState<1 | 2 | 3>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-sm max-h-[90dvh] overflow-y-auto bg-[var(--card)] rounded-3xl border border-[var(--card-border)] p-6 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-300">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1.5">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slide ? 'w-6 bg-rose-500' : 'w-2 bg-stone-200 dark:bg-stone-800'
              }`}
            />
          ))}
        </div>

        {/* Slide 1: আমাদের মুড */}
        {slide === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500 shadow-sm">
              <Heart className="w-8 h-8 fill-rose-500 stroke-rose-500 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--foreground)]">
              {STRINGS_BN.onboarding.step1Title}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {STRINGS_BN.onboarding.step1Desc}
            </p>
          </div>
        )}

        {/* Slide 2: কীভাবে কাজ করে? */}
        {slide === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-600">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)]">
              {STRINGS_BN.onboarding.step2Title}
            </h3>
            <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300 text-left bg-stone-50 dark:bg-stone-900/60 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{STRINGS_BN.onboarding.step2Desc1}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{STRINGS_BN.onboarding.step2Desc2}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{STRINGS_BN.onboarding.step2Desc3}</span>
              </p>
            </div>
          </div>
        )}

        {/* Slide 3: Privacy & Zero Monitoring */}
        {slide === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)]">
              {STRINGS_BN.onboarding.step3Title}
            </h3>
            <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300 text-left bg-stone-50 dark:bg-stone-900/60 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{STRINGS_BN.onboarding.step3Desc1}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{STRINGS_BN.onboarding.step3Desc2}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{STRINGS_BN.onboarding.step3Desc3}</span>
              </p>
            </div>
          </div>
        )}

        {/* Action button */}
        <div>
          {slide < 3 ? (
            <button
              type="button"
              onClick={() => setSlide((prev) => (prev + 1) as 1 | 2 | 3)}
              className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-stone-950 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all"
            >
              <span>{STRINGS_BN.onboarding.nextBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="w-full py-3.5 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>{STRINGS_BN.onboarding.startBtn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
