jest.mock("@/lib/admin/auth", () => ({
  requireAdmin: jest.fn(),
}));

jest.mock("@/lib/admin/supabase-admin", () => ({
  fetchSupabaseAdminMetrics: jest.fn(),
}));

jest.mock("@/lib/admin/revenuecat", () => ({
  fetchRcMetrics: jest.fn(),
}));

jest.mock("@/lib/admin/asc", () => ({
  fetchAscMetrics: jest.fn(),
}));

jest.mock("@/lib/admin/sentry", () => ({
  fetchSentryMetrics: jest.fn(),
}));

jest.mock("@/lib/admin/referrals", () => ({
  fetchReferralStats: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

import { requireAdmin } from "@/lib/admin/auth";
import { fetchSupabaseAdminMetrics } from "@/lib/admin/supabase-admin";
import { fetchRcMetrics } from "@/lib/admin/revenuecat";
import { fetchAscMetrics } from "@/lib/admin/asc";
import { fetchSentryMetrics } from "@/lib/admin/sentry";
import { fetchReferralStats } from "@/lib/admin/referrals";
import AdminPage from "@/app/admin/page";

const mockRequireAdmin = requireAdmin as jest.Mock;
const mockFetchSupabaseAdminMetrics = fetchSupabaseAdminMetrics as jest.Mock;
const mockFetchRcMetrics = fetchRcMetrics as jest.Mock;
const mockFetchAscMetrics = fetchAscMetrics as jest.Mock;
const mockFetchSentryMetrics = fetchSentryMetrics as jest.Mock;
const mockFetchReferralStats = fetchReferralStats as jest.Mock;

describe("AdminPage Supabase failure handling", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockRequireAdmin.mockResolvedValue("admin-user");
    mockFetchSupabaseAdminMetrics.mockRejectedValue(new Error("user@example.com leaked"));
    mockFetchRcMetrics.mockResolvedValue(null);
    mockFetchAscMetrics.mockResolvedValue(null);
    mockFetchSentryMetrics.mockResolvedValue(null);
    mockFetchReferralStats.mockResolvedValue(null);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("logs a redacted error and keeps rendering the page when Supabase metrics fail", async () => {
    await expect(AdminPage()).resolves.toBeTruthy();

    expect(errorSpy).toHaveBeenCalledWith(
      "Supabase admin metrics failed:",
      { code: "Error" },
    );
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("user@example.com");
  });
});

