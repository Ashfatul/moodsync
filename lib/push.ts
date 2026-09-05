import webpush from 'web-push';
import { createAdminClient } from './supabase/admin';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@moodsync.app';

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (error) {
    console.error('Error setting VAPID details:', error);
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
}

export async function sendPushToPartner(
  coupleId: string,
  senderUserId: string,
  payload: PushNotificationPayload
) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not set. Skipping Web Push notification.');
    return { success: false, reason: 'VAPID keys not configured' };
  }

  const supabase = createAdminClient();

  // 1. Query partner user IDs in the same couple from couple_members
  const { data: partnerMembers, error: memberError } = await supabase
    .from('couple_members')
    .select('user_id')
    .eq('couple_id', coupleId)
    .neq('user_id', senderUserId);

  if (memberError) {
    console.error('Error fetching partner members:', memberError);
  }

  const partnerUserIds = (partnerMembers || []).map((m) => m.user_id);

  // 2. Query active subscriptions for those partner user ID(s)
  let subscriptions: { id: string; endpoint: string; p256dh: string; auth: string }[] = [];

  if (partnerUserIds.length > 0) {
    const { data: subByUser, error: userSubError } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .in('user_id', partnerUserIds);

    if (!userSubError && subByUser) {
      subscriptions = subByUser;
    }
  }

  // Fallback: If no subscriptions found by user_id, check by couple_id
  if (subscriptions.length === 0) {
    const { data: subByCouple } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('couple_id', coupleId)
      .neq('user_id', senderUserId);

    if (subByCouple) {
      subscriptions = subByCouple;
    }
  }

  if (subscriptions.length === 0) {
    return { success: true, count: 0, reason: 'No active push subscriptions found for partner' };
  }

  const notificationString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/icon-192.png',
    tag: payload.tag || 'mood-update',
    url: payload.url || '/',
  });

  const deadSubscriptionIds: string[] = [];

  const sendPromises = subscriptions.map(async (sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, notificationString, {
        vapidDetails: {
          subject: vapidSubject,
          publicKey: vapidPublicKey,
          privateKey: vapidPrivateKey,
        },
        TTL: 60 * 60 * 24, // 24 hours
        urgency: 'high',   // CRITICAL for mobile (wakes up sleeping Android/iOS devices)
      });
    } catch (err: unknown) {
      const statusCode =
        typeof err === 'object' && err !== null && 'statusCode' in err
          ? (err as { statusCode: number }).statusCode
          : null;

      // 404 Not Found or 410 Gone means subscription expired or uninstalled
      if (statusCode === 404 || statusCode === 410) {
        deadSubscriptionIds.push(sub.id);
      } else {
        console.error('Push notification delivery error:', err);
      }
    }
  });

  await Promise.allSettled(sendPromises);

  // Clean up expired subscriptions if any
  if (deadSubscriptionIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', deadSubscriptionIds);
  }

  return { success: true, count: subscriptions.length - deadSubscriptionIds.length };
}

export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload
) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not set. Skipping Web Push notification.');
    return { success: false, reason: 'VAPID keys not configured' };
  }

  const supabase = createAdminClient();

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId);

  if (error || !subscriptions || subscriptions.length === 0) {
    return { success: false, count: 0, reason: 'No active push subscriptions found for this user' };
  }

  const notificationString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/icon-192.png',
    tag: payload.tag || 'moodsync-test',
    url: payload.url || '/',
  });

  const deadSubscriptionIds: string[] = [];

  const sendPromises = subscriptions.map(async (sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, notificationString, {
        vapidDetails: {
          subject: vapidSubject,
          publicKey: vapidPublicKey,
          privateKey: vapidPrivateKey,
        },
        TTL: 60 * 60 * 24,
        urgency: 'high',
      });
    } catch (err: unknown) {
      const statusCode =
        typeof err === 'object' && err !== null && 'statusCode' in err
          ? (err as { statusCode: number }).statusCode
          : null;

      if (statusCode === 404 || statusCode === 410) {
        deadSubscriptionIds.push(sub.id);
      } else {
        console.error('Test push delivery error:', err);
      }
    }
  });

  await Promise.allSettled(sendPromises);

  if (deadSubscriptionIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', deadSubscriptionIds);
  }

  return { success: true, count: subscriptions.length - deadSubscriptionIds.length };
}
