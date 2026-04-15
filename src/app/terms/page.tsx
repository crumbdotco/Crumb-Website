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
          &larr; Back to home
        </a>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-crumb-dark">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-crumb-muted">Last updated: April 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-crumb-brown">
          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              1. Acceptance of Terms
            </h2>
            <p>
              By downloading, installing, or using Crumb (&quot;the App&quot;), or by
              accessing the Crumb website at crumbify.co.uk (&quot;the Site&quot;), you agree
              to be bound by these Terms of Service. If you do not agree, do not
              use the App or Site.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              2. Description of Service
            </h2>
            <p>
              Crumb is a mobile application that connects to your food delivery
              accounts (such as Uber Eats and Just Eat) to provide personalised
              statistics, insights, restaurant reviews, food maps, social features
              (friends, groups, food soulmate matching), achievements, weekly recaps,
              and an annual Crumb Wrapped summary based on your order history.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              3. Account Registration
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You can sign up via Apple Sign In, Google Sign In, or email OTP (one-time passcode).</li>
              <li>You are responsible for maintaining the security of your account.</li>
              <li>You must be at least 16 years old to use the App.</li>
              <li>One account per person. Duplicate or fake accounts may be terminated.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              4. Connected Platforms
            </h2>
            <p className="mb-3">
              When you connect a food delivery platform, you authorise Crumb to
              access your order history through the platform&apos;s official API.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Access is read-only — Crumb cannot place orders, modify your account, or access payment details.</li>
              <li>You can disconnect any platform at any time from your account settings.</li>
              <li>Crumb is not affiliated with, endorsed by, or sponsored by Uber Eats, Just Eat, or any other delivery platform.</li>
              <li>Data accuracy depends on the connected platform. We are not responsible for inaccurate or missing data from third-party APIs.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              5. Premium Subscription
            </h2>
            <p className="mb-3">
              Crumb Premium unlocks additional features including advanced analytics,
              food soulmate matching, unlimited history, data export, and an ad-free
              experience.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Subscriptions are billed at &pound;4.99/month or &pound;49.99/year, managed through Apple App Store or Google Play Store.</li>
              <li>Cancellation and refund policies are governed by the respective app store&apos;s terms.</li>
              <li>Premium features may change over time. We will notify you of material changes.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              6. Founding Member
            </h2>
            <p className="mb-3">
              Founding Member is a <strong className="text-crumb-dark">pre-launch only</strong> offer:
              a one-time payment of &pound;4.99 (processed by Stripe) that grants
              lifetime Premium access. This is separate from the recurring Premium
              subscription (&pound;4.99/month or &pound;49.99/year) which will be
              available after launch via the App Store and Google Play.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Founding Members pay once and never pay again — no subscription, no recurring fees.</li>
              <li>The Founding Member offer will be permanently removed once the App launches publicly.</li>
              <li>Founding Members receive an exclusive profile badge and all current and future Premium features at no additional cost.</li>
              <li>Founding Member status is non-transferable and tied to your Crumb account.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              7. Social Features &amp; Groups
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>You can add friends, create or join groups, and share stats with other users.</li>
              <li>Group feeds allow members to post restaurant recommendations, vote on suggestions, and share experiences.</li>
              <li>Group admins can manage members, change group settings, and customise group appearance.</li>
              <li>You can set your profile to private to hide your stats from non-friends.</li>
              <li>You can block or report users for inappropriate behaviour.</li>
              <li>We reserve the right to remove content or suspend accounts that violate community guidelines.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              8. User Content &amp; Moderation
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>You retain ownership of content you create (reviews, photos, group posts).</li>
              <li>By posting content, you grant Crumb a non-exclusive licence to display it within the App for its intended purpose.</li>
              <li>Profile photos are automatically scanned for inappropriate content using Google Vision SafeSearch.</li>
              <li>Content flagged as adult, violent, or racy will be rejected.</li>
              <li>You can report users or content. Reports are reviewed and actioned by our team.</li>
              <li>We may remove content that violates these Terms without prior notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              9. Acceptable Use
            </h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Use the App for any unlawful purpose.</li>
              <li>Attempt to reverse-engineer, decompile, or disassemble the App.</li>
              <li>Impersonate another person or misrepresent your identity.</li>
              <li>Interfere with or disrupt the App&apos;s infrastructure.</li>
              <li>Upload malicious, offensive, or inappropriate content.</li>
              <li>Use automated tools (bots, scrapers) to access the App or API.</li>
              <li>Attempt to circumvent rate limits, bot protection, or security measures.</li>
              <li>Harass, bully, or threaten other users.</li>
              <li>Create multiple accounts to circumvent restrictions.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              10. Intellectual Property
            </h2>
            <p>
              All content, features, branding, and functionality of the App and Site
              (including the Crumb name, logo, Crumb Wrapped, and food personality
              system) are owned by Crumb and are protected by copyright, trademark,
              and other intellectual property laws. You may not reproduce,
              distribute, or create derivative works without our written consent.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              11. Limitation of Liability
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Crumb is provided &quot;as is&quot; without warranties of any kind, express or implied.</li>
              <li>We are not responsible for the accuracy of data provided by connected platforms.</li>
              <li>We are not liable for any loss of data stored on your device.</li>
              <li>Our total liability shall not exceed the amount you paid for the App in the 12 months preceding any claim.</li>
              <li>We are not responsible for third-party services (Uber Eats, Just Eat, Stripe, AdMob) — their own terms apply.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              12. Termination
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>We may suspend or terminate your account if you violate these Terms.</li>
              <li>You may delete your account at any time from the App settings.</li>
              <li>Account deletion removes all your data from our cloud systems immediately.</li>
              <li>On-device data is removed when you uninstall the App.</li>
              <li>If you are a Founding Member and your account is terminated for violating these Terms, no refund will be issued.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              13. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of England and Wales. Any disputes
              arising from these Terms or your use of the App shall be subject to the
              exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              14. Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. We will notify you of
              material changes via in-app notification or email. Your continued use
              of the App after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              15. Contact
            </h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a
                href="mailto:hello@crumbify.co.uk"
                className="text-crumb-dark font-medium underline underline-offset-2 hover:text-crumb-darkest"
              >
                hello@crumbify.co.uk
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
