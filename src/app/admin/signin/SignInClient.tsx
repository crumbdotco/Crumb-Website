'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}

export default function SignInClient({
  callerIp,
  unauthorised = false,
}: {
  callerIp: string | null;
  unauthorised?: boolean;
}) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase config missing');
      setStatus('error');
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({ email });
    if (otpError) {
      setError(otpError.message);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setStatus('verifying');
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase config missing');
      setStatus('error');
      return;
    }

    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: token.replace(/\s/g, ''),
      type: 'email',
    });

    if (verifyError || !verifyData.session) {
      setError(verifyError?.message ?? 'Verification failed');
      setStatus('sent');
      return;
    }

    await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: verifyData.session.access_token }),
    });

    window.location.href = '/admin';
  }

  async function copyIp() {
    if (!callerIp) return;
    try {
      await navigator.clipboard.writeText(callerIp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard write can fail under restrictive permissions — ignore silently
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-black/20 p-8">
        <div>
          <h1 className="text-2xl font-bold text-[#E6C39B]">Admin sign-in</h1>
          <p className="mt-1 text-sm opacity-70">
            OTP via Supabase. Only allow-listed user IDs reach /admin.
          </p>
        </div>

        {unauthorised && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <strong>OTP verified but access denied.</strong> Your user ID isn&apos;t in{' '}
            <code className="font-mono">ADMIN_USER_IDS</code>. Update that Vercel env var with your
            current Supabase UUID and redeploy.
          </div>
        )}

        {status === 'idle' || status === 'sending' || (status === 'error' && !token) ? (
          <form onSubmit={handleSendOtp} className="space-y-3">
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-[#E6C39B]"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full rounded-lg bg-[#E6C39B] p-3 text-sm font-semibold text-[#1A1208] disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending…' : 'Send code'}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-3">
            <p className="text-sm opacity-70">
              Enter the 6-digit code sent to <span className="font-semibold">{email}</span>.
            </p>
            <input
              type="text"
              required
              autoFocus
              inputMode="numeric"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="218138"
              className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-center text-xl tracking-widest outline-none focus:border-[#E6C39B]"
            />
            <button
              type="submit"
              disabled={status === 'verifying'}
              className="w-full rounded-lg bg-[#E6C39B] p-3 text-sm font-semibold text-[#1A1208] disabled:opacity-50"
            >
              {status === 'verifying' ? 'Verifying…' : 'Sign in'}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="button"
              onClick={() => { setStatus('idle'); setToken(''); setError(null); }}
              className="w-full text-sm opacity-50 hover:opacity-100"
            >
              ← Use different email
            </button>
          </form>
        )}

        <div className="space-y-2 border-t border-white/10 pt-4">
          <p className="text-xs uppercase tracking-wider opacity-50">Auto-login bypass</p>
          {callerIp ? (
            <>
              <button
                type="button"
                onClick={copyIp}
                className="block w-full rounded-lg border border-white/10 bg-black/40 p-2 text-left font-mono text-xs hover:border-[#E6C39B]/40"
                title="Copy IP"
              >
                {callerIp} {copied && <span className="opacity-60">· copied</span>}
              </button>
              <p className="text-xs opacity-50">
                Add to Vercel env <code className="font-mono">ADMIN_IPS</code> (comma-sep) → redeploy → auto-signed in from this IP.
              </p>
            </>
          ) : (
            <p className="text-xs opacity-50">IP unavailable in this environment.</p>
          )}
        </div>
      </div>
    </main>
  );
}
