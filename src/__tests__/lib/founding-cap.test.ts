/**
 * Unit tests for the single-source founding cap helper (src/lib/founding-cap.ts).
 * Both the Stripe webhook and the public founding-availability route read the
 * cap through getFoundingCap(); this file pins its fail-closed semantics
 * directly (RPC value used when valid, FoundingCapUnavailableError thrown on
 * any error/rejection/null/non-numeric/out-of-range result - never a
 * guessed fallback number).
 */

import { FoundingCapUnavailableError, getFoundingCap } from "@/lib/founding-cap";

function fakeSupabase(rpcResult: { data?: unknown; error?: { message: string } | null }) {
  return {
    rpc: jest.fn().mockResolvedValue(rpcResult),
  };
}

describe("getFoundingCap", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("returns the RPC's numeric value when valid", async () => {
    const supabase = fakeSupabase({ data: 250, error: null });
    const cap = await getFoundingCap(supabase);

    expect(cap).toBe(250);
    expect(supabase.rpc).toHaveBeenCalledWith("get_founding_cap");
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("throws FoundingCapUnavailableError and logs on an RPC error", async () => {
    const supabase = fakeSupabase({ data: null, error: { message: "permission denied" } });

    await expect(getFoundingCap(supabase)).rejects.toBeInstanceOf(FoundingCapUnavailableError);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("refusing to guess the cap"),
      "permission denied"
    );
  });

  it("throws FoundingCapUnavailableError on a null result", async () => {
    const supabase = fakeSupabase({ data: null, error: null });
    const cap = getFoundingCap(supabase);

    await expect(cap).rejects.toBeInstanceOf(FoundingCapUnavailableError);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("throws FoundingCapUnavailableError on zero (never treats 0 as a usable cap)", async () => {
    const supabase = fakeSupabase({ data: 0, error: null });

    await expect(getFoundingCap(supabase)).rejects.toBeInstanceOf(FoundingCapUnavailableError);
  });

  it("throws FoundingCapUnavailableError on a negative value", async () => {
    const supabase = fakeSupabase({ data: -5, error: null });

    await expect(getFoundingCap(supabase)).rejects.toBeInstanceOf(FoundingCapUnavailableError);
  });

  it("throws FoundingCapUnavailableError on NaN", async () => {
    const supabase = fakeSupabase({ data: Number.NaN, error: null });

    await expect(getFoundingCap(supabase)).rejects.toBeInstanceOf(FoundingCapUnavailableError);
  });

  it("throws FoundingCapUnavailableError on a non-numeric (string) value, without coercion", async () => {
    const supabase = fakeSupabase({ data: "100", error: null });

    await expect(getFoundingCap(supabase)).rejects.toBeInstanceOf(FoundingCapUnavailableError);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("throws FoundingCapUnavailableError when the RPC call rejects", async () => {
    const supabase = { rpc: jest.fn().mockRejectedValue(new Error("network down")) };

    await expect(getFoundingCap(supabase)).rejects.toBeInstanceOf(FoundingCapUnavailableError);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("RPC threw"),
      "network down"
    );
  });

  it("throws FoundingCapUnavailableError when the RPC call itself throws synchronously (e.g. no rpc method)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = {} as any;

    await expect(getFoundingCap(supabase)).rejects.toBeInstanceOf(FoundingCapUnavailableError);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("RPC threw"),
      expect.any(String)
    );
  });

  it("never returns a number when the RPC did not return a usable value", async () => {
    const supabase = fakeSupabase({ data: null, error: null });
    let threw = false;
    let returnedValue: unknown;

    try {
      returnedValue = await getFoundingCap(supabase);
    } catch (err) {
      threw = true;
      expect(err).toBeInstanceOf(FoundingCapUnavailableError);
    }

    expect(threw).toBe(true);
    expect(returnedValue).toBeUndefined();
  });
});
