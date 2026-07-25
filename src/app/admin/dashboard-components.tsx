import type { ReactNode } from 'react';

/**
 * Small presentational building blocks for the admin overview. Kept
 * separate from page.tsx (the data-fetching server component) so the
 * page stays under the house 400-line guideline.
 */

export function DashboardSection({
  title,
  subtitle,
  connected,
  unavailableReason,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Pass `false` when the whole data source failed or isn't configured. */
  connected: boolean;
  /** Shown when `connected` is false, explains which integration is missing. */
  unavailableReason?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-[#E6C39B]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs opacity-60">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {!connected && <UnavailableBadge />}
          {action}
        </div>
      </div>

      {connected ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {children}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-white/15 p-4 text-sm opacity-60">
          {unavailableReason ?? 'This integration is not connected.'}
        </p>
      )}
    </section>
  );
}

function UnavailableBadge() {
  return (
    <span className="inline-flex min-h-[28px] items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium opacity-70">
      Not connected
    </span>
  );
}

type StatValue = number | null | undefined;

export function StatCard({
  label,
  value,
  delta,
  deltaPeriod = 'last 7 days',
  prefix,
  suffix,
  fixed,
  unavailable,
}: {
  label: string;
  value: StatValue;
  /** Positive = up, negative = down, 0 = flat. Omit when no delta exists. */
  delta?: number | null;
  deltaPeriod?: string;
  prefix?: string;
  suffix?: string;
  fixed?: number;
  /** True when this specific stat has no data because a source failed,
   *  as distinct from a genuine zero. */
  unavailable?: boolean;
}) {
  const hasValue = value != null;
  const display = hasValue
    ? `${prefix ?? ''}${
        fixed != null ? value.toFixed(fixed) : value.toLocaleString('en-GB')
      }${suffix ?? ''}`
    : null;

  const showDelta = hasValue && delta != null;
  const trend = showDelta ? (delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat') : null;

  return (
    <div className="min-h-[44px] rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs font-medium opacity-60">{label}</div>
      {hasValue ? (
        <div className="mt-1.5 text-2xl font-bold tabular-nums text-[#F4ECE1]">{display}</div>
      ) : (
        <div className="mt-1.5 text-sm italic opacity-45">
          {unavailable ? 'Unavailable' : 'No data'}
        </div>
      )}
      {showDelta && (
        <div
          className={`mt-1 text-xs font-medium ${
            trend === 'up'
              ? 'text-emerald-400'
              : trend === 'down'
                ? 'text-red-400'
                : 'opacity-60'
          }`}
        >
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}{' '}
          {delta! > 0 ? '+' : ''}
          {delta!.toLocaleString('en-GB')} ({deltaPeriod})
        </div>
      )}
    </div>
  );
}

export function HeroStat({
  label,
  value,
  prefix,
  suffix,
  fixed,
  unavailable,
}: {
  label: string;
  value: StatValue;
  prefix?: string;
  suffix?: string;
  fixed?: number;
  unavailable?: boolean;
}) {
  const hasValue = value != null;
  const display = hasValue
    ? `${prefix ?? ''}${
        fixed != null ? value.toFixed(fixed) : value.toLocaleString('en-GB')
      }${suffix ?? ''}`
    : null;

  return (
    <div className="min-h-[44px] rounded-2xl border border-[#E6C39B]/25 bg-gradient-to-b from-[#E6C39B]/10 to-transparent p-5">
      <div className="text-xs font-medium uppercase opacity-60">{label}</div>
      {hasValue ? (
        <div className="mt-2 text-3xl font-bold tabular-nums text-[#E6C39B] sm:text-4xl">
          {display}
        </div>
      ) : (
        <div className="mt-2 text-lg italic opacity-45">
          {unavailable ? 'Unavailable' : 'No data'}
        </div>
      )}
    </div>
  );
}

export function ListCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-[#E6C39B]">{title}</h2>
        {action}
      </div>
      <div className="mt-3 divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10">
        {children}
      </div>
    </section>
  );
}

export function ListRow({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-4 p-3">
      <span className="truncate pr-2">{left}</span>
      <span className="shrink-0 font-mono text-sm opacity-80">{right}</span>
    </div>
  );
}
