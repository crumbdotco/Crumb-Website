'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { SplitText } from '@/components/ui/SplitText';
import { useWaitlistCount } from '@/hooks/useWaitlistCount';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
const STRIPE_FOUNDING_MEMBER_LINK =
  process.env.NEXT_PUBLIC_STRIPE_FOUNDING_MEMBER_LINK ?? '';
const isBrowser = typeof window !== 'undefined';

export function WaitlistSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const reduce = useReducedMotion();
  const waitlistCount = useWaitlistCount();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const hasTurnstile = !!TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!isBrowser) return;
    if (!TURNSTILE_SITE_KEY) return;
    if (!turnstileRef.current) return;
    if (!window.turnstile) return;
    if (widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: 'dark',
      size: 'flexible',
      callback: (token: string) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(null),
      'error-callback': () => {
        setTurnstileToken(null);
        widgetIdRef.current = null;
      },
    });
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    if (!TURNSTILE_SITE_KEY) return;
    if (window.turnstile) {
      renderWidget();
      return;
    }
    window.onTurnstileLoad = () => renderWidget();
    if (!document.getElementById('cf-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
      script.async = true;
      document.head.appendChild(script);
    }
    return () => {
      window.onTurnstileLoad = undefined;
    };
  }, [renderWidget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          website: isBrowser
            ? (document.getElementById('crumb-hp') as HTMLInputElement)?.value ?? ''
            : '',
          turnstileToken: turnstileToken ?? '',
        }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        if (isBrowser && widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
          setTurnstileToken(null);
        }
      }
    } catch {
      setStatus('error');
    }
  };

  const buttonDisabled = status === 'loading' || (hasTurnstile && !turnstileToken);

  return (
    <section
      ref={ref}
      id="waitlist"
      className="relative bg-[#0E0805] px-6 py-28 overflow-hidden"
    >
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse,rgba(201,160,119,0.18),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-[640px] mx-auto text-center">
        <motion.p
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
          className="text-[10px] font-bold tracking-[3px] uppercase text-[#E6C39B]/60 mb-4 font-mono"
        >
          Launching soon
        </motion.p>

        <SplitText
          text="Be first to taste it."
          as="h2"
          className="font-headline text-[clamp(48px,8vw,108px)] text-[#E0D5C9] leading-[0.9] mb-6"
          staggerDelay={0.08}
          baseDelay={0.1}
        />

        <motion.p
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="text-[15px] leading-[1.65] text-[#E0D5C9]/50 mb-10 max-w-[440px] mx-auto"
        >
          Join the waitlist to be first in line when Crumbify launches. We&apos;ll email you the
          day it goes live — and not before.
        </motion.p>

        {/* Waitlist form */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mb-10"
        >
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#E6C39B]/10 border border-[#E6C39B]/30 rounded-2xl p-6 max-w-[460px] mx-auto"
            >
              <p className="text-[#E0D5C9] text-lg font-semibold">You&apos;re on the list.</p>
              <p className="text-[#E0D5C9]/50 mt-1 text-sm">
                We&apos;ll email you the day Crumbify launches.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-[460px] mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="crumb-hp"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 px-5 py-3.5 rounded-[12px] bg-white/[0.04] border border-white/10 text-[#E0D5C9] placeholder:text-[#E0D5C9]/30 focus:outline-none focus:border-[#E6C39B]/40 transition-colors text-[14px]"
                />
                <button
                  type="submit"
                  disabled={buttonDisabled}
                  data-cursor="pointer"
                  className="px-6 py-3.5 rounded-[12px] bg-[#E6C39B] text-[#1A1208] font-bold text-[14px] hover:bg-[#C9A077] transition-colors duration-150 disabled:opacity-50 whitespace-nowrap"
                >
                  {status === 'loading' ? 'Joining…' : 'Join Waitlist'}
                </button>
              </div>
              <div ref={turnstileRef} className="flex justify-center" />
              {status === 'error' && (
                <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
              )}
              {waitlistCount !== null && (
                <p className="text-[12px] text-[#E0D5C9]/30 mt-1">
                  {waitlistCount.toLocaleString()}+ already on the list
                </p>
              )}
            </form>
          )}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0 }}
          animate={inView ? { opacity: 1 } : undefined}
          transition={{ delay: 0.9 }}
          className="flex items-center gap-4 max-w-[460px] mx-auto mb-10"
        >
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-[10px] uppercase tracking-[2px] text-[#E0D5C9]/30 font-mono">
            Or
          </span>
          <div className="flex-1 h-px bg-white/8" />
        </motion.div>

        {/* Founding member card */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 1.0, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#1A1208] border border-[#E6C39B]/20 rounded-3xl p-8 max-w-[520px] mx-auto text-left relative overflow-hidden"
        >
          {/* Inner shimmer */}
          <div
            className="absolute -inset-px rounded-3xl pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(230,195,155,0.15), transparent 40%, transparent 60%, rgba(230,195,155,0.08))',
            }}
          />

          <div className="relative flex items-center gap-3 mb-5">
            <span className="text-2xl">👑</span>
            <h3 className="text-[22px] font-bold text-[#E0D5C9]">Become a Founding Member</h3>
          </div>

          <p className="relative text-[#E0D5C9]/60 text-[14px] mb-2">Pay once. Get premium forever.</p>

          <div className="relative flex items-baseline gap-3 mb-6">
            <span className="font-headline text-[40px] text-[#E0D5C9] leading-none">£4.99</span>
            <span className="text-[#E0D5C9]/40 text-[13px]">one-time</span>
            <span className="text-[#E0D5C9]/25 line-through text-[12px]">£4.99/month</span>
          </div>

          <ul className="relative space-y-2.5 mb-7">
            {[
              'First-day access when Crumbify launches',
              'Lifetime premium — never pay a subscription',
              'Exclusive "Founding Member" badge in your profile',
              'All future premium features included forever',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[#E0D5C9]/75 text-[13px]">
                <span className="text-[#E6C39B] mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>

          {STRIPE_FOUNDING_MEMBER_LINK ? (
            <a
              href={STRIPE_FOUNDING_MEMBER_LINK}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="pointer"
              className="relative block w-full text-center bg-[#E6C39B] hover:bg-[#C9A077] text-[#1A1208] font-bold py-3.5 px-6 rounded-[12px] transition-colors text-[14px]"
            >
              Become a Founding Member — £4.99
            </a>
          ) : (
            <button
              disabled
              className="relative block w-full text-center bg-[#E6C39B]/30 text-[#1A1208]/40 font-bold py-3.5 px-6 rounded-[12px] cursor-not-allowed text-[14px]"
            >
              Become a Founding Member — £4.99
            </button>
          )}

          <p className="relative text-[11px] text-[#E0D5C9]/30 mt-4 text-center">
            Available in the UK. More regions coming soon.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
