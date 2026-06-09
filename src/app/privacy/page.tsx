import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy - Crumbify",
  description: "How Crumbify handles your data. GDPR compliant.",
};

const headingStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#F4ECDF",
  marginBottom: 12,
  marginTop: 0,
  lineHeight: 1.3,
  letterSpacing: 0,
};

const bodyStyle: React.CSSProperties = {
  color: "#C4B09A",
  fontSize: 16,
  lineHeight: 1.65,
  marginBottom: 12,
};

const listStyle: React.CSSProperties = {
  paddingLeft: 20,
  marginTop: 8,
  marginBottom: 0,
  display: "flex",
  flexDirection: "column" as const,
  gap: 8,
};

const strongStyle: React.CSSProperties = {
  color: "#F4ECDF",
  fontWeight: 700,
};

const linkStyle: React.CSSProperties = {
  color: "#E6C39B",
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 32,
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="June 2026">
      <section style={sectionStyle}>
        <h2 style={headingStyle}>1. Introduction</h2>
        <p style={bodyStyle}>
          Crumbify (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your
          information when you use our mobile application (&quot;the App&quot;) and website
          at crumbify.co.uk (&quot;the Site&quot;). Crumbify is operated by Ali Bars, based in
          London, United Kingdom.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>2. Information We Collect</h2>
        <p style={{ ...bodyStyle, marginBottom: 8 }}>When you use Crumbify, we may collect:</p>
        <ul style={listStyle}>
          <li>
            <span style={strongStyle}>Account information:</span>{" "}
            Name, email address, username, and profile photo when you create an
            account via Apple Sign In, Google Sign In, or email OTP.
          </li>
          <li>
            <span style={strongStyle}>Order data:</span>{" "}
            Crumbify reads your order history from screenshots you import (using OCR)
            and from manual entries you add yourself. It does not connect to delivery
            platform accounts or APIs to retrieve this data. The imported data is stored
            locally on your device in an encrypted SQLite database. Anonymised taste
            profiles and restaurant reviews are synced to our cloud database.
          </li>
          <li>
            <span style={strongStyle}>Restaurant reviews:</span>{" "}
            Ratings and notes you write about restaurants. Notes are capped at
            2,000 characters and synced to the cloud for social features.
          </li>
          <li>
            <span style={strongStyle}>Profile photo:</span>{" "}
            If you upload an avatar, it is automatically scanned by Google Vision
            SafeSearch to detect inappropriate content before being stored.
          </li>
          <li>
            <span style={strongStyle}>Photos in feed posts:</span>{" "}
            When you add a photo to a feed post or your profile, we store it and run
            automated safety screening (Google Vision SafeSearch) before it is shown.
          </li>
          <li>
            <span style={strongStyle}>Social posts and messages:</span>{" "}
            Posts you publish (with optional photo and note) and the one-time opener
            messages you send through Food Soulmate are stored so they can be shown to
            the intended audience. You can report or block content and users in the app.
          </li>
          <li>
            <span style={strongStyle}>Social data:</span>{" "}
            Friend connections, group memberships, group feed posts, and food
            soulmate match percentages.
          </li>
          <li>
            <span style={strongStyle}>Advertising identifiers:</span>{" "}
            We show ads via Google AdMob and, with your consent, use your device
            advertising identifier to personalise them. You can decline via the in-app
            consent prompt and (iOS) the App Tracking prompt.
          </li>
          <li>
            <span style={strongStyle}>Usage analytics:</span>{" "}
            Anonymous analytics about screens visited and features used, collected
            via Vercel Speed Insights on the website and standard app analytics.
          </li>
          <li>
            <span style={strongStyle}>Waitlist data:</span>{" "}
            Email address, signup IP, country, and user agent when joining the
            waitlist. This data is used solely for launch notifications and bot
            prevention.
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>3. What We Do NOT Collect</h2>
        <ul style={listStyle}>
          <li>We never access, store, or see your delivery platform passwords.</li>
          <li>We do not connect to delivery platform accounts or APIs to retrieve your order data. Import is done via screenshots (OCR) or manual entry only.</li>
          <li>We never share your personal data with third parties for their marketing purposes.</li>
          <li>We do not sell your data to advertisers or data brokers.</li>
          <li>We do not track your location - restaurant maps use data from your imported order history only.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>4. How We Use Your Information</h2>
        <ul style={listStyle}>
          <li>Generate personalised food delivery statistics and insights.</li>
          <li>Create your taste profile and food personality type.</li>
          <li>Enable social features: friend comparisons, food soulmate matching, groups, the global feed, and activity feeds.</li>
          <li>Compute global statistics (anonymised, aggregated across all users).</li>
          <li>Send weekly recap notifications and achievement alerts.</li>
          <li>Moderate uploaded content (avatars, feed photos) for safety.</li>
          <li>Process reports submitted by users about inappropriate content or behaviour.</li>
          <li>Show relevant ads to free-tier users via Google AdMob.</li>
          <li>Improve and maintain the App and Site.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>5. Data Storage and Security</h2>
        <p style={bodyStyle}>
          Your order data is stored locally on your device using encrypted SQLite
          storage. Cloud features use Supabase (hosted in the EU) with row-level
          security (RLS) policies enforcing per-user data isolation. All API
          communication uses HTTPS with TLS 1.3.
        </p>
        <ul style={listStyle}>
          <li>Auth tokens are stored on-device only using secure storage.</li>
          <li>Passwords are never stored - authentication uses Apple/Google Sign In or email OTP.</li>
          <li>Avatar moderation logs are automatically deleted after 30 days.</li>
          <li>Waitlist audit logs and places search logs are automatically purged on schedule.</li>
          <li>Account deletion removes all cloud data immediately via a secure Edge Function.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>6. Third-Party Services</h2>
        <ul style={listStyle}>
          <li>
            <span style={strongStyle}>Supabase:</span>{" "}
            Cloud database and authentication provider (EU-hosted).
          </li>
          <li>
            <span style={strongStyle}>Google Places API:</span>{" "}
            Used to fetch restaurant details (photos, ratings, addresses). Rate-limited per user.
          </li>
          <li>
            <span style={strongStyle}>Google Vision API:</span>{" "}
            SafeSearch moderation for uploaded avatar images and feed photos. Rate-limited per user.
          </li>
          <li>
            <span style={strongStyle}>RevenueCat:</span>{" "}
            Manages in-app subscriptions. Receives your anonymous user ID only.
          </li>
          <li>
            <span style={strongStyle}>Google AdMob:</span>{" "}
            Displays ads to free-tier users. May use device identifiers for ad personalisation.
            You can decline via the in-app consent prompt, or opt out via your device settings.
            Premium users see no ads.
          </li>
          <li>
            <span style={strongStyle}>Cloudflare Turnstile:</span>{" "}
            Bot protection on the waitlist form. No personal data is collected.
          </li>
          <li>
            <span style={strongStyle}>Stripe:</span>{" "}
            Processes founding member payments on the website only. We never see or store your card details.
          </li>
          <li>
            <span style={strongStyle}>Vercel:</span>{" "}
            Hosts the website with speed insights analytics.
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>7. Social Features and Visibility</h2>
        <p style={{ ...bodyStyle, marginBottom: 8 }}>Crumbify includes social features with the following visibility controls:</p>
        <ul style={listStyle}>
          <li>You can set your profile to private, hiding your stats from non-friends.</li>
          <li>Friend requests require mutual acceptance.</li>
          <li>You can block or report any user. Blocked users cannot see your profile or send requests.</li>
          <li>Group membership is visible to other group members only.</li>
          <li>Group feed posts are visible to group members only.</li>
          <li>You can unfriend, leave groups, or delete your account at any time.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>8. Content Moderation</h2>
        <p style={bodyStyle}>
          Uploaded avatars and feed photos are automatically scanned using Google Vision SafeSearch.
          Images flagged as containing adult, violent, or racy content are rejected.
          Users can report other users or content, which is reviewed and actioned.
          Moderation logs are retained for 30 days, then automatically deleted.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>9. Advertising</h2>
        <p style={bodyStyle}>
          Free-tier users see ads via Google AdMob. AdMob may use device identifiers for
          ad personalisation. You can decline personalised ads via the in-app consent
          prompt shown on first launch and via your device privacy settings at any time.
          Premium users see no ads.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>10. GDPR and Your Rights</h2>
        <p style={{ ...bodyStyle, marginBottom: 8 }}>Under GDPR and UK data protection law, you have the right to:</p>
        <ul style={listStyle}>
          <li>Access all data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your account and all associated data.</li>
          <li>Export your data in a portable format (Premium feature).</li>
          <li>Object to processing of your data.</li>
          <li>Withdraw consent for optional data collection at any time.</li>
        </ul>
        <p style={{ ...bodyStyle, marginTop: 12 }}>
          To exercise any of these rights, use the in-app account settings or
          contact us at the email below.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>11. Data Retention</h2>
        <ul style={listStyle}>
          <li>Account data is retained until you delete your account.</li>
          <li>On-device order data is deleted when you uninstall the App.</li>
          <li>Avatar and feed photo moderation logs: 30 days.</li>
          <li>Places search logs: 48 hours.</li>
          <li>Waitlist audit logs: purged on schedule.</li>
          <li>When you delete your account, all cloud data is removed immediately.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>12. Children&apos;s Privacy</h2>
        <p style={bodyStyle}>
          Crumbify is not intended for children under 16. We do not knowingly
          collect personal information from children under 16. If we discover
          that a child under 16 has provided us with personal information, we
          will delete it immediately.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>13. Changes to This Policy</h2>
        <p style={bodyStyle}>
          We may update this Privacy Policy from time to time. We will notify
          you of any material changes via in-app notification or email. Your
          continued use of the App after changes constitutes acceptance of the
          updated policy.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>14. Contact Us</h2>
        <p style={bodyStyle}>
          If you have questions about this Privacy Policy, contact us at{" "}
          <a
            href="mailto:support@crumbify.co.uk"
            style={linkStyle}
          >
            support@crumbify.co.uk
          </a>
          .
        </p>
      </section>
    </LegalShell>
  );
}
