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
    <LegalShell title="Privacy Policy" updated="18 July 2026">
      <section style={sectionStyle}>
        <h2 style={headingStyle}>1. Introduction</h2>
        <p style={bodyStyle}>
          Crumbify (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your
          information when you use our mobile application (&quot;the App&quot;) and website
          at crumbify.co.uk (&quot;the Site&quot;). Crumbify is operated by Crumbify LTD, a
          company registered in England and Wales (company number 17288992), registered
          office 60 Millmead Business Centre, Millmead Road, London, United Kingdom,
          N17 9QU. Crumbify LTD is the data controller for personal data processed
          through the Crumbify app and this website.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>2. Information We Collect</h2>
        <p style={{ ...bodyStyle, marginBottom: 8 }}>When you use Crumbify, we may collect:</p>
        <ul style={listStyle}>
          <li>
            <span style={strongStyle}>Account information:</span>{" "}
            Name, email address, username, and profile photo when you create an
            account via Apple Sign In, Google Sign In, or email OTP. Sign in with
            Apple or Google is used to authenticate you only, it does not give us
            access to your Apple or Google account data.
          </li>
          <li>
            <span style={strongStyle}>Restaurants you add:</span>{" "}
            When you share a TikTok or Instagram post into Crumbify, paste in a
            Google Maps list link, or search and add a place manually, we store the
            restaurant, your been-to and want-to-try status, and any score or note
            you attach. Crumbify does not connect to delivery-platform accounts or
            APIs, and it does not read your order history from screenshots.
          </li>
          <li>
            <span style={strongStyle}>Reviews and private notes:</span>{" "}
            Scores out of 10 and personal notes you write about places you have
            been to.
          </li>
          <li>
            <span style={strongStyle}>Profile photo:</span>{" "}
            If you upload an avatar, it is automatically scanned by Google Vision
            SafeSearch to detect inappropriate content before being stored.
          </li>
          <li>
            <span style={strongStyle}>Posts and photos:</span>{" "}
            When you post about a place to your profile wall or the home feed, with
            an optional photo, we store it and run automated safety screening
            (Google Vision SafeSearch) before it is shown to others.
          </li>
          <li>
            <span style={strongStyle}>Social activity:</span>{" "}
            Reactions and comments on posts, friend connections and requests,
            groups you create or join and their shared lists and shared photos,
            direct messages you send, and leaderboard participation.
          </li>
          <li>
            <span style={strongStyle}>Location:</span>{" "}
            With your permission, we use your device location to power the
            Discover map and to help you find and add nearby places via Google
            Places.
          </li>
          <li>
            <span style={strongStyle}>Advertising identifiers:</span>{" "}
            We show ads via Google AdMob and, with your consent, use your device
            advertising identifier to personalise them. You can decline via the
            in-app consent prompt and, on iOS, the App Tracking Transparency prompt.
          </li>
          <li>
            <span style={strongStyle}>Usage analytics:</span>{" "}
            Device and usage analytics about screens visited and features used in
            the App, and anonymous performance metrics collected via Vercel Speed
            Insights on the website.
          </li>
          <li>
            <span style={strongStyle}>Founding-member checkout:</span>{" "}
            If you buy a founding-member place through the website, Stripe
            processes the payment and we store your email address to grant the
            tier to your account. We never see or store your card details.
          </li>
          <li>
            <span style={strongStyle}>Referral link visits:</span>{" "}
            See section 9 below.
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>3. What We Do NOT Collect</h2>
        <ul style={listStyle}>
          <li>We never access, store, or see your delivery-platform or other third-party account passwords.</li>
          <li>We do not connect to delivery-platform accounts or APIs, and we do not read order history from screenshots. Places are added by sharing a TikTok or Instagram post into the app, pasting a Google Maps list link, or manual search.</li>
          <li>We never share your personal data with third parties for their own marketing purposes.</li>
          <li>We do not sell your data to advertisers or data brokers.</li>
          <li>We do not show spend, price, or currency figures anywhere in the App or Site.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>4. How We Use Your Information</h2>
        <ul style={listStyle}>
          <li>Run the home feed: showing friends&apos; posts, reactions, comments, and leaderboards.</li>
          <li>Power Discover: the map, nearby places, and taste-matched recommendations.</li>
          <li>Maintain your Reviews history: been-to places, want-to-try lists, scores, and private notes.</li>
          <li>Enable Social features: friends, groups, shared lists, shared photos, and direct messages.</li>
          <li>Run your Profile wall: posts, achievements, and tiers, and the monthly Challenge.</li>
          <li>Moderate uploaded content (avatars, post photos) for safety.</li>
          <li>Process reports submitted by users about inappropriate content or behaviour.</li>
          <li>Show relevant ads to free-tier users via Google AdMob.</li>
          <li>Grant and manage Crumbify Premium and founding-member access.</li>
          <li>Measure referral-link effectiveness (see section 9).</li>
          <li>Improve and maintain the App and Site.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>5. Data Storage and Security</h2>
        <p style={bodyStyle}>
          Cloud data is stored with Supabase, using row-level security (RLS)
          policies that enforce per-user data isolation. All API communication uses
          HTTPS with TLS.
        </p>
        <ul style={listStyle}>
          <li>Auth tokens are stored on-device only using secure storage.</li>
          <li>Passwords are never stored - authentication uses Apple/Google Sign In or email OTP.</li>
          <li>Avatar and post-photo moderation logs are automatically deleted after 30 days.</li>
          <li>Account deletion removes your cloud data as described on our delete-account page.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>6. Third-Party Services</h2>
        <ul style={listStyle}>
          <li>
            <span style={strongStyle}>Supabase:</span>{" "}
            Cloud database, authentication, and storage provider for the App and website.
          </li>
          <li>
            <span style={strongStyle}>Google Places:</span>{" "}
            Used to search for and fetch restaurant details (photos, ratings, addresses) when you add a place or use Discover.
          </li>
          <li>
            <span style={strongStyle}>Google Vision API:</span>{" "}
            SafeSearch moderation for uploaded avatar images and post photos.
          </li>
          <li>
            <span style={strongStyle}>RevenueCat:</span>{" "}
            Manages Crumbify Premium subscriptions. Receives your anonymous user ID only.
          </li>
          <li>
            <span style={strongStyle}>Google AdMob:</span>{" "}
            Displays ads to free-tier users. May use device identifiers for ad personalisation.
            You can decline via the in-app consent prompt, or opt out via your device settings.
            Premium users see no ads.
          </li>
          <li>
            <span style={strongStyle}>Stripe:</span>{" "}
            Processes founding-member payments on the website only. We never see or store your card details.
          </li>
          <li>
            <span style={strongStyle}>Sentry:</span>{" "}
            Error monitoring for the App and website, to help us find and fix bugs.
          </li>
          <li>
            <span style={strongStyle}>Vercel:</span>{" "}
            Hosts the website and collects anonymous performance metrics via Speed Insights.
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>7. Social Features and Visibility</h2>
        <p style={{ ...bodyStyle, marginBottom: 8 }}>Crumbify includes social features with the following visibility controls:</p>
        <ul style={listStyle}>
          <li>You can set your profile to private, hiding your posts and reviews from non-friends.</li>
          <li>Friend requests require mutual acceptance.</li>
          <li>You can block or report any user. Blocked users cannot see your profile or send requests.</li>
          <li>Group membership and shared group content are visible to other group members only.</li>
          <li>Direct messages are visible only to the people in the conversation.</li>
          <li>You can unfriend, leave groups, or delete your account at any time.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>8. Content Moderation</h2>
        <p style={bodyStyle}>
          Uploaded avatars and post photos are automatically scanned using Google Vision SafeSearch.
          Images flagged as containing adult, violent, or racy content are rejected.
          Users can report other users or content, which is reviewed and actioned.
          Moderation logs are retained for 30 days, then automatically deleted.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>9. Referral Link Tracking</h2>
        <p style={bodyStyle}>
          Some creators share tracking links in the form crumbify.co.uk/referral?code=CODE.
          When someone visits such a link, we record the referral code and the visitor&apos;s
          device platform (iOS, Android, or other), and store a salted SHA-256 hash of the
          visitor&apos;s IP address before redirecting them to the relevant app store. The raw
          IP address is never stored, only the hash, and only one record is kept per unique
          visitor per code. We use this solely to measure how many people a creator&apos;s link
          brings in, on the basis of our legitimate interest in measuring marketing
          effectiveness.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>10. Advertising</h2>
        <p style={bodyStyle}>
          Free-tier users see ads via Google AdMob. AdMob may use device identifiers for
          ad personalisation. You can decline personalised ads via the in-app consent
          prompt shown on first launch and via your device privacy settings at any time.
          Premium users see no ads.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>11. GDPR and Your Rights</h2>
        <p style={{ ...bodyStyle, marginBottom: 8 }}>Under GDPR and UK data protection law, you have the right to:</p>
        <ul style={listStyle}>
          <li>Access all data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your account and all associated data.</li>
          <li>Object to processing of your data.</li>
          <li>Withdraw consent for optional data collection at any time.</li>
        </ul>
        <p style={{ ...bodyStyle, marginTop: 12 }}>
          To exercise any of these rights, use the in-app account settings or
          contact us at the email below.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>12. Data Retention</h2>
        <ul style={listStyle}>
          <li>Account data is retained until you delete your account.</li>
          <li>Avatar and post-photo moderation logs: 30 days.</li>
          <li>
            Waitlist signups: the email waitlist form has been removed from the website, but
            emails collected while it was live may still be retained for launch notifications;
            contact us if you would like one removed.
          </li>
          <li>Referral-link records: kept as an IP hash with no way to reverse it to an address, retained for as long as we need it to measure referral performance.</li>
          <li>When you delete your account, your cloud data is removed as described on our delete-account page.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>13. Children&apos;s Privacy</h2>
        <p style={bodyStyle}>
          Crumbify is not intended for children under 16. We do not knowingly
          collect personal information from children under 16. If we discover
          that a child under 16 has provided us with personal information, we
          will delete it.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>14. Changes to This Policy</h2>
        <p style={bodyStyle}>
          We may update this Privacy Policy from time to time. We will notify
          you of any material changes via in-app notification or email. Your
          continued use of the App after changes constitutes acceptance of the
          updated policy.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>15. Contact Us</h2>
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
