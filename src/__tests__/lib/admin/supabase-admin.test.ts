const mockFrom = jest.fn();

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

import { createClient } from "@supabase/supabase-js";
import { fetchSupabaseAdminMetrics } from "@/lib/admin/supabase-admin";

const mockCreateClient = createClient as jest.Mock;

let selectCalls: Array<{ table: string; args: unknown[] }> = [];

function queryResult(result: {
  count: number | null;
  error: { code?: string; message?: string } | null;
  status?: number;
}) {
  const query = Promise.resolve(result);
  return Object.assign(query, {
    eq: jest.fn(() => Promise.resolve(result)),
    gte: jest.fn(() => Promise.resolve(result)),
  });
}

describe("fetchSupabaseAdminMetrics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    selectCalls = [];
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    mockCreateClient.mockReturnValue({ from: mockFrom });
    mockFrom.mockImplementation((table: string) => ({
      select: jest.fn((...args: unknown[]) => {
        selectCalls.push({ table, args });
        return queryResult({ count: 7, error: null, status: 200 });
      }),
    }));
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns all count metrics when every count read succeeds", async () => {
    await expect(fetchSupabaseAdminMetrics()).resolves.toEqual({
      waitlistCount: 7,
      profilesCount: 7,
      onboardedCount: 7,
      premiumCount: 7,
      reviewsCount: 7,
      reviewsLast7d: 7,
      newProfilesLast7d: 7,
      newWaitlistLast7d: 7,
    });
    expect(mockCreateClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-key",
      { auth: { persistSession: false } },
    );
  });

  it("marks one failed count unavailable while keeping the other seven metrics real", async () => {
    mockFrom.mockImplementationOnce((table: string) => ({
      select: jest.fn((...args: unknown[]) => {
        selectCalls.push({ table, args });
        return queryResult({ count: null, error: { code: "42501", message: "permission denied" }, status: 500 });
      }),
    }));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(fetchSupabaseAdminMetrics()).resolves.toEqual({
      waitlistCount: null,
      profilesCount: 7,
      onboardedCount: 7,
      premiumCount: 7,
      reviewsCount: 7,
      reviewsLast7d: 7,
      newProfilesLast7d: 7,
      newWaitlistLast7d: 7,
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Supabase count read unavailable:",
      expect.objectContaining({ metric: "waitlistCount", status: 500, code: "42501" }),
    );
    errorSpy.mockRestore();
  });

  it("marks a successful response without a count unavailable", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: jest.fn(() => queryResult({ count: null, error: null })),
    }));

    await expect(fetchSupabaseAdminMetrics()).resolves.toEqual(
      expect.objectContaining({ waitlistCount: null, profilesCount: 7 }),
    );
  });

  it("marks a rejected count read unavailable without rejecting other metrics", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockFrom.mockImplementationOnce(() => ({
      select: jest.fn(() => Promise.reject(new Error("network response included an email"))),
    }));

    await expect(fetchSupabaseAdminMetrics()).resolves.toEqual(
      expect.objectContaining({ waitlistCount: null, profilesCount: 7 }),
    );
    expect(errorSpy).toHaveBeenCalledWith(
      "Supabase count read unavailable:",
      expect.objectContaining({ metric: "waitlistCount", status: 0, code: "FETCH_ERROR" }),
    );
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("network response");
    errorSpy.mockRestore();
  });

  it("reads onboarded profiles with the live onboarding_complete column", async () => {
    await fetchSupabaseAdminMetrics();

    expect(selectCalls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: "profiles", args: ["id", { count: "exact", head: true }] }),
      ]),
    );
    const onboardedFilter = (mockFrom.mock.results[2].value.select as jest.Mock).mock.results[0].value.eq;
    expect(onboardedFilter).toHaveBeenCalledWith("onboarding_complete", true);
  });

  it("throws when Supabase environment variables are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    await expect(fetchSupabaseAdminMetrics()).rejects.toThrow(
      "Supabase service role not configured",
    );
  });
});
