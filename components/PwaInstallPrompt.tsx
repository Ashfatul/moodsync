'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, X, Share2, PlusSquare, Smartphone, CheckCircle, Heart } from 'lucide-react';
import { STRINGS_BN } from '@/lib/constants/strings.bn';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running as standalone PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone);

    setIsStandalone(Boolean(standalone));

    // Detect iOS
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream: unknown }).MSStream;
    setIsIos(Boolean(ios));

    // If already installed, don't show prompt
    if (standalone) return;

    // Check last dismissal timestamp (24h cooldown)
    const dismissedAt = localStorage.getItem('moodsync_install_dismissed_at');
    const isRecentlyDismissed =
      dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 24 * 60 * 60 * 1000;

    // Listen for beforeinstallprompt (Chromium / Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      deferredPromptRef.current = promptEvent;
      setDeferredPrompt(promptEvent);

      if (!isRecentlyDismissed) {
        // Slight delay so the page loads smoothly before showing prompt
        setTimeout(() => {
          setShowPrompt(true);
        }, 1200);
      }
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setShowPrompt(false);
      setShowIosGuide(false);
      setInstalledSuccess(true);
      localStorage.removeItem('moodsync_install_dismissed_at');
      setTimeout(() => setInstalledSuccess(false), 4000);
    };

    // Custom event to trigger install popup anytime (e.g. from Settings)
    const handleCustomTrigger = () => {
      if (ios && !standalone) {
        setShowIosGuide(true);
      } else if (deferredPromptRef.current) {
        setShowPrompt(true);
      } else {
        // Fallback if no prompt event is cached
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('moodsync:open-install', handleCustomTrigger);

    // If on iOS and not standalone and not recently dismissed, show prompt after 2 seconds
    if (ios && !standalone && !isRecentlyDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('moodsync:open-install', handleCustomTrigger);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowPrompt(false);
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setInstalledSuccess(true);
          setShowPrompt(false);
          setTimeout(() => setInstalledSuccess(false), 4000);
        }
        deferredPromptRef.current = null;
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('PWA install prompt failed:', err);
      }
    } else {
      // Fallback: explain how to install from browser menu
      alert('আপনার ব্রাউজার মেন্যু (⋮) থেকে "Install app" অথবা "Add to Home screen" নির্বাচন করুন।');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('moodsync_install_dismissed_at', Date.now().toString());
  };

  // If already standalone and no notification toast, render nothing
  if (isStandalone && !installedSuccess) return null;

  return (
    <>
      {/* 1. Success Toast */}
      {installedSuccess && (
        <div className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 p-3.5 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <div className="text-xs font-semibold">
            🎉 মুডসিঙ্ক অ্যাপ সফলভাবে ইনস্টল হয়েছে!
          </div>
        </div>
      )}

      {/* 2. Floating Bottom Install Popup Banner */}
      {showPrompt && !isStandalone && (
        <div className="fixed bottom-20 left-3 right-3 max-w-md mx-auto z-40 animate-in slide-in-from-bottom duration-300">
          <div className="p-3.5 rounded-3xl backdrop-blur-xl bg-white/95 dark:bg-stone-900/95 border border-rose-200 dark:border-rose-900/80 shadow-2xl space-y-2.5">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shrink-0">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <span>{STRINGS_BN.appName} অ্যাপ ইনস্টল করো</span>
                    <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-extrabold">
                      PWA
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug mt-0.5">
                    হোমস্ক্রিন থেকে এক ট্যাপে ব্যবহার ও ইনস্ট্যান্ট নোটিফিকেশন পেতে অ্যাপটি ইনস্টল করুন।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                title="পরে করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>{isIos ? 'আইফোনে ইনস্টল নিয়ম 📲' : 'ইনস্টল করুন 📲'}</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
              >
                পরে
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. iOS Step-by-Step Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full sm:max-w-md flex flex-col bg-[var(--card)] rounded-t-3xl sm:rounded-3xl border border-[var(--card-border)] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    আইফোনে ইনস্টল করার সহজ নিয়ম
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    সাফারি ব্রাউজারে ৩টি সহজ ধাপ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1.5 -mr-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guide Steps */}
            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  ১
                </div>
                <div>
                  <p className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <span>সাফারির Share বাটনে চাপুন</span>
                    <Share2 className="w-4 h-4 text-blue-500" />
                  </p>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">
                    স্ক্রিনের একদম নিচে সাফারির মাঝের শেয়ার বোতামে ট্যাপ করুন।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  ২
                </div>
                <div>
                  <p className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <span>&apos;Add to Home Screen&apos; চাপুন</span>
                    <PlusSquare className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                  </p>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">
                    একটু নিচের দিকে স্ক্রোল করে &apos;Add to Home Screen&apos; (হোম স্ক্রিনে যোগ করুন) অপশনটি নির্বাচন করুন।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  ৩
                </div>
                <div>
                  <p className="font-bold text-[var(--foreground)]">
                    উপরে ডানদিকের &apos;Add&apos; বোতামে চাপুন
                  </p>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">
                    তাহলেই আপনার হোম স্ক্রিনে মুডসিঙ্ক অ্যাপ আইকন তৈরি হয়ে যাবে এবং পুশ নোটিফিকেশন চালু হবে!
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="p-4 pt-2 pb-8 sm:pb-4 border-t border-[var(--card-border)] bg-[var(--card)]">
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="w-full py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all text-center"
              >
                বুঝেছি 👍
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
