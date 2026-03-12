"use client";

export function PhoneMockup({ label = "Home Tab" }: { label?: string }) {
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

        {/* App content placeholder */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="w-12 h-12 rounded-xl bg-crumb-card flex items-center justify-center">
            <span className="text-lg font-bold text-crumb-dark">C</span>
          </div>
          <span className="text-lg font-bold text-crumb-dark">{label}</span>
          <div className="w-full space-y-2">
            <div className="h-3 bg-crumb-line rounded-full w-full" />
            <div className="h-3 bg-crumb-line rounded-full w-4/5" />
            <div className="h-3 bg-crumb-line rounded-full w-3/5" />
          </div>
          <div className="flex gap-2 mt-2">
            <div className="px-3 py-1.5 bg-crumb-card rounded-full">
              <span className="text-xs font-semibold text-crumb-dark">147 orders</span>
            </div>
            <div className="px-3 py-1.5 bg-crumb-card rounded-full">
              <span className="text-xs font-semibold text-crumb-dark">15 spots</span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center justify-around px-4 py-3 border-t border-crumb-line">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-5 h-5 bg-crumb-dark rounded" />
            <span className="text-[8px] font-medium text-crumb-dark">Home</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-5 h-5 bg-crumb-muted/40 rounded" />
            <span className="text-[8px] text-crumb-muted">Stats</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-5 h-5 bg-crumb-muted/40 rounded" />
            <span className="text-[8px] text-crumb-muted">Social</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-5 h-5 bg-crumb-muted/40 rounded" />
            <span className="text-[8px] text-crumb-muted">Account</span>
          </div>
        </div>
      </div>
    </div>
  );
}
