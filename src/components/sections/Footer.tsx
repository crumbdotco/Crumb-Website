import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-1 border-t border-crumb-gold/[0.06] bg-crumb-darker px-10 py-7">
      <div className="mx-auto flex max-w-[960px] items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Image
              src="/images/crumb-icon.png"
              alt="Crumb"
              width={22}
              height={22}
              className="rounded object-cover"
            />
            <span className="text-[13px] font-extrabold text-crumb-cream">crumb</span>
          </div>
          <div className="h-3.5 w-px bg-white/[0.08]" />
          <span className="text-[11px] text-[#6B5D4E]">
            Your food. Your stats. Your story.
          </span>
        </div>

        {/* Right */}
        <div className="flex gap-4">
          {[
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
            { href: "/support", label: "Support" },
            { href: "mailto:hello@crumbify.co.uk", label: "Contact" },
          ].map(({ href, label }) =>
            href.startsWith("mailto:") ? (
              <a
                key={label}
                href={href}
                className="text-[11px] text-[#6B5D4E] no-underline transition-colors duration-150 hover:text-crumb-cream"
              >
                {label}
              </a>
            ) : (
              <Link
                key={label}
                href={href}
                className="text-[11px] text-[#6B5D4E] no-underline transition-colors duration-150 hover:text-crumb-cream"
              >
                {label}
              </Link>
            ),
          )}
        </div>
      </div>
    </footer>
  );
}
