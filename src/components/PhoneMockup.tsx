export function PhoneMockup() {
  return (
    <div className="relative">
      <div className="glow absolute inset-0 rounded-[3rem]" />
      <div className="relative w-[280px] rounded-[3rem] border-2 border-border bg-surface p-3 md:w-[300px]">
        <div className="overflow-hidden rounded-[2.3rem] bg-background">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-2">
            <span className="text-xs font-medium">9:41</span>
            <div className="flex gap-1">
              <div className="h-2.5 w-4 rounded-sm bg-foreground/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-foreground/40" />
              <div className="h-2.5 w-5 rounded-sm bg-foreground/40" />
            </div>
          </div>

          {/* App content */}
          <div className="px-5 pb-6 pt-2">
            <p className="text-xs text-muted">Good evening,</p>
            <h3 className="text-lg font-bold">Ali</h3>

            <div className="mt-4 rounded-2xl bg-surface p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted">
                This Week
              </p>
              <p className="mt-1 text-sm text-muted">
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

            <div className="mt-3 flex gap-2">
              <div className="flex-1 rounded-xl bg-surface p-3 text-center">
                <p className="text-xl font-extrabold text-primary">147</p>
                <p className="text-[10px] text-muted">ORDERS</p>
              </div>
              <div className="flex-1 rounded-xl bg-surface p-3 text-center">
                <p className="text-xl font-extrabold text-primary">23</p>
                <p className="text-[10px] text-muted">RESTAURANTS</p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-surface p-4">
              <p className="text-xs font-semibold">Top Restaurants</p>
              <div className="mt-2 space-y-2">
                {["Wagamama", "Nando's", "Five Guys"].map((name, i) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted w-3">
                      {i + 1}
                    </span>
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${[80, 65, 50][i]}%`,
                        opacity: 1 - i * 0.2,
                      }}
                    />
                    <span className="text-[10px]">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center justify-around border-t border-border px-2 py-3">
            {[
              { label: "Home", active: true },
              { label: "Stats", active: false },
              { label: "Social", active: false },
              { label: "Account", active: false },
            ].map((tab) => (
              <div key={tab.label} className="flex flex-col items-center gap-0.5">
                <div
                  className={`h-4 w-4 rounded-md ${
                    tab.active ? "bg-primary" : "bg-muted/30"
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
