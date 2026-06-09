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
    <LegalShell title="Delete Your Crumbify Account">
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
          <a href="mailto:support@crumbify.co.uk" style={linkStyle}>
            support@crumbify.co.uk
          </a>{" "}
          from the address on your account and ask us to delete it. We action requests
          within 30 days.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>What gets deleted</h2>
        <ul style={listStyle}>
          <li>Your profile (name, username, email, avatar)</li>
          <li>Imported order history and items</li>
          <li>Restaurant reviews, ratings, and want-to-try lists</li>
          <li>Friends, groups, messages, and social activity</li>
          <li>Feed posts you created, their photos, likes, and comments</li>
          <li>Food Soulmate matches and the opener messages you sent or received</li>
          <li>Your login account</li>
        </ul>
        <div style={noteBoxStyle}>
          Deletion cascades across our database, so removing your account removes the data
          tied to it. Photos you uploaded (avatar and feed post photos) are deleted from
          storage as part of the same flow.
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
            Aggregated or anonymized analytics that can no longer identify you.
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
