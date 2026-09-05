'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { STRINGS_BN, toBengaliNumber } from '@/lib/constants/strings.bn';

interface OfflineBannerProps {
  isOnline: boolean;
  pendingSyncCount?: number;
  isSyncing?: boolean;
}

export default function OfflineBanner({
  isOnline,
  pendingSyncCount = 0,
  isSyncing = false,
}: OfflineBannerProps) {
  if (isOnline) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className={`sticky top-0 z-40 text-xs font-semibold py-1.5 px-3 text-center shadow-xs flex items-center justify-center gap-1.5 transition-all ${
        !isOnline
          ? 'bg-amber-500 text-white'
          : 'bg-blue-600 text-white animate-in fade-in duration-300'
      }`}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>
            {pendingSyncCount > 0
              ? `অফলাইন মোড — ${toBengaliNumber(pendingSyncCount)}টি আপডেট জমা আছে, ইন্টারনেট পেলে সিঙ্ক হবে।`
              : STRINGS_BN.errors.network}
          </span>
        </>
      ) : (
        <>
          <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin" />
          <span>অফলাইনে জমা থাকা আপডেট সিঙ্ক হচ্ছে...</span>
        </>
      )}
    </aside>
  );
}
