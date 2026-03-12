import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Crumb",
  description: "Terms and conditions for using the Crumb app.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-crumb-muted">Last updated: March 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-crumb-brown">
          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              1. Acceptance of Terms
            </h2>
            <p>
              By downloading, installing, or using Crumb (&quot;the App&quot;), you agree to
              be bound by these Terms of Service. If you do not agree, do not use
              the App.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              2. Description of Service
            </h2>
            <p>
              Crumb is a mobile application that connects to your food delivery
              accounts (such as Uber Eats and Just Eat) to provide personalised
              statistics, insights, and social features based on your order
              history.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              3. Account Registration
            </h2>
            <p>
              You must provide accurate and complete information when creating an
              account. You are responsible for maintaining the security of your
              account credentials. You must be at least 16 years old to use the
              App.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              4. Connected Platforms
            </h2>
            <p>
              When you connect a food delivery platform, you authorise Crumb to
              access your order history through the platform&apos;s official API. Crumb
              is not affiliated with, endorsed by, or sponsored by Uber Eats, Just
              Eat, or any other delivery platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              5. Premium Subscription
            </h2>
            <p>
              Crumb Premium is a paid subscription that unlocks additional features.
              Subscriptions are billed at £2.99/month or £19.99/year and are managed
              through Apple App Store or Google Play Store. Cancellation and refund
              policies are governed by the respective app store&apos;s terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              6. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Use the App for any unlawful purpose.</li>
              <li>
                Attempt to reverse-engineer, decompile, or disassemble the App.
              </li>
              <li>
                Impersonate another person or misrepresent your identity.
              </li>
              <li>
                Interfere with or disrupt the App&apos;s infrastructure.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              7. Intellectual Property
            </h2>
            <p>
              All content, features, and functionality of the App are owned by
              Crumb and are protected by copyright, trademark, and other
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              8. Limitation of Liability
            </h2>
            <p>
              Crumb is provided &quot;as is&quot; without warranties of any kind. We are not
              responsible for the accuracy of data provided by connected
              platforms. Our total liability shall not exceed the amount you paid
              for the App in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              9. Termination
            </h2>
            <p>
              We may suspend or terminate your account if you violate these Terms.
              You may delete your account at any time from the App settings,
              which will remove all your data from our systems.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              10. Contact
            </h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a
                href="mailto:contact@crumbify.co.uk"
                className="text-crumb-dark font-medium underline underline-offset-2 hover:text-crumb-darkest"
              >
                contact@crumbify.co.uk
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
