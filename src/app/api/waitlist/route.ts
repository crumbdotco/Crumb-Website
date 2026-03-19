import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// RFC 5322-compliant email regex (practical subset)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase environment variables are not configured');
  }

  return createClient(url, key);
}

function isValidEmail(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();

    const { error } = await getSupabase()
      .from('waitlist')
      .upsert(
        { email: normalised, tier: 'free' },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('Waitlist insert error:', error.message);
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Do not surface internal error details to the client
    if (err instanceof Error && err.message.includes('environment variables')) {
      console.error('Configuration error:', err.message);
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
