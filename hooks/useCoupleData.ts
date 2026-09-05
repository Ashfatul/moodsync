'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Profile, Couple, MoodEvent, MoodEventWithDetails, UserPresenceState } from '@/lib/types';
import { MOODS, NEEDS, STRINGS_BN } from '@/lib/constants/strings.bn';
import { FloatingParticle, IncomingNudgeAlert } from '@/components/FloatingHearts';

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
  const [partnerPresence, setPartnerPresence] = useState<UserPresenceState | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Nudge & Miss You Bomb state
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [incomingNudge, setIncomingNudge] = useState<IncomingNudgeAlert | null>(null);

  const coupleIdRef = useRef<string | null>(null);

  useEffect(() => {
    coupleIdRef.current = couple?.id || null;
  }, [couple?.id]);

  // Refresh mood events
  const fetchMoodEvents = useCallback(async (cId: string, currentUserId: string, pProfile: Profile | null) => {
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
        setMoodEvents(enriched);
      }
    } catch (err) {
      console.error('Fetch mood events failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [supabase]);

  // Load all user and couple data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();

      if (authErr || !authUser) {
        setUser(null);
        setProfile(null);
        setCouple(null);
        setPartnerProfile(null);
        setMoodEvents([]);
        setLoading(false);
        return;
      }

      setUser(authUser);

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
        }
      } else {
        setPartnerProfile(null);
      }

      // 5. Fetch mood events
      await fetchMoodEvents(activeCoupleId, authUser.id, foundPartner);
    } catch (err: unknown) {
      console.error('Initialization error:', err);
      setErrorMsg(STRINGS_BN.errors.generic);
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchMoodEvents]);

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

  // Network and Mobile visibility change handler (wake from sleep)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && coupleIdRef.current && user) {
        // App woke up from background/sleep: immediate re-sync
        fetchMoodEvents(coupleIdRef.current, user.id, partnerProfile);
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
  }, [fetchMoodEvents, user, partnerProfile]);

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

    setParticles((prev) => [...prev.slice(-20), ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 4000);
  }, []);

  // Supabase Realtime Subscription: Filtered by couple_id
  useEffect(() => {
    if (!couple?.id || !user?.id) return;

    const channelName = `couple-realtime-${couple.id}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // 1. Listen for new or updated mood events
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
            // Deduplicate if already present
            if (prev.some((e) => e.id === newEvt.id)) return prev;
            return [enriched, ...prev];
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
          // If events are deleted / cleared
          fetchMoodEvents(couple.id, user.id, partnerProfile);
        }
      )
      // 2. Listen for partner joining
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
      // 3. Listen for live incoming quick nudges / Miss You Bombs
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
      // 4. Lightweight presence: track partner online state
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
  }, [couple?.id, user?.id, partnerProfile, supabase, fetchMoodEvents, loadInitialData]);

  // Submit Mood Event (Instant optimistic UI + DB insert + Push Notification)
  const submitMood = async (payload: {
    moodId: string;
    needId?: string | null;
    intimacyMoodId?: string | null;
    note?: string | null;
  }) => {
    if (!couple?.id || !user?.id) return { success: false, error: 'কাপল পাওয়া যায়নি' };

    const tempId = 'temp-' + Date.now();
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
    };

    // Optimistic update
    setMoodEvents((prev) => [optimisticEvent, ...prev]);

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
        console.error('Insert mood error:', insertErr);
        // Rollback optimistic
        setMoodEvents((prev) => prev.filter((e) => e.id !== tempId));
        return { success: false, error: STRINGS_BN.errors.generic };
      }

      // Replace temp with real record
      setMoodEvents((prev) =>
        prev.map((e) => (e.id === tempId ? { ...e, id: inserted.id } : e))
      );

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
      console.error('Submit mood failed:', err);
      setMoodEvents((prev) => prev.filter((e) => e.id !== tempId));
      const message = err instanceof Error ? err.message : STRINGS_BN.errors.generic;
      return { success: false, error: message };
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
        setProfile((prev) => (prev ? { ...prev, name: newName.trim() } : null));
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
        setCouple((prev) => (prev ? { ...prev, retention_days: days } : null));
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
    // Quick Nudge & Miss You Bomb
    particles,
    incomingNudge,
    setIncomingNudge,
    triggerFloatingHearts,
    sendQuickNudge,
  };
}
