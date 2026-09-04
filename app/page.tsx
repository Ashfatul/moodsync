'use client';

import { useState, useEffect } from 'react';
import { useCoupleData } from '@/hooks/useCoupleData';
import Header from '@/components/Header';
import BottomNav, { TabType } from '@/components/BottomNav';
import NowView from '@/components/NowView';
import TodayView from '@/components/TodayView';
import WeekView from '@/components/WeekView';
import SettingsView from '@/components/SettingsView';
import MoodModal from '@/components/MoodModal';
import FightModal from '@/components/FightModal';
import AuthView from '@/components/AuthView';
import PairingView from '@/components/PairingView';
import OnboardingModal from '@/components/OnboardingModal';
import OfflineBanner from '@/components/OfflineBanner';
import { Heart } from 'lucide-react';

export default function Home() {
  const {
    user,
    profile,
    couple,
    partnerProfile,
    moodEvents,
    myLatestMood,
    partnerLatestMood,
    loading,
    isOnline,
    isSyncing,
    partnerPresence,
    submitMood,
    createCouple,
    joinCouple,
    updateProfileName,
    updateRetentionDays,
    deleteCoupleHistory,
    exportData,
    signOut,
    refreshData,
  } = useCoupleData();

  const [activeTab, setActiveTab] = useState<TabType>('now');
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isFightModalOpen, setIsFightModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Check if first-time visitor to show onboarding
  useEffect(() => {
    queueMicrotask(() => {
      const hasSeenOnboarding = localStorage.getItem('moodsync_onboarding_seen');
      if (!hasSeenOnboarding) {
        setIsOnboardingOpen(true);
      }
    });
  }, []);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('moodsync_onboarding_seen', 'true');
    setIsOnboardingOpen(false);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--background)]">
        <div className="w-14 h-14 rounded-3xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500 shadow-sm animate-pulse mb-3">
          <Heart className="w-7 h-7 fill-rose-500 stroke-rose-500" />
        </div>
        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
          মুডসিঙ্ক লোড হচ্ছে...
        </p>
      </div>
    );
  }

  // Not logged in -> Show Auth View
  if (!user) {
    return (
      <>
        <OfflineBanner isOnline={isOnline} />
        <AuthView
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onSuccess={refreshData}
        />
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onComplete={handleCompleteOnboarding}
        />
      </>
    );
  }

  // Logged in but not in a couple OR waiting for partner
  if (!couple || (!partnerProfile && couple.invite_code)) {
    return (
      <>
        <OfflineBanner isOnline={isOnline} />
        <PairingView
          couple={couple}
          profile={profile}
          onCreateCouple={createCouple}
          onJoinCouple={joinCouple}
          onSignOut={signOut}
        />
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onComplete={handleCompleteOnboarding}
        />
      </>
    );
  }

  // Count today's updates
  const todayStr = new Date().toDateString();
  const todayCount = moodEvents.filter(
    (e) => new Date(e.created_at).toDateString() === todayStr
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <OfflineBanner isOnline={isOnline} />

      {/* Top Header */}
      <Header
        isOnline={isOnline}
        isSyncing={isSyncing}
        partnerPresence={partnerPresence}
        partnerName={partnerProfile?.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-2">
        {activeTab === 'now' && (
          <NowView
            partnerMood={partnerLatestMood}
            myMood={myLatestMood}
            partnerProfile={partnerProfile}
            todayCount={todayCount}
            onOpenMoodModal={() => setIsMoodModalOpen(true)}
            onOpenFightModal={() => setIsFightModalOpen(true)}
          />
        )}

        {activeTab === 'today' && (
          <TodayView
            events={moodEvents}
            partnerProfile={partnerProfile}
          />
        )}

        {activeTab === 'week' && (
          <WeekView events={moodEvents} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            couple={couple}
            partnerProfile={partnerProfile}
            onUpdateName={updateProfileName}
            onUpdateRetention={updateRetentionDays}
            onExportData={exportData}
            onDeleteHistory={deleteCoupleHistory}
            onSignOut={signOut}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Modals */}
      <MoodModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        onSubmit={submitMood}
      />

      <FightModal
        isOpen={isFightModalOpen}
        onClose={() => setIsFightModalOpen(false)}
        onSubmit={submitMood}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}
