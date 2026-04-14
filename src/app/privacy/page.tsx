import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Crumb",
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
          &larr; Back to home
        </a>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-crumb-dark">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-crumb-muted">Last updated: April 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-crumb-brown">
          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              1. Introduction
            </h2>
            <p>
              Crumb (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard your
              information when you use our mobile application (&quot;the App&quot;) and website
              at crumbify.co.uk (&quot;the Site&quot;). Crumb is operated by Ali Bars, based in
              London, United Kingdom.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              2. Information We Collect
            </h2>
            <p className="mb-3">When you use Crumb, we may collect:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-crumb-dark">Account information:</strong>{" "}
                Name, email address, username, and profile photo when you create an
                account via Apple Sign In, Google Sign In, or email/OTP.
              </li>
              <li>
                <strong className="text-crumb-dark">Order data:</strong>{" "}
                When you connect a food delivery platform (Uber Eats, Just Eat), we
                access your order history including restaurant names, items ordered,
                order dates, and totals. This data is stored locally on your device
                in an encrypted SQLite database. Anonymised taste profiles and
                restaurant reviews are synced to our cloud database.
              </li>
              <li>
                <strong className="text-crumb-dark">Restaurant reviews:</strong>{" "}
                Ratings and notes you write about restaurants. Notes are capped at
                2,000 characters and synced to the cloud for social features.
              </li>
              <li>
                <strong className="text-crumb-dark">Profile photo:</strong>{" "}
                If you upload an avatar, it is automatically scanned by Google Vision
                SafeSearch to detect inappropriate content before being stored.
              </li>
              <li>
                <strong className="text-crumb-dark">Social data:</strong>{" "}
                Friend connections, group memberships, group feed posts, and food
                soulmate match percentages.
              </li>
              <li>
                <strong className="text-crumb-dark">Usage analytics:</strong>{" "}
                Anonymous analytics about screens visited and features used, collected
                via Vercel Speed Insights on the website and standard app analytics.
              </li>
              <li>
                <strong className="text-crumb-dark">Waitlist data:</strong>{" "}
                Email address, signup IP, country, and user agent when joining the
                waitlist. This data is used solely for launch notifications and bot
                prevention.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              3. What We Do NOT Collect
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>We never access, store, or see your delivery platform passwords.</li>
              <li>Your full order history and spending data never leave your device.</li>
              <li>We never share your personal spending data with third parties.</li>
              <li>We do not sell your data to advertisers or data brokers.</li>
              <li>We do not track your location — restaurant maps use data from your order history only.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              4. How We Use Your Information
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Generate personalised food delivery statistics and insights.</li>
              <li>Create your taste profile and food personality type.</li>
              <li>Enable social features: friend comparisons, food soulmate matching, groups, and activity feeds.</li>
              <li>Generate your annual Crumb Wrapped summary.</li>
              <li>Compute global statistics (anonymised, aggregated across all users).</li>
              <li>Send weekly recap notifications and achievement alerts.</li>
              <li>Moderate uploaded content (avatars) for safety.</li>
              <li>Process reports submitted by users about inappropriate content or behaviour.</li>
              <li>Improve and maintain the App and Site.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              5. Data Storage &amp; Security
            </h2>
            <p className="mb-3">
              Your order data is stored locally on your device using encrypted SQLite
              storage. Cloud features use Supabase (hosted in the EU) with row-level
              security (RLS) policies enforcing per-user data isolation. All API
              communication uses HTTPS with TLS 1.3.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>OAuth tokens are encrypted and stored on-device only.</li>
              <li>Passwords are never stored — authentication uses Apple/Google Sign In or email OTP.</li>
              <li>Avatar moderation logs are automatically deleted after 30 days.</li>
              <li>Waitlist audit logs and places search logs are automatically purged on schedule.</li>
              <li>Account deletion removes all cloud data immediately via a secure Edge Function.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              6. Third-Party Services
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-crumb-dark">Uber Eats &amp; Just Eat:</strong>{" "}
                Connected via official OAuth 2.0 APIs. Read-only access — we cannot place orders or modify your account.
              </li>
              <li>
                <strong className="text-crumb-dark">Supabase:</strong>{" "}
                Cloud database and authentication provider (EU-hosted).
              </li>
              <li>
                <strong className="text-crumb-dark">Google Places API:</strong>{" "}
                Used to fetch restaurant details (photos, ratings, addresses). Rate-limited per user.
              </li>
              <li>
                <strong className="text-crumb-dark">Google Vision API:</strong>{" "}
                SafeSearch moderation for uploaded avatar images. Rate-limited per user.
              </li>
              <li>
                <strong className="text-crumb-dark">RevenueCat:</strong>{" "}
                Manages in-app subscriptions. Receives your anonymous user ID only.
              </li>
              <li>
                <strong className="text-crumb-dark">Google AdMob:</strong>{" "}
                Displays ads to free-tier users. May use device identifiers for ad personalisation. Opt out via device settings.
              </li>
              <li>
                <strong className="text-crumb-dark">Cloudflare Turnstile:</strong>{" "}
                Bot protection on the waitlist form. No personal data is collected.
              </li>
              <li>
                <strong className="text-crumb-dark">Stripe:</strong>{" "}
                Processes founding member payments on the website only. We never see or store your card details.
              </li>
              <li>
                <strong className="text-crumb-dark">Vercel:</strong>{" "}
                Hosts the website with speed insights analytics.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              7. Social Features &amp; Visibility
            </h2>
            <p className="mb-3">Crumb includes social features with the following visibility controls:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>You can set your profile to private, hiding your stats from non-friends.</li>
              <li>Friend requests require mutual acceptance.</li>
              <li>You can block or report any user. Blocked users cannot see your profile or send requests.</li>
              <li>Group membership is visible to other group members only.</li>
              <li>Group feed posts are visible to group members only.</li>
              <li>You can unfriend, leave groups, or delete your account at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              8. Content Moderation
            </h2>
            <p>
              Uploaded avatars are automatically scanned using Google Vision SafeSearch.
              Images flagged as containing adult, violent, or racy content are rejected.
              Users can report other users or content, which is reviewed and actioned.
              Moderation logs are retained for 30 days, then automatically deleted.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              9. Advertising
            </h2>
            <p>
              Free-tier users see ads via Google AdMob. AdMob may use cookies or
              device identifiers for ad personalisation. You can opt out of
              personalised ads in your device settings. Premium users see no ads.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              10. GDPR &amp; Your Rights
            </h2>
            <p className="mb-3">Under GDPR and UK data protection law, you have the right to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Access all data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and all associated data.</li>
              <li>Disconnect any linked delivery platform at any time.</li>
              <li>Export your data in a portable format (Premium feature).</li>
              <li>Object to processing of your data.</li>
              <li>Withdraw consent for optional data collection at any time.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, use the in-app account settings or
              contact us at the email below.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              11. Data Retention
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Account data is retained until you delete your account.</li>
              <li>On-device order data is deleted when you uninstall the App or disconnect a platform.</li>
              <li>Avatar moderation logs: 30 days.</li>
              <li>Places search logs: 48 hours.</li>
              <li>Waitlist audit logs: purged on schedule.</li>
              <li>When you delete your account, all cloud data is removed immediately.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              12. Children&apos;s Privacy
            </h2>
            <p>
              Crumb is not intended for children under 16. We do not knowingly
              collect personal information from children under 16. If we discover
              that a child under 16 has provided us with personal information, we
              will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              13. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify
              you of any material changes via in-app notification or email. Your
              continued use of the App after changes constitutes acceptance of the
              updated policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-crumb-dark">
              14. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, contact us at{" "}
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
