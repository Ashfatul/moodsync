'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Shield, RefreshCw } from 'lucide-react';
import { DEFAULT_GHOST_APP_URL } from '@/lib/constants/strings.bn';

interface InAppChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomUrl?: string;
  partnerName?: string;
}

export default function InAppChatModal({
  isOpen,
  onClose,
  roomUrl = DEFAULT_GHOST_APP_URL,
  partnerName = 'সঙ্গী',
}: InAppChatModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const targetUrl = roomUrl || DEFAULT_GHOST_APP_URL;

  // Reset loading when opened
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen, targetUrl]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenExternal = () => {
    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Container taking full screen on mobile, capped on larger screens */}
      <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto h-full bg-[var(--card)] sm:my-4 sm:rounded-3xl sm:border sm:border-[var(--card-border)] sm:shadow-2xl overflow-hidden">
        {/* Chat Modal Top Bar */}
        <header className="px-3.5 py-2.5 bg-gradient-to-r from-violet-900 via-purple-900 to-violet-950 text-white flex items-center justify-between shrink-0 shadow-sm border-b border-violet-800/60">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-lg shrink-0">
              👻
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5 leading-tight">
                <span>সিক্রেট চ্যাট রুম</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[10px] text-violet-200/90 truncate flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-300 shrink-0" />
                <span>{partnerName}-এর সাথে ক্ষণস্থায়ী ও এনক্রিপ্টেড আড্ডা</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Pop-out to Separate Browser Tab/App */}
            <button
              type="button"
              onClick={handleOpenExternal}
              className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-[11px] font-semibold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              title="আলাদা ব্রাউজার ট্যাবে খুলুন"
            >
              <span>আলাদা ট্যাবে</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs transition-colors cursor-pointer"
              aria-label="চ্যাট বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Embedded Iframe Container */}
        <div className="relative flex-1 w-full bg-stone-950 overflow-hidden min-h-0">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-950/80 backdrop-blur-xs text-white p-4">
              <RefreshCw className="w-7 h-7 text-violet-400 animate-spin mb-2" />
              <p className="text-xs font-semibold text-stone-300">
                এনক্রিপ্টেড চ্যাট রুম লোড হচ্ছে...
              </p>
              <p className="text-[11px] text-stone-400 mt-1 text-center max-w-xs">
                একটু সময় লাগলে &apos;আলাদা ট্যাবে&apos; বাটনে চাপ দিয়ে সরাসরি ব্রাউজারে যেতে পারেন।
              </p>
            </div>
          )}

          <iframe
            src={targetUrl}
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-0"
            allow="microphone; camera; clipboard-write; clipboard-read"
            title="MoodSync Ghost Chat"
          />
        </div>

        {/* Security & Privacy Reminder Footer */}
        <footer className="px-3 py-2 bg-stone-100 dark:bg-stone-900 border-t border-[var(--card-border)] shrink-0 flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400">
          <span className="truncate">
            🔒 কোনো মেসেজ কোথাও জমা থাকে না • রুম বন্ধ করলে সব ডিলিট
          </span>
          <button
            type="button"
            onClick={handleOpenExternal}
            className="text-violet-600 dark:text-violet-400 font-semibold hover:underline shrink-0 ml-2"
          >
            ফুল স্ক্রিন ব্রাউজার ↗
          </button>
        </footer>
      </div>
    </div>
  );
}
