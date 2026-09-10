/**
 * Static-analysis guard: the founding-member cap must have exactly one
 * source (src/lib/founding-cap.ts, backed by the get_founding_cap() RPC),
 * never a hardcoded `= 100` literal or the old per-file constants
 * (FOUNDING_CAP / MAX_FOUNDING) duplicated across the Stripe webhook and the
 * public founding-availability route (Stage 4.5 B7 / Crumb-Website#17).
 *
 * Also pins that the founder-clawback RPC call sits AFTER the waitlist
 * delete in the webhook's refund branch (it demotes profiles for rows the
 * delete actually removed), never before it.
 *
 * Reads the actual route sources (filesystem only) so it stays correct
 * across reasonable refactors instead of pinning exact whitespace.
 */

import { readFileSync } from "fs";
import path from "path";

const WEBHOOK_PATH = path.resolve(
  __dirname,
  "..",
  "..",
  "app",
  "api",
  "stripe",
  "webhook",
  "route.ts"
);
const FOUNDING_ROUTE_PATH = path.resolve(
  __dirname,
  "..",
  "..",
  "app",
  "api",
  "waitlist",
  "founding",
  "route.ts"
);

const BANNED_IDENTIFIERS = ["FOUNDING_CAP", "MAX_FOUNDING"];

describe("security: the founding-member cap has exactly one source", () => {
  const webhookSource = readFileSync(WEBHOOK_PATH, "utf-8");
  const foundingRouteSource = readFileSync(FOUNDING_ROUTE_PATH, "utf-8");

  it.each([
    ["webhook route", WEBHOOK_PATH, webhookSource],
    ["founding route", FOUNDING_ROUTE_PATH, foundingRouteSource],
  ])("%s never declares a `= 100` cap literal", (_label, _filePath, source) => {
    expect(source).not.toMatch(/=\s*100\s*;/);
  });

  it.each([
    ["webhook route", WEBHOOK_PATH, webhookSource],
    ["founding route", FOUNDING_ROUTE_PATH, foundingRouteSource],
  ])("%s never references the retired FOUNDING_CAP / MAX_FOUNDING identifiers", (_label, _filePath, source) => {
    for (const identifier of BANNED_IDENTIFIERS) {
      expect(source).not.toMatch(new RegExp(`\\b${identifier}\\b`));
    }
  });

  it.each([
    ["webhook route", webhookSource],
    ["founding route", foundingRouteSource],
  ])("%s imports the cap from @/lib/founding-cap", (_label, source) => {
    expect(source).toMatch(/from\s+["']@\/lib\/founding-cap["']/);
  });

  it("the webhook calls demote_refunded_founder inside the refund branch, AFTER the waitlist delete (never before it)", () => {
    const deleteIndex = webhookSource.indexOf(".delete()");
    const rpcIndex = webhookSource.indexOf("rpc('demote_refunded_founder'");

    expect(deleteIndex).toBeGreaterThan(-1);
    expect(rpcIndex).toBeGreaterThan(-1);
    expect(rpcIndex).toBeGreaterThan(deleteIndex);
  });
});
