'use client';

import { useState, useEffect } from 'react';
import {
  MessageCircle,
  X,
  ExternalLink,
  Send,
  Shield,
  Settings2,
  Check,
  Bell,
} from 'lucide-react';

const DEFAULT_GHOST_APP_URL = 'https://ghost-message-13rh.onrender.com/';

const PRESET_MESSAGES = [
  'একটু কথা বলো না, ফ্রি আছো? 💬',
  'মন খারাপ লাগছে... তোমার সাথে একটু কথা বলি 🥺',
  'জরুরি বিষয়, একটু চ্যাটে এসো 🫂',
  'তোমাকে খুব মনে পড়ছে, চলো একটু গল্প করি ❤️',
];

interface LetsTalkModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  coupleId?: string;
  onSendInvite: (params: {
    emoji: string;
    text: string;
    count: number;
    customMessage?: string;
    url?: string;
  }) => Promise<any>;
  onTriggerFloatingHearts?: (emoji: string, count: number) => void;
}

export default function LetsTalkModal({
  isOpen,
  onClose,
  partnerName,
  coupleId,
  onSendInvite,
  onTriggerFloatingHearts,
}: LetsTalkModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_MESSAGES[0]);
  const [customText, setCustomText] = useState<string>('');
  const [ghostUrl, setGhostUrl] = useState<string>(DEFAULT_GHOST_APP_URL);
  const [notifyPartner, setNotifyPartner] = useState<boolean>(true);
  const [isCustomizingUrl, setIsCustomizingUrl] = useState<boolean>(false);
  const [urlSaved, setUrlSaved] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Load custom room URL from localStorage if set
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storageKey = `moodsync_ghost_chat_url_${coupleId || 'default'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved && saved.trim()) {
      setGhostUrl(saved.trim());
    }
  }, [coupleId]);

  if (!isOpen) return null;

  const handleSaveCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const storageKey = `moodsync_ghost_chat_url_${coupleId || 'default'}`;
    const finalUrl = ghostUrl.trim() || DEFAULT_GHOST_APP_URL;
    setGhostUrl(finalUrl);
    localStorage.setItem(storageKey, finalUrl);
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2000);
    setIsCustomizingUrl(false);
  };

  const handleOpenGhostChat = async () => {
    if (isSending) return;
    const targetUrl = ghostUrl.trim() || DEFAULT_GHOST_APP_URL;

    if (notifyPartner) {
      setIsSending(true);
      const messageToSend = customText.trim() || selectedPreset;
      try {
        await onSendInvite({
          emoji: '💬',
          text: 'চলো কথা বলি',
          count: 1,
          customMessage: messageToSend,
          url: targetUrl,
        });
        onTriggerFloatingHearts?.('💬', 6);
      } catch (err) {
        console.warn('Nudge push error:', err);
      } finally {
        setIsSending(false);
      }
    }

    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }

    onClose();
  };

  const handleDirectOpen = () => {
    const targetUrl = ghostUrl.trim() || DEFAULT_GHOST_APP_URL;
    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full sm:max-w-md max-h-[92dvh] flex flex-col bg-[var(--card)] rounded-t-3xl sm:rounded-3xl border border-[var(--card-border)] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-[var(--card-border)] flex items-center justify-between shrink-0 bg-gradient-to-r from-violet-50/70 to-purple-50/40 dark:from-violet-950/30 dark:to-purple-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center text-violet-600 dark:text-violet-300 shadow-2xs">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5 leading-snug">
                <span>চলো কথা বলি</span>
                <span className="text-xs">💬👻</span>
              </h3>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                ঘোস্ট মেসেজে প্রাইভেট ও গোপন আড্ডা
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

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto min-h-0 flex-1 space-y-3.5 pb-6">
          {/* Partner Callout */}
          <div className="p-3 rounded-2xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-900/50">
            <div className="flex items-center gap-2">
              <span className="text-xl select-none">👻</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-violet-900 dark:text-violet-200 leading-snug">
                  {partnerName}-কে চ্যাটে আসার আমন্ত্রণ
                </p>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-normal">
                  নোটিফিকেশন পাঠিয়ে সরাসরি ঘোস্ট মেসেজ ওপেন হবে।
                </p>
              </div>
            </div>
          </div>

          {/* Quick Preset Message Options */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1.5">
              কী বলতে চাও?
            </label>
            <div className="space-y-1.5">
              {PRESET_MESSAGES.map((msg) => {
                const isSelected = selectedPreset === msg && !customText;
                return (
                  <button
                    key={msg}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(msg);
                      setCustomText('');
                    }}
                    className={`w-full p-2.5 rounded-2xl border text-left text-xs transition-all active:scale-[0.98] flex items-center gap-2 ${
                      isSelected
                        ? 'border-violet-500 bg-violet-50/80 dark:bg-violet-950/40 ring-1 ring-violet-400 font-semibold text-violet-900 dark:text-violet-200'
                        : 'border-stone-200 dark:border-stone-800 bg-[var(--background)] text-stone-700 dark:text-stone-300 hover:border-violet-300'
                    }`}
                  >
                    <span className="shrink-0">{isSelected ? '🟣' : '⚪'}</span>
                    <span className="leading-relaxed">{msg}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Custom Note */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
              অথবা নিজের মতো লিখো (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="যেমন: তাড়াতাড়ি ফ্রি হয়ে চ্যাটে আসো..."
              maxLength={80}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Notify Partner Toggle Card */}
          <div
            onClick={() => setNotifyPartner(!notifyPartner)}
            className="p-3 rounded-2xl border border-violet-200/90 dark:border-violet-900/60 bg-gradient-to-r from-violet-50/80 to-purple-50/50 dark:from-violet-950/40 dark:to-purple-950/20 flex items-center justify-between gap-3 cursor-pointer select-none transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-violet-200/80 dark:bg-violet-900/60 flex items-center justify-center text-violet-700 dark:text-violet-300 shrink-0 shadow-2xs">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-violet-950 dark:text-violet-100 leading-snug">
                  মেসেজে যাওয়ার সময় সঙ্গীকে নোটিফিকেশন পাঠাও
                </p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight mt-0.5">
                  {notifyPartner
                    ? 'সঙ্গীর ফোনে নোটিফিকেশন যাবে, যাতে উনি ক্লিক করে সাথে সাথে চ্যাটে আসতে পারেন'
                    : 'কোনো নোটিফিকেশন পাঠানো হবে না, শুধু আপনার জন্য চ্যাট খুলবে'}
                </p>
              </div>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                notifyPartner ? 'bg-violet-600' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  notifyPartner ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Connected App Status & Security Pill */}
          <div className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-stone-50/60 dark:bg-stone-900/40 text-left space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)]">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ghost Message অ্যাপ সংযুক্ত</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizingUrl(!isCustomizingUrl)}
                className="text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                <Settings2 className="w-3 h-3" />
                <span>{isCustomizingUrl ? 'বাতিল' : 'রুম লিংক পরিবর্তন'}</span>
              </button>
            </div>

            <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-normal">
              🔒 এন্ড-টু-এন্ড এনক্রিপ্টেড • কোনো মেসেজ সেভ থাকে না • ব্রাউজার বন্ধ করলে চ্যাট শেষ।
            </p>

            {/* Custom Room URL Configuration */}
            {isCustomizingUrl && (
              <form onSubmit={handleSaveCustomUrl} className="pt-2 space-y-2">
                <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-300">
                  নির্দিষ্ট কাপল রুম URL (ঐচ্ছিক):
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={ghostUrl}
                    onChange={(e) => setGhostUrl(e.target.value)}
                    placeholder={DEFAULT_GHOST_APP_URL}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-[var(--background)] text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold"
                  >
                    সেভ
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGhostUrl(DEFAULT_GHOST_APP_URL);
                    const storageKey = `moodsync_ghost_chat_url_${coupleId || 'default'}`;
                    localStorage.removeItem(storageKey);
                    setIsCustomizingUrl(false);
                  }}
                  className="text-[10px] text-stone-400 hover:text-stone-600 underline"
                >
                  ডিফল্ট লিংক রিসেট করো
                </button>
              </form>
            )}

            {urlSaved && (
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>রুম লিংক সেভ করা হয়েছে!</span>
              </p>
            )}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 pt-2 pb-8 sm:pb-4 border-t border-[var(--card-border)] bg-[var(--card)] shrink-0 space-y-2">
          {/* Main Action: Open with or without Notification based on toggle */}
          <button
            type="button"
            onClick={handleOpenGhostChat}
            disabled={isSending}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isSending ? (
              <span>নোটিফিকেশন পাঠানো হচ্ছে...</span>
            ) : notifyPartner ? (
              <>
                <Send className="w-4 h-4" />
                <span>সঙ্গীকে নোটিফাই করে মেসেজ ওপেন করো 🚀</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                <span>ঘোস্ট মেসেজ ওপেন করো ↗️</span>
              </>
            )}
          </button>

          {/* Quick Silent Alternative if notifyPartner is ON */}
          {notifyPartner && (
            <button
              type="button"
              onClick={handleDirectOpen}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-[var(--background)] hover:bg-stone-50 dark:hover:bg-stone-900 active:scale-[0.98] text-stone-600 dark:text-stone-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>সরাসরি যাও (নোটিফিকেশন ছাড়া)</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
