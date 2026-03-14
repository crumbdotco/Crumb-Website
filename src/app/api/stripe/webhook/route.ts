import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
}

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    );
  } catch {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    const session = event.data.object as Record<string, any>;
    const email = session.customer_details?.email ?? session.receipt_email;
    const paymentId = session.payment_intent ?? session.id;

    if (email) {
      await getSupabase()
        .from('waitlist')
        .upsert(
          {
            email: (email as string).toLowerCase().trim(),
            tier: 'founding_member',
            stripe_payment_id: paymentId,
          },
          { onConflict: 'email' }
        );
    }
  }

  return NextResponse.json({ received: true });
}
