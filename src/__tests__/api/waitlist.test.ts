/**
 * POST /api/waitlist is CLOSED (free waitlist ended 2026-10-02): it must
 * return 410 and never touch Supabase, Turnstile or email.
 */

const mockFrom = jest.fn();
const mockCreateClient = jest.fn((..._args: unknown[]) => ({ from: mockFrom }));
jest.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: ResponseInit) => ({
      body,
      status: init?.status ?? 200,
    })),
  },
}));

import { POST } from "../../app/api/waitlist/route";

describe("POST /api/waitlist (closed)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as unknown as typeof fetch;
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    process.env.TURNSTILE_SECRET_KEY = "secret";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.TURNSTILE_SECRET_KEY;
  });

  it("returns 410 waitlist_closed", async () => {
    const res = (await POST()) as unknown as { body: unknown; status: number };
    expect(res.status).toBe(410);
    expect(res.body).toEqual({ error: "waitlist_closed" });
  });

  it("never creates a Supabase client, writes a row or calls Turnstile", async () => {
    await POST();
    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
