/**
 * Unit tests for the single-source founding cap helper (src/lib/founding-cap.ts).
 * Both the Stripe webhook and the public founding-availability route read the
 * cap through getFoundingCap(); this file pins its fallback semantics
 * directly (RPC value used when valid, DEFAULT_FOUNDING_CAP=100 on any
 * error/null/non-numeric/out-of-range result, never 0).
 */

import { DEFAULT_FOUNDING_CAP, getFoundingCap } from "@/lib/founding-cap";

function fakeSupabase(rpcResult: { data?: unknown; error?: { message: string } | null }) {
  return {
    rpc: jest.fn().mockResolvedValue(rpcResult),
  };
}

describe("getFoundingCap", () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("DEFAULT_FOUNDING_CAP is 100", () => {
    expect(DEFAULT_FOUNDING_CAP).toBe(100);
  });

  it("returns the RPC's numeric value when valid", async () => {
    const supabase = fakeSupabase({ data: 250, error: null });
    const cap = await getFoundingCap(supabase);

    expect(cap).toBe(250);
    expect(supabase.rpc).toHaveBeenCalledWith("get_founding_cap");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("falls back to DEFAULT_FOUNDING_CAP and warns on an RPC error", async () => {
    const supabase = fakeSupabase({ data: null, error: { message: "permission denied" } });
    const cap = await getFoundingCap(supabase);

    expect(cap).toBe(100);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("falling back to DEFAULT_FOUNDING_CAP"),
      "permission denied"
    );
  });

  it("falls back to DEFAULT_FOUNDING_CAP on a null result", async () => {
    const supabase = fakeSupabase({ data: null, error: null });
    const cap = await getFoundingCap(supabase);

    expect(cap).toBe(100);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("falls back to DEFAULT_FOUNDING_CAP on zero (never a cap of 0)", async () => {
    const supabase = fakeSupabase({ data: 0, error: null });
    const cap = await getFoundingCap(supabase);

    expect(cap).toBe(100);
  });

  it("falls back to DEFAULT_FOUNDING_CAP on a negative value", async () => {
    const supabase = fakeSupabase({ data: -5, error: null });
    const cap = await getFoundingCap(supabase);

    expect(cap).toBe(100);
  });

  it("falls back to DEFAULT_FOUNDING_CAP on NaN", async () => {
    const supabase = fakeSupabase({ data: Number.NaN, error: null });
    const cap = await getFoundingCap(supabase);

    expect(cap).toBe(100);
  });

  it("falls back to DEFAULT_FOUNDING_CAP on a non-numeric (string) value, without coercion", async () => {
    const supabase = fakeSupabase({ data: "100", error: null });
    const cap = await getFoundingCap(supabase);

    expect(cap).toBe(100);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("falls back to DEFAULT_FOUNDING_CAP when the RPC call throws", async () => {
    const supabase = { rpc: jest.fn().mockRejectedValue(new Error("network down")) };
    const cap = await getFoundingCap(supabase);

    expect(cap).toBe(100);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("RPC threw"),
      "network down"
    );
  });
});
