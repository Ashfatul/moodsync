'use client';

import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

export interface FloatingParticle {
  id: string;
  emoji: string;
  left: number; // 5% to 95%
  size: number; // 24px to 48px
  duration: number; // seconds
  delay: number; // seconds
}

export interface IncomingNudgeAlert {
  senderName: string;
  emoji: string;
  text: string;
  count: number;
  customMessage?: string;
  url?: string;
}

interface FloatingHeartsProps {
  particles: FloatingParticle[];
  incomingNudge: IncomingNudgeAlert | null;
  onDismissIncoming: () => void;
}

export default function FloatingHearts({
  particles,
  incomingNudge,
  onDismissIncoming,
}: FloatingHeartsProps) {
  useEffect(() => {
    if (!incomingNudge) return;
    const timer = setTimeout(() => {
      onDismissIncoming();
    }, 4500);
    return () => clearTimeout(timer);
  }, [incomingNudge, onDismissIncoming]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Floating Particle Swarm */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 select-none animate-float-heart"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* Incoming Realtime Nudge Banner */}
      {incomingNudge && (
        <div className="pointer-events-auto absolute top-4 left-4 right-4 max-w-md mx-auto animate-in slide-in-from-top-6 fade-in duration-300">
          <div className="rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-rose-200 dark:border-rose-900 shadow-xl p-3.5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-2xl shrink-0 animate-bounce">
              {incomingNudge.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-[var(--foreground)]">
                  {incomingNudge.senderName}
                </span>
                <span className="text-xs font-semibold text-rose-500">
                  {incomingNudge.text}
                </span>
                {incomingNudge.count > 1 && (
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                    x{incomingNudge.count} বোম্ব! 💣
                  </span>
                )}
              </div>
              {incomingNudge.customMessage && (
                <p className="text-xs text-stone-600 dark:text-stone-300 italic break-words leading-relaxed mt-0.5">
                  “{incomingNudge.customMessage}”
                </p>
              )}
              {incomingNudge.url && (
                <a
                  href={incomingNudge.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
                >
                  <span>ঘোস্ট চ্যাটে যোগ দাও 👻</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={onDismissIncoming}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
