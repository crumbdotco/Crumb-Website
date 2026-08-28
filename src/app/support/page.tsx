import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/LegalShell";
import { ContactLinks } from "@/components/legal/ContactLinks";

export const metadata: Metadata = {
  title: "Support - Crumbify",
};

const headingStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#F4ECDF",
  marginBottom: 0,
  lineHeight: 1.3,
  letterSpacing: 0,
};

const cardStyle: React.CSSProperties = {
  background: "#241712",
  border: "1px solid rgba(230,195,155,0.15)",
  borderRadius: 16,
  padding: "32px",
  marginBottom: 20,
  boxShadow: "0 2px 8px rgba(26,18,8,0.25)",
};

const faqQuestionStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#F4ECDF",
  fontSize: 16,
  marginBottom: 8,
  lineHeight: 1.4,
  letterSpacing: 0,
};

const faqAnswerStyle: React.CSSProperties = {
  color: "#C4B09A",
  fontSize: 15,
  lineHeight: 1.65,
  margin: 0,
};

const faqs = [
  {
    q: "How do I add restaurants to Crumbify?",
    a: "Share a TikTok or Instagram post into Crumbify via the share sheet, paste in a Google Maps list link, or search for a place manually. Crumbify does not read order history from screenshots, and it never connects to delivery-platform accounts or APIs.",
  },
  {
    q: "Is my data safe?",
    a: "Your data lives in our secure cloud with row-level security, so other users only see what you share with them. Two things to know: avatar and post photos are served from public links, so anyone with the direct link can open the image, and posts you share to the Trending tab are visible to any signed-in Crumbify user. We never sell your data. See our privacy policy for the full picture.",
  },
  {
    q: "How does the Home feed work?",
    a: "When you post about a place, your friends can see it, react, and comment in the Home feed. You can also discover new places through friends, taste-matched recommendations, and the Discover map. You can also choose to share a post to the public Trending tab so people beyond your friends can see it.",
  },
  {
    q: "How do I remove data I have added?",
    a: "Everything in Crumbify comes from what you post or enter, so you stay in control. You can remove individual posts, reviews, or want-to-try entries in the app, or delete your whole account at any time (see our delete account page).",
  },
  {
    q: "What is included in Crumbify Premium?",
    a: "Crumbify Premium gives you Monthly Wrapped, removes Google ads (clearly labelled sponsored restaurant picks still appear, about half as often), and unlocks unlimited profile collections with a premium cover library plus a premium profile badge.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to Account, tap the gear icon, then tap Delete Account. You can also request deletion by email. See our delete account page for full details.",
  },
];

export default function SupportPage() {
  return (
    <LegalShell title="Support">
      <p
        style={{
          fontSize: 18,
          color: "#C4B09A",
          marginBottom: 32,
          marginTop: -8,
          lineHeight: 1.5,
        }}
      >
        Got a question or need help? We&apos;re here for you.
      </p>

      {/* FAQ card */}
      <div style={cardStyle}>
        <h2 style={headingStyle}>Frequently Asked Questions</h2>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 24 }}>
          {faqs.map((faq) => (
            <div key={faq.q}>
              <p style={faqQuestionStyle}>{faq.q}</p>
              <p style={faqAnswerStyle}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact card */}
      <div style={cardStyle}>
        <h2 style={headingStyle}>Contact Us</h2>
        <p
          style={{
            marginTop: 12,
            marginBottom: 20,
            fontSize: 15,
            color: "#9B8272",
            lineHeight: 1.5,
          }}
        >
          Can&apos;t find what you&apos;re looking for? Reach out directly.
        </p>
        <ContactLinks />
      </div>
    </LegalShell>
  );
}
