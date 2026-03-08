"use client";

import { motion } from "framer-motion";

const platforms = [
  {
    name: "Uber Eats",
    colour: "#06C167",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
      </svg>
    ),
    status: "live",
  },
  {
    name: "Just Eat",
    colour: "#FF8000",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M18 3H6C4.34 3 3 4.34 3 6v12c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3zm-3 14H9v-2h6v2zm3-4H6V7h12v6z" />
      </svg>
    ),
    status: "live",
  },
  {
    name: "Deliveroo",
    colour: "#00CCBC",
    icon: null,
    status: "coming",
  },
];

export function Platforms() {
  return (
    <section className="relative py-28 md:py-36">
      <div className="section-divider mx-auto max-w-md" />

      <div className="mx-auto max-w-6xl px-6 pt-28 md:pt-36">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            Platforms
          </motion.span>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Connect your favourite platforms
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-muted md:text-lg">
            We support the biggest food delivery platforms in the UK, with more
            coming soon.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {platforms.map((platform, i) => (
            <motion.div
              key={platform.name}
              className={`group relative flex h-40 w-72 flex-col items-center justify-center gap-4 rounded-2xl border transition-all duration-300 card-hover ${
                platform.status === "coming"
                  ? "border-dashed border-border bg-surface/30"
                  : "border-border/60 bg-surface/50 backdrop-blur-sm hover:border-border"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              {/* Glow effect on hover */}
              {platform.status === "live" && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100 blur-xl"
                  style={{ background: platform.colour + "10" }}
                />
              )}

              <div className="relative">
                {platform.status === "live" ? (
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: platform.colour,
                      boxShadow: `0 8px 24px ${platform.colour}30`,
                    }}
                  >
                    {platform.icon}
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/10">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4l3 3" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="text-center">
                <span className={`text-lg font-bold ${platform.status === "coming" ? "text-muted" : ""}`}>
                  {platform.name}
                </span>
                {platform.status === "coming" && (
                  <p className="text-xs text-muted mt-1">Coming soon</p>
                )}
              </div>

              {platform.status === "live" && (
                <div className="absolute top-3 right-3">
                  <span className="flex h-2 w-2">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                      style={{ backgroundColor: platform.colour }}
                    />
                    <span
                      className="relative inline-flex h-2 w-2 rounded-full"
                      style={{ backgroundColor: platform.colour }}
                    />
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
