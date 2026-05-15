export function Screen1() {
  const rows: [string, string, number, number][] = [
    ['🍗', "Nando's", 100, 21],
    ['🍕', 'Pizza Express', 67, 14],
    ['🍜', 'Wagamama', 52, 11],
    ['🥘', 'Dishoom', 38, 8],
    ['🍗', 'KFC', 28, 6],
  ];
  return (
    <div className="p-4 pt-12 space-y-2.5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-[1.5px] text-[#E0D5C9]/30">Top Restaurants</div>
        <div className="text-base">🏆</div>
      </div>
      {rows.map(([e, n, w, v]) => (
        <div key={n} className="flex items-center gap-2">
          <span className="text-sm">{e}</span>
          <span className="text-[11px] text-[#E0D5C9]/65 w-[78px] shrink-0 truncate">{n}</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full bg-[#C9A077]" style={{ width: `${w}%` }} />
          </div>
          <span className="text-[9px] text-[#E6C39B] w-5 text-right shrink-0 font-bold">{v}</span>
        </div>
      ))}
    </div>
  );
}

export function Screen2() {
  return (
    <div className="p-4 pt-12">
      <div className="inline-block px-2 py-0.5 rounded-full bg-[#E6C39B]/15 text-[#E6C39B] text-[8px] font-bold tracking-[1.5px] uppercase mb-4">
        ✦ Wrapped 2025
      </div>
      <div className="font-headline text-[30px] text-white leading-[0.95] mb-1 tracking-[-0.01em]">
        Your Year<br />in Food
      </div>
      <div className="text-[11px] text-[#E0D5C9]/30 mb-5">Jan — Dec 2025</div>
      <div className="grid grid-cols-2 gap-2">
        {[['147', 'Orders'], ['38', 'Restaurants'], ["Nando's", 'Top Spot'], ['Indian', 'Top Cuisine']].map(([v, l]) => (
          <div key={l} className="bg-[#2A2118] rounded-xl p-3 border border-white/5">
            <div className="text-[8px] uppercase tracking-[1px] text-[#E0D5C9]/30">{l}</div>
            <div className="font-headline text-[20px] text-[#E6C39B] mt-0.5 leading-tight tracking-[-0.01em]">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Screen3() {
  return (
    <div className="p-4 pt-12">
      <div className="text-[9px] uppercase tracking-[1.5px] text-[#E6C39B] mb-2 font-bold">
        Food Personality
      </div>
      <div className="font-headline text-[28px] text-white leading-[0.95] tracking-[-0.01em]">
        The Explorer
      </div>
      <div className="text-[10px] text-[#E0D5C9]/40 leading-relaxed mt-2 mb-5">
        You try new cuisines constantly. Always on the hunt for something new.
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-[72px] h-[72px] rounded-full shrink-0 relative"
          style={{
            background:
              'conic-gradient(#C9A077 0deg 122deg, #8A7060 122deg 223deg, #5C4438 223deg 280deg, rgba(255,255,255,0.06) 280deg)',
          }}
        >
          <div className="absolute inset-0 m-[14px] rounded-full bg-[#1A1208]" />
        </div>
        <div className="space-y-1.5 text-[9px] text-[#E0D5C9]/55">
          {[['#C9A077', 'Indian 34%'], ['#8A7060', 'Pizza 28%'], ['#5C4438', 'Chinese 18%']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-sm" style={{ background: c }} />
              {l}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {['Adventurous', 'Night Owl', 'Spice Lover', 'Top 4%'].map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[#E0D5C9]/55 text-[9px] border border-white/[0.08]">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Screen4() {
  return (
    <div className="p-4 pt-12">
      <div className="font-headline text-[24px] text-white mb-1 tracking-[-0.01em]">Soulmates</div>
      <div className="text-[10px] text-[#E0D5C9]/35 mb-4">People who order just like you</div>
      <div className="bg-[#2A2118] rounded-2xl p-4 border border-[#E6C39B]/15 mb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A077] to-[#5C4438] flex items-center justify-center text-white font-bold text-sm shrink-0">
            J
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-white">Jamie</div>
            <div className="text-[9px] text-[#E0D5C9]/35">Your #1 match</div>
          </div>
          <div className="font-headline text-[30px] text-[#E6C39B] leading-none">92%</div>
        </div>
        <div className="text-[8px] uppercase tracking-[1px] text-[#E0D5C9]/25 mb-1.5">
          Shared favourites
        </div>
        <div className="flex flex-wrap gap-1">
          {["Nando's", 'Indian', 'Wagamama', 'Late night 🌙'].map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-[#E6C39B]/10 text-[#E6C39B] text-[8px] font-semibold">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
