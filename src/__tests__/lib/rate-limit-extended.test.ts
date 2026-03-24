/**
 * Extended rate-limit tests — targeting uncovered branch at line 24.
 *
 * Line 24: `if (entry.resetAt <= now) store.delete(key);`
 * This is the cleanup loop that deletes expired entries.
 * The existing test triggers cleanup but the coverage doesn't see
 * the actual deletion of an expired entry happening during the cleanup
 * iteration. We need to ensure multiple keys exist, some expired,
 * and that cleanup actually iterates and deletes them.
 */

describe("isRateLimited — cleanup branch coverage (line 24)", () => {
  let isRateLimited: (key: string, limit: number, windowMs: number) => boolean;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    ({ isRateLimited } = require("../../lib/rate-limit"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("cleanup deletes expired entries from the store (line 24 branch)", () => {
    // Create several entries with a short window
    const windowMs = 1_000;
    isRateLimited("key-a", 5, windowMs);
    isRateLimited("key-b", 5, windowMs);
    isRateLimited("key-c", 5, windowMs);

    // Advance past the window so entries expire
    jest.advanceTimersByTime(windowMs + 100);

    // Advance past the cleanup interval (60_000ms) so cleanup runs
    jest.advanceTimersByTime(60_000);

    // Now trigger a new call which runs cleanup()
    // The cleanup should iterate over expired key-a, key-b, key-c and delete them
    const result = isRateLimited("key-d", 5, windowMs);
    expect(result).toBe(false); // new entry, should be allowed

    // Verify the old keys are truly gone by using them again — they should start fresh
    expect(isRateLimited("key-a", 1, windowMs)).toBe(false); // brand new entry
    expect(isRateLimited("key-b", 1, windowMs)).toBe(false);
    expect(isRateLimited("key-c", 1, windowMs)).toBe(false);
  });

  it("cleanup does not delete entries that are still within their window", () => {
    const windowMs = 120_000; // 2 minutes, longer than cleanup interval
    isRateLimited("active-key", 3, windowMs); // count: 1

    // Advance past cleanup interval but NOT past the window
    jest.advanceTimersByTime(61_000);

    // Trigger cleanup by calling isRateLimited again
    isRateLimited("trigger-cleanup", 3, windowMs);

    // The "active-key" entry should still exist with its count
    // Requesting again should increment (not create a new entry)
    isRateLimited("active-key", 3, windowMs); // count: 2
    isRateLimited("active-key", 3, windowMs); // count: 3
    expect(isRateLimited("active-key", 3, windowMs)).toBe(true); // count: 4 > limit 3
  });

  it("cleanup runs when interval threshold is reached even with mixed expired/active entries", () => {
    const shortWindow = 500;
    const longWindow = 200_000;

    // Create expired entries
    isRateLimited("expired-1", 5, shortWindow);
    isRateLimited("expired-2", 5, shortWindow);

    // Create active entry with a long window
    isRateLimited("active-1", 5, longWindow);

    // Advance past the short window and cleanup interval
    jest.advanceTimersByTime(61_000);

    // Trigger cleanup
    isRateLimited("new-key", 5, shortWindow);

    // Expired keys should have been cleaned up — new request creates fresh entry
    expect(isRateLimited("expired-1", 1, shortWindow)).toBe(false); // fresh entry

    // Active key should still be counting
    expect(isRateLimited("active-1", 1, longWindow)).toBe(true); // count: 2 > limit 1
  });
});
