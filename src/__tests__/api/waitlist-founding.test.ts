/**
 * GET /api/waitlist/founding tests.
 *
 * The route is a public display surface (FoundingSection.tsx on the landing
 * page), never a grant/deny decision, so it always responds 200 and degrades
 * rather than refusing outright: on any failure it omits the fields it could
 * not genuinely read (never a guessed number) instead of erroring. Exercises
 * the real getFoundingCap() (src/lib/founding-cap.ts, unmocked) against a
 * mocked Supabase client so the three response shapes are proven against the
 * actual fail-closed cap contract, not a stubbed helper.
 */

// --- Supabase mock ---
const mockEq = jest.fn();
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockRpc = jest.fn();
const mockFrom = jest.fn(() => ({ select: mockSelect }));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: mockFrom, rpc: mockRpc })),
}));

import { createClient } from "@supabase/supabase-js";
const mockCreateClient = createClient as jest.Mock;

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

// --- Route under test ---
import { GET } from "../../app/api/waitlist/founding/route";

describe("GET /api/waitlist/founding", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });
    mockCreateClient.mockReturnValue({ from: mockFrom, rpc: mockRpc });
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  });

  afterEach(() => {
    errorSpy.mockRestore();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns the live count/remaining/closed math when both count and cap are readable", async () => {
    mockEq.mockResolvedValue({ count: 40 });
    mockRpc.mockResolvedValue({ data: 100, error: null });

    await GET();

    expect(mockJson).toHaveBeenCalledWith({
      count: 40,
      remaining: 60,
      closed: false,
      capAvailable: true,
    });
  });

  it("marks closed true and remaining 0 once the live count has reached the live cap", async () => {
    mockEq.mockResolvedValue({ count: 100 });
    mockRpc.mockResolvedValue({ data: 100, error: null });

    await GET();

    expect(mockJson).toHaveBeenCalledWith({
      count: 100,
      remaining: 0,
      closed: true,
      capAvailable: true,
    });
  });

  it("returns 200 with capAvailable:false and neither `remaining` nor `closed` (but the real count) when the cap RPC fails", async () => {
    mockEq.mockResolvedValue({ count: 42 });
    mockRpc.mockResolvedValue({ data: null, error: { message: "permission denied" } });

    await GET();

    expect(mockJson).toHaveBeenCalledWith({ count: 42, capAvailable: false });
    const [body, init] = mockJson.mock.calls[0];
    expect(body).not.toHaveProperty("remaining");
    expect(body).not.toHaveProperty("closed");
    expect(init?.status ?? 200).toBe(200);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("returns 200 with capAvailable:false and no `count`, `remaining`, or `closed` when the waitlist count read itself fails", async () => {
    mockEq.mockRejectedValue(new Error("connection reset"));

    await GET();

    expect(mockJson).toHaveBeenCalledWith({ capAvailable: false });
    const [body, init] = mockJson.mock.calls[0];
    expect(body).not.toHaveProperty("count");
    expect(body).not.toHaveProperty("remaining");
    expect(body).not.toHaveProperty("closed");
    expect(init?.status ?? 200).toBe(200);
  });

  it("returns 200 with capAvailable:false and no `count`, `remaining`, or `closed` when Supabase env vars are missing", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    await GET();

    expect(mockJson).toHaveBeenCalledWith({ capAvailable: false });
    expect(mockFrom).not.toHaveBeenCalled();
    const [body, init] = mockJson.mock.calls[0];
    expect(body).not.toHaveProperty("closed");
    expect(init?.status ?? 200).toBe(200);
  });

  it("never fabricates `closed` (present and === true only on the success path, absent on every degraded path)", async () => {
    // Degraded: cap RPC fails but count is readable - closed must be absent,
    // not a guessed false, since `closed` gates the CTA.
    mockEq.mockResolvedValue({ count: 999 });
    mockRpc.mockResolvedValue({ data: null, error: { message: "permission denied" } });

    await GET();

    const [degradedBody] = mockJson.mock.calls[0];
    expect(degradedBody).not.toHaveProperty("closed");

    jest.clearAllMocks();
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockEq.mockResolvedValue({ count: 999 });
    mockRpc.mockResolvedValue({ data: 100, error: null });

    await GET();

    const [successBody] = mockJson.mock.calls[0];
    expect(successBody).toHaveProperty("closed", true);
  });

  it("never returns a 503 or any non-200 status, on any failure path", async () => {
    delete process.env.SUPABASE_URL;
    await GET();
    expect(mockJson.mock.calls[0][1]?.status ?? 200).toBe(200);

    jest.clearAllMocks();
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    mockEq.mockResolvedValue({ count: 5 });
    mockRpc.mockRejectedValue(new Error("network down"));
    await GET();
    expect(mockJson.mock.calls[0][1]?.status ?? 200).toBe(200);
  });

  it("logs the reason on every failure path", async () => {
    delete process.env.SUPABASE_URL;
    await GET();
    expect(errorSpy).toHaveBeenCalled();
  });
});
