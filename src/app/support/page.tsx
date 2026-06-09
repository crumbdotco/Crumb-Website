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
    q: "How does Crumbify access my order history?",
    a: "Crumbify reads your order history from screenshots you import. You stay in control of what you share. We never ask for your delivery-account password and never connect to those accounts directly. You can also add any restaurant manually.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Your order data is stored locally on your device with encryption. Social features use our secure cloud with row-level security. We never sell your data.",
  },
  {
    q: "What platforms do you support?",
    a: "Crumbify reads screenshots from Uber Eats, Just Eat, and Deliveroo, and you can log any restaurant by hand.",
  },
  {
    q: "How do I remove data I have added?",
    a: "Everything in Crumbify comes from what you import or enter, so you stay in control. You can remove individual entries in the app, or delete your whole account at any time (see our delete account page).",
  },
  {
    q: "What is included in Crumbify Premium?",
    a: "Crumbify Premium gives you unlimited screenshot imports, your full stats history (including year and all-time), unlimited want-to-try saved spots, photo reviews, friend recommendations, larger groups, and an ad-free experience.",
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
