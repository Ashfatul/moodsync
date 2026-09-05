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
import NudgeModal from '@/components/NudgeModal';
import LetsTalkModal from '@/components/LetsTalkModal';
import FloatingHearts from '@/components/FloatingHearts';
import AuthView from '@/components/AuthView';
import PairingView from '@/components/PairingView';
import OnboardingModal from '@/components/OnboardingModal';
import OfflineBanner from '@/components/OfflineBanner';
import InAppChatModal from '@/components/InAppChatModal';
import { DEFAULT_GHOST_APP_URL } from '@/lib/constants/strings.bn';
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
    activeChatInvite,
    loading,
    isOnline,
    isSyncing,
    pendingSyncCount,
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
    particles,
    incomingNudge,
    setIncomingNudge,
    triggerFloatingHearts,
    sendQuickNudge,
  } = useCoupleData();

  const [activeTab, setActiveTab] = useState<TabType>('now');
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isFightModalOpen, setIsFightModalOpen] = useState(false);
  const [isNudgeModalOpen, setIsNudgeModalOpen] = useState(false);
  const [isLetsTalkOpen, setIsLetsTalkOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // In-App Chat Modal state
  const [isInAppChatOpen, setIsInAppChatOpen] = useState(false);
  const [chatRoomUrl, setChatRoomUrl] = useState(DEFAULT_GHOST_APP_URL);

  const handleOpenInAppChat = (url?: string) => {
    if (url) setChatRoomUrl(url);
    setIsInAppChatOpen(true);
  };

  // Check if first-time visitor to show onboarding, and check ?openChat=1 or sw messages
  useEffect(() => {
    queueMicrotask(() => {
      const hasSeenOnboarding = localStorage.getItem('moodsync_onboarding_seen');
      if (!hasSeenOnboarding) {
        setIsOnboardingOpen(true);
      }
    });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('openChat') === '1') {
        setIsInAppChatOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      }

      const handleSwMessage = (event: MessageEvent) => {
        if (event.data?.type === 'OPEN_GHOST_CHAT') {
          if (event.data.roomUrl) {
            setChatRoomUrl(event.data.roomUrl);
          }
          setIsInAppChatOpen(true);
        }
      };

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', handleSwMessage);
      }

      return () => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.removeEventListener('message', handleSwMessage);
        }
      };
    }
  }, []);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('moodsync_onboarding_seen', 'true');
    setIsOnboardingOpen(false);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center p-4 bg-[var(--background)]">
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
        <OfflineBanner
          isOnline={isOnline}
          pendingSyncCount={pendingSyncCount}
          isSyncing={isSyncing}
        />
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
        <OfflineBanner
          isOnline={isOnline}
          pendingSyncCount={pendingSyncCount}
          isSyncing={isSyncing}
        />
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
    <div className="min-h-screen min-h-dvh flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <OfflineBanner
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        isSyncing={isSyncing}
      />

      {/* Top Header */}
      <Header
        isOnline={isOnline}
        isSyncing={isSyncing}
        partnerPresence={partnerPresence}
        partnerName={partnerProfile?.name}
        partnerMood={partnerLatestMood}
        myMood={myLatestMood}
        onOpenMoodModal={() => setIsMoodModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-2 pb-safe">
        {activeTab === 'now' && (
          <NowView
            partnerMood={partnerLatestMood}
            myMood={myLatestMood}
            partnerProfile={partnerProfile}
            todayCount={todayCount}
            activeChatInvite={activeChatInvite}
            onOpenMoodModal={() => setIsMoodModalOpen(true)}
            onOpenFightModal={() => setIsFightModalOpen(true)}
            onOpenNudgeModal={() => setIsNudgeModalOpen(true)}
            onOpenLetsTalk={() => setIsLetsTalkOpen(true)}
            onOpenInAppChat={handleOpenInAppChat}
            onQuickNudge={(emoji, text) => sendQuickNudge({ emoji, text, count: 1 })}
            onViewHistory={() => setActiveTab('today')}
          />
        )}

        {activeTab === 'today' && (
          <TodayView
            events={moodEvents}
            partnerProfile={partnerProfile}
            onOpenInAppChat={handleOpenInAppChat}
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
            onOpenLetsTalk={() => setIsLetsTalkOpen(true)}
            onOpenInAppChat={handleOpenInAppChat}
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

      {/* Floating Emojis & Realtime In-App Incoming Nudge Banner */}
      <FloatingHearts
        particles={particles}
        incomingNudge={incomingNudge}
        onDismissIncoming={() => setIncomingNudge(null)}
        onOpenInAppChat={handleOpenInAppChat}
      />

      {/* Modals */}
      <MoodModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        onSubmit={submitMood}
      />

      <FightModal
        isOpen={isFightModalOpen}
        onClose={() => setIsFightModalOpen(false)}
        onOpenLetsTalk={() => setIsLetsTalkOpen(true)}
        onSubmit={submitMood}
      />

      <NudgeModal
        isOpen={isNudgeModalOpen}
        onClose={() => setIsNudgeModalOpen(false)}
        partnerName={partnerProfile?.name || 'সঙ্গী'}
        onSendNudge={sendQuickNudge}
        onTriggerFloatingHearts={triggerFloatingHearts}
      />

      <LetsTalkModal
        isOpen={isLetsTalkOpen}
        onClose={() => setIsLetsTalkOpen(false)}
        partnerName={partnerProfile?.name || 'সঙ্গী'}
        coupleId={couple?.id}
        onSendInvite={sendQuickNudge}
        onTriggerFloatingHearts={triggerFloatingHearts}
        onOpenInAppChat={handleOpenInAppChat}
      />

      <InAppChatModal
        isOpen={isInAppChatOpen}
        onClose={() => setIsInAppChatOpen(false)}
        roomUrl={chatRoomUrl}
        partnerName={partnerProfile?.name || 'সঙ্গী'}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}
