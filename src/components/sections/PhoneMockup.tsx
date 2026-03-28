export function PhoneMockup() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="w-[280px] md:w-[360px] aspect-[9/19.5] bg-crumb-cream rounded-[2.5rem] border-4 border-crumb-brown/30 shadow-2xl overflow-hidden flex flex-col">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1">
          <span className="text-[10px] font-semibold text-crumb-dark">9:41</span>
          <div className="w-20 h-5 bg-crumb-dark rounded-full" />
          <div className="flex gap-0.5">
            <div className="w-3.5 h-2 bg-crumb-dark/60 rounded-sm" />
          </div>
        </div>

        {/* App content - resembles actual home screen */}
        <div className="flex-1 flex flex-col px-5 pt-3 pb-2 overflow-hidden">
          {/* Greeting */}
          <p className="text-[11px] text-crumb-muted">Good evening,</p>
          <p className="text-base font-bold text-crumb-dark">Ali</p>

          {/* Stat circle */}
          <div className="flex justify-center mt-3">
            <div className="w-24 h-24 rounded-full border-[3px] border-crumb-card flex flex-col items-center justify-center">
              <span className="text-lg font-extrabold text-crumb-dark leading-none">147</span>
              <span className="text-[8px] text-crumb-muted mt-0.5">total orders</span>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="flex gap-2 mt-3">
            <div className="flex-1 bg-crumb-card/60 rounded-lg p-2">
              <span className="text-[9px] text-crumb-muted">Top spot</span>
              <p className="text-[11px] font-bold text-crumb-dark leading-tight">Nando's</p>
            </div>
            <div className="flex-1 bg-crumb-card/60 rounded-lg p-2">
              <span className="text-[9px] text-crumb-muted">Favourite</span>
              <p className="text-[11px] font-bold text-crumb-dark leading-tight">Indian</p>
            </div>
          </div>

          {/* Mini bar chart */}
          <div className="mt-3">
            <p className="text-[9px] font-semibold text-crumb-dark mb-1.5">This week</p>
            <div className="flex items-end gap-1.5 h-10">
              {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-crumb-brown/70 rounded-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className="text-[7px] text-crumb-muted flex-1 text-center">{d}</span>
              ))}
            </div>
          </div>

          {/* Recent orders */}
          <div className="mt-3">
            <p className="text-[9px] font-semibold text-crumb-dark mb-1">Recent orders</p>
            {[
              { name: "Nando's", item: "Butterfly Chicken", platform: "Uber Eats" },
              { name: "Wagamama", item: "Katsu Curry", platform: "Just Eat" },
            ].map((order, i) => (
              <div key={i} className="flex items-center gap-2 py-1 border-b border-crumb-line/50 last:border-0">
                <div className="w-6 h-6 rounded-md bg-crumb-card flex items-center justify-center">
                  <span className="text-[8px] font-bold text-crumb-dark">{order.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-semibold text-crumb-dark truncate">{order.name}</p>
                  <p className="text-[7px] text-crumb-muted truncate">{order.item}</p>
                </div>
                <span className="text-[7px] text-crumb-muted shrink-0">{order.platform}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center justify-around px-2 py-2.5 border-t border-crumb-line">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-4 h-4 bg-crumb-dark rounded" />
            <span className="text-[7px] font-medium text-crumb-dark">Home</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-4 h-4 bg-crumb-muted/40 rounded" />
            <span className="text-[7px] text-crumb-muted">Stats</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            {/* Map pin icon for Reviews */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-crumb-muted/40">
              <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor" />
            </svg>
            <span className="text-[7px] text-crumb-muted">Reviews</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-4 h-4 bg-crumb-muted/40 rounded" />
            <span className="text-[7px] text-crumb-muted">Social</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-4 h-4 bg-crumb-muted/40 rounded" />
            <span className="text-[7px] text-crumb-muted">Account</span>
          </div>
        </div>
      </div>
    </div>
  );
}
