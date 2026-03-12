import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Crumb",
  description: "How Crumb handles your data. GDPR compliant.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-crumb-muted">Last updated: March 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-crumb-brown">
          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              1. Introduction
            </h2>
            <p>
              Crumb (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard your
              information when you use our mobile application and website.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              2. Information We Collect
            </h2>
            <p className="mb-3">
              When you use Crumb, we may collect the following information:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-crumb-dark">Account information:</strong>{" "}
                Your name, email address, and profile details when you create an
                account.
              </li>
              <li>
                <strong className="text-crumb-dark">Order data:</strong> When you
                connect a food delivery platform (e.g. Uber Eats, Just Eat), we
                access your order history including restaurant names, items
                ordered, order dates, and order totals. This data is stored locally
                on your device. Anonymised taste profiles are stored on Supabase.
              </li>
              <li>
                <strong className="text-crumb-dark">Usage data:</strong> Anonymous
                analytics about how you interact with the app (e.g. screens
                visited, features used).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              3. What We Do NOT Collect
            </h2>
            <p>
              Spending data is never shared with third parties. Your full order
              history never leaves your device — only anonymised taste profiles
              are synced to the cloud for social features.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              4. How We Use Your Information
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                To generate personalised food delivery statistics and insights.
              </li>
              <li>
                To create your taste profile and food personality type.
              </li>
              <li>
                To enable social features such as friend comparisons and food
                soulmate matching.
              </li>
              <li>
                To generate your annual Wrapped summary.
              </li>
              <li>To improve and maintain the app.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              5. Data Storage &amp; Security
            </h2>
            <p>
              Your order data is stored locally on your device using encrypted
              storage. Social features use our secure cloud infrastructure
              (Supabase) with row-level security policies. OAuth tokens are
              encrypted and stored on-device. We use industry-standard
              encryption for all data in transit and at rest.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              6. Third-Party Services
            </h2>
            <p>
              We connect to food delivery platforms (Uber Eats, Just Eat) using
              their official OAuth 2.0 APIs. We never see or store your delivery
              platform passwords. You can disconnect any platform at any time from
              your account settings.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              7. Advertising
            </h2>
            <p>
              Crumb uses Google AdMob to display ads to free-tier users. AdMob may
              use cookies or device identifiers for ad personalisation. You can opt
              out of personalised ads in your device settings.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              8. GDPR &amp; Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Access all data we hold about you.</li>
              <li>Request deletion of your account and all associated data.</li>
              <li>Disconnect any linked platform at any time.</li>
              <li>Export your data in a portable format.</li>
              <li>Object to processing of your data.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              9. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, please contact us
              at{" "}
              <a
                href="mailto:privacy@getcrumb.co"
                className="text-crumb-dark font-medium underline underline-offset-2 hover:text-crumb-darkest"
              >
                privacy@getcrumb.co
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
