'use client';

import { Heart, WifiOff, RefreshCw } from 'lucide-react';
import { STRINGS_BN } from '@/lib/constants/strings.bn';
import { UserPresenceState } from '@/lib/types';

interface HeaderProps {
  isOnline: boolean;
  isSyncing: boolean;
  partnerPresence: UserPresenceState | null;
  partnerName?: string;
}

export default function Header({
  isOnline,
  isSyncing,
  partnerPresence,
  partnerName,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[var(--background)]/85 border-b border-[var(--card-border)] px-4 py-3.5 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500 shadow-sm">
            <Heart className="w-4 h-4 fill-rose-500 stroke-rose-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--foreground)] flex items-center gap-1.5">
              {STRINGS_BN.appName}
            </h1>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          {/* Partner online indicator */}
          {partnerPresence ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>{partnerName || 'সঙ্গী'} অনলাইন</span>
            </div>
          ) : null}

          {/* Connection status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              !isOnline
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                : isSyncing
                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            {!isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{STRINGS_BN.status.offline}</span>
              </>
            ) : isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
                <span>{STRINGS_BN.status.syncing}</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>{STRINGS_BN.status.connected}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
