'use client';

import { useState } from 'react';
import { Heart, X, Send, Plus } from 'lucide-react';
import { QUICK_NUDGES, NudgeOption } from '@/lib/constants/strings.bn';

interface NudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onSendNudge: (params: {
    emoji: string;
    text: string;
    count: number;
    customMessage?: string;
  }) => Promise<any>;
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
  const [count, setCount] = useState<number>(1);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [heartBounce, setHeartBounce] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTapHeart = () => {
    setCount((prev) => prev + 1);
    setHeartBounce(true);
    setTimeout(() => setHeartBounce(false), 180);
    // Micro particle burst
    onTriggerFloatingHearts?.(selectedOption.emoji, 2);
  };

  const handleAddBurst = (amount: number) => {
    setCount((prev) => prev + amount);
    setHeartBounce(true);
    setTimeout(() => setHeartBounce(false), 200);
    onTriggerFloatingHearts?.(selectedOption.emoji, Math.min(amount, 6));
  };

  const handleSend = async () => {
    if (isSending) return;
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
      <div className="w-full sm:max-w-md max-h-[90dvh] flex flex-col bg-[var(--card)] rounded-t-3xl sm:rounded-3xl border border-[var(--card-border)] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--card-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                <span>{partnerName}-কে মিস ইউ বোম্ব</span>
                <span className="text-xs">💣❤️</span>
              </h3>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                এক চাপেই ভালোবাসা পৌছে দাও
              </p>
            </div>
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
        <div className="p-4 overflow-y-auto min-h-0 flex-1 space-y-3.5">
          {/* Quick Choice Chips */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1.5">
              কী পাঠাতে চাও?
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {QUICK_NUDGES.map((item) => {
                const isSelected = selectedOption.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedOption(item)}
                    className={`p-2 rounded-2xl border text-center transition-all active:scale-95 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 ring-2 ring-rose-400'
                        : 'border-stone-200 dark:border-stone-800 bg-[var(--background)] hover:border-rose-300'
                    }`}
                  >
                    <div className="text-xl select-none mb-0.5">{item.emoji}</div>
                    <div className="text-[11px] font-bold text-[var(--foreground)]">
                      {item.text}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bomb Tapper Section */}
          <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-b from-rose-50/50 to-pink-50/30 dark:from-rose-950/20 dark:to-pink-950/10 p-3 text-center space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-800 dark:text-rose-300 px-1">
              <span>বোম্বের তীব্রতা:</span>
              <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                x{count} বার! 💣
              </span>
            </div>

            {/* Giant Tappable Heart */}
            <div className="flex flex-col items-center justify-center py-1">
              <button
                type="button"
                onClick={handleTapHeart}
                className={`relative w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md flex flex-col items-center justify-center transition-all active:scale-90 ${
                  heartBounce
                    ? 'scale-110 shadow-rose-300 dark:shadow-rose-900 ring-4 ring-rose-300'
                    : 'hover:scale-105'
                }`}
                title="ট্যাপ করে বোম্ব বাড়াও!"
              >
                <span className="text-2xl select-none">{selectedOption.emoji}</span>
                <span className="text-[10px] font-extrabold mt-0.5">ট্যাপ করো!</span>
              </button>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1.5 font-medium">
                যত খুশি ট্যাপ করে ভালোবাসা পাঠাও ❤️
              </p>
            </div>

            {/* Rapid Burst Shortcuts */}
            <div className="flex items-center justify-center gap-1.5 pt-0.5">
              {[+5, +10, +50, +100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAddBurst(amt)}
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-stone-800 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 hover:bg-rose-50 transition-all active:scale-95 flex items-center gap-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>{amt}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCount(1)}
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-stone-400 hover:text-stone-600"
              >
                রিসেট
              </button>
            </div>
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
              মিষ্টি চিরকুট (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="যেমন: তাড়াতাড়ি বাড়ি আসো, একা একা লাগছে..."
              maxLength={80}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Dedicated Fixed Footer for Send Button with Generous Mobile Bottom Spacing */}
        <div className="p-4 pt-2.5 pb-8 sm:pb-4 border-t border-[var(--card-border)] bg-[var(--card)] shrink-0">
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
