export function Footer() {
  return (
    <footer className="bg-crumb-darkest border-t border-white/[0.06] py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: logo + copyright */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-extrabold text-crumb-cream tracking-tight">
            Crumb
          </span>
          <span className="text-xs text-crumb-muted">
            © {new Date().getFullYear()} Crumb. All rights reserved.
          </span>
        </div>

        {/* Center: links */}
        <div className="flex items-center gap-6">
          <a
            href="/privacy"
            className="text-sm text-crumb-muted hover:text-crumb-cream transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-sm text-crumb-muted hover:text-crumb-cream transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="mailto:contact@crumbify.co.uk"
            className="text-sm text-crumb-muted hover:text-crumb-cream transition-colors"
          >
            Contact
          </a>
        </div>

        {/* Right: socials */}
        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/crumbify.co.uk/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-crumb-muted hover:text-crumb-cream transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" />
            </svg>
          </a>
          <a
            href="https://x.com/crumbifyco"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X / Twitter"
            className="text-crumb-muted hover:text-crumb-cream transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              role="img"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@crumbifyco"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="text-crumb-muted hover:text-crumb-cream transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              role="img"
              aria-hidden="true"
            >
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.89 2.89 2.89 0 012.88-2.89c.28 0 .56.04.82.12V9.01a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.05a8.27 8.27 0 004.76 1.51V7.12a4.83 4.83 0 01-1-.43z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
