import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPushToUser } from '@/lib/push';

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

    const result = await sendPushToUser(user.id, {
      title: 'মুডসিঙ্ক টেস্ট ❤️',
      body: 'অভিনন্দন! তোমার মোবাইলে নোটিফিকেশন সফলভাবে কাজ করছে।',
      tag: 'moodsync-test-' + Date.now(),
      url: '/',
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'সার্ভার ত্রুটি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
