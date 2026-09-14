jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

import {
  AUDIT_HISTORY_LIMIT,
  createModerationService,
  fetchModerationData,
  isModerationCursor,
  isModerationUuid,
  isReportSource,
  isReportStatus,
  isReportStatusFilter,
  ModerationUnbanPartialError,
  type ModerationDependencies,
  type ModerationQueryOptions,
  type ModerationReport,
  REPORT_PAGE_SIZE,
  unbanModerationUser,
} from "@/lib/admin/moderation";
import { createClient } from "@supabase/supabase-js";

const mockCreateClient = createClient as jest.Mock;

const report = {
  source: "post_reports",
  id: "11111111-1111-4111-8111-111111111111",
  target_type: "post",
  target_id: "22222222-2222-4222-8222-222222222222",
  reporter_id: null,
  reason: "spam",
  category: "safety",
  note: "Please review",
  status: "queued",
  emailed: true,
  created_at: "2026-09-13T12:00:00.000Z",
  handled_by: null,
  handled_at: null,
  report_number: 12,
};

const ban = {
  user_id: "44444444-4444-4444-8444-444444444444",
  username: "blocked-user",
  shadow_banned_at: null,
  hard_banned_at: "2026-09-12T12:00:00.000Z",
  reason: "Repeated abuse",
  actor_id: "55555555-5555-4555-8555-555555555555",
  updated_at: "2026-09-12T12:00:00.000Z",
  identity_count: 2,
};

const audit = {
  id: "66666666-6666-4666-8666-666666666666",
  actor_id: "55555555-5555-4555-8555-555555555555",
  action: "unban",
  target_type: "user",
  target_id: "44444444-4444-4444-8444-444444444444",
  reason: null,
  created_at: "2026-09-13T12:00:00.000Z",
};

const reportWithUnknownEmailDelivery: ModerationReport = {
  ...report,
  source: "post_reports",
  status: "queued",
  emailed: null,
};

/**
 * Awaits a promise expected to reject and returns the rejection value,
 * without swallowing an unexpected FULFILLMENT: `.catch()` alone would
 * silently return `undefined` if the promise resolved instead of rejected,
 * which would make a `.restored` assertion pass on `undefined.restored`
 * throwing a TypeError rather than reporting "expected a rejection".
 */
async function catchError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (err) {
    return err;
  }
  throw new Error("Expected the promise to reject, but it resolved.");
}

function createDependencies(overrides: Partial<ModerationDependencies> = {}) {
  const rpc = jest.fn((name: string) => {
    if (name === "is_platform_admin") return Promise.resolve({ data: true, error: null });
    if (name === "admin_list_reports") return Promise.resolve({ data: [report], error: null });
    if (name === "admin_list_bans") return Promise.resolve({ data: [ban], error: null });
    if (name === "admin_audit_log") return Promise.resolve({ data: [audit], error: null });
    return Promise.resolve({ data: null, error: null });
  });
  const updateUserById = jest.fn(() => Promise.resolve({ error: null }));
  const createVerifiedRpcClient = jest.fn(() => ({ rpc }));

  return {
    dependencies: {
      createVerifiedRpcClient,
      createServiceRoleClient: jest.fn(() => ({ auth: { admin: { updateUserById } } })),
      ...overrides,
    } as ModerationDependencies,
    rpc,
    createVerifiedRpcClient,
    updateUserById,
  };
}

describe("moderation service", () => {
  // Most of this suite's error-path tests now legitimately trigger
  // logModerationServerError's console.error call. Silence it here (the
  // dedicated "server-side error logging" tests below install their own
  // spy and assert on it directly).
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("maps successful report, ban, and audit RPC rows through the service-role client with the verified bearer", async () => {
    const { dependencies, rpc, createVerifiedRpcClient } = createDependencies();
    const service = createModerationService(dependencies);

    const data = await service.fetchModerationData("verified-admin-token");

    expect(data).toEqual({
      reports: { available: true, rows: [report] },
      bans: { available: true, rows: [ban] },
      audit: { available: true, rows: [audit] },
    });
    expect(createVerifiedRpcClient).toHaveBeenCalledWith("verified-admin-token");
    if (!data.reports.available) throw new Error("Expected reports to be available");
    expect(data.reports.rows[0].reporter_id).toBeNull();
    expect(rpc.mock.calls.map(([name]) => name)).toEqual([
      "admin_list_reports",
      "admin_list_bans",
      "admin_audit_log",
    ]);
    expect(rpc).toHaveBeenCalledWith("admin_list_reports", {
      p_status: "queued",
      p_limit: REPORT_PAGE_SIZE,
      p_before: null,
    });
  });

  it("passes a valid report cursor to the queued report RPC", async () => {
    const { dependencies, rpc } = createDependencies();
    const service = createModerationService(dependencies);

    await service.fetchModerationData("verified-admin-token", {
      before: "2026-09-13T12:00:00.000Z",
    });

    expect(rpc).toHaveBeenCalledWith("admin_list_reports", {
      p_status: "queued",
      p_limit: REPORT_PAGE_SIZE,
      p_before: "2026-09-13T12:00:00.000Z",
    });
  });

  it("does not send an invalid report cursor to the RPC", async () => {
    const { dependencies, rpc } = createDependencies();
    const service = createModerationService(dependencies);

    await service.fetchModerationData("verified-admin-token", { before: "not-a-date" });

    expect(rpc).toHaveBeenCalledWith("admin_list_reports", {
      p_status: "queued",
      p_limit: REPORT_PAGE_SIZE,
      p_before: null,
    });
  });

  it("keeps a report email delivery state when the RPC returns unknown", async () => {
    const { dependencies } = createDependencies({
      createVerifiedRpcClient: jest.fn(() => ({
        rpc: jest.fn((name: string) => Promise.resolve({
          data: name === "admin_list_reports" ? [reportWithUnknownEmailDelivery] : [],
          error: null,
        })),
      })),
    });
    const service = createModerationService(dependencies);

    const data = await service.fetchModerationData("verified-admin-token");

    expect(data.reports).toEqual({ available: true, rows: [reportWithUnknownEmailDelivery] });
  });

  it("maps successful null RPC data to available empty rows", async () => {
    const { dependencies } = createDependencies({
      createVerifiedRpcClient: jest.fn(() => ({
        rpc: jest.fn((name: string) =>
          Promise.resolve({ data: name === "admin_list_reports" ? null : [], error: null }),
        ),
      })),
    });
    const service = createModerationService(dependencies);

    const data = await service.fetchModerationData("verified-admin-token");

    expect(data.reports).toEqual({ available: true, rows: [] });
  });

  it.each([
    ["admin_list_reports", "reports"],
    ["admin_list_bans", "bans"],
    ["admin_audit_log", "audit"],
  ] as const)("keeps %s unavailable without hiding the other moderation data", async (failedRpc, key) => {
    const { dependencies } = createDependencies({
      createVerifiedRpcClient: jest.fn(() => ({
        rpc: jest.fn((name: string) =>
          Promise.resolve({ data: name === failedRpc ? null : [], error: name === failedRpc ? { message: "denied" } : null }),
        ),
      })),
    });
    const service = createModerationService(dependencies);

    const data = await service.fetchModerationData("verified-admin-token");

    expect(data[key]).toEqual({ available: false });
    expect(Object.entries(data).filter(([name]) => name !== key).map(([, value]) => value)).toEqual([
      { available: true, rows: [] },
      { available: true, rows: [] },
    ]);
  });

  it("marks a rejected moderation read as unavailable", async () => {
    const { dependencies } = createDependencies({
      createVerifiedRpcClient: jest.fn(() => ({
        rpc: jest.fn((name: string) =>
          name === "admin_list_bans"
            ? Promise.reject(new Error("network failure"))
            : Promise.resolve({ data: [], error: null }),
        ),
      })),
    });
    const service = createModerationService(dependencies);

    const data = await service.fetchModerationData("verified-admin-token");

    expect(data.bans).toEqual({ available: false });
    expect(data.reports).toEqual({ available: true, rows: [] });
    expect(data.audit).toEqual({ available: true, rows: [] });
  });

  it("rejects an invalid report mutation before creating a client", async () => {
    const { dependencies } = createDependencies();
    const service = createModerationService(dependencies);

    await expect(service.setModerationReportStatus("verified-admin-token", {
      source: "other" as "post_reports",
      reportId: "not-a-uuid",
      status: "pending" as "queued",
    })).rejects.toThrow("Invalid moderation report status input");
    expect(dependencies.createVerifiedRpcClient).not.toHaveBeenCalled();
  });

  it("rejects a report mutation when the database RPC returns an error", async () => {
    const rpc = jest.fn(() => Promise.resolve({ data: null, error: { message: "denied" } }));
    const { dependencies } = createDependencies({
      createVerifiedRpcClient: jest.fn(() => ({ rpc })),
    });
    const service = createModerationService(dependencies);

    await expect(service.setModerationReportStatus("verified-admin-token", {
      source: "group_content_reports",
      reportId: report.id,
      status: "dismissed",
    })).rejects.toThrow("Unable to update moderation report status");

    expect(rpc).toHaveBeenCalledWith("admin_set_report_status", {
      p_source: "group_content_reports",
      p_report_id: report.id,
      p_status: "dismissed",
    });
  });

  it("sends a valid report mutation through the service-role client with the verified bearer", async () => {
    const { dependencies, rpc, createVerifiedRpcClient } = createDependencies();
    const service = createModerationService(dependencies);

    await service.setModerationReportStatus("verified-admin-token", {
      source: "post_reports",
      reportId: report.id,
      status: "actioned",
    });

    expect(rpc).toHaveBeenCalledWith("admin_set_report_status", {
      p_source: "post_reports",
      p_report_id: report.id,
      p_status: "actioned",
    });
    expect(createVerifiedRpcClient).toHaveBeenCalledWith("verified-admin-token");
  });

  it("preflights platform-admin access before GoTrue and records the caller-scoped database action", async () => {
    const events: string[] = [];
    const updateUserById = jest.fn(() => {
      events.push("gotrue");
      return Promise.resolve({ error: null });
    });
    const createVerifiedRpcClient = jest.fn(() => ({
      rpc: jest.fn((name: string) => {
        events.push(name === "is_platform_admin" ? "preflight" : "rpc");
        return Promise.resolve({ data: name === "is_platform_admin" ? true : null, error: null });
        }),
      }));
    const createServiceRoleClient = jest.fn(() => ({
      auth: { admin: { updateUserById } },
    }));
    const { dependencies } = createDependencies({
      createVerifiedRpcClient,
      createServiceRoleClient,
    });
    const service = createModerationService(dependencies);

    await service.unbanModerationUser("verified-admin-token", ban.user_id);

    expect(events).toEqual(["preflight", "gotrue", "rpc"]);
    expect(createVerifiedRpcClient).toHaveBeenCalledWith("verified-admin-token");
    expect(createServiceRoleClient).toHaveBeenCalledWith();
    expect(updateUserById).toHaveBeenCalledWith(ban.user_id, { ban_duration: "none" });
  });

  it("does not call admin_unban when GoTrue rejects the unban", async () => {
    const rpc = jest.fn((name: string) => Promise.resolve({
      data: name === "is_platform_admin" ? true : null,
      error: null,
    }));
    const { dependencies } = createDependencies({
      createVerifiedRpcClient: jest.fn(() => ({ rpc })),
      createServiceRoleClient: jest.fn(() => ({
        auth: { admin: { updateUserById: jest.fn(() => Promise.resolve({ error: { message: "denied" } })) } },
      })),
    });
    const service = createModerationService(dependencies);

    await expect(service.unbanModerationUser("verified-admin-token", ban.user_id)).rejects.toThrow(
      "Unable to unban moderation user",
    );

    expect(rpc).not.toHaveBeenCalledWith("admin_unban", { p_user_id: ban.user_id });
  });

  it("rejects an invalid service unban user id before creating clients", async () => {
    const { dependencies } = createDependencies();
    const service = createModerationService(dependencies);

    await expect(service.unbanModerationUser("verified-admin-token", "not-a-uuid")).rejects.toThrow(
      "Invalid moderation user id",
    );

    expect(dependencies.createServiceRoleClient).not.toHaveBeenCalled();
    expect(dependencies.createVerifiedRpcClient).not.toHaveBeenCalled();
  });

  it("re-bans with the hard-ban duration and throws a distinct partial-unban error carrying restored=true when the re-ban succeeds", async () => {
    const rpc = jest.fn((name: string) => Promise.resolve({
      data: name === "is_platform_admin" ? true : null,
      error: name === "is_platform_admin" ? null : { message: "denied", code: "42501" },
    }));
    const updateUserById = jest.fn(() => Promise.resolve({ error: null }));
    const { dependencies } = createDependencies({
      createVerifiedRpcClient: jest.fn(() => ({ rpc })),
      createServiceRoleClient: jest.fn(() => ({ auth: { admin: { updateUserById } } })),
    });
    const service = createModerationService(dependencies);

    const error = await catchError(service.unbanModerationUser("verified-admin-token", ban.user_id));
    expect(error).toBeInstanceOf(ModerationUnbanPartialError);
    expect((error as InstanceType<typeof ModerationUnbanPartialError>).restored).toBe(true);

    expect(rpc).toHaveBeenCalledWith("admin_unban", { p_user_id: ban.user_id });
    // First call clears the ban, second is the compensating re-ban - both
    // target the same user, with the SAME duration admin-moderate's own
    // hard-ban uses (never the plain unban duration a second time).
    expect(updateUserById).toHaveBeenNthCalledWith(1, ban.user_id, { ban_duration: "none" });
    expect(updateUserById).toHaveBeenNthCalledWith(2, ban.user_id, { ban_duration: "876000h" });
  });

  it("still throws the partial-unban error (never masking it) with restored=false when the compensating re-ban itself returns an error", async () => {
    const rpc = jest.fn((name: string) => Promise.resolve({
      data: name === "is_platform_admin" ? true : null,
      error: name === "is_platform_admin" ? null : { message: "denied" },
    }));
    const updateUserById = jest
      .fn()
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: "re-ban denied" } });
    const { dependencies } = createDependencies({
      createVerifiedRpcClient: jest.fn(() => ({ rpc })),
      createServiceRoleClient: jest.fn(() => ({ auth: { admin: { updateUserById } } })),
    });
    const service = createModerationService(dependencies);

    const error = await catchError(service.unbanModerationUser("verified-admin-token", ban.user_id));
    expect(error).toBeInstanceOf(ModerationUnbanPartialError);
    expect((error as InstanceType<typeof ModerationUnbanPartialError>).restored).toBe(false);

    expect(updateUserById).toHaveBeenCalledTimes(2);
    expect(updateUserById).toHaveBeenNthCalledWith(2, ban.user_id, { ban_duration: "876000h" });
  });

  it("still throws the partial-unban error (never masking it) with restored=false when the compensating re-ban itself rejects", async () => {
    const rpc = jest.fn((name: string) => Promise.resolve({
      data: name === "is_platform_admin" ? true : null,
      error: name === "is_platform_admin" ? null : { message: "denied" },
    }));
    const updateUserById = jest
      .fn()
      .mockResolvedValueOnce({ error: null })
      .mockRejectedValueOnce(new Error("network failure"));
    const { dependencies } = createDependencies({
      createVerifiedRpcClient: jest.fn(() => ({ rpc })),
      createServiceRoleClient: jest.fn(() => ({ auth: { admin: { updateUserById } } })),
    });
    const service = createModerationService(dependencies);

    const error = await catchError(service.unbanModerationUser("verified-admin-token", ban.user_id));
    expect(error).toBeInstanceOf(ModerationUnbanPartialError);
    expect((error as InstanceType<typeof ModerationUnbanPartialError>).restored).toBe(false);

    expect(updateUserById).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["false", false, null],
    ["truthy string", "true", null],
    ["truthy number", 1, null],
    ["null", null, null],
    ["RPC error", true, { message: "denied" }],
  ] as const)("requires exact true platform-admin preflight for %s before creating GoTrue", async (_label, data, error) => {
    const rpc = jest.fn(() => Promise.resolve({ data, error }));
    const updateUserById = jest.fn(() => Promise.resolve({ error: null }));
    const createServiceRoleClient = jest.fn(() => ({ auth: { admin: { updateUserById } } }));
    const { dependencies } = createDependencies({
      createVerifiedRpcClient: jest.fn(() => ({ rpc })),
      createServiceRoleClient,
    });
    const service = createModerationService(dependencies);

    await expect(service.unbanModerationUser("verified-admin-token", ban.user_id)).rejects.toThrow(
      "Unable to verify moderation admin access",
    );

    expect(rpc).toHaveBeenCalledWith("is_platform_admin");
    expect(rpc).not.toHaveBeenCalledWith("admin_unban", { p_user_id: ban.user_id });
    expect(updateUserById).not.toHaveBeenCalled();
    expect(createServiceRoleClient).not.toHaveBeenCalled();
  });

  it("denies a rejected platform-admin preflight before creating GoTrue", async () => {
    const rpc = jest.fn(() => Promise.reject(new Error("network failure")));
    const createServiceRoleClient = jest.fn(() => ({
      auth: { admin: { updateUserById: jest.fn() } },
    }));
    const { dependencies } = createDependencies({
      createVerifiedRpcClient: jest.fn(() => ({ rpc })),
      createServiceRoleClient,
    });
    const service = createModerationService(dependencies);

    await expect(service.unbanModerationUser("verified-admin-token", ban.user_id)).rejects.toThrow(
      "Unable to verify moderation admin access",
    );

    expect(rpc).toHaveBeenCalledWith("is_platform_admin");
    expect(rpc).not.toHaveBeenCalledWith("admin_unban", { p_user_id: ban.user_id });
    expect(createServiceRoleClient).not.toHaveBeenCalled();
  });

  it("exports the shared moderation input type guards", () => {
    expect(isModerationUuid(ban.user_id)).toBe(true);
    expect(isModerationUuid("not-a-uuid")).toBe(false);
    expect(isReportSource("post_reports")).toBe(true);
    expect(isReportSource("other")).toBe(false);
    expect(isReportStatus("actioned")).toBe(true);
    expect(isReportStatus("pending")).toBe(false);
    expect(isReportStatusFilter("all")).toBe(true);
    expect(isReportStatusFilter("actioned")).toBe(true);
    expect(isReportStatusFilter("pending")).toBe(false);
  });

  it.each([
    ["a bare digit string", "1"],
    ["a bare year", "2026"],
    ["a natural-language date", "Dec 25"],
  ])("rejects %s as a moderation cursor even though Date.parse accepts it", (_label, value) => {
    expect(Number.isNaN(Date.parse(value))).toBe(false); // sanity: Date.parse alone would accept it
    expect(isModerationCursor(value)).toBe(false);
  });

  it("accepts exactly the ISO-8601 instant shape toISOString() produces", () => {
    expect(isModerationCursor(new Date("2026-09-13T12:00:00.000Z").toISOString())).toBe(true);
    expect(isModerationCursor("2026-09-13T12:00:00.000Z")).toBe(true);
  });

  it.each([
    "2026-09-13", // date only, no time
    "2026-09-13T12:00:00Z", // missing milliseconds
    "2026-09-13T12:00:00.000+01:00", // offset instead of Z
    "not-a-date",
    "",
  ])("rejects %s as a moderation cursor", (value) => {
    expect(isModerationCursor(value)).toBe(false);
  });

  it("passes the audit history limit constant as p_limit on the audit RPC", async () => {
    const { dependencies, rpc } = createDependencies();
    const service = createModerationService(dependencies);

    await service.fetchModerationData("verified-admin-token");

    expect(rpc).toHaveBeenCalledWith("admin_audit_log", { p_limit: AUDIT_HISTORY_LIMIT });
    expect(AUDIT_HISTORY_LIMIT).toBe(100);
  });

  it.each([
    [undefined, "queued"],
    ["queued" as const, "queued"],
    ["actioned" as const, "actioned"],
    ["dismissed" as const, "dismissed"],
    ["all" as const, null],
  ])("maps the %s report status filter to p_status %s on the RPC", async (status, expectedPStatus) => {
    const { dependencies, rpc } = createDependencies();
    const service = createModerationService(dependencies);

    await service.fetchModerationData("verified-admin-token", status === undefined ? {} : { status });

    expect(rpc).toHaveBeenCalledWith("admin_list_reports", expect.objectContaining({ p_status: expectedPStatus }));
  });

  it("defaults an untrusted, invalid status value to 'queued' at the service boundary rather than passing it through to the RPC", async () => {
    // ModerationQueryOptions types `status` as ReportStatusFilter, but that
    // is only enforced at the current call site (the page already validates
    // via isReportStatusFilter). A future caller with no such guarantee
    // could hand this an arbitrary string; the service must re-guard rather
    // than trust the type and forward it straight into admin_list_reports.
    const { dependencies, rpc } = createDependencies();
    const service = createModerationService(dependencies);

    await service.fetchModerationData("verified-admin-token", {
      status: "bogus" as unknown as ModerationQueryOptions["status"],
    });

    expect(rpc).toHaveBeenCalledWith("admin_list_reports", expect.objectContaining({ p_status: "queued" }));
  });

  describe("server-side error logging (never the raw message, never a token)", () => {
    // Reuses the outer describe's consoleErrorSpy (already installed above).

    it("logs the RPC name and Postgres error code, and never the error message, when a moderation read fails", async () => {
      const secretMessage = "denied for user ali.bars@city.ac.uk";
      const { dependencies } = createDependencies({
        createVerifiedRpcClient: jest.fn(() => ({
          rpc: jest.fn((name: string) =>
            Promise.resolve({
              data: null,
              error: name === "admin_list_bans" ? { message: secretMessage, code: "42501", status: 403 } : null,
            }),
          ),
        })),
      });
      const service = createModerationService(dependencies);

      await service.fetchModerationData("verified-admin-token");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ operation: "admin_list_bans", code: "42501", status: 403 }),
      );
      const loggedText = JSON.stringify(consoleErrorSpy.mock.calls);
      expect(loggedText).not.toContain(secretMessage);
      expect(loggedText).not.toContain("verified-admin-token");
    });

    it("logs a thrown moderation read failure without the error message", async () => {
      const secretMessage = "network failure leaking internal host details";
      const { dependencies } = createDependencies({
        createVerifiedRpcClient: jest.fn(() => ({
          rpc: jest.fn((name: string) =>
            name === "admin_audit_log" ? Promise.reject(new Error(secretMessage)) : Promise.resolve({ data: [], error: null }),
          ),
        })),
      });
      const service = createModerationService(dependencies);

      await service.fetchModerationData("verified-admin-token");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ operation: "admin_audit_log" }),
      );
      const loggedText = JSON.stringify(consoleErrorSpy.mock.calls);
      expect(loggedText).not.toContain(secretMessage);
    });

    it("logs the admin_set_report_status RPC failure with its code but not its message", async () => {
      const secretMessage = "row violates policy for reporter jane@example.com";
      const rpc = jest.fn(() => Promise.resolve({ data: null, error: { message: secretMessage, code: "23514" } }));
      const { dependencies } = createDependencies({
        createVerifiedRpcClient: jest.fn(() => ({ rpc })),
      });
      const service = createModerationService(dependencies);

      await expect(
        service.setModerationReportStatus("verified-admin-token", {
          source: "post_reports",
          reportId: report.id,
          status: "dismissed",
        }),
      ).rejects.toThrow("Unable to update moderation report status");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ operation: "admin_set_report_status", code: "23514" }),
      );
      const loggedText = JSON.stringify(consoleErrorSpy.mock.calls);
      expect(loggedText).not.toContain(secretMessage);
    });
  });
});

describe("production moderation client wiring", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("uses the anon key (never the service-role key) and the verified bearer for moderation RPCs", async () => {
    const rpc = jest.fn(() => Promise.resolve({ data: [], error: null }));
    mockCreateClient.mockReturnValue({ rpc });

    await fetchModerationData("verified-admin-token");

    expect(mockCreateClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({
        global: { headers: { Authorization: "Bearer verified-admin-token" } },
      }),
    );
    expect(mockCreateClient).not.toHaveBeenCalledWith(
      expect.anything(),
      "service-role-key",
      expect.anything(),
    );
  });

  it.each(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"])(
    "rejects exported moderation reads when %s is missing",
    async (missingEnvironmentVariable) => {
      delete process.env[missingEnvironmentVariable];

      await expect(fetchModerationData("verified-admin-token")).rejects.toThrow(
        "Supabase admin RPC client is not configured",
      );
      expect(mockCreateClient).not.toHaveBeenCalled();
    },
  );

  it("rejects an exported unban before any RPC call when the anon key is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    await expect(unbanModerationUser("verified-admin-token", ban.user_id)).rejects.toThrow(
      "Supabase admin RPC client is not configured",
    );
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("rejects an exported unban before GoTrue when the service-role key is missing, after a successful preflight", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const rpc = jest.fn(() => Promise.resolve({ data: true, error: null }));
    mockCreateClient.mockReturnValueOnce({ rpc });

    await expect(unbanModerationUser("verified-admin-token", ban.user_id)).rejects.toThrow(
      "Supabase service role is not configured",
    );
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockCreateClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({
        global: { headers: { Authorization: "Bearer verified-admin-token" } },
      }),
    );
  });

  it("keeps GoTrue on the anon-free service-role client while the RPCs carry the anon key and verified bearer", async () => {
    const updateUserById = jest.fn(() => Promise.resolve({ error: null }));
    const rpc = jest.fn((name: string) => Promise.resolve({
      data: name === "is_platform_admin" ? true : null,
      error: null,
    }));
    mockCreateClient
      .mockReturnValueOnce({ rpc })
      .mockReturnValueOnce({ auth: { admin: { updateUserById } } });

    await unbanModerationUser("verified-admin-token", ban.user_id);

    expect(mockCreateClient).toHaveBeenNthCalledWith(
      1,
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({
        global: { headers: { Authorization: "Bearer verified-admin-token" } },
      }),
    );
    expect(mockCreateClient).toHaveBeenNthCalledWith(
      2,
      "https://example.supabase.co",
      "service-role-key",
      expect.not.objectContaining({ global: expect.anything() }),
    );
    expect(rpc).toHaveBeenNthCalledWith(1, "is_platform_admin");
    expect(rpc).toHaveBeenNthCalledWith(2, "admin_unban", { p_user_id: ban.user_id });
  });
});
