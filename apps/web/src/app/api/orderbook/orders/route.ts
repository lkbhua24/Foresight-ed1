import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const client = getClient();
    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { chainId, verifyingContract, order, signature } = body;

    if (!chainId || !verifyingContract || !order || !signature) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Verify signature using ethers.verifyTypedData
    // For now, we trust the client (Development Mode)

    const { error } = await (client.from('orders') as any).insert({
      chain_id: chainId,
      verifying_contract: verifyingContract.toLowerCase(),
      maker_address: order.maker.toLowerCase(),
      outcome_index: Number(order.outcomeIndex),
      is_buy: order.isBuy,
      price: order.price,
      amount: order.amount,
      remaining: order.amount, // Initially, remaining equals amount
      expiry: order.expiry,
      maker_salt: order.salt,
      signature: signature,
      status: 'open',
    });

    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Order created' });

  } catch (e: any) {
    console.error('Create Order API error:', e);
    return NextResponse.json(
      { success: false, message: e?.message || String(e) },
      { status: 500 }
    );
  }
}
