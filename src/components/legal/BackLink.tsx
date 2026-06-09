"use client";

export function BackLink() {
  return (
    <a
      href="/"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 14,
        fontWeight: 600,
        color: "#E6C39B",
        textDecoration: "none",
        fontFamily: "inherit",
        transition: "color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = "#C9A077";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = "#E6C39B";
      }}
    >
      <span style={{ fontSize: 16 }}>&#8592;</span> Back to home
    </a>
  );
}
