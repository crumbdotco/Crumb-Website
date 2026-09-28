/**
 * POST /api/waitlist tests, adapted to the live DB schema (2026-09-28):
 * no signup_country column, no check_ip_rate_limit RPC, no waitlist_audit_log
 * writes. See src/lib/waitlist-guards.ts for the domain allow-list mirrored
 * from the live trg_block_bot_inserts trigger.
 */

// --- rate-limit mock (deterministic; the real in-memory limiter is tested separately) ---
jest.mock("../../lib/rate-limit", () => ({
  isRateLimited: jest.fn(() => false),
}));
import { isRateLimited } from "../../lib/rate-limit";
const mockIsRateLimited = isRateLimited as jest.Mock;

// --- Supabase mock: queue of per-call builders, consumed in call order ---
let fromQueue: Array<Record<string, unknown>> = [];
const mockFrom = jest.fn(() => fromQueue.shift() ?? {});
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

function rateLimitBuilder(count: number | null) {
  return { select: () => ({ eq: () => ({ gte: () => Promise.resolve({ count }) }) }) };
}
function existenceBuilder(data: { email: string } | null) {
  return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data }) }) }) };
}
function insertBuilder(error: { message: string } | null) {
  const insert = jest.fn((...args: [Record<string, unknown>]) => {
    void args;
    return Promise.resolve({ error });
  });
  return { insert };
}

// --- Next.js mock ---
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: ResponseInit) => ({
      body,
      status: init?.status ?? 200,
    })),
  },
}));
import { NextResponse } from "next/server";
const mockJson = NextResponse.json as jest.Mock;
const originalFetch = global.fetch;

import { POST } from "../../app/api/waitlist/route";

function makeRequest(opts: {
  origin?: string;
  ua?: string;
  accept?: string;
  acceptLang?: string;
  body?: Record<string, unknown>;
}): Request {
  const {
    origin = "https://crumbify.co.uk",
    ua = "Mozilla/5.0 (iPhone) Safari/604.1",
    accept = "application/json",
    acceptLang = "en-GB,en;q=0.9",
    body = { email: "person@gmail.com" },
  } = opts;

  const headers = new Map<string, string>();
  if (origin) headers.set("origin", origin);
  if (ua) headers.set("user-agent", ua);
  if (accept) headers.set("accept", accept);
  if (acceptLang) headers.set("accept-language", acceptLang);
  headers.set("x-real-ip", "203.0.113.5");

  return {
    headers: { get: (key: string) => headers.get(key.toLowerCase()) ?? null },
    json: async () => body,
  } as unknown as Request;
}

describe("POST /api/waitlist", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    fromQueue = [];
    mockIsRateLimited.mockReturnValue(false);
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    delete process.env.VERCEL_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
  });

  afterEach(() => {
    errorSpy.mockRestore();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    delete process.env.VERCEL_ENV;
    global.fetch = originalFetch;
  });

  it("rejects an unknown origin with 403", async () => {
    fromQueue = [rateLimitBuilder(0)];
    await POST(makeRequest({ origin: "https://evil.example.com" }));
    expect(mockJson).toHaveBeenCalledWith({ error: "Forbidden" }, { status: 403 });
  });

  it("allows localhost only in development", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    fromQueue = [rateLimitBuilder(0), existenceBuilder(null), insertBuilder(null)];
    await POST(makeRequest({ origin: "http://localhost:3000" }));
    expect(mockJson).toHaveBeenCalledWith({ success: true, alreadyExists: false });
  });

  it("rejects localhost outside development", async () => {
    await POST(makeRequest({ origin: "http://localhost:3000" }));
    expect(mockJson).toHaveBeenCalledWith({ error: "Forbidden" }, { status: 403 });
  });

  it("allows a vercel.app preview origin only when VERCEL_ENV=preview", async () => {
    process.env.VERCEL_ENV = "preview";
    fromQueue = [rateLimitBuilder(0), existenceBuilder(null), insertBuilder(null)];
    await POST(makeRequest({ origin: "https://crumb-website-git-foo.vercel.app" }));
    expect(mockJson).toHaveBeenCalledWith({ success: true, alreadyExists: false });
  });

  it("silently succeeds for a bot user agent", async () => {
    await POST(makeRequest({ ua: "curl/8.0" }));
    expect(mockJson).toHaveBeenCalledWith({ success: true });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("silently succeeds when the honeypot field is filled", async () => {
    await POST(makeRequest({ body: { email: "person@gmail.com", website: "http://spam.example" } }));
    expect(mockJson).toHaveBeenCalledWith({ success: true });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("proceeds when Turnstile is not configured at all", async () => {
    fromQueue = [rateLimitBuilder(0), existenceBuilder(null), insertBuilder(null)];
    await POST(makeRequest({}));
    expect(mockJson).toHaveBeenCalledWith({ success: true, alreadyExists: false });
  });

  it("succeeds when only the Turnstile secret is configured and no token is sent", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    fromQueue = [rateLimitBuilder(0), existenceBuilder(null), insertBuilder(null)];
    await POST(makeRequest({ body: { email: "person@gmail.com" } }));
    expect(mockJson).toHaveBeenCalledWith({ success: true, alreadyExists: false });
  });

  it("returns a visible 400 and writes nothing when both Turnstile keys are set without a token", async () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    process.env.TURNSTILE_SECRET_KEY = "secret";
    await POST(makeRequest({ body: { email: "person@gmail.com" } }));
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Please complete the bot check, then try again." },
      { status: 400 },
    );
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("proceeds when Turnstile is configured and the token verifies", async () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    process.env.TURNSTILE_SECRET_KEY = "secret";
    const fetchMock = jest.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    const insert = insertBuilder(null);
    fromQueue = [rateLimitBuilder(0), existenceBuilder(null), insert];
    await POST(makeRequest({ body: { email: "person@gmail.com", turnstileToken: "tok" } }));
    expect(fetchMock).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ method: "POST" }),
    );
    const verifyBody = (fetchMock.mock.calls[0][1] as RequestInit).body as URLSearchParams;
    expect(verifyBody.get("secret")).toBe("secret");
    expect(verifyBody.get("response")).toBe("tok");
    expect(insert.insert).toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalledWith({ success: true, alreadyExists: false });
  });

  it("returns a visible 400 and writes nothing when Turnstile verification fails", async () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    process.env.TURNSTILE_SECRET_KEY = "secret";
    global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ success: false }) }) as unknown as typeof fetch;
    await POST(makeRequest({ body: { email: "person@gmail.com", turnstileToken: "bad" } }));
    expect(mockJson).toHaveBeenCalledWith(
      { error: "The bot check could not be verified. Please try again." },
      { status: 400 },
    );
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("does not call siteverify for a rejected email domain", async () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    process.env.TURNSTILE_SECRET_KEY = "secret";
    global.fetch = jest.fn() as unknown as typeof fetch;
    await POST(makeRequest({ body: { email: "person@example.com", turnstileToken: "tok" } }));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Please use a personal email like Gmail, iCloud or Outlook. Student emails work too." },
      { status: 400 },
    );
  });

  it("allows the signup through and logs no email when siteverify times out", async () => {
    jest.useFakeTimers();
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    process.env.TURNSTILE_SECRET_KEY = "secret";
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    global.fetch = jest.fn((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
      }),
    ) as unknown as typeof fetch;
    fromQueue = [rateLimitBuilder(0), existenceBuilder(null), insertBuilder(null)];

    const responsePromise = POST(makeRequest({ body: { email: "person@gmail.com", turnstileToken: "tok" } }));
    await jest.advanceTimersByTimeAsync(5_000);
    await responsePromise;

    expect(mockJson).toHaveBeenCalledWith({ success: true, alreadyExists: false });
    expect(warnSpy).toHaveBeenCalledWith("Turnstile verification unavailable; allowing signup to continue");
    expect(warnSpy.mock.calls.flat().join(" ")).not.toContain("person@gmail.com");
    warnSpy.mockRestore();
    jest.useRealTimers();
  }, 15_000);

  it("rejects an invalid email with 400", async () => {
    await POST(makeRequest({ body: { email: "not-an-email" } }));
    expect(mockJson).toHaveBeenCalledWith({ error: "Valid email required" }, { status: 400 });
  });

  it("rejects a disposable-domain email with 400", async () => {
    await POST(makeRequest({ body: { email: "person@mailinator.com" } }));
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Please use a personal email like Gmail, iCloud or Outlook. Student emails work too." },
      { status: 400 },
    );
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("rejects a non-allowed domain with 400 and a clear message (never fake success)", async () => {
    await POST(makeRequest({ body: { email: "person@example.com" } }));
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Please use a personal email like Gmail, iCloud or Outlook. Student emails work too." },
      { status: 400 },
    );
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("inserts a new signup for an allowed domain with no signup_country field", async () => {
    const insert = insertBuilder(null);
    fromQueue = [rateLimitBuilder(0), existenceBuilder(null), insert];
    await POST(makeRequest({ body: { email: "Person@Gmail.com" } }));

    expect(insert.insert).toHaveBeenCalledWith({
      email: "person@gmail.com",
      tier: "free",
      signup_ip: expect.any(String),
      signup_user_agent: expect.any(String),
    });
    const insertArg = insert.insert.mock.calls[0][0];
    expect(insertArg).not.toHaveProperty("signup_country");
    expect(mockJson).toHaveBeenCalledWith({ success: true, alreadyExists: false });
  });

  it("returns alreadyExists:true for a duplicate email without inserting", async () => {
    const insert = insertBuilder(null);
    fromQueue = [rateLimitBuilder(0), existenceBuilder({ email: "person@gmail.com" }), insert];
    await POST(makeRequest({ body: { email: "person@gmail.com" } }));

    expect(insert.insert).not.toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalledWith({ success: true, alreadyExists: true });
  });

  it("returns 429 with a friendly message when the DB rate limit (60/10min) is reached", async () => {
    fromQueue = [rateLimitBuilder(60)];
    await POST(makeRequest({ body: { email: "person@gmail.com" } }));
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Lots of people are joining right now, please try again in a few minutes." },
      { status: 429 },
    );
  });

  it("proceeds when under the DB rate limit", async () => {
    fromQueue = [rateLimitBuilder(59), existenceBuilder(null), insertBuilder(null)];
    await POST(makeRequest({ body: { email: "person@gmail.com" } }));
    expect(mockJson).toHaveBeenCalledWith({ success: true, alreadyExists: false });
  });

  it("returns 429 from the in-memory limiter before touching the database", async () => {
    mockIsRateLimited.mockReturnValue(true);
    await POST(makeRequest({ body: { email: "person@gmail.com" } }));
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("maps a DB trigger 'blocked' insert error to 400, never 500", async () => {
    fromQueue = [rateLimitBuilder(0), existenceBuilder(null), insertBuilder({ message: "blocked: domain not allowed" })];
    await POST(makeRequest({ body: { email: "person@gmail.com" } }));
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Please use a personal email like Gmail, iCloud or Outlook. Student emails work too." },
      { status: 400 },
    );
  });

  it("returns a generic 500 for an unexpected insert error, without leaking details or the email", async () => {
    fromQueue = [rateLimitBuilder(0), existenceBuilder(null), insertBuilder({ message: "connection reset" })];
    await POST(makeRequest({ body: { email: "person@gmail.com" } }));
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Something went wrong, please try again." },
      { status: 500 },
    );
    for (const call of errorSpy.mock.calls) {
      expect(JSON.stringify(call)).not.toContain("person@gmail.com");
    }
  });

  it("never surfaces raw exception details to the client on an unexpected throw", async () => {
    delete process.env.SUPABASE_URL;
    await POST(makeRequest({ body: { email: "person@gmail.com" } }));
    expect(mockJson).toHaveBeenCalledWith(
      { error: "Something went wrong, please try again." },
      { status: 500 },
    );
  });
});
