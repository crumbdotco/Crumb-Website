const mockFrom = jest.fn();

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

import { createClient } from "@supabase/supabase-js";
import { fetchSupabaseAdminMetrics } from "@/lib/admin/supabase-admin";

const mockCreateClient = createClient as jest.Mock;

function queryResult(result: { count: number | null; error: { message: string } | null }) {
  const query = Promise.resolve(result);
  return Object.assign(query, {
    eq: jest.fn(() => Promise.resolve(result)),
    gte: jest.fn(() => Promise.resolve(result)),
  });
}

describe("fetchSupabaseAdminMetrics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    mockCreateClient.mockReturnValue({ from: mockFrom });
    mockFrom.mockImplementation(() => ({
      select: jest.fn(() => queryResult({ count: 7, error: null })),
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

  it("throws when a count read returns a Supabase error", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: jest.fn(() => queryResult({ count: null, error: { message: "permission denied" } })),
    }));

    await expect(fetchSupabaseAdminMetrics()).rejects.toThrow(
      "Supabase count read failed: permission denied",
    );
  });

  it("throws when a count read returns no count", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: jest.fn(() => queryResult({ count: null, error: null })),
    }));

    await expect(fetchSupabaseAdminMetrics()).rejects.toThrow("Supabase count read returned no count");
  });

  it("throws when Supabase environment variables are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    await expect(fetchSupabaseAdminMetrics()).rejects.toThrow(
      "Supabase service role not configured",
    );
  });
});
