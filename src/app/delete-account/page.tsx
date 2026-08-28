import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Delete Your Crumbify Account",
  description:
    "How to delete your Crumbify account and associated data, in the app or by email.",
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

const linkStyle: React.CSSProperties = {
  color: "#E6C39B",
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 32,
};

const noteBoxStyle: React.CSSProperties = {
  background: "#241712",
  border: "1px solid rgba(230,195,155,0.15)",
  borderRadius: 12,
  padding: "16px 20px",
  marginTop: 12,
  color: "#C4B09A",
  fontSize: 15,
  lineHeight: 1.6,
};

export default function DeleteAccountPage() {
  return (
    <LegalShell title="Delete Your Crumbify Account" updated="28 August 2026">
      <section style={sectionStyle}>
        <p style={bodyStyle}>
          You can permanently delete your Crumbify account and its associated data at any time.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Option 1 - In the app (recommended)</h2>
        <ol style={{ ...listStyle, listStyleType: "decimal" }}>
          <li>Open Crumbify and go to Account.</li>
          <li>Tap Settings (gear icon).</li>
          <li>Tap Delete Account.</li>
          <li>Confirm with the one-time code sent to your email.</li>
        </ol>
        <div style={noteBoxStyle}>
          Your account and data are removed immediately.
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Option 2 - By email</h2>
        <p style={bodyStyle}>
          If you no longer have the app installed, email{" "}
          <a href="mailto:admin@crumbify.co.uk" style={linkStyle}>
            admin@crumbify.co.uk
          </a>{" "}
          from the address on your account and ask us to delete it. We action requests
          within 30 days.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>What gets deleted</h2>
        <ul style={listStyle}>
          <li>Your profile (name, username, email, avatar)</li>
          <li>Posts you created and their photos</li>
          <li>Restaurant reviews, scores, and private notes</li>
          <li>Your been-to and want-to-try lists</li>
          <li>Comments and reactions you made on posts</li>
          <li>
            Your friends and group memberships, and content you shared within groups,
            including group photos
          </li>
          <li>Collections you created and their cover photos</li>
          <li>The hashed identifiers used for contact matching</li>
          <li>Your push notification token</li>
          <li>Your login account</li>
        </ul>
        <div style={noteBoxStyle}>
          Deletion cascades across our database, so removing your account removes the data
          tied to it. Photos you uploaded (avatars, feed post photos, collection covers, and
          group photos) are deleted from storage as part of the same flow. If you signed in
          with Apple, we also ask Apple to revoke the Sign in with Apple connection for
          Crumbify as part of deletion.
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>What we keep</h2>
        <ul style={listStyle}>
          <li>
            If you joined as a Founding Member, your founding status is tied to your email
            address and is retained so the benefit survives if you sign up again later.
            It holds no personal profile data.
          </li>
          <li>
            If you had a premium subscription or founding status, we keep a minimal
            entitlement record (your old account ID and dates, with no profile data) so we
            can reconcile app-store subscriptions.
          </li>
          <li>
            Aggregated or anonymised analytics that can no longer identify you.
          </li>
          <li>
            We keep a record of the request email itself, so we can show we actioned your
            deletion request.
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Retention</h2>
        <ul style={listStyle}>
          <li>App-initiated deletion: immediate.</li>
          <li>Email-requested deletion: within 30 days of a verified request.</li>
        </ul>
      </section>
    </LegalShell>
  );
}
