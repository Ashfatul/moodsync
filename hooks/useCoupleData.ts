'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Profile, Couple, MoodEvent, MoodEventWithDetails, UserPresenceState } from '@/lib/types';
import { MOODS, NEEDS, STRINGS_BN } from '@/lib/constants/strings.bn';
import { FloatingParticle, IncomingNudgeAlert } from '@/components/FloatingHearts';

interface QueuedMoodEvent {
  tempId: string;
  coupleId: string;
  userId: string;
  moodId: string;
  needId?: string | null;
  intimacyMoodId?: string | null;
  note?: string | null;
  createdAt: string;
}

const CACHE_KEYS = {
  USER: 'moodsync_cache_user',
  PROFILE: 'moodsync_cache_profile',
  COUPLE: 'moodsync_cache_couple',
  PARTNER: 'moodsync_cache_partner',
  EVENTS: 'moodsync_cache_events',
  QUEUE: 'moodsync_offline_queue',
};

export function useCoupleData() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [moodEvents, setMoodEvents] = useState<MoodEventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [partnerPresence, setPartnerPresence] = useState<UserPresenceState | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Nudge & Miss You Bomb state
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [incomingNudge, setIncomingNudge] = useState<IncomingNudgeAlert | null>(null);

  const coupleIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    coupleIdRef.current = couple?.id || null;
    userIdRef.current = user?.id || null;
  }, [couple?.id, user?.id]);

  // 1. Initial Cache Hydration on mount (Instant offline startup)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    try {
      const cachedUser = localStorage.getItem(CACHE_KEYS.USER);
      const cachedProf = localStorage.getItem(CACHE_KEYS.PROFILE);
      const cachedCpl = localStorage.getItem(CACHE_KEYS.COUPLE);
      const cachedPartner = localStorage.getItem(CACHE_KEYS.PARTNER);
      const cachedEvts = localStorage.getItem(CACHE_KEYS.EVENTS);
      const cachedQueue = localStorage.getItem(CACHE_KEYS.QUEUE);

      if (cachedQueue) {
        const q = JSON.parse(cachedQueue);
        if (Array.isArray(q)) setPendingSyncCount(q.length);
      }

      if (cachedProf && cachedCpl) {
        if (cachedUser) setUser(JSON.parse(cachedUser));
        setProfile(JSON.parse(cachedProf));
        setCouple(JSON.parse(cachedCpl));
        if (cachedPartner) setPartnerProfile(JSON.parse(cachedPartner));
        if (cachedEvts) setMoodEvents(JSON.parse(cachedEvts));
        setLoading(false);
      }
    } catch (e) {
      console.warn('Failed to hydrate from offline cache:', e);
    }
  }, []);

  // Refresh mood events from DB with offline queue merging
  const fetchMoodEvents = useCallback(
    async (cId: string, currentUserId: string, pProfile: Profile | null) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return;
      }

      setIsSyncing(true);
      try {
        const { data, error } = await supabase
          .from('mood_events')
          .select('*')
          .eq('couple_id', cId)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          console.error('Error fetching mood events:', error);
          return;
        }

        if (data) {
          const enriched: MoodEventWithDetails[] = data.map((evt: MoodEvent) => {
            const isMe = evt.user_id === currentUserId;
            return {
              ...evt,
              isCurrentUser: isMe,
              authorName: isMe ? STRINGS_BN.nowScreen.you : (pProfile?.name || 'সঙ্গী'),
            };
          });

          // Merge any pending offline queued items at the top
          let finalEvents = enriched;
          try {
            const queuedRaw = localStorage.getItem(CACHE_KEYS.QUEUE);
            if (queuedRaw) {
              const queued: QueuedMoodEvent[] = JSON.parse(queuedRaw);
              if (Array.isArray(queued) && queued.length > 0) {
                const queuedDetails: MoodEventWithDetails[] = queued.map((q) => ({
                  id: q.tempId,
                  couple_id: q.coupleId,
                  user_id: q.userId,
                  mood_id: q.moodId,
                  need_id: q.needId || null,
                  intimacy_mood_id: q.intimacyMoodId || null,
                  note: q.note || null,
                  created_at: q.createdAt,
                  isCurrentUser: true,
                  authorName: STRINGS_BN.nowScreen.you,
                  isOfflinePending: true,
                }));
                finalEvents = [...queuedDetails, ...enriched];
              }
            }
            localStorage.setItem(CACHE_KEYS.EVENTS, JSON.stringify(finalEvents));
          } catch {}

          setMoodEvents(finalEvents);
        }
      } catch (err) {
        console.warn('Fetch mood events failed (likely offline):', err);
      } finally {
        setIsSyncing(false);
      }
    },
    [supabase]
  );

  // Helper: Queue an offline mood event into LocalStorage
  const queueOfflineMood = useCallback((item: QueuedMoodEvent) => {
    try {
      const existing = localStorage.getItem(CACHE_KEYS.QUEUE);
      const queue: QueuedMoodEvent[] = existing ? JSON.parse(existing) : [];
      queue.push(item);
      localStorage.setItem(CACHE_KEYS.QUEUE, JSON.stringify(queue));
      setPendingSyncCount(queue.length);
    } catch (e) {
      console.error('Failed to queue offline mood:', e);
    }
  }, []);

  // Helper: Sync offline queue with Supabase when online
  const syncOfflineQueue = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.onLine) return;

    let queue: QueuedMoodEvent[] = [];
    try {
      const existing = localStorage.getItem(CACHE_KEYS.QUEUE);
      if (!existing) return;
      queue = JSON.parse(existing);
      if (!Array.isArray(queue) || queue.length === 0) return;
    } catch {
      return;
    }

    setIsSyncing(true);
    const remainingQueue: QueuedMoodEvent[] = [];

    for (const item of queue) {
      try {
        const { data: inserted, error } = await supabase
          .from('mood_events')
          .insert({
            couple_id: item.coupleId,
            user_id: item.userId,
            mood_id: item.moodId,
            need_id: item.needId || null,
            intimacy_mood_id: item.intimacyMoodId || null,
            note: item.note || null,
            created_at: item.createdAt,
          })
          .select()
          .single();

        if (error || !inserted) {
          remainingQueue.push(item);
        } else {
          // Update event in React state and LocalStorage
          setMoodEvents((prev) => {
            const next = prev.map((e) =>
              e.id === item.tempId
                ? { ...e, id: inserted.id, isOfflinePending: false }
                : e
            );
            try {
              localStorage.setItem(CACHE_KEYS.EVENTS, JSON.stringify(next));
            } catch {}
            return next;
          });

          // Trigger push notification quietly
          try {
            const { data: sData } = await supabase.auth.getSession();
            const token = sData.session?.access_token;
            const moodDef = MOODS.find((m) => m.id === item.moodId);
            fetch('/api/push/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                coupleId: item.coupleId,
                title: `মুড আপডেট: ${moodDef?.emoji || '❤️'} ${moodDef?.name || ''}`,
                body: item.note ? `চিরকুট: "${item.note}"` : 'মনের অনুভূতি জানানো হয়েছে।',
              }),
            }).catch(() => {});
          } catch {}
        }
      } catch {
        remainingQueue.push(item);
      }
    }

    if (remainingQueue.length > 0) {
      localStorage.setItem(CACHE_KEYS.QUEUE, JSON.stringify(remainingQueue));
      setPendingSyncCount(remainingQueue.length);
    } else {
      localStorage.removeItem(CACHE_KEYS.QUEUE);
      setPendingSyncCount(0);
    }

    setIsSyncing(false);
  }, [supabase]);

  // Load all user and couple data with offline resilience
  const loadInitialData = useCallback(async () => {
    try {
      setErrorMsg(null);

      // If completely offline, keep using cached state
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOnline(false);
        setLoading(false);
        return;
      }

      const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();

      if (authErr || !authUser) {
        // If network error occurred, keep cached data
        if (
          authErr &&
          (authErr.message?.includes('FetchError') ||
            authErr.message?.includes('network') ||
            authErr.message?.includes('Failed to fetch'))
        ) {
          setIsOnline(false);
          setLoading(false);
          return;
        }

        // Genuine signout
        setUser(null);
        setProfile(null);
        setCouple(null);
        setPartnerProfile(null);
        setMoodEvents([]);
        localStorage.removeItem(CACHE_KEYS.USER);
        localStorage.removeItem(CACHE_KEYS.PROFILE);
        localStorage.removeItem(CACHE_KEYS.COUPLE);
        localStorage.removeItem(CACHE_KEYS.PARTNER);
        localStorage.removeItem(CACHE_KEYS.EVENTS);
        setLoading(false);
        return;
      }

      setUser(authUser);
      localStorage.setItem(CACHE_KEYS.USER, JSON.stringify(authUser));

      // 1. Get or create current user's profile
      let prof: Profile | null = null;
      const { data: existingProf, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profErr || !existingProf) {
        const defaultName = authUser.user_metadata?.name || 'প্রিয়জন';
        const { data: newProf } = await supabase
          .from('profiles')
          .insert({ id: authUser.id, name: defaultName })
          .select()
          .single();
        prof = newProf;
      } else {
        prof = existingProf;
      }
      setProfile(prof);
      if (prof) localStorage.setItem(CACHE_KEYS.PROFILE, JSON.stringify(prof));

      // 2. Check couple membership
      const { data: memberships, error: memErr } = await supabase
        .from('couple_members')
        .select('couple_id')
        .eq('user_id', authUser.id)
        .limit(1);

      if (memErr || !memberships || memberships.length === 0) {
        setCouple(null);
        setPartnerProfile(null);
        setMoodEvents([]);
        setLoading(false);
        return;
      }

      const activeCoupleId = memberships[0].couple_id;

      // 3. Get couple details
      const { data: coupleData } = await supabase
        .from('couples')
        .select('*')
        .eq('id', activeCoupleId)
        .single();

      setCouple(coupleData);
      if (coupleData) localStorage.setItem(CACHE_KEYS.COUPLE, JSON.stringify(coupleData));

      // 4. Find partner member
      const { data: allMembers } = await supabase
        .from('couple_members')
        .select('user_id')
        .eq('couple_id', activeCoupleId);

      let foundPartner: Profile | null = null;
      if (allMembers && allMembers.length > 1) {
        const partnerMember = allMembers.find((m) => m.user_id !== authUser.id);
        if (partnerMember) {
          const { data: pData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', partnerMember.user_id)
            .single();
          foundPartner = pData;
          setPartnerProfile(pData);
          if (pData) localStorage.setItem(CACHE_KEYS.PARTNER, JSON.stringify(pData));
        }
      } else {
        setPartnerProfile(null);
      }

      // 5. Fetch mood events
      await fetchMoodEvents(activeCoupleId, authUser.id, foundPartner);

      // 6. Sync any offline queued moods
      syncOfflineQueue();
    } catch (err: unknown) {
      console.warn('Initialization offline fallback:', err);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchMoodEvents, syncOfflineQueue]);

  // Initial load
  useEffect(() => {
    queueMicrotask(() => {
      loadInitialData();
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        loadInitialData();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [loadInitialData, supabase]);

  // Network online/offline event listeners and auto-sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
      if (coupleIdRef.current && userIdRef.current) {
        fetchMoodEvents(coupleIdRef.current, userIdRef.current, partnerProfile);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        syncOfflineQueue();
        if (coupleIdRef.current && userIdRef.current) {
          fetchMoodEvents(coupleIdRef.current, userIdRef.current, partnerProfile);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchMoodEvents, syncOfflineQueue, partnerProfile]);

  // Spawn flying hearts & emojis for Miss You Bombs
  const triggerFloatingHearts = useCallback((emoji = '❤️', count = 8) => {
    const newParticles: FloatingParticle[] = [];
    const particleCount = Math.min(Math.max(count * 2, 6), 30);

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: `p-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        emoji,
        left: 5 + Math.random() * 85,
        size: 24 + Math.random() * 26,
        duration: 2 + Math.random() * 1.5,
        delay: Math.random() * 0.4,
      });
    }

    setParticles((prev) => [...prev.slice(-30), ...newParticles]);

    // Clean up
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 4000);
  }, []);

  // Realtime subscription (Supabase broadcast, postgres changes, online presence)
  useEffect(() => {
    if (!couple?.id || !user?.id) return;

    const channelName = `couple-realtime-${couple.id}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mood_events',
          filter: `couple_id=eq.${couple.id}`,
        },
        (payload) => {
          const newEvt = payload.new as MoodEvent;
          const isMe = newEvt.user_id === user.id;
          const enriched: MoodEventWithDetails = {
            ...newEvt,
            isCurrentUser: isMe,
            authorName: isMe ? STRINGS_BN.nowScreen.you : (partnerProfile?.name || 'সঙ্গী'),
          };

          setMoodEvents((prev) => {
            if (prev.some((e) => e.id === newEvt.id)) return prev;
            const updated = [enriched, ...prev];
            try {
              localStorage.setItem(CACHE_KEYS.EVENTS, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'mood_events',
          filter: `couple_id=eq.${couple.id}`,
        },
        () => {
          fetchMoodEvents(couple.id, user.id, partnerProfile);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'couple_members',
          filter: `couple_id=eq.${couple.id}`,
        },
        () => {
          loadInitialData();
        }
      )
      .on(
        'broadcast',
        { event: 'quick_nudge' },
        ({ payload }: { payload: { senderUserId?: string; senderName?: string; emoji?: string; text?: string; count?: number; customMessage?: string } }) => {
          if (!payload) return;
          const { senderUserId, senderName, emoji, text, count, customMessage } = payload;
          if (senderUserId !== user.id) {
            triggerFloatingHearts(emoji || '❤️', Math.min(count || 5, 20));
            setIncomingNudge({
              senderName: senderName || partnerProfile?.name || 'সঙ্গী',
              emoji: emoji || '❤️',
              text: text || 'মিস করছি',
              count: count || 1,
              customMessage,
            });
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        let partnerActive: UserPresenceState | null = null;
        Object.keys(state).forEach((key) => {
          if (key !== user.id) {
            const presences = state[key] as unknown as { onlineAt: string }[];
            if (presences && presences.length > 0) {
              partnerActive = {
                userId: key,
                onlineAt: presences[0].onlineAt,
                status: 'online',
              };
            }
          }
        });
        setPartnerPresence(partnerActive);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: user.id,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id, user?.id, partnerProfile, supabase, fetchMoodEvents, loadInitialData, triggerFloatingHearts]);

  // Submit Mood Event (Instant optimistic UI + LocalStorage Queue if offline + DB insert + Push)
  const submitMood = async (payload: {
    moodId: string;
    needId?: string | null;
    intimacyMoodId?: string | null;
    note?: string | null;
  }) => {
    if (!couple?.id || !user?.id) return { success: false, error: 'কাপল পাওয়া যায়নি' };

    const tempId = 'offline-' + Date.now();
    const isCurrentlyOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    const optimisticEvent: MoodEventWithDetails = {
      id: tempId,
      couple_id: couple.id,
      user_id: user.id,
      mood_id: payload.moodId,
      need_id: payload.needId || null,
      intimacy_mood_id: payload.intimacyMoodId || null,
      note: payload.note || null,
      created_at: new Date().toISOString(),
      isCurrentUser: true,
      authorName: STRINGS_BN.nowScreen.you,
      isOfflinePending: isCurrentlyOffline,
    };

    // 1. Immediate UI update and local cache persistence
    setMoodEvents((prev) => {
      const updated = [optimisticEvent, ...prev];
      try {
        localStorage.setItem(CACHE_KEYS.EVENTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. If offline, save into queue and return success immediately
    if (isCurrentlyOffline) {
      queueOfflineMood({
        tempId,
        coupleId: couple.id,
        userId: user.id,
        moodId: payload.moodId,
        needId: payload.needId || null,
        intimacyMoodId: payload.intimacyMoodId || null,
        note: payload.note || null,
        createdAt: optimisticEvent.created_at,
      });
      return { success: true, isOffline: true };
    }

    // 3. If online, attempt insert
    try {
      const { data: inserted, error: insertErr } = await supabase
        .from('mood_events')
        .insert({
          couple_id: couple.id,
          user_id: user.id,
          mood_id: payload.moodId,
          need_id: payload.needId || null,
          intimacy_mood_id: payload.intimacyMoodId || null,
          note: payload.note || null,
        })
        .select()
        .single();

      if (insertErr) {
        // Network or DB error -> queue offline instead of discarding!
        console.warn('Mood insert failed, falling back to offline queue:', insertErr);
        queueOfflineMood({
          tempId,
          coupleId: couple.id,
          userId: user.id,
          moodId: payload.moodId,
          needId: payload.needId || null,
          intimacyMoodId: payload.intimacyMoodId || null,
          note: payload.note || null,
          createdAt: optimisticEvent.created_at,
        });
        return { success: true, isOffline: true };
      }

      // Replace temp with real record
      setMoodEvents((prev) => {
        const next = prev.map((e) =>
          e.id === tempId ? { ...e, id: inserted.id, isOfflinePending: false } : e
        );
        try {
          localStorage.setItem(CACHE_KEYS.EVENTS, JSON.stringify(next));
        } catch {}
        return next;
      });

      // Trigger Web Push to partner
      const moodDef = MOODS.find((m) => m.id === payload.moodId);
      const needDef = payload.needId ? NEEDS.find((n) => n.id === payload.needId) : null;
      const pushTitle = `${profile?.name || 'সঙ্গী'}: ${moodDef?.emoji || '❤️'} ${moodDef?.name || 'মুড আপডেট'}`;
      const pushBody = needDef
        ? `দরকার: ${needDef.emoji} ${needDef.name}`
        : payload.note
        ? `চিরকুট: "${payload.note.slice(0, 50)}"`
        : `${moodDef?.shortDesc || 'মনের অনুভূতি জানানো হয়েছে।'}`;

      (async () => {
        try {
          const { data: sData } = await supabase.auth.getSession();
          const token = sData.session?.access_token;
          const res = await fetch('/api/push/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              coupleId: couple.id,
              title: pushTitle,
              body: pushBody,
            }),
          });
          if (!res.ok) {
            const errRes = await res.json().catch(() => ({}));
            console.warn('Push notification send failed:', res.status, errRes);
          }
        } catch (e) {
          console.warn('Push trigger notification error:', e);
        }
      })();

      return { success: true };
    } catch (err: unknown) {
      console.warn('Network exception during submit, queueing offline:', err);
      queueOfflineMood({
        tempId,
        coupleId: couple.id,
        userId: user.id,
        moodId: payload.moodId,
        needId: payload.needId || null,
        intimacyMoodId: payload.intimacyMoodId || null,
        note: payload.note || null,
        createdAt: optimisticEvent.created_at,
      });
      return { success: true, isOffline: true };
    }
  };

  // Helper to quietly sync push subscription with new couple ID
  const syncPushSubscriptionWithCouple = async (newCoupleId: string) => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const { data: sData } = await supabase.auth.getSession();
        const token = sData.session?.access_token;
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            subscription: sub.toJSON(),
            coupleId: newCoupleId,
          }),
        });
      }
    } catch {
      // Non-blocking background sync
    }
  };

  // Create Couple
  const createCouple = async (partnerName: string) => {
    if (!user) return { success: false, error: 'লগইন করুন' };
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_couple', {
        partner_name: partnerName || 'প্রিয়জন',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data) {
        setCouple(data);
        syncPushSubscriptionWithCouple(data.id);
      }

      await loadInitialData();
      return { success: true, couple: data };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ত্রুটি';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Join Couple with 6-char code
  const joinCouple = async (code: string, partnerName: string) => {
    if (!user) return { success: false, error: 'লগইন করুন' };
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('join_couple_with_code', {
        code: code.trim(),
        partner_name: partnerName || 'প্রিয়জন',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data) {
        setCouple(data);
        syncPushSubscriptionWithCouple(data.id);
      }

      await loadInitialData();
      return { success: true, couple: data };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ত্রুটি';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Update profile name
  const updateProfileName = async (newName: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: newName.trim(), updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (!error) {
        setProfile((prev) => {
          const next = prev ? { ...prev, name: newName.trim() } : null;
          if (next) localStorage.setItem(CACHE_KEYS.PROFILE, JSON.stringify(next));
          return next;
        });
      }
    } catch (err) {
      console.error('Error updating name:', err);
    }
  };

  // Update retention days
  const updateRetentionDays = async (days: number) => {
    if (!couple?.id) return;
    try {
      const { error } = await supabase
        .from('couples')
        .update({ retention_days: days, updated_at: new Date().toISOString() })
        .eq('id', couple.id);

      if (!error) {
        setCouple((prev) => {
          const next = prev ? { ...prev, retention_days: days } : null;
          if (next) localStorage.setItem(CACHE_KEYS.COUPLE, JSON.stringify(next));
          return next;
        });
      }
    } catch (err) {
      console.error('Error updating retention:', err);
    }
  };

  // Delete all mood events for couple (Reset history)
  const deleteCoupleHistory = async () => {
    if (!couple?.id) return;
    try {
      const { error } = await supabase
        .from('mood_events')
        .delete()
        .eq('couple_id', couple.id);

      if (!error) {
        setMoodEvents([]);
        localStorage.removeItem(CACHE_KEYS.EVENTS);
        localStorage.removeItem(CACHE_KEYS.QUEUE);
        setPendingSyncCount(0);
      }
    } catch (err) {
      console.error('Error deleting history:', err);
    }
  };

  // Export all couple data as JSON
  const exportData = () => {
    const dataToExport = {
      app: 'MoodSync',
      exportedAt: new Date().toISOString(),
      user: {
        id: user?.id,
        name: profile?.name,
        email: user?.email,
      },
      partner: partnerProfile
        ? {
            name: partnerProfile.name,
          }
        : null,
      couple: {
        id: couple?.id,
        created_at: couple?.created_at,
        retention_days: couple?.retention_days,
      },
      events: moodEvents,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moodsync-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Send Quick Nudge / Miss You Bomb
  const sendQuickNudge = async (payload: {
    emoji: string;
    text: string;
    count: number;
    customMessage?: string;
  }) => {
    if (!couple?.id || !user) return { success: false };

    // If offline, notify user gently
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        error: 'ইন্টারনেট সংযোগ নেই। অনলাইনে এলে পিং পাঠানো যাবে।',
      };
    }

    // 1. Locally spawn floating emojis
    triggerFloatingHearts(payload.emoji, Math.min(payload.count, 20));

    // 2. Broadcast via Supabase Realtime channel
    const channelName = `couple-realtime-${couple.id}`;
    const channels = supabase.getChannels();
    const activeChannel = channels.find(
      (c) => c.topic === `realtime:${channelName}` || c.topic === channelName
    );
    if (activeChannel) {
      activeChannel
        .send({
          type: 'broadcast',
          event: 'quick_nudge',
          payload: {
            senderUserId: user.id,
            senderName: profile?.name || 'সঙ্গী',
            emoji: payload.emoji,
            text: payload.text,
            count: payload.count,
            customMessage: payload.customMessage,
          },
        })
        .catch(() => {});
    }

    // 3. Send Web Push to partner's phone
    try {
      const { data: sData } = await supabase.auth.getSession();
      const token = sData.session?.access_token;
      fetch('/api/push/nudge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          coupleId: couple.id,
          emoji: payload.emoji,
          text: payload.text,
          count: payload.count,
          customMessage: payload.customMessage,
        }),
      }).catch((err) => console.warn('Nudge push error:', err));
    } catch {
      // Non-blocking
    }

    return { success: true };
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCouple(null);
    setPartnerProfile(null);
    setMoodEvents([]);
    localStorage.removeItem(CACHE_KEYS.USER);
    localStorage.removeItem(CACHE_KEYS.PROFILE);
    localStorage.removeItem(CACHE_KEYS.COUPLE);
    localStorage.removeItem(CACHE_KEYS.PARTNER);
    localStorage.removeItem(CACHE_KEYS.EVENTS);
    localStorage.removeItem(CACHE_KEYS.QUEUE);
    setPendingSyncCount(0);
  };

  // Derive partner's latest mood and current user's latest mood
  const myLatestMood = moodEvents.find((e) => e.isCurrentUser) || null;
  const partnerLatestMood = moodEvents.find((e) => !e.isCurrentUser) || null;

  return {
    supabase,
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
    pendingSyncCount,
    partnerPresence,
    errorMsg,
    submitMood,
    createCouple,
    joinCouple,
    updateProfileName,
    updateRetentionDays,
    deleteCoupleHistory,
    exportData,
    signOut,
    refreshData: loadInitialData,
    syncOfflineQueue,
    // Quick Nudge & Miss You Bomb
    particles,
    incomingNudge,
    setIncomingNudge,
    triggerFloatingHearts,
    sendQuickNudge,
  };
}
