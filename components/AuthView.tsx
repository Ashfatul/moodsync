'use client';

import { useState } from 'react';
import { Heart, Lock, Mail, User, Info, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { STRINGS_BN } from '@/lib/constants/strings.bn';

interface AuthViewProps {
  onOpenOnboarding: () => void;
  onSuccess: () => void;
}

export default function AuthView({ onOpenOnboarding, onSuccess }: AuthViewProps) {
  const [supabase] = useState(() => createClient());
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim() || 'প্রিয়জন',
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        if (data.session) {
          onSuccess();
        } else {
          setMessage('অ্যাকাউন্ট তৈরি হয়েছে! তোমার ইমেইলে ভেরিফিকেশন লিঙ্ক পাঠানো হয়েছে (যদি প্রযোজ্য হয়)।');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMsg(STRINGS_BN.errors.authFailed);
          return;
        }

        onSuccess();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : STRINGS_BN.errors.generic;
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      <div className="space-y-6">
        {/* Brand Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500 shadow-sm">
            <Heart className="w-8 h-8 fill-rose-500 stroke-rose-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            {STRINGS_BN.appName}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
            {STRINGS_BN.appTagline}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-2xl bg-stone-100 dark:bg-stone-900 p-1 border border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'signin'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            লগইন
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            নতুন অ্যাকাউন্ট
          </button>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--card-border)] shadow-sm space-y-4"
        >
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300">
              {message}
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400">
                তোমার নাম
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: অনিক বা মিতু"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400">
              ইমেইল
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষর"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'প্রক্রিয়াধীন...' : mode === 'signin' ? 'লগইন করো' : 'অ্যাকাউন্ট খুলো'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Onboarding trigger */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 inline-flex items-center gap-1 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>অ্যাপটি কীভাবে কাজ করে ও প্রাইভেসি পলিসি</span>
          </button>
        </div>
      </div>
    </div>
  );
}
