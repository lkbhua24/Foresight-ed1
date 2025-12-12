import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const client = getClient();
    if (!client) {
      return NextResponse.json({ success: false, message: 'Supabase not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { maker, salt, signature } = body;

    if (!maker || !salt) {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    }

    // TODO: Verify signature

    // Update order status to cancelled
    const { error } = await (client
      .from('orders') as any)
      .update({ status: 'cancelled' })
      .eq('maker_address', maker.toLowerCase())
      .eq('maker_salt', salt);

    if (error) {
      console.error('Cancel order error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Order cancelled' });
  } catch (e: any) {
    console.error('Cancel API error:', e);
    return NextResponse.json({ success: false, message: e?.message || String(e) }, { status: 500 });
  }
}
