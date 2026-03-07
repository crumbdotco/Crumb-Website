import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Crumb",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
      <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: March 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">
            1. Introduction
          </h2>
          <p>
            Crumb (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard your
            information when you use our mobile application and website.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">
            2. Information We Collect
          </h2>
          <p className="mb-3">
            When you use Crumb, we may collect the following information:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Account information:</strong>{" "}
              Your name, email address, and profile details when you create an
              account.
            </li>
            <li>
              <strong className="text-foreground">Order data:</strong> When you
              connect a food delivery platform (e.g. Uber Eats, Just Eat), we
              access your order history including restaurant names, items
              ordered, order dates, and order totals. This data is accessed via
              the platform&apos;s official API with your explicit authorisation.
            </li>
            <li>
              <strong className="text-foreground">Usage data:</strong> Anonymous
              analytics about how you interact with the app (e.g. screens
              visited, features used).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">
            3. How We Use Your Information
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
          <h2 className="mb-3 text-lg font-bold text-foreground">
            4. Data Storage & Security
          </h2>
          <p>
            Your order data is stored locally on your device using encrypted
            storage. Social features use our secure cloud infrastructure
            (Supabase) with row-level security policies. We use industry-standard
            encryption for all data in transit and at rest.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">
            5. Third-Party Services
          </h2>
          <p>
            We connect to food delivery platforms (Uber Eats, Just Eat) using
            their official OAuth 2.0 APIs. We never see or store your delivery
            platform passwords. You can disconnect any platform at any time from
            your account settings.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">
            6. Data Sharing
          </h2>
          <p>
            We do not sell your personal data to third parties. We only share
            data in the following cases:
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              With friends you explicitly connect with on the platform (limited
              to your public profile and stats you choose to share).
            </li>
            <li>When required by law or legal process.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">
            7. Your Rights
          </h2>
          <p>You have the right to:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Access all data we hold about you.</li>
            <li>Request deletion of your account and all associated data.</li>
            <li>
              Disconnect any linked platform at any time.
            </li>
            <li>Export your data in a portable format.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">
            8. Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy, please contact us
            at{" "}
            <a
              href="mailto:privacy@crumb.co"
              className="text-primary hover:underline"
            >
              privacy@crumb.co
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
