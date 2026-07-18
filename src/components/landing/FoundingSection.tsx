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
  remaining: number;
  closed: boolean;
}

const PERKS = [
  "Founding member badge in the app",
  "Locked-in premium perks, kept as long as you stay",
  "Early access before public launch",
];

export function FoundingSection() {
  const [founding, setFounding] = useState<FoundingData>({ count: 0, remaining: 100, closed: false });
  const [loaded, setLoaded] = useState(false);

  const stripeLink =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_STRIPE_FOUNDING_MEMBER_LINK) || "";

  useEffect(() => {
    fetch("/api/waitlist/founding")
      .then((r) => r.json())
      .then((d: FoundingData) => {
        setFounding(d);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const clampedCount = Math.min(founding.count, 100);
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
                <span className="fcount">{loaded ? `${clampedCount} / 100` : "... / 100"}</span>
              </div>
              <div className="fbar">
                <div className="ffill" style={{ width: loaded ? `${progressPct}%` : "0%" }} />
              </div>
              {loaded && !founding.closed && (
                <div className="fremain">
                  {founding.remaining} spot{founding.remaining !== 1 ? "s" : ""} remaining
                </div>
              )}
              {founding.closed ? (
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
