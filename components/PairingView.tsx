'use client';

import { useState } from 'react';
import { Heart, Copy, Check, Share2, ArrowRight, LogOut, KeyRound } from 'lucide-react';
import { Couple, Profile } from '@/lib/types';
import { STRINGS_BN } from '@/lib/constants/strings.bn';

interface PairingViewProps {
  couple: Couple | null;
  profile: Profile | null;
  onCreateCouple: (name: string) => Promise<{ success: boolean; couple?: Couple | null; error?: string }>;
  onJoinCouple: (code: string, name: string) => Promise<{ success: boolean; couple?: Couple | null; error?: string }>;
  onSignOut: () => Promise<void>;
}

export default function PairingView({
  couple,
  profile,
  onCreateCouple,
  onJoinCouple,
  onSignOut,
}: PairingViewProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localCouple, setLocalCouple] = useState<Couple | null>(null);
  const [showJoinInstead, setShowJoinInstead] = useState(false);

  const activeCouple = couple || localCouple;
  const displayName = profile?.name || 'প্রিয়জন';

  const handleCreate = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await onCreateCouple(displayName);
      if (res.success && res.couple) {
        setLocalCouple(res.couple);
      } else if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || inviteCode.trim().length !== 6) {
      setErrorMessage(STRINGS_BN.pairing.codeInvalid);
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await onJoinCouple(inviteCode.trim(), displayName);
      if (res.success && res.couple) {
        setLocalCouple(res.couple);
      } else if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!activeCouple?.invite_code) return;
    try {
      await navigator.clipboard.writeText(activeCouple.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShare = async () => {
    if (!activeCouple?.invite_code) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'মুডসিঙ্ক আমন্ত্রণ',
          text: `মুডসিঙ্কে আমার সাথে যুক্ত হও! আমন্ত্রণ কোড: ${activeCouple.invite_code}`,
          url: window.location.origin,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen min-h-dvh flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      <div className="space-y-6 text-center">
        {/* Logo */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500 shadow-sm">
          <Heart className="w-8 h-8 fill-rose-500 stroke-rose-500 animate-pulse" />
        </div>

        <div>
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-2">
            স্বাগতম, {displayName}! ❤️
          </span>
          <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            {STRINGS_BN.pairing.title}
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 max-w-xs mx-auto leading-relaxed">
            {STRINGS_BN.pairing.subtitle}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* If couple was created and waiting for partner, BUT user has option to enter partner's code */}
        {activeCouple?.invite_code && !showJoinInstead ? (
          <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--card-border)] shadow-sm space-y-4 animate-in fade-in duration-300">
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
              <KeyRound className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {STRINGS_BN.settingsScreen.waitingPartner}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                {STRINGS_BN.settingsScreen.shareCodeNotice}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700">
              <span className="font-mono text-3xl font-extrabold tracking-widest text-amber-900 dark:text-amber-100">
                {activeCouple.invite_code}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 py-3 px-4 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>শেয়ার করো</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? STRINGS_BN.settingsScreen.codeCopied : STRINGS_BN.settingsScreen.copyCode}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[var(--card-border)]/60">
              <button
                type="button"
                onClick={() => setShowJoinInstead(true)}
                className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline"
              >
                অথবা তোমার সঙ্গীর কোড দিয়ে যুক্ত হতে চাও? এখানে চাপ দাও
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* If user toggled from active code view */}
            {activeCouple?.invite_code && showJoinInstead && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowJoinInstead(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-medium"
                >
                  ← আমার কোড ফিরিয়ে দেখাও
                </button>
              </div>
            )}

            {/* OPTION 1: Create Couple (only show if user has not yet created one) */}
            {!activeCouple?.invite_code && (
              <>
                <div className="bg-[var(--card)] p-5 rounded-3xl border border-[var(--card-border)] space-y-3">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    {STRINGS_BN.pairing.createTitle}
                  </h3>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white text-sm font-bold shadow-sm transition-all"
                  >
                    {loading ? 'তৈরি হচ্ছে...' : STRINGS_BN.pairing.createBtn}
                  </button>
                </div>

                <div className="text-xs text-stone-600 dark:text-stone-300 font-semibold uppercase tracking-wider">
                  {STRINGS_BN.pairing.or}
                </div>
              </>
            )}

            {/* OPTION 2: Join with Code */}
            <form
              onSubmit={handleJoin}
              className="bg-[var(--card)] p-5 rounded-3xl border border-[var(--card-border)] space-y-3"
            >
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                {STRINGS_BN.pairing.joinTitle}
              </h3>
              <input
                type="text"
                maxLength={6}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder={STRINGS_BN.pairing.codePlaceholder}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-[var(--background)] font-mono text-center text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="submit"
                disabled={loading || inviteCode.trim().length !== 6}
                className="w-full py-3 px-4 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-stone-950 text-sm font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? STRINGS_BN.pairing.joining : STRINGS_BN.pairing.joinBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Sign Out */}
        <div className="pt-4">
          <button
            type="button"
            onClick={onSignOut}
            className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>অন্য অ্যাকাউন্টে লগইন করো</span>
          </button>
        </div>
      </div>
    </div>
  );
}
