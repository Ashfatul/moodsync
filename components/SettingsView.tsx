'use client';

import { useState, useEffect } from 'react';
import {
  User,
  HeartHandshake,
  Bell,
  Clock,
  ShieldCheck,
  Download,
  Trash2,
  LogOut,
  Copy,
  Check,
  Share2,
  Send,
  Smartphone,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Profile, Couple } from '@/lib/types';
import { STRINGS_BN } from '@/lib/constants/strings.bn';
import { createClient } from '@/lib/supabase/client';

interface SettingsViewProps {
  profile: Profile | null;
  couple: Couple | null;
  partnerProfile: Profile | null;
  onOpenLetsTalk?: () => void;
  onUpdateName: (name: string) => Promise<void>;
  onUpdateRetention: (days: number) => Promise<void>;
  onExportData: () => void;
  onDeleteHistory: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

export default function SettingsView({
  profile,
  couple,
  partnerProfile,
  onOpenLetsTalk,
  onUpdateName,
  onUpdateRetention,
  onExportData,
  onDeleteHistory,
  onSignOut,
}: SettingsViewProps) {
  const [name, setName] = useState(profile?.name || '');
  const [savedName, setSavedName] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [pushStatus, setPushStatus] = useState<'enabled' | 'disabled' | 'unsupported'>('disabled');
  const [pushLoading, setPushLoading] = useState(false);
  const [isIosNotPwa, setIsIosNotPwa] = useState(false);
  const [isInstalledApp, setIsInstalledApp] = useState(false);
  const [testPushLoading, setTestPushLoading] = useState(false);
  const [pushMessage, setPushMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedRetention, setSelectedRetention] = useState<number>(couple?.retention_days || 30);

  // Password change state
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [prevProfileName, setPrevProfileName] = useState(profile?.name);
  if (profile?.name !== prevProfileName) {
    setPrevProfileName(profile?.name);
    setName(profile?.name || '');
  }

  const [prevRetention, setPrevRetention] = useState(couple?.retention_days);
  if (couple?.retention_days !== prevRetention) {
    setPrevRetention(couple?.retention_days);
    setSelectedRetention(couple?.retention_days || 30);
  }

  // Check current push notification permission and subscription
  useEffect(() => {
    let isMounted = true;

    const checkPushStatus = async () => {
      if (typeof window === 'undefined') return;

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone);

      if (isMounted) {
        setIsInstalledApp(Boolean(isStandalone));
      }

      // On iOS Safari, Web Push is only supported if added to Home Screen (PWA)
      if (isIOS && !isStandalone) {
        if (isMounted) {
          setIsIosNotPwa(true);
          setPushStatus('unsupported');
        }
        return;
      }

      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        if (isMounted) setPushStatus('unsupported');
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();

        if (isMounted) {
          if (sub && Notification.permission === 'granted') {
            setPushStatus('enabled');
          } else {
            setPushStatus('disabled');
          }
        }
      } catch {
        if (isMounted) setPushStatus('disabled');
      }
    };

    checkPushStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onUpdateName(name);
    setSavedName(true);
    setTimeout(() => setSavedName(false), 2000);
  };

  const handleCopyCode = async () => {
    if (!couple?.invite_code) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(couple.invite_code);
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleShareCode = async () => {
    if (!couple?.invite_code) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'মুডসিঙ্ক আমন্ত্রণ',
          text: `মুডসিঙ্কে আমার সাথে যুক্ত হও! আমন্ত্রণ কোড: ${couple.invite_code}`,
          url: window.location.origin,
        });
      } catch {
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  const handleTogglePush = async () => {
    if (pushStatus === 'unsupported') return;
    setPushLoading(true);
    setPushMessage(null);

    try {
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        throw new Error('ওয়েব পুশ নোটিফিকেশনের জন্য নিরাপদ সংযোগ (HTTPS বা localhost) প্রয়োজন।');
      }

      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        throw new Error('আপনার বর্তমান ব্রাউজার ওয়েব পুশ নোটিফিকেশন সাপোর্ট করে না।');
      }

      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Ensure service worker is actively registered
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
      }
      await navigator.serviceWorker.ready;

      if (pushStatus === 'enabled') {
        // Unsubscribe
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          await fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: authHeaders,
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setPushStatus('disabled');
        setPushMessage({ type: 'success', text: 'নোটিফিকেশন বন্ধ করা হয়েছে।' });
      } else {
        // Subscribe
        if (Notification.permission === 'denied') {
          setPushStatus('disabled');
          setPushMessage({
            type: 'error',
            text: 'ব্রাউজারে নোটিফিকেশন ব্লক করা আছে। অ্যাড্রেস বারের বাম পাশের লক (Lock) বা সাইট সেটিংসে গিয়ে Notifications: Allow করুন।',
          });
          setPushLoading(false);
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setPushStatus('disabled');
          setPushMessage({
            type: 'error',
            text: 'ব্রাউজারে নোটিফিকেশনের অনুমতি দেওয়া হয়নি। অনুগ্রহ করে ব্রাউজার সাইট সেটিংসে গিয়ে Notifications Allow করুন।',
          });
          setPushLoading(false);
          return;
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          setPushMessage({ type: 'error', text: 'VAPID Public Key কনফিগার করা নেই।' });
          setPushLoading(false);
          return;
        }

        // Clean up any stale/mismatched existing subscription before subscribing
        // On desktop browsers (Chrome, Edge, Firefox), subscribing when an existing subscription
        // with another key or in a stale state exists throws "Registration failed - push service error"
        try {
          const existingSub = await registration.pushManager.getSubscription();
          if (existingSub) {
            await existingSub.unsubscribe();
          }
        } catch (unsubErr) {
          console.warn('Could not clear previous subscription:', unsubErr);
        }

        // Convert base64 url-safe VAPID to Uint8Array
        const urlBase64ToUint8Array = (base64String: string) => {
          const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
          const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
          const rawData = window.atob(base64);
          const outputArray = new Uint8Array(rawData.length);
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
          }
          return outputArray;
        };

        let subscription: PushSubscription;
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey.trim()),
          });
        } catch (subErr: unknown) {
          console.error('PushManager subscribe error:', subErr);
          const errMessage = subErr instanceof Error ? subErr.message : String(subErr);
          const isBrave =
            Boolean((navigator as unknown as { brave?: unknown })?.brave) ||
            navigator.userAgent.toLowerCase().includes('brave');

          if (
            errMessage.includes('push service error') ||
            (subErr as { name?: string })?.name === 'AbortError' ||
            isBrave
          ) {
            throw new Error(
              'ব্রাউজার পুশ সার্ভিস এরর: আপনি যদি Brave ব্রাউজার ব্যবহার করেন, brave://settings/privacy পেজে গিয়ে "Use Google services for push messaging" অন করে ব্রাউজার রিস্টার্ট দিন।'
            );
          }
          throw subErr;
        }

        // Send subscription to server
        const res = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            coupleId: couple?.id,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'সাবস্ক্রিপশন সেভ করা সম্ভব হয়নি');
        }

        setPushStatus('enabled');
        setPushMessage({ type: 'success', text: 'নোটিফিকেশন সক্রিয় করা হয়েছে! সঙ্গী মুড আপডেট করলে এলার্ট পাবেন।' });
      }
    } catch (err) {
      console.error('Push toggle error:', err);
      setPushMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'নোটিফিকেশন সেটআপে ত্রুটি ঘটেছে',
      });
    } finally {
      setPushLoading(false);
    }
  };

  const handleSendTestPush = async () => {
    setTestPushLoading(true);
    setPushMessage(null);

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || 'টেস্ট নোটিফিকেশন পাঠানো যায়নি');
      }

      if (json.count === 0) {
        setPushMessage({
          type: 'error',
          text: 'ডিভাইস পাওয়া যায়নি। অনুগ্রহ করে নোটিফিকেশন বাটনটি একবার বন্ধ করে আবার চালু করুন।',
        });
      } else {
        setPushMessage({
          type: 'success',
          text: '✅ টেস্ট নোটিফিকেশন পাঠানো হয়েছে! আপনার ফোনের নোটিফিকেশন বার চেক করুন।',
        });
      }
    } catch (err) {
      setPushMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'টেস্ট নোটিফিকেশন পাঠানো ব্যর্থ হয়েছে',
      });
    } finally {
      setTestPushLoading(false);
    }
  };

  const handleRetentionChange = async (days: number) => {
    setSelectedRetention(days);
    await onUpdateRetention(days);
  };

  const handleDeleteAll = async () => {
    if (window.confirm(STRINGS_BN.settingsScreen.confirmDeleteHistory)) {
      await onDeleteHistory();
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!newPassword) {
      setPasswordMessage({ type: 'error', text: 'নতুন পাসওয়ার্ড লিখুন।' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'উভয় পাসওয়ার্ড মিলছে না।' });
      return;
    }

    setPasswordLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setPasswordMessage({ type: 'success', text: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordMessage(null);
        setIsPasswordFormOpen(false);
      }, 3000);
    } catch (err: unknown) {
      console.error('Change password failed:', err);
      const msg = err instanceof Error ? err.message : 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।';
      setPasswordMessage({ type: 'error', text: msg });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          {STRINGS_BN.settingsScreen.title}
        </h2>
      </div>

      {/* 1. Profile Section */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
          <User className="w-4 h-4 text-rose-500" />
          {STRINGS_BN.settingsScreen.profileSection}
        </h3>
        <form onSubmit={handleSaveName} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
              {STRINGS_BN.settingsScreen.yourName}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={STRINGS_BN.settingsScreen.namePlaceholder}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                {savedName ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{savedName ? 'সংরক্ষিত' : STRINGS_BN.settingsScreen.saveName}</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Password Change Section */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-rose-500" />
            <span>পাসওয়ার্ড পরিবর্তন</span>
          </h3>
          <button
            type="button"
            onClick={() => {
              setIsPasswordFormOpen(!isPasswordFormOpen);
              setPasswordMessage(null);
            }}
            className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            {isPasswordFormOpen ? 'বাতিল' : 'পরিবর্তন করুন'}
          </button>
        </div>

        {isPasswordFormOpen && (
          <form onSubmit={handleChangePassword} className="space-y-3 pt-1 animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                নতুন পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
                  aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                নতুন পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {passwordMessage && (
              <div
                className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5"
            >
              {passwordLoading ? (
                <span>আপডেট হচ্ছে...</span>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>পাসওয়ার্ড আপডেট করুন</span>
                </>
              )}
            </button>
          </form>
        )}
      </section>

      {/* 2. Partner Connection Section */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-rose-500" />
          {STRINGS_BN.settingsScreen.partnerSection}
        </h3>

        {partnerProfile ? (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                {STRINGS_BN.settingsScreen.partnerConnected}
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                সঙ্গী: <span className="font-semibold">{partnerProfile.name}</span>
              </p>
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
        ) : couple?.invite_code ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2.5">
            <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
              {STRINGS_BN.settingsScreen.waitingPartner}
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              {STRINGS_BN.settingsScreen.shareCodeNotice}
            </p>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700">
              <span className="font-mono text-xl font-bold tracking-widest text-amber-900 dark:text-amber-100">
                {couple.invite_code}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleShareCode}
                  className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 hover:bg-amber-200"
                  title="শেয়ার করো"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-1 text-xs font-medium"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? STRINGS_BN.settingsScreen.codeCopied : STRINGS_BN.settingsScreen.copyCode}</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* PWA App Installation Section */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-2xs space-y-2.5">
        <h3 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-rose-500" />
          <span>অ্যাপ ইনস্টলেশন (PWA)</span>
        </h3>

        {isInstalledApp ? (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>মুডসিঙ্ক আপনার ফোনে অ্যাপ হিসেবে ইনস্টল করা আছে (Standalone)।</span>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              ব্রাউজার ছাড়া সরাসরি হোমস্ক্রিন থেকে ফুল-স্ক্রিন মোডে ব্যবহার এবং তাৎক্ষণিক পুশ নোটিফিকেশন পেতে অ্যাপটি ইনস্টল করুন।
            </p>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('moodsync:open-install'));
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>হোমস্ক্রিনে অ্যাপ ইনস্টল করুন 📲</span>
            </button>
          </div>
        )}
      </section>

      {/* Connected Secret Chat App: Ghost Message */}
      <section className="rounded-3xl border border-violet-200/80 dark:border-violet-900/60 bg-gradient-to-r from-violet-50/50 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/10 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
            <span className="text-base select-none">👻</span>
            <span>সিক্রেট চ্যাট (Ghost Message)</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60">
            সংযুক্ত ✅
          </span>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          মুডসিঙ্কের সাথে যুক্ত এন্ড-টু-এন্ড এনক্রিপ্টেড ক্ষণস্থায়ী চ্যাট। হোমপেজের &apos;চলো কথা বলি&apos; চাপলে সরাসরি এই চ্যাটে যাওয়া যাবে।
        </p>

        <div className="p-3 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">চ্যাট লিঙ্ক:</span>
            <span className="font-mono text-[11px] text-violet-600 dark:text-violet-400 font-semibold truncate max-w-[200px]">
              ghost-message-13rh.onrender.com
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            {onOpenLetsTalk && (
              <button
                type="button"
                onClick={onOpenLetsTalk}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 active:scale-[0.98] text-white text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <span>সঙ্গীকে নোটিফাই করে চ্যাট খুলুন 🚀</span>
              </button>
            )}

            <a
              href="https://ghost-message-13rh.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <span>সরাসরি ওপেন করুন (নোটিফিকেশন ছাড়া) ↗️</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. Notifications Section */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
          <Bell className="w-4 h-4 text-rose-500" />
          {STRINGS_BN.settingsScreen.notificationsSection}
        </h3>
        <p className="text-xs text-stone-600 dark:text-stone-300">
          {STRINGS_BN.settingsScreen.notificationsDesc}
        </p>

        {isIosNotPwa ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-100">
              <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>আইফোনে (iOS) নোটিফিকেশন পাওয়ার নিয়ম:</span>
            </div>
            <p className="text-stone-600 dark:text-stone-300">
              অ্যাপল সাফারি ব্রাউজার সরাসরি পুশ নোটিফিকেশন সাপোর্ট করে না। আইফোনে নোটিফিকেশন পেতে:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-stone-700 dark:text-stone-200 font-medium">
              <li>নিচে সাফারির <strong>Share (শেয়ার)</strong> বাটনে চাপ দিন।</li>
              <li>তালিকা থেকে <strong>&apos;Add to Home Screen&apos; (হোম স্ক্রিনে যোগ করুন)</strong> চাপুন।</li>
              <li>এবার হোম স্ক্রিনের <strong>মুডসিঙ্ক</strong> অ্যাপটি খুলুন এবং নোটিফিকেশন অন করুন।</li>
            </ol>
          </div>
        ) : pushStatus === 'unsupported' ? (
          <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-900 text-xs text-stone-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-stone-400 shrink-0" />
            <span>{STRINGS_BN.settingsScreen.pushNotSupported} (শুধুমাত্র HTTPS বা সুরক্ষিত ব্রাউজারে কাজ করে)</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleTogglePush}
              disabled={pushLoading}
              className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                pushStatus === 'enabled'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500 text-white hover:bg-rose-600'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>
                {pushLoading
                  ? 'প্রক্রিয়াধীন...'
                  : pushStatus === 'enabled'
                  ? STRINGS_BN.settingsScreen.pushEnabled
                  : STRINGS_BN.settingsScreen.enablePush}
              </span>
            </button>

            {pushStatus === 'enabled' && (
              <button
                type="button"
                onClick={handleSendTestPush}
                disabled={testPushLoading}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testPushLoading ? 'পাঠানো হচ্ছে...' : 'একটি টেস্ট নোটিফিকেশন পাঠাও'}</span>
              </button>
            )}
          </div>
        )}

        {pushMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-medium ${
              pushMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
            }`}
          >
            {pushMessage.text}
          </div>
        )}
      </section>

      {/* 4. Data Retention Section */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-500" />
          {STRINGS_BN.settingsScreen.retentionSection}
        </h3>
        <p className="text-xs text-stone-600 dark:text-stone-300">
          {STRINGS_BN.settingsScreen.retentionDesc}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {[
            { days: 7, label: STRINGS_BN.settingsScreen.days7 },
            { days: 14, label: STRINGS_BN.settingsScreen.days14 },
            { days: 30, label: STRINGS_BN.settingsScreen.days30 },
          ].map((item) => (
            <button
              key={item.days}
              type="button"
              onClick={() => handleRetentionChange(item.days)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                selectedRetention === item.days
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                  : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-rose-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* 5. Privacy & Data Rights */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-500" />
          {STRINGS_BN.settingsScreen.privacySection}
        </h3>
        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          {STRINGS_BN.settingsScreen.privacyGuarantee}
        </p>

        <div className="space-y-2 pt-1">
          {/* Export Data */}
          <button
            type="button"
            onClick={onExportData}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-rose-500" />
            <span>{STRINGS_BN.settingsScreen.exportData}</span>
          </button>

          {/* Delete History */}
          <button
            type="button"
            onClick={handleDeleteAll}
            className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/60 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{STRINGS_BN.settingsScreen.deleteHistory}</span>
          </button>
        </div>
      </section>

      {/* 6. Sign Out */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSignOut}
          className="w-full py-3.5 px-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-[var(--card)] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>{STRINGS_BN.settingsScreen.signOut}</span>
        </button>
      </div>
    </div>
  );
}
