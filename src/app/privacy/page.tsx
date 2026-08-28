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
    <LegalShell title="Privacy Policy" updated="28 August 2026">
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
            Name, email address, and username when you create an account via
            Apple Sign In, Google Sign In, or email OTP, plus a profile photo if
            you choose to upload one. Signing in
            with Apple or Google shares your name and email address with us so we
            can create your account; it does not give us access to anything else
            in your Apple or Google account.
          </li>
          <li>
            <span style={strongStyle}>Restaurants you add:</span>{" "}
            When you share a TikTok or Instagram post into Crumbify, paste in a
            Google Maps list link, or search and add a place manually, we resolve
            the shared link to a restaurant and store that restaurant, your
            been-to and want-to-try status, and any score or note you attach. For a
            TikTok share, we read the caption via TikTok&apos;s public oEmbed
            service, and TikTok photo posts may be fetched from TikTok&apos;s embed
            pages; if a caption does not identify a place, the post&apos;s images
            are run through Google Vision text detection instead. For an Instagram
            share, the caption is extracted by our processor, Supadata. We store
            only the source (TikTok, Instagram, or Google Maps), the link you
            shared, the resolved restaurant, and the import status; we never store
            the caption text or the text read from an image. Crumbify does not
            connect to delivery-platform accounts or APIs, and it does not read
            your order history from screenshots.
          </li>
          <li>
            <span style={strongStyle}>Reviews and private notes:</span>{" "}
            Scores out of 10 and personal notes you write about places you have
            been to.
          </li>
          <li>
            <span style={strongStyle}>Profile photo:</span>{" "}
            If you upload an avatar, it is resized and re-encoded before upload
            and normally scanned by Google Vision SafeSearch to detect
            inappropriate content before being stored (see Content Moderation
            below).
          </li>
          <li>
            <span style={strongStyle}>Posts and photos:</span>{" "}
            When you post about a place to your profile wall or the Home feed,
            with an optional photo, we store it and normally run automated safety
            screening (Google Vision SafeSearch) before it is shown to others
            (see Content Moderation below). You
            can also choose, post by post, to share it to the public Trending
            tab as well.
          </li>
          <li>
            <span style={strongStyle}>Social activity:</span>{" "}
            Reactions and comments on posts, friend connections and requests,
            groups you create or join and their shared lists, photos, comments,
            and reactions, and leaderboard participation.
          </li>
          <li>
            <span style={strongStyle}>Contacts you choose to match:</span>{" "}
            If you use the optional find-friends step, and only with your
            permission, we read the phone numbers and email addresses in your
            device contacts; we never read names or photos. Each value is
            converted to a one-way SHA-256 hash on your device before anything
            leaves it, and only those hashes (up to 2000 at a time) are uploaded
            to check for matching Crumbify accounts, up to 200 matches are
            returned, and blocked users are excluded. A hash of your own sign-up
            email is stored the same way so other people can find you. This step
            is optional and can be skipped, and the hashes are kept only while
            your account exists.
          </li>
          <li>
            <span style={strongStyle}>Location:</span>{" "}
            With your permission, we read your approximate device location in
            the foreground to power the Discover map and to search nearby places
            via Google Places. Your coordinates are sent to our servers only to
            run that search and are not stored there, and the last location fix
            is cached on your device for up to 7 days. Location permission is
            optional and is only ever requested once, during onboarding.
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
            the App, collected via PostHog against a pseudonymous account ID
            only (no names, emails, or review content), and EU-hosted. The
            website separately collects anonymous performance metrics via
            Vercel Speed Insights.
          </li>
          <li>
            <span style={strongStyle}>Push notifications:</span>{" "}
            If you enable notifications, we store a push token on your profile
            so we can deliver them. Notifications can include first-party
            content such as a friend&apos;s display name, a group name, or a
            place name. Turning notifications off removes the stored token.
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
          <li>We never upload your contacts&apos; names, photos, or readable phone numbers or email addresses; contact matching uses one-way hashes computed on your phone.</li>
          <li>We never share your personal data with third parties for their own marketing purposes.</li>
          <li>We do not sell your data to advertisers or data brokers.</li>
          <li>We do not track or display what you spend on food - Crumbify&apos;s stats are counts and percentages only. (Subscription pricing is shown at purchase, as any store requires.)</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>4. How We Use Your Information</h2>
        <ul style={listStyle}>
          <li>Run the Home feed: showing friends&apos; posts, reactions, comments, and leaderboards, plus the public Trending tab for posts you choose to share there.</li>
          <li>Power Discover: the map, nearby places, and taste-matched recommendations.</li>
          <li>Maintain your Reviews history: been-to places, want-to-try lists, scores, and private notes.</li>
          <li>Enable Social features: friends, groups, shared lists, and shared photos.</li>
          <li>Run your Profile wall: posts, achievements, and tiers, and the monthly Challenge.</li>
          <li>Moderate uploaded content (avatars, post photos) for safety.</li>
          <li>Process reports submitted by users about inappropriate content or behaviour.</li>
          <li>Show ads to free-tier users via Google AdMob, personalised only if you consent (see the Advertising section).</li>
          <li>Grant and manage Crumbify Premium and founding-member access.</li>
          <li>Measure referral-link effectiveness (see section 9).</li>
          <li>Improve and maintain the App and Site.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>5. Data Storage and Security</h2>
        <p style={bodyStyle}>
          Cloud data is stored with our cloud database provider, using row-level
          security (RLS) policies that enforce per-user data isolation. All API
          communication uses HTTPS with TLS.
        </p>
        <ul style={listStyle}>
          <li>Auth tokens are stored on-device only using secure storage.</li>
          <li>Passwords are never stored - authentication uses Apple/Google Sign In or email OTP.</li>
          <li>
            Every photo you upload (avatars, post photos, group photos, review
            photos, collection covers) is resized and re-encoded before upload,
            which removes embedded photo metadata such as location tags.
          </li>
          <li>
            Avatars and feed-post photos are stored at public links, meaning
            anyone with the link can view the image. Group photos and private
            review photos are private and served through short-lived signed
            links. Collection covers are stored privately and shown according to
            the collection&apos;s visibility.
          </li>
          <li>Avatar and post-photo moderation logs are automatically deleted after 30 days.</li>
          <li>
            Account deletion removes your cloud data as described on our{" "}
            <a href="/delete-account" style={linkStyle}>
              delete-account page
            </a>
            .
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>6. Third-Party Services</h2>
        <ul style={listStyle}>
          <li>
            <span style={strongStyle}>Supabase:</span>{" "}
            Provides the database, authentication, and storage for the App and website.
          </li>
          <li>
            <span style={strongStyle}>Google Places:</span>{" "}
            Used to search for and fetch restaurant details (photos, ratings, addresses) when you add a place or use Discover.
          </li>
          <li>
            <span style={strongStyle}>Google Vision API:</span>{" "}
            SafeSearch moderation for uploaded avatar images and post photos, and text detection used as a fallback over a shared TikTok post&apos;s thumbnail or slide images when its caption does not identify a place. Instagram posts are never sent to Google Vision.
          </li>
          <li>
            <span style={strongStyle}>TikTok:</span>{" "}
            When you share a TikTok post into Crumbify, we read the caption via TikTok&apos;s public oEmbed service, and photo posts may be fetched from TikTok&apos;s embed pages, solely to resolve the place you shared.
          </li>
          <li>
            <span style={strongStyle}>Supadata:</span>{" "}
            A third-party processor we use to extract the caption from an Instagram post you share, solely to resolve the place you shared.
          </li>
          <li>
            <span style={strongStyle}>Resend:</span>{" "}
            Sends our transactional emails: sign-in codes, founding-member verification codes, and trial-ending reminders. We do not send marketing email, other than the single launch notification waitlist members signed up for.
          </li>
          <li>
            <span style={strongStyle}>Expo:</span>{" "}
            Delivers push notifications using the token stored on your profile while notifications are enabled.
          </li>
          <li>
            <span style={strongStyle}>PostHog:</span>{" "}
            Product analytics, EU-hosted, keyed to a pseudonymous account ID only, never your name, email, or review content.
          </li>
          <li>
            <span style={strongStyle}>RevenueCat:</span>{" "}
            Manages Crumbify Premium subscriptions. Receives an anonymous account ID only, never your email, name, or advertising identifiers.
          </li>
          <li>
            <span style={strongStyle}>Google AdMob:</span>{" "}
            Displays ads to free-tier users. Shows the Google consent (UMP) prompt and, on iOS, the App Tracking Transparency prompt; ads are non-personalised unless both consents are given, and you can decline and still use the App. Premium users see no Google ads.
          </li>
          <li>
            <span style={strongStyle}>Stripe:</span>{" "}
            Processes founding-member payments on the website only. We never see or store your card details.
          </li>
          <li>
            <span style={strongStyle}>Sentry:</span>{" "}
            Error monitoring for the App and website, EU-hosted, to help us find and fix bugs. Configured to send no personal details, with automatic redaction of emails and tokens; the user reference attached is your account ID only.
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
          <li>A post you make goes to your Home feed by default, where friends see it in the Friends tab. You can choose, per post, to also share it to the public Trending tab, where it is visible to any signed-in Crumbify user.</li>
          <li>You can unfriend, leave groups, or delete your account at any time.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>8. Content Moderation</h2>
        <p style={bodyStyle}>
          We run automated SafeSearch screening (Google Vision) on uploaded
          avatars and post photos and reject images it flags as adult, violent,
          or racy. Automated screening is not perfect and may occasionally be
          unavailable, so you can also report any content or user in the app;
          reports are reviewed and actioned. Moderation logs are retained for 30
          days, then automatically deleted.
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
        <h2 style={headingStyle}>10. Cookies on This Site</h2>
        <p style={bodyStyle}>
          The website at crumbify.co.uk uses one essential cookie: a login session
          cookie for the admin area, valid for one hour and never set for
          ordinary visitors. We also use cookieless Vercel Speed Insights for
          performance metrics and the salted IP hash described in section 9 for
          referral-link measurement. We do not use any advertising or tracking
          cookies on the website, and we do not send marketing email, other
          than the single launch notification waitlist members signed up for.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>11. Advertising</h2>
        <p style={bodyStyle}>
          Free-tier users see ads via Google AdMob: banners on the Home and
          Social tabs, native ads in the Discover scroll, and an occasional
          full-screen ad in the collections story viewer. We show the Google
          consent (UMP) prompt and, on iOS, the App Tracking Transparency
          prompt; ads are non-personalised unless you give both consents, and
          you can decline and still use the App. Crumbify Premium removes all
          Google ads.
        </p>
        <p style={bodyStyle}>
          Separately, clearly labelled &quot;Sponsored&quot; restaurant cards may appear
          in the App. These are not personalised; they are chosen by simple
          rotation from a campaign list rather than from your data, carry a
          gold &quot;Sponsored&quot; label, and involve no per-user tracking. They appear
          for everyone, about half as often for Crumbify Premium members.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>12. GDPR and Your Rights</h2>
        <p style={{ ...bodyStyle, marginBottom: 8 }}>
          We rely on different legal bases depending on the processing: your
          contract with us to provide the App, your consent for optional
          features such as contacts matching, location, and personalised ads,
          and our legitimate interests for security, moderation, and measuring
          marketing effectiveness. Under GDPR and UK data protection law, you
          have the right to:
        </p>
        <ul style={listStyle}>
          <li>Access all data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your account and all associated data.</li>
          <li>Object to processing of your data.</li>
          <li>Withdraw consent for optional data collection at any time.</li>
          <li>Request that we restrict processing of your data in certain circumstances.</li>
          <li>Receive a copy of your data in a portable, machine-readable format (the in-app export described below).</li>
        </ul>
        <p style={{ ...bodyStyle, marginTop: 12 }}>
          You can withdraw contacts and location permissions at any time in
          your device settings, and change your advertising choices via the
          in-app privacy options and, on iOS, in Settings under Privacy and
          Security, Tracking.
        </p>
        <p style={{ ...bodyStyle, marginTop: 12 }}>
          To exercise any of these rights, use the in-app account settings,
          where you can request a JSON export of your data through the device
          share sheet (very large exports are truncated, with an email route
          for the full copy), or contact us at the email below. You also have
          the right to complain to the Information Commissioner&apos;s Office at{" "}
          <a
            href="https://ico.org.uk"
            style={linkStyle}
            target="_blank"
            rel="noopener noreferrer"
          >
            ico.org.uk
          </a>
          .
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>13. International Transfers</h2>
        <p style={bodyStyle}>
          Sentry and PostHog are EU-hosted. Some of the providers listed in
          section 6, including Google, RevenueCat, Expo, Stripe, Supadata, and
          TikTok, may process data outside the UK. Where that happens, we rely
          on UK data protection safeguards for the transfer, such as adequacy
          regulations or standard contractual clauses and the UK International
          Data Transfer Addendum.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>14. Data Retention</h2>
        <ul style={listStyle}>
          <li>Account data is retained until you delete your account.</li>
          <li>Import history (the shared link, the resolved place, and the status): while your account exists.</li>
          <li>Hashed contact-matching identifiers: while your account exists.</li>
          <li>Push notification token: while notifications are enabled, removed when you turn them off.</li>
          <li>Notification history (a record of notifications we sent you): while your account exists.</li>
          <li>Avatar and post-photo moderation logs: 30 days.</li>
          <li>Trial-ending reminder scheduling records: 30 days.</li>
          <li>Founding-member emails: retained while the founding benefit exists, so the tier can be restored by verifying that email.</li>
          <li>Pre-launch waitlist emails: kept until launch so we can send the launch notification you signed up for; contact us any time to be removed.</li>
          <li>Referral-link records: kept as a salted IP hash (never reversible to an address) for up to 12 months from the click, then deleted.</li>
          <li>
            When you delete your account, your cloud data is removed as
            described on our{" "}
            <a href="/delete-account" style={linkStyle}>
              delete-account page
            </a>
            .
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>15. Children&apos;s Privacy</h2>
        <p style={bodyStyle}>
          Crumbify is not intended for children under 16. We do not knowingly
          collect personal information from children under 16. If we discover
          that a child under 16 has provided us with personal information, we
          will delete it.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>16. Changes to This Policy</h2>
        <p style={bodyStyle}>
          We may update this Privacy Policy from time to time. We will notify
          you of any material changes via in-app notification or email. Your
          continued use of the App after changes constitutes acceptance of the
          updated policy.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>17. Contact Us</h2>
        <p style={bodyStyle}>
          If you have questions about this Privacy Policy, or want to reach our
          data protection contact, email us at{" "}
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
