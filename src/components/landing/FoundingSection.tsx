"use client";

/**
 * FoundingSection — Founding member offer, redesigned in the handoff cream language.
 * Placed between Groups and CTA.
 * Fetches /api/waitlist/founding for live spot count.
 * Stripe link: NEXT_PUBLIC_STRIPE_FOUNDING_MEMBER_LINK (fallback: /founding-member).
 */

import { useEffect, useState } from "react";

interface FoundingData {
  count: number;
  // Absent when the live cap could not be read (route degrades rather than
  // guessing) - only ever rendered when it is genuinely a number.
  remaining?: number;
  // Also absent in that same degraded case: a cap-read blip must never be
  // treated as "closed" (that would wrongly hide the CTA). Only an actual
  // `=== true` closes the offer; absent/undefined falls through to the CTA.
  closed?: boolean;
}

function isFoundingData(value: unknown): value is FoundingData {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Partial<FoundingData>;
  return typeof data.count === "number" && Number.isFinite(data.count);
}

const PERKS = [
  "Founding member badge in the app",
  "Locked-in premium perks, kept as long as you stay",
  "Early access before public launch",
];

export function FoundingSection() {
  const [founding, setFounding] = useState<FoundingData | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const stripeLink =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_STRIPE_FOUNDING_MEMBER_LINK) || "";

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const waitForRetry = (delay: number) =>
      new Promise<void>((resolve) => {
        retryTimer = setTimeout(resolve, delay);
      });

    const loadFoundingData = async () => {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const response = await fetch("/api/waitlist/founding", { signal: controller.signal });
          if (!response.ok) throw new Error("Founding count request failed");

          const data: unknown = await response.json();
          if (!isFoundingData(data)) throw new Error("Founding count response was unavailable");

          if (!active) return;
          setFounding(data);
          return;
        } catch {
          if (!active || controller.signal.aborted) return;
          if (attempt === 2) {
            setUnavailable(true);
            return;
          }
          await waitForRetry(attempt === 0 ? 1000 : 3000);
          if (!active || controller.signal.aborted) return;
        }
      }
    };

    void loadFoundingData();

    return () => {
      active = false;
      controller.abort();
      if (retryTimer !== undefined) clearTimeout(retryTimer);
    };
  }, []);

  const clampedCount = founding ? Math.min(founding.count, 100) : 0;
  const progressPct = (clampedCount / 100) * 100;

  return (
    <section id="founding" className="founding">
      <div className="wrap">
        <div className="feat">
          <div className="feat-copy reveal">
            <span className="eyebrow">Founding member</span>
            <h2>
              Be one of the first <em className="s">100</em>.
            </h2>
            <p>
              The first 100 people to join get founding member status, not a first-come waitlist spot but
              a real limited group with lasting recognition in the app.
            </p>
            <ul className="founding-perks">
              {PERKS.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </div>
          <div className="feat-media reveal">
            <div className="match-card founding-card">
              <div className="frow">
                <span className="flabel">Founding spots claimed</span>
                {founding && <span className="fcount">{`${clampedCount} / 100`}</span>}
              </div>
              {founding && (
                <div className="fbar">
                  <div className="ffill" style={{ width: `${progressPct}%` }} />
                </div>
              )}
              {founding && founding.closed !== true && typeof founding.remaining === "number" && (
                <div className="fremain">
                  {founding.remaining} spot{founding.remaining !== 1 ? "s" : ""} remaining
                </div>
              )}
              {unavailable && <div className="fremain">Live count unavailable right now.</div>}
              {founding?.closed === true ? (
                <div className="fclosed">Founding membership is now closed</div>
              ) : (
                <button
                  className="btn"
                  style={{ width: "100%" }}
                  onClick={() => {
                    const href = stripeLink || "/founding-member";
                    window.open(href, stripeLink ? "_blank" : "_self");
                  }}
                >
                  Become a founding member
                </button>
              )}
              <div className="fnote">Available in the UK. More regions coming soon.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
