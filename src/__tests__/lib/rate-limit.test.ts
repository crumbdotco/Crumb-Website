/**
 * Tests for src/lib/rate-limit.ts
 *
 * The module uses an in-memory Map store.  We need to reset the module
 * between tests that depend on clean state — done by clearing the internal
 * store via jest.resetModules() and re-importing.
 */

describe("isRateLimited", () => {
  // Re-import fresh module for each test to get a clean store
  let isRateLimited: (key: string, limit: number, windowMs: number) => boolean;

  beforeEach(() => {
    jest.resetModules();
    ({ isRateLimited } = require("../../lib/rate-limit"));
  });

  // -------------------------------------------------------------------------
  // Basic allow / block behaviour
  // -------------------------------------------------------------------------

  it("allows the first request (returns false)", () => {
    expect(isRateLimited("ip-1", 3, 60_000)).toBe(false);
  });

  it("allows requests up to the limit", () => {
    const key = "ip-2";
    // Limit = 3: requests 1, 2, 3 should all be allowed
    expect(isRateLimited(key, 3, 60_000)).toBe(false);
    expect(isRateLimited(key, 3, 60_000)).toBe(false);
    expect(isRateLimited(key, 3, 60_000)).toBe(false);
  });

  it("blocks the (limit+1)th request", () => {
    const key = "ip-block";
    isRateLimited(key, 3, 60_000); // 1
    isRateLimited(key, 3, 60_000); // 2
    isRateLimited(key, 3, 60_000); // 3
    expect(isRateLimited(key, 3, 60_000)).toBe(true); // 4 — blocked
  });

  it("blocks all subsequent requests after limit is exceeded", () => {
    const key = "ip-persist";
    for (let i = 0; i < 5; i++) isRateLimited(key, 2, 60_000);
    expect(isRateLimited(key, 2, 60_000)).toBe(true);
  });

  it("treats different keys independently", () => {
    const key1 = "ip-a";
    const key2 = "ip-b";

    // Exhaust key1's limit
    isRateLimited(key1, 1, 60_000);
    expect(isRateLimited(key1, 1, 60_000)).toBe(true); // blocked

    // key2 should still be allowed
    expect(isRateLimited(key2, 1, 60_000)).toBe(false); // allowed
  });

  // -------------------------------------------------------------------------
  // Window expiry
  // -------------------------------------------------------------------------

  it("resets count after the window expires", () => {
    jest.useFakeTimers();

    const key = "ip-reset";
    const windowMs = 5_000;

    // Use up the limit
    isRateLimited(key, 2, windowMs); // 1
    isRateLimited(key, 2, windowMs); // 2
    expect(isRateLimited(key, 2, windowMs)).toBe(true); // 3 → blocked

    // Advance past the window
    jest.advanceTimersByTime(windowMs + 1);

    // Should be allowed again (new window)
    expect(isRateLimited(key, 2, windowMs)).toBe(false);

    jest.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // Limit = 1
  // -------------------------------------------------------------------------

  it("blocks the second request when limit is 1", () => {
    const key = "ip-limit1";
    expect(isRateLimited(key, 1, 60_000)).toBe(false);
    expect(isRateLimited(key, 1, 60_000)).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Cleanup path (triggered by 60-second interval)
  // -------------------------------------------------------------------------

  it("cleans up expired entries and allows new request after cleanup", () => {
    jest.useFakeTimers();

    const key = "ip-cleanup";
    const windowMs = 1_000;

    // Fill up and block
    isRateLimited(key, 1, windowMs);
    expect(isRateLimited(key, 1, windowMs)).toBe(true);

    // Advance past window AND cleanup interval (60_000 ms)
    jest.advanceTimersByTime(61_000);

    // The cleanup should have removed the expired entry.
    // A new request in a fresh window should be allowed.
    expect(isRateLimited(key, 1, windowMs)).toBe(false);

    jest.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  it("handles high-volume requests without throwing", () => {
    const key = "ip-volume";
    expect(() => {
      for (let i = 0; i < 1000; i++) {
        isRateLimited(key, 5, 60_000);
      }
    }).not.toThrow();
  });

  it("handles special-character keys (email addresses, IPv6)", () => {
    const keys = [
      "user@example.com",
      "2001:db8::1",
      "::1",
      "key with spaces",
    ];
    for (const key of keys) {
      expect(() => isRateLimited(key, 3, 60_000)).not.toThrow();
    }
  });
});
