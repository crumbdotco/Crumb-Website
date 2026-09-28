import { __resetRateLimitStoreForTests, isRateLimited } from "../../lib/rate-limit";

describe("isRateLimited", () => {
  beforeEach(() => {
    __resetRateLimitStoreForTests();
  });

  it("allows requests under the limit", () => {
    expect(isRateLimited("ip-a", 3, 60_000)).toBe(false);
    expect(isRateLimited("ip-a", 3, 60_000)).toBe(false);
    expect(isRateLimited("ip-a", 3, 60_000)).toBe(false);
  });

  it("blocks once the count exceeds the limit within the window", () => {
    expect(isRateLimited("ip-b", 2, 60_000)).toBe(false);
    expect(isRateLimited("ip-b", 2, 60_000)).toBe(false);
    expect(isRateLimited("ip-b", 2, 60_000)).toBe(true);
  });

  it("resets after the window elapses", () => {
    jest.useFakeTimers().setSystemTime(0);
    expect(isRateLimited("ip-c", 1, 1000)).toBe(false);
    expect(isRateLimited("ip-c", 1, 1000)).toBe(true);
    jest.setSystemTime(2000);
    expect(isRateLimited("ip-c", 1, 1000)).toBe(false);
    jest.useRealTimers();
  });

  it("tracks separate keys independently", () => {
    expect(isRateLimited("ip-d", 1, 60_000)).toBe(false);
    expect(isRateLimited("ip-e", 1, 60_000)).toBe(false);
  });
});
