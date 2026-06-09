"use client";

const contactLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  borderRadius: 12,
  border: "1px solid rgba(230,195,155,0.12)",
  padding: "16px",
  textDecoration: "none",
  background: "transparent",
};

const contactIconWrapStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  background: "rgba(230,195,155,0.12)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const contactLabelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#F4ECDF",
  marginBottom: 2,
  letterSpacing: 0,
};

const contactSubStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#C4B09A",
};

export function ContactLinks() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <a
        href="mailto:contact@crumbify.co.uk"
        style={contactLinkStyle}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(230,195,155,0.07)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
        }}
      >
        <div style={contactIconWrapStyle}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E6C39B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <div>
          <p style={contactLabelStyle}>Email</p>
          <p style={contactSubStyle}>contact@crumbify.co.uk</p>
        </div>
      </a>

      <a
        href="https://x.com/crumbifyco"
        target="_blank"
        rel="noopener noreferrer"
        style={contactLinkStyle}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(230,195,155,0.07)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
        }}
      >
        <div style={contactIconWrapStyle}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="#E6C39B"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
        <div>
          <p style={contactLabelStyle}>Twitter / X</p>
          <p style={contactSubStyle}>@crumbifyco</p>
        </div>
      </a>
    </div>
  );
}
