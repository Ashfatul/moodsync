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

  // Query active subscriptions of the partner in the same couple
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('couple_id', coupleId)
    .neq('user_id', senderUserId);

  if (error || !subscriptions || subscriptions.length === 0) {
    return { success: true, count: 0 };
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
      await webpush.sendNotification(pushSubscription, notificationString);
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
