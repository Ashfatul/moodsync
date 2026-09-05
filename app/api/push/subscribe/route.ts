import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function getAuthenticatedUser(req: NextRequest) {
  const supabase = await createClient();
  let user = null;

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user) {
      user = data.user;
    }
  }

  if (!user) {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    }
  }

  return user;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json({ error: 'অননুমোদিত অনুরোধ' }, { status: 401 });
    }

    const { subscription, coupleId } = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'অবৈধ সাবস্ক্রিপশন ডাটা' }, { status: 400 });
    }

    const { endpoint, keys } = subscription;
    const adminSupabase = createAdminClient();

    let resolvedCoupleId = coupleId || null;
    if (!resolvedCoupleId) {
      const { data: member } = await adminSupabase
        .from('couple_members')
        .select('couple_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (member?.couple_id) {
        resolvedCoupleId = member.couple_id;
      }
    }

    // Save or update subscription via admin client to avoid RLS conflicts on existing endpoints
    const { error: insertError } = await adminSupabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          couple_id: resolvedCoupleId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

    if (insertError) {
      console.error('Subscription save error:', insertError);
      return NextResponse.json({ error: 'সাবস্ক্রিপশন সংরক্ষণ ব্যর্থ হয়েছে' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'সার্ভার ত্রুটি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json({ error: 'অননুমোদিত অনুরোধ' }, { status: 401 });
    }

    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'এন্ডপয়েন্ট প্রদান করা আবশ্যক' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    await adminSupabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'সার্ভার ত্রুটি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
