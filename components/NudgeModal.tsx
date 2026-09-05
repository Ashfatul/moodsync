'use client';

import React, { useState } from 'react';
import { X, Heart, Sparkles, Send, Plus } from 'lucide-react';
import { QUICK_NUDGES, NudgeOption } from '@/lib/constants/strings.bn';

interface NudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onSendNudge: (payload: {
    emoji: string;
    text: string;
    count: number;
    customMessage?: string;
  }) => Promise<unknown>;
  onTriggerFloatingHearts?: (emoji: string, count: number) => void;
}

export default function NudgeModal({
  isOpen,
  onClose,
  partnerName,
  onSendNudge,
  onTriggerFloatingHearts,
}: NudgeModalProps) {
  const [selectedOption, setSelectedOption] = useState<NudgeOption>(QUICK_NUDGES[0]);
  const [count, setCount] = useState(1);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [heartBounce, setHeartBounce] = useState(false);

  if (!isOpen) return null;

  const handleTapHeart = () => {
    setCount((prev) => prev + 1);
    setHeartBounce(true);
    setTimeout(() => setHeartBounce(false), 180);
    onTriggerFloatingHearts?.(selectedOption.emoji, 1);
  };

  const handleAddBurst = (amount: number) => {
    setCount((prev) => prev + amount);
    onTriggerFloatingHearts?.(selectedOption.emoji, Math.min(amount, 10));
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      await onSendNudge({
        emoji: selectedOption.emoji,
        text: selectedOption.text,
        count,
        customMessage: customMessage.trim() || undefined,
      });
      onTriggerFloatingHearts?.(selectedOption.emoji, Math.min(count, 20));
      onClose();
      // Reset state for next time
      setCount(1);
      setCustomMessage('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full sm:max-w-md max-h-[92dvh] flex flex-col bg-[var(--card)] rounded-t-3xl sm:rounded-3xl border border-[var(--card-border)] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                <span>{partnerName}-কে মিস ইউ বোম্ব</span>
                <span className="text-xs">💣❤️</span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                এক চাপেই মনের অনুভূতি পৌছে দাও
              </p>
            </div>
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
        <div className="p-5 overflow-y-auto min-h-0 flex-1 space-y-5 pb-safe">
          {/* Quick Choice Chips */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-2">
              কী পাঠাতে চাও?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_NUDGES.map((item) => {
                const isSelected = selectedOption.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedOption(item)}
                    className={`p-2.5 rounded-2xl border text-center transition-all active:scale-95 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 ring-2 ring-rose-400'
                        : 'border-stone-200 dark:border-stone-800 bg-[var(--background)] hover:border-rose-300'
                    }`}
                  >
                    <div className="text-2xl select-none mb-1">{item.emoji}</div>
                    <div className="text-xs font-bold text-[var(--foreground)]">
                      {item.text}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bomb Tapper Section */}
          <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-b from-rose-50/50 to-pink-50/30 dark:from-rose-950/20 dark:to-pink-950/10 p-4 text-center space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-800 dark:text-rose-300 px-1">
              <span>বোম্বের তীব্রতা:</span>
              <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                x{count} বার! 💣
              </span>
            </div>

            {/* Giant Tappable Heart */}
            <div className="flex flex-col items-center justify-center py-2">
              <button
                type="button"
                onClick={handleTapHeart}
                className={`relative w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg flex flex-col items-center justify-center transition-all active:scale-90 ${
                  heartBounce ? 'scale-110 shadow-rose-300 dark:shadow-rose-900 ring-4 ring-rose-300' : 'hover:scale-105'
                }`}
                title="ট্যাপ করে বোম্ব বাড়াও!"
              >
                <span className="text-3xl select-none">{selectedOption.emoji}</span>
                <span className="text-xs font-extrabold mt-0.5">ট্যাপ করো!</span>
              </button>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 font-medium">
                যত খুশি ট্যাপ করে ভালোবাসা পাঠাও ❤️
              </p>
            </div>

            {/* Rapid Burst Shortcuts */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {[+5, +10, +50, +100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAddBurst(amt)}
                  className="px-2.5 py-1 rounded-full text-xs font-bold bg-white dark:bg-stone-800 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 hover:bg-rose-50 transition-all active:scale-95 flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>{amt}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCount(1)}
                className="px-2.5 py-1 rounded-full text-xs font-semibold text-stone-400 hover:text-stone-600"
              >
                রিসেট
              </button>
            </div>
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
              একটি মিষ্টি চিরকুট (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="যেমন: তাড়াতাড়ি বাড়ি আসো, একা একা লাগছে..."
              maxLength={80}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="w-full py-3.5 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isSending ? (
              <span>পাঠানো হচ্ছে...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {selectedOption.text} পাঠিয়ে দাও {count > 1 ? `(x${count})` : ''} 🚀
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
