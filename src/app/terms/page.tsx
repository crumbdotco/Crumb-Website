import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service - Crumbify",
  description: "Terms and conditions for using the Crumbify app.",
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

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="June 2026">
      <section style={sectionStyle}>
        <h2 style={headingStyle}>1. Acceptance of Terms</h2>
        <p style={bodyStyle}>
          By downloading, installing, or using Crumbify (&quot;the App&quot;), or by
          accessing the Crumbify website at crumbify.co.uk (&quot;the Site&quot;), you agree
          to be bound by these Terms of Service. If you do not agree, do not
          use the App or Site.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>2. Description of Service</h2>
        <p style={bodyStyle}>
          Crumbify is a mobile application that reads your food delivery order history
          from screenshots you import (using OCR) and from orders you log manually.
          It uses this data to provide personalised statistics, insights, restaurant
          reviews, food maps, a global feed, social features (friends, groups, food
          soulmate matching), a discover feed, and achievements.
          Crumbify does not connect to delivery platform accounts via their APIs.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>3. Account Registration</h2>
        <ul style={listStyle}>
          <li>You must provide accurate and complete information when creating an account.</li>
          <li>You can sign up via Apple Sign In, Google Sign In, or email OTP (one-time passcode).</li>
          <li>You are responsible for maintaining the security of your account.</li>
          <li>You must be at least 16 years old to use the App.</li>
          <li>One account per person. Duplicate or fake accounts may be terminated.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>4. Importing Order Data</h2>
        <p style={{ ...bodyStyle, marginBottom: 8 }}>
          Crumbify reads order history from screenshots you choose to share with the App.
        </p>
        <ul style={listStyle}>
          <li>You stay in control of what you import - nothing is pulled automatically.</li>
          <li>We support screenshots from Uber Eats, Just Eat, and Deliveroo, plus manual entry for any restaurant.</li>
          <li>Crumbify is not affiliated with, endorsed by, or sponsored by Uber Eats, Just Eat, Deliveroo, or any other delivery platform.</li>
          <li>Data accuracy depends on screenshot quality and OCR parsing. We are not responsible for inaccurate or missing data.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>5. Premium Subscription</h2>
        <p style={{ ...bodyStyle, marginBottom: 8 }}>
          Crumbify Premium unlocks additional features including unlimited screenshot imports,
          your full stats history, unlimited want-to-try saved spots, photo reviews,
          friend recommendations, larger groups, and an ad-free experience.
        </p>
        <ul style={listStyle}>
          <li>Subscriptions are managed through Apple App Store or Google Play Store.</li>
          <li>Cancellation and refund policies are governed by the respective app store&apos;s terms.</li>
          <li>Premium features may change over time. We will notify you of material changes.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>6. Founding Member</h2>
        <p style={{ ...bodyStyle, marginBottom: 8 }}>
          Founding Member is a <span style={strongStyle}>pre-launch only</span> offer:
          a one-time payment (processed by Stripe) that grants
          lifetime Crumbify Premium access. This is separate from the recurring Crumbify Premium
          subscription available after launch via the App Store and Google Play.
        </p>
        <ul style={listStyle}>
          <li>Founding Members pay once and never pay again - no subscription, no recurring fees.</li>
          <li>The Founding Member offer will be permanently removed once the App launches publicly.</li>
          <li>Founding Members receive an exclusive profile badge and all current and future Premium features at no additional cost.</li>
          <li>Founding Member status is non-transferable and tied to your Crumbify account.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>7. Social Features and Groups</h2>
        <ul style={listStyle}>
          <li>You can add friends, create or join groups, and share stats with other users.</li>
          <li>Group feeds allow members to post restaurant recommendations, vote on suggestions, and share experiences.</li>
          <li>Group admins can manage members, change group settings, and customise group appearance.</li>
          <li>You can set your profile to private to hide your stats from non-friends.</li>
          <li>You can block or report users for inappropriate behaviour.</li>
          <li>We reserve the right to remove content or suspend accounts that violate community guidelines.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>8. User Content and Moderation</h2>
        <ul style={listStyle}>
          <li>You retain ownership of content you create (reviews, photos, group posts, feed posts).</li>
          <li>By posting content, you grant Crumbify a non-exclusive licence to display it within the App for its intended purpose.</li>
          <li>Profile photos and feed post photos are automatically scanned for inappropriate content using Google Vision SafeSearch.</li>
          <li>Content flagged as adult, violent, or racy will be rejected.</li>
          <li>You can report users or content. Reports are reviewed and actioned by our team.</li>
          <li>We may remove content that violates these Terms without prior notice.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>9. Acceptable Use</h2>
        <p style={{ ...bodyStyle, marginBottom: 8 }}>You agree not to:</p>
        <ul style={listStyle}>
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

      <section style={sectionStyle}>
        <h2 style={headingStyle}>10. Intellectual Property</h2>
        <p style={bodyStyle}>
          All content, features, branding, and functionality of the App and Site
          (including the Crumbify name, logo, and food personality
          system) are owned by Crumbify and are protected by copyright, trademark,
          and other intellectual property laws. You may not reproduce,
          distribute, or create derivative works without our written consent.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>11. Limitation of Liability</h2>
        <ul style={listStyle}>
          <li>Crumbify is provided &quot;as is&quot; without warranties of any kind, express or implied.</li>
          <li>We are not responsible for the accuracy of data extracted from imported screenshots.</li>
          <li>We are not liable for any loss of data stored on your device.</li>
          <li>Our total liability shall not exceed the amount you paid for the App in the 12 months preceding any claim.</li>
          <li>We are not responsible for third-party services (Stripe, AdMob) - their own terms apply.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>12. Termination</h2>
        <ul style={listStyle}>
          <li>We may suspend or terminate your account if you violate these Terms.</li>
          <li>You may delete your account at any time from the App settings.</li>
          <li>Account deletion removes all your data from our cloud systems immediately.</li>
          <li>On-device data is removed when you uninstall the App.</li>
          <li>If you are a Founding Member and your account is terminated for violating these Terms, no refund will be issued.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>13. Governing Law</h2>
        <p style={bodyStyle}>
          These Terms are governed by the laws of England and Wales. Any disputes
          arising from these Terms or your use of the App shall be subject to the
          exclusive jurisdiction of the courts of England and Wales.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>14. Changes to These Terms</h2>
        <p style={bodyStyle}>
          We may update these Terms from time to time. We will notify you of
          material changes via in-app notification or email. Your continued use
          of the App after changes constitutes acceptance of the updated Terms.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>15. Contact</h2>
        <p style={bodyStyle}>
          For questions about these Terms, contact us at{" "}
          <a
            href="mailto:contact@crumbify.co.uk"
            style={linkStyle}
          >
            contact@crumbify.co.uk
          </a>
          .
        </p>
      </section>
    </LegalShell>
  );
}
