'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AdminSignIn() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError(null);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      setError('Supabase config missing');
      setStatus('error');
      return;
    }

    const supabase = createClient(url, anon);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/callback`,
      },
    });

    if (otpError) {
      setError(otpError.message);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-black/20 p-8">
        <div>
          <h1 className="text-2xl font-bold text-[#E6C39B]">Admin sign-in</h1>
          <p className="mt-1 text-sm opacity-70">
            Magic link via Supabase. Only allow-listed user IDs reach /admin.
          </p>
        </div>

        {status === 'sent' ? (
          <div className="rounded-lg border border-[#E6C39B]/30 bg-[#E6C39B]/10 p-4 text-sm">
            Check <span className="font-semibold">{email}</span> for a magic
            link. Tap it on this device to sign in.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@crumbify.co.uk"
              className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-[#E6C39B]"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full rounded-lg bg-[#E6C39B] p-3 text-sm font-semibold text-[#1A1208] disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </button>
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
