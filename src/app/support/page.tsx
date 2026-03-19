import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support - Crumb",
};

export default function SupportPage() {
  return (
    <main className="bg-crumb-cream min-h-screen">
      <div className="mx-auto max-w-3xl px-6 pt-32 pb-24">
        <a
          href="/"
          className="text-sm font-medium text-crumb-brown hover:text-crumb-dark transition-colors"
        >
          ← Back to home
        </a>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-crumb-dark">
          Support
        </h1>
        <p className="mt-4 text-lg text-crumb-muted">
          Got a question or need help? We&apos;re here for you.
        </p>

        <div className="mt-12 space-y-6">
          {/* FAQ */}
          <div className="rounded-2xl border border-crumb-line bg-crumb-card p-8">
            <h2 className="text-xl font-bold text-crumb-dark">
              Frequently Asked Questions
            </h2>
            <div className="mt-6 space-y-6">
              {[
                {
                  q: "How does Crumb access my order history?",
                  a: "Crumb connects to your delivery accounts (Uber Eats, Just Eat) through their official APIs using OAuth 2.0. This means you log in directly with the platform. We never see your password.",
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
                  <h3 className="font-semibold text-crumb-dark">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-crumb-muted">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-2xl border border-crumb-line bg-crumb-card p-8">
            <h2 className="text-xl font-bold text-crumb-dark">Contact Us</h2>
            <p className="mt-3 text-sm text-crumb-muted">
              Can&apos;t find what you&apos;re looking for? Reach out directly.
            </p>
            <div className="mt-6 space-y-4">
              <a
                href="mailto:contact@crumbify.co.uk"
                className="flex items-center gap-3 rounded-xl border border-crumb-line p-4 transition-colors hover:bg-crumb-cream"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-crumb-brown/20">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-crumb-brown"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-crumb-dark">Email</p>
                  <p className="text-sm text-crumb-muted">
                    contact@crumbify.co.uk
                  </p>
                </div>
              </a>
              <a
                href="https://x.com/crumbifyco"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-crumb-line p-4 transition-colors hover:bg-crumb-cream"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-crumb-brown/20">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-crumb-brown"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-crumb-dark">
                    Twitter / X
                  </p>
                  <p className="text-sm text-crumb-muted">@crumbifyco</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
