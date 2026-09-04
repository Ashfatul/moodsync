import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  return handleCleanup(req);
}

export async function POST(req: NextRequest) {
  return handleCleanup(req);
}

async function handleCleanup(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      const urlSecret = req.nextUrl.searchParams.get('secret');
      if (urlSecret !== expectedSecret) {
        return NextResponse.json({ error: 'অননুমোদিত রিকোয়েস্ট' }, { status: 401 });
      }
    }

    const supabase = createAdminClient();

    // Call stored procedure to purge old mood events according to each couple's retention_days
    const { data, error } = await supabase.rpc('cleanup_expired_mood_events');

    if (error) {
      console.error('Cleanup error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deletedEventsCount: data ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'সার্ভার ত্রুটি';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
