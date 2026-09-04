'use client';

import { WifiOff } from 'lucide-react';
import { STRINGS_BN } from '@/lib/constants/strings.bn';

interface OfflineBannerProps {
  isOnline: boolean;
}

export default function OfflineBanner({ isOnline }: OfflineBannerProps) {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-amber-500 text-white text-xs font-semibold py-1 px-3 text-center shadow-md flex items-center justify-center gap-1.5 animate-in slide-in-from-top duration-300">
      <WifiOff className="w-3.5 h-3.5" />
      <span>{STRINGS_BN.errors.network}</span>
    </div>
  );
}
