'use client';

import { Sparkles, Calendar, BarChart3, Settings } from 'lucide-react';
import { STRINGS_BN } from '@/lib/constants/strings.bn';

export type TabType = 'now' | 'today' | 'week' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onChangeTab }: BottomNavProps) {
  const navItems: { id: TabType; label: string; icon: typeof Sparkles }[] = [
    { id: 'now', label: STRINGS_BN.tabs.now, icon: Sparkles },
    { id: 'today', label: 'টাইমলাইন', icon: Calendar },
    { id: 'week', label: STRINGS_BN.tabs.week, icon: BarChart3 },
    { id: 'settings', label: STRINGS_BN.tabs.settings, icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--card)]/90 backdrop-blur-lg border-t border-[var(--card-border)] pb-safe transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full min-h-[48px] transition-all relative ${
                isActive
                  ? 'text-rose-500 dark:text-rose-400 font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
              aria-label={item.label}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 rounded-b-full bg-rose-500 dark:bg-rose-400" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs leading-normal">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
