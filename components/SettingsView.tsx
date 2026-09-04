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
} from 'lucide-react';
import { Profile, Couple } from '@/lib/types';
import { STRINGS_BN } from '@/lib/constants/strings.bn';

interface SettingsViewProps {
  profile: Profile | null;
  couple: Couple | null;
  partnerProfile: Profile | null;
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
  const [selectedRetention, setSelectedRetention] = useState<number>(couple?.retention_days || 30);

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

  // Check current push notification permission
  useEffect(() => {
    queueMicrotask(() => {
      if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
        setPushStatus('unsupported');
        return;
      }

      if (Notification.permission === 'granted') {
        setPushStatus('enabled');
      } else {
        setPushStatus('disabled');
      }
    });
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

    try {
      if (pushStatus === 'enabled') {
        // Unsubscribe
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          await fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setPushStatus('disabled');
      } else {
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setPushStatus('disabled');
          setPushLoading(false);
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          alert('VAPID Public Key not configured.');
          setPushLoading(false);
          return;
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

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // Send subscription to server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            coupleId: couple?.id,
          }),
        });

        setPushStatus('enabled');
      }
    } catch (err) {
      console.error('Push toggle error:', err);
    } finally {
      setPushLoading(false);
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

      {/* 3. Notifications Section */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
          <Bell className="w-4 h-4 text-rose-500" />
          {STRINGS_BN.settingsScreen.notificationsSection}
        </h3>
        <p className="text-xs text-stone-600 dark:text-stone-300">
          {STRINGS_BN.settingsScreen.notificationsDesc}
        </p>

        {pushStatus === 'unsupported' ? (
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900 text-xs text-stone-500">
            {STRINGS_BN.settingsScreen.pushNotSupported}
          </div>
        ) : (
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
