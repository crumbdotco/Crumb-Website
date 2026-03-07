import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support - Crumb",
};

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
      <h1 className="text-4xl font-extrabold tracking-tight">Support</h1>
      <p className="mt-4 text-lg text-muted">
        Got a question or need help? We&apos;re here for you.
      </p>

      <div className="mt-12 space-y-6">
        {/* FAQ */}
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-6">
            {[
              {
                q: "How does Crumb access my order history?",
                a: "Crumb connects to your delivery accounts (Uber Eats, Just Eat) through their official APIs using OAuth 2.0. This means you log in directly with the platform — we never see your password.",
              },
              {
                q: "Is my data safe?",
                a: "Yes. Your order data is stored locally on your device with encryption. Social features use our secure cloud with row-level security. We never sell your data.",
              },
              {
                q: "What platforms do you support?",
                a: "We currently support Uber Eats and Just Eat. More platforms are coming soon, including Deliveroo.",
              },
              {
                q: "How do I disconnect a platform?",
                a: "Go to Account > Connected Platforms and tap the platform you want to disconnect. This will revoke access and remove that platform's data from your account.",
              },
              {
                q: "What's included in Crumb Plus?",
                a: "Crumb Plus unlocks spending analytics, drink stats, percentile rankings, advanced friend comparisons, and an ad-free experience.",
              },
              {
                q: "How do I delete my account?",
                a: "Go to Account > Settings > Delete Account. This will permanently remove all your data from our systems.",
              },
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-xl font-bold">Contact Us</h2>
          <p className="mt-3 text-sm text-muted">
            Can&apos;t find what you&apos;re looking for? Reach out directly.
          </p>
          <div className="mt-6 space-y-4">
            <a
              href="mailto:support@crumb.co"
              className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-surface-light"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">Email</p>
                <p className="text-sm text-muted">support@crumb.co</p>
              </div>
            </a>
            <a
              href="https://twitter.com/crumbapp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-surface-light"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-primary"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">Twitter / X</p>
                <p className="text-sm text-muted">@crumbapp</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
