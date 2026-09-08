import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const FOUNDING_CAP = 100;

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

      // Belt-and-suspenders: deactivate the payment link once the cap is reached.
      // Primary cutoff is the Stripe Payment Link's built-in completed-sessions limit.
      try {
        const { count } = await getSupabase()
          .from('waitlist')
          .select('*', { count: 'exact', head: true })
          .eq('tier', 'founding_member');

        const linkId = process.env.STRIPE_FOUNDING_PAYMENT_LINK_ID;
        if ((count ?? 0) >= FOUNDING_CAP && linkId) {
          await getStripe().paymentLinks.update(linkId, { active: false });
        }
      } catch (capErr) {
        console.error('Founding cap check failed:', capErr);
      }
    }
  }

  if (event.type === 'charge.refunded' || event.type === 'payment_intent.canceled') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = event.data.object as any;

    let paymentId: string | undefined;

    if (event.type === 'charge.refunded') {
      const fullyRefunded =
        obj.refunded === true ||
        (typeof obj.amount_refunded === 'number' &&
          typeof obj.amount === 'number' &&
          obj.amount_refunded >= obj.amount);

      if (!fullyRefunded) {
        console.warn('Partial refund on charge, not demoting founding member:', obj.id);
        return NextResponse.json({ received: true });
      }

      const paymentIntent = obj.payment_intent;
      if (typeof paymentIntent === 'string') {
        paymentId = paymentIntent;
      } else if (paymentIntent && typeof paymentIntent === 'object' && typeof paymentIntent.id === 'string') {
        paymentId = paymentIntent.id;
      } else if (typeof obj.id === 'string') {
        paymentId = obj.id;
      }
    } else {
      paymentId = typeof obj.id === 'string' ? obj.id : undefined;
    }

    if (!paymentId) {
      console.error('Refund/cancellation event had no resolvable payment id:', event.type);
      return NextResponse.json({ received: true });
    }

    // Demotion is a DELETE, never an UPDATE: waitlist.tier's CHECK constraint
    // only allows 'free'/'founding_member', and trg_prevent_tier_downgrade
    // (app repo supabase/migrations/009_waitlist_lockdown.sql) silently
    // reverts any UPDATE that would move tier from founding_member to free.
    const { data, error } = await getSupabase()
      .from('waitlist')
      .delete()
      .eq('stripe_payment_id', paymentId)
      .select('email');

    if (error) {
      console.error('Supabase delete error in refund webhook:', error.message);
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true, demoted: data?.length ?? 0 });
  }

  return NextResponse.json({ received: true });
}
