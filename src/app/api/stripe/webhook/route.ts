import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
  }
  return new Stripe(key);
}

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not configured');
  }
  return secret;
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables are not configured');
  }
  return createClient(url, key);
}

export async function POST(request: Request) {
  let body: string;
  let sig: string | null;

  try {
    body = await request.text();
    sig = request.headers.get('stripe-signature');
  } catch {
    return NextResponse.json({ error: 'Failed to read request' }, { status: 400 });
  }

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, getWebhookSecret());
  } catch (err) {
    // Log internally without leaking the error details externally
    console.error('Webhook signature verification failed:', err instanceof Error ? err.message : 'unknown error');
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 });
  }

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'payment_intent.succeeded'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = event.data.object as any;
    const email: string | null | undefined =
      session.customer_details?.email ?? session.receipt_email;
    const paymentId: string | undefined =
      session.payment_intent ?? session.id;

    if (email && typeof email === 'string') {
      const { error } = await getSupabase()
        .from('waitlist')
        .upsert(
          {
            email: email.toLowerCase().trim(),
            tier: 'founding_member',
            stripe_payment_id: paymentId ?? null,
          },
          { onConflict: 'email' }
        );

      if (error) {
        console.error('Supabase upsert error in webhook:', error.message);
        // Return 200 to Stripe to avoid retries for DB errors;
        // log and monitor via Supabase dashboard instead.
      }
    }
  }

  return NextResponse.json({ received: true });
}
