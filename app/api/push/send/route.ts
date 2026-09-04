import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPushToPartner } from '@/lib/push';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'অননুমোদিত অনুরোধ' }, { status: 401 });
    }

    const { coupleId, title, body } = await req.json();

    if (!coupleId || !title || !body) {
      return NextResponse.json({ error: 'প্রয়োজনীয় তথ্য অনুপস্থিত' }, { status: 400 });
    }

    // Verify user is actually a member of this couple
    const { data: membership, error: memError } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('couple_id', coupleId)
      .eq('user_id', user.id)
      .single();

    if (memError || !membership) {
      return NextResponse.json({ error: 'এই কাপলে আপনার অধিকার নেই' }, { status: 403 });
    }

    // Send push notification to partner
    const result = await sendPushToPartner(coupleId, user.id, {
      title,
      body,
      tag: 'moodsync-partner-update',
      url: '/',
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'সার্ভার ত্রুটি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
