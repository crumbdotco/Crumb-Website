// src/components/sections/v2/Footer.tsx
export function Footer() {
  return (
    <footer className="bg-[#0E0805] px-6 pt-16 pb-8 border-t border-[#E6C39B]/8">
      <div className="max-w-[1100px] mx-auto">
        {/* Big tagline */}
        <div className="font-headline text-[clamp(64px,11vw,160px)] text-[#E0D5C9]/8 leading-none mb-12 select-none pointer-events-none">
          Crumbify.
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
          <div>
            <div className="text-[22px] text-[#E6C39B] tracking-[0.12em] font-extrabold mb-2">CRUMBIFY</div>
            <div className="text-[12px] text-[#E0D5C9]/30">Your food delivery stats in one place</div>
          </div>
          <ul className="flex gap-6 flex-wrap">
            {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Support', '/support']].map(([l, h]) => (
              <li key={l}>
                <a
                  href={h}
                  className="text-[12px] text-[#E0D5C9]/35 hover:text-[#E0D5C9]/70 transition-colors"
                  data-cursor="pointer"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="pt-6 border-t border-white/6 flex flex-col md:flex-row justify-between items-center gap-2">
          <span className="text-[11px] text-[#E0D5C9]/20">© 2026 Crumbify. All rights reserved.</span>
          <span className="text-[11px] text-[#E0D5C9]/20 font-mono">crumbify.co.uk</span>
        </div>
      </div>
    </footer>
  );
}
