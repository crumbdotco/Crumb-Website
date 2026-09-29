/**
 * Waitlist route log redaction (Crumb-Website#18): the insert is keyed by
 * email, so a Supabase error there is the exact shape that echoes the
 * address. Asserts the logged DATA is redacted.
 */

jest.mock("../../lib/rate-limit", () => ({ isRateLimited: jest.fn(() => false) }));

let fromQueue: Array<Record<string, unknown>> = [];
const mockFrom = jest.fn(() => fromQueue.shift() ?? {});
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: ResponseInit) => ({ body, status: init?.status ?? 200 })),
  },
}));

import { POST } from "../../app/api/waitlist/route";

const EMAIL = "person@gmail.com";

function makeRequest(json: () => Promise<unknown>): Request {
  const headers = new Map<string, string>([
    ["origin", "https://crumbify.co.uk"],
    ["user-agent", "Mozilla/5.0 (iPhone) Safari/604.1"],
    ["accept", "application/json"],
    ["accept-language", "en-GB,en;q=0.9"],
    ["x-real-ip", "203.0.113.5"],
  ]);
  return { headers: { get: (k: string) => headers.get(k.toLowerCase()) ?? null }, json } as unknown as Request;
}

const rateLimitBuilder = { select: () => ({ eq: () => ({ gte: () => Promise.resolve({ count: 0 }) }) }) };
const existenceBuilder = { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }) };

describe("waitlist route log redaction", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  });

  afterEach(() => {
    errorSpy.mockRestore();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("redacts an email echoed by the insert error", async () => {
    fromQueue = [
      rateLimitBuilder,
      existenceBuilder,
      { insert: () => Promise.resolve({ error: { message: `insert failed for ${EMAIL}` } }) },
    ];
    await POST(makeRequest(async () => ({ email: EMAIL })));
    expect(errorSpy).toHaveBeenCalledWith("Waitlist insert error:", "insert failed for [redacted-email]");
  });

  it("redacts an email inside a thrown route error", async () => {
    await POST(
      makeRequest(async () => {
        throw new Error(`parse failed near ${EMAIL}`);
      }),
    );
    expect(errorSpy).toHaveBeenCalledWith("Waitlist route error:", "Error: parse failed near [redacted-email]");
  });
});
