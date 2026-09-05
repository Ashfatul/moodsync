import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPushToPartner } from '@/lib/push';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Support Cookie auth and Authorization Bearer header
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

    // Fallback: verify token using admin client
    if (!user && authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const adminSupabase = createAdminClient();
      const { data, error } = await adminSupabase.auth.getUser(token);
      if (!error && data?.user) {
        user = data.user;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'অননুমোদিত অনুরোধ' }, { status: 401 });
    }

    const { coupleId, text, emoji, count = 1, customMessage, url } = await req.json();

    if (!coupleId) {
      return NextResponse.json({ error: 'coupleId আবশ্যক' }, { status: 400 });
    }

    // Verify user is a member of this couple
    const { data: membership, error: memError } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('couple_id', coupleId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (memError || !membership) {
      return NextResponse.json({ error: 'এই কাপলে আপনার অধিকার নেই' }, { status: 403 });
    }

    // Get sender profile name
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .maybeSingle();

    const senderName = profile?.name || 'সঙ্গী';
    const nudgeEmoji = emoji || '❤️';
    const nudgeText = text || 'মিস করছি';

    let title = `${senderName}: ${nudgeEmoji} ${nudgeText}`;
    if (count > 1) {
      title += ` (x${count} বোম্ব! 💣)`;
    }

    const body = customMessage?.trim()
      ? `"${customMessage.trim().slice(0, 80)}"`
      : count > 1
      ? `তোমাকে অনেক অনেক বেশি ${nudgeText}! ❤️`
      : `তোমাকে এখন খুব মনে পড়ছে... ❤️`;

    // Unique tag per timestamp so rapid multiple pushes arrive without replacing previous ones
    const tag = `nudge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const result = await sendPushToPartner(coupleId, user.id, {
      title,
      body,
      tag,
      url: url || '/',
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'সার্ভার ত্রুটি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
