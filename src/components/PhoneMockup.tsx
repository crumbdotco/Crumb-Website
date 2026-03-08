export function PhoneMockup() {
  return (
    <div className="relative" style={{ perspective: "1200px" }}>
      {/* Multi-layer glow behind phone */}
      <div className="absolute -inset-8 rounded-[4rem] bg-primary/8 blur-[60px] animate-pulse-ring" />
      <div className="absolute -inset-4 rounded-[3.5rem] bg-primary/5 blur-[30px]" />

      {/* Phone frame */}
      <div
        className="relative w-[280px] rounded-[3rem] border-2 border-border/80 bg-surface p-3 shadow-2xl md:w-[300px]"
        style={{
          boxShadow: "0 25px 60px rgba(108, 92, 231, 0.12), 0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-28 bg-surface rounded-b-2xl z-10" />

        <div className="overflow-hidden rounded-[2.3rem] bg-background">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <span className="text-xs font-semibold">9:41</span>
            <div className="flex gap-1.5">
              <div className="h-2.5 w-4 rounded-sm bg-foreground/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-foreground/30" />
              <div className="relative h-2.5 w-6 rounded-sm border border-foreground/30">
                <div className="absolute inset-0.5 right-1 rounded-sm bg-foreground/40" />
              </div>
            </div>
          </div>

          {/* App content */}
          <div className="px-5 pb-6 pt-2">
            <p className="text-xs text-muted">Good evening,</p>
            <h3 className="text-lg font-bold">Ali</h3>

            {/* Weekly recap card */}
            <div className="mt-4 rounded-2xl bg-surface p-4 border border-border/30">
              <p className="text-[10px] uppercase tracking-wider text-muted font-medium">
                This Week
              </p>
              <p className="mt-1.5 text-sm text-muted">
                You ordered <span className="font-bold text-foreground">7</span>{" "}
                times from{" "}
                <span className="font-bold text-foreground">4</span> places
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-xs font-semibold">
                  Top item: Chicken Katsu Curry
                </span>
              </div>
            </div>

            {/* Stats pills */}
            <div className="mt-3 flex gap-2">
              <div className="flex-1 rounded-xl bg-surface p-3 text-center border border-border/30">
                <p className="text-xl font-extrabold text-primary">147</p>
                <p className="text-[10px] text-muted font-medium">ORDERS</p>
              </div>
              <div className="flex-1 rounded-xl bg-surface p-3 text-center border border-border/30">
                <p className="text-xl font-extrabold text-primary">23</p>
                <p className="text-[10px] text-muted font-medium">RESTAURANTS</p>
              </div>
            </div>

            {/* Top restaurants */}
            <div className="mt-3 rounded-2xl bg-surface p-4 border border-border/30">
              <p className="text-xs font-semibold">Top Restaurants</p>
              <div className="mt-2.5 space-y-2.5">
                {["Wagamama", "Nando's", "Five Guys"].map((name, i) => (
                  <div key={name} className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold text-muted w-3">
                      {i + 1}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-border/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${[80, 65, 50][i]}%`,
                          opacity: 1 - i * 0.15,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-medium w-14 text-right">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center justify-around border-t border-border/50 px-2 py-3">
            {[
              { label: "Home", active: true },
              { label: "Stats", active: false },
              { label: "Social", active: false },
              { label: "Account", active: false },
            ].map((tab) => (
              <div key={tab.label} className="flex flex-col items-center gap-1">
                <div
                  className={`h-4 w-4 rounded-md transition-colors ${
                    tab.active ? "bg-primary shadow-sm shadow-primary/30" : "bg-muted/20"
                  }`}
                />
                <span
                  className={`text-[9px] ${
                    tab.active
                      ? "font-semibold text-primary"
                      : "text-muted"
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
