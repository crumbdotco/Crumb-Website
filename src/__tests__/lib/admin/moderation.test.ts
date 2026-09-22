jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

import {
  AUDIT_HISTORY_LIMIT,
  buildModerationHref,
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

const report: ModerationReport = {
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
  const rpc = jest.fn((name: string, params?: Record<string, unknown>) => {
    void params; // signature kept for a two-arg mock.calls shape used by later assertions
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
    const before = "2026-09-13T12:00:00.123456+00:00";
    const beforeId = "77777777-7777-4777-8777-777777777777";
    const { dependencies, rpc } = createDependencies();
    const service = createModerationService(dependencies);

    await service.fetchModerationData("verified-admin-token", {
      before,
      beforeId,
    });

    expect(rpc).toHaveBeenCalledWith("admin_list_reports", {
      p_status: "queued",
      p_limit: REPORT_PAGE_SIZE,
      p_before: before,
      p_before_id: beforeId,
    });
  });

  it.each([
    ["valid before, missing beforeId", { before: "2026-09-13T12:00:00.000Z" }],
    ["valid before, null beforeId", { before: "2026-09-13T12:00:00.000Z", beforeId: null }],
    ["valid before, invalid beforeId", { before: "2026-09-13T12:00:00.000Z", beforeId: "not-a-uuid" }],
    ["invalid before, valid beforeId", { before: "not-a-date", beforeId: "77777777-7777-4777-8777-777777777777" }],
    ["missing before, valid beforeId", { beforeId: "77777777-7777-4777-8777-777777777777" }],
  ] as const)(
    "discards an unpaired cursor together (%s) and pages from the start",
    async (_label, options) => {
      const { dependencies, rpc } = createDependencies();
      const service = createModerationService(dependencies);

      await service.fetchModerationData("verified-admin-token", options);

      const [, params] = rpc.mock.calls.find(([name]) => name === "admin_list_reports")!;
      expect(params).toStrictEqual({
        p_status: "queued",
        p_limit: REPORT_PAGE_SIZE,
        p_before: null,
      });
    },
  );

  it("sends exactly p_status, p_limit, and p_before null on page 1, with no p_before_id key", async () => {
    const { dependencies, rpc } = createDependencies();
    const service = createModerationService(dependencies);

    await service.fetchModerationData("verified-admin-token");

    // toStrictEqual (not toHaveBeenCalledWith/toEqual) so an accidental
    // `p_before_id: undefined` key does not slip through: toHaveBeenCalledWith
    // treats an undefined-valued key as absent, toStrictEqual does not.
    expect(rpc.mock.calls[0][1]).toStrictEqual({
      p_status: "queued",
      p_limit: REPORT_PAGE_SIZE,
      p_before: null,
    });
  });

  it.each([
    ["zero", 0],
    ["negative", -5],
    ["non-integer", 2.5],
    ["over 200", 201],
  ] as const)(
    "falls back to REPORT_PAGE_SIZE for an invalid injected report page size (%s)",
    async (_label, invalidSize) => {
      const { dependencies, rpc } = createDependencies();
      const service = createModerationService(dependencies, { reportPageSize: invalidSize });

      await service.fetchModerationData("verified-admin-token");

      expect(rpc).toHaveBeenCalledWith(
        "admin_list_reports",
        expect.objectContaining({ p_limit: REPORT_PAGE_SIZE }),
      );
    },
  );

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
    expect(isModerationCursor("2026-09-13T12:00:00.123456+00:00")).toBe(true);
  });

  // PostgREST trims trailing zeros from a timestamptz fraction and omits it
  // entirely for a zero fraction, so these are real production shapes, not
  // hypothetical ones. Before this round none of them matched the cursor
  // regex, so the "Older reports" link silently never rendered whenever the
  // last row of a page happened to land on one of these shapes.
  it.each([
    ["no fraction, Z", "2026-09-13T12:00:00Z"],
    ["no fraction, numeric offset", "2026-09-13T12:00:00+00:00"],
    ["one fraction digit", "2026-09-13T12:00:00.5+00:00"],
    ["two fraction digits", "2026-09-13T12:00:00.12+00:00"],
    ["three fraction digits", "2026-09-13T12:00:00.123+00:00"],
    ["five fraction digits", "2026-09-13T12:00:00.23583+00:00"],
    ["six fraction digits", "2026-09-13T12:00:00.123456+00:00"],
    ["negative numeric offset", "2026-09-13T12:00:00.5-05:00"],
  ])("accepts the real PostgREST timestamp shape: %s (%s)", (_label, value) => {
    expect(isModerationCursor(value)).toBe(true);
  });

  it("omits an unpaired before cursor from the moderation href", () => {
    expect(buildModerationHref({ status: "queued", before: "2026-09-13T12:00:00.000Z" })).toBe(
      "/admin/moderation",
    );
  });

  it("omits an unpaired beforeId from the moderation href", () => {
    expect(buildModerationHref({ status: "queued", beforeId: report.id })).toBe("/admin/moderation");
  });

  it("keeps only the status for a non-default status with a half cursor", () => {
    expect(buildModerationHref({ status: "actioned", before: "2026-09-13T12:00:00.000Z" })).toBe(
      "/admin/moderation?status=actioned",
    );
    expect(buildModerationHref({ status: "actioned", beforeId: report.id })).toBe(
      "/admin/moderation?status=actioned",
    );
  });

  it("preserves a database timestamp through the encoded older link and RPC cursor", async () => {
    const row: ModerationReport = { ...report, created_at: "2026-09-13T12:00:00.123456+00:00" };
    const href = buildModerationHref({ status: "queued", before: row.created_at, beforeId: row.id });
    const query = new URLSearchParams(href.slice(href.indexOf("?") + 1));
    const parsedBefore = query.get("before");
    const parsedBeforeId = query.get("beforeId");
    const { dependencies, rpc } = createDependencies();
    const service = createModerationService(dependencies);

    expect(href).toContain("%2B00%3A00");
    expect(parsedBefore).toBe(row.created_at);
    expect(parsedBeforeId).toBe(row.id);

    await service.fetchModerationData("verified-admin-token", {
      before: parsedBefore,
      beforeId: parsedBeforeId,
    });

    expect(rpc).toHaveBeenCalledWith("admin_list_reports", {
      p_status: "queued",
      p_limit: REPORT_PAGE_SIZE,
      p_before: row.created_at,
      p_before_id: row.id,
    });
  });

  // Builds a fixture whose rows deliberately mix real PostgREST timestamp
  // shapes (no fraction, short fraction, full microsecond fraction) across
  // DIFFERENT instants, with one genuine tied pair sharing an identical
  // created_at string. Comparing created_at as plain strings is only sound
  // when every row shares one format; with mixed formats the fake RPC below
  // orders/filters by the parsed instant (Date.parse) and falls back to the
  // id rule only for genuinely equal instants, matching how the real
  // database can never emit two different string spellings for the same
  // instant in one column.
  function buildTieBreakFixture(): ModerationReport[] {
    const tiedCreatedAt = "2026-09-13T12:00:00+00:00"; // no fraction (item 1 shape)
    return [
      { ...report, id: "00000000-0000-4000-8000-000000000005", created_at: "2026-09-13T12:01:00.5+00:00" },
      { ...report, id: "00000000-0000-4000-8000-000000000004", created_at: tiedCreatedAt },
      { ...report, id: "00000000-0000-4000-8000-000000000003", created_at: tiedCreatedAt },
      { ...report, id: "00000000-0000-4000-8000-000000000002", created_at: "2026-09-13T11:59:00.123456+00:00" },
      { ...report, id: "00000000-0000-4000-8000-000000000001", created_at: "2026-09-13T11:58:00.12+00:00" },
    ];
  }

  function orderByInstantThenId(fixture: ModerationReport[]): ModerationReport[] {
    return [...fixture].sort((left, right) => {
      const byInstant = Date.parse(right.created_at) - Date.parse(left.created_at);
      return byInstant || right.id.localeCompare(left.id);
    });
  }

  function createTieBreakRpc(ordered: ModerationReport[]) {
    return jest.fn((name: string, params?: Record<string, unknown>) => {
      if (name !== "admin_list_reports") return Promise.resolve({ data: [], error: null });
      const before = typeof params?.p_before === "string" ? params.p_before : null;
      const beforeId = typeof params?.p_before_id === "string" ? params.p_before_id : null;
      const beforeInstant = before === null ? null : Date.parse(before);
      const rows = ordered
        .filter((row) => {
          if (before === null || beforeInstant === null) return true;
          const rowInstant = Date.parse(row.created_at);
          if (rowInstant !== beforeInstant) return rowInstant < beforeInstant;
          return beforeId !== null && row.id < beforeId;
        })
        .slice(0, Number(params?.p_limit));
      return Promise.resolve({ data: rows, error: null });
    });
  }

  it("walks every tied report exactly once with the real service and link builder", async () => {
    const fixture = buildTieBreakFixture();
    const pageSize = 2;
    const ordered = orderByInstantThenId(fixture);
    const rpc = createTieBreakRpc(ordered);
    const dependencies = {
      createVerifiedRpcClient: jest.fn(() => ({ rpc })),
      createServiceRoleClient: jest.fn(),
    } as unknown as ModerationDependencies;
    const service = createModerationService(dependencies, { reportPageSize: pageSize });
    const seen: string[] = [];
    let before: string | null = null;
    let beforeId: string | null = null;
    // Bounded: fixture.length+2 pages is always enough to drain this fixture
    // through an honest exit. An earlier version of this test used `for
    // (;;)`, and a cursor that stops surviving validation made the fake
    // return page 1 forever, driving the worker to 3176 MB before it was
    // killed. The loop below can never hang; `exitedByIntendedCondition`
    // below proves it also never SILENTLY ran to the cap instead of
    // terminating for the right reason.
    let exitedByIntendedCondition = false;

    for (let page = 0; page < fixture.length + 2; page += 1) {
      const data = await service.fetchModerationData("verified-admin-token", {
        before,
        beforeId,
      });
      if (!data.reports.available || data.reports.rows.length === 0) {
        exitedByIntendedCondition = true;
        break;
      }
      seen.push(...data.reports.rows.map((row) => row.id));
      if (data.reports.rows.length < pageSize) {
        exitedByIntendedCondition = true;
        break;
      }
      const last = data.reports.rows[data.reports.rows.length - 1];
      const href = buildModerationHref({ status: "queued", before: last.created_at, beforeId: last.id });
      const query = new URLSearchParams(href.slice(href.indexOf("?") + 1));
      before = query.get("before");
      beforeId = query.get("beforeId");
    }

    expect(exitedByIntendedCondition).toBe(true);
    expect(seen).toEqual(ordered.map((row) => row.id));
    expect(new Set(seen).size).toBe(fixture.length);
  });

  it("red control: withholding the cursor id from the service returns page 1 again, never a skip-prone page", async () => {
    // Drives the REAL service and the REAL link builder (no hand-rolled
    // paging model). Pair-or-nothing (item 5) means the service can no
    // longer be made to page by timestamp alone, so the honest control for
    // "an old client sends only `before`" is that the service refuses to
    // advance: it keeps returning page 1, never a skip-prone page.
    const fixture = buildTieBreakFixture();
    const pageSize = 2;
    const ordered = orderByInstantThenId(fixture);
    const rpc = createTieBreakRpc(ordered);
    const dependencies = {
      createVerifiedRpcClient: jest.fn(() => ({ rpc })),
      createServiceRoleClient: jest.fn(),
    } as unknown as ModerationDependencies;
    const service = createModerationService(dependencies, { reportPageSize: pageSize });

    const firstPage = await service.fetchModerationData("verified-admin-token", {});
    if (!firstPage.reports.available) throw new Error("Expected reports to be available");
    const firstPageIds = firstPage.reports.rows.map((row) => row.id);
    const lastRow = firstPage.reports.rows[firstPage.reports.rows.length - 1];

    // Bounded: three repeats of "an old client hands back only `before`" is
    // enough to demonstrate it never advances; it is not a search for a
    // hang.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      // Simulates an old client that never adopted beforeId: it calls the
      // service with `before` alone, bypassing buildModerationHref (which
      // would refuse to emit a `before` without its paired `beforeId`).
      const page = await service.fetchModerationData("verified-admin-token", {
        before: lastRow.created_at,
      });
      if (!page.reports.available) throw new Error("Expected reports to be available");
      expect(page.reports.rows.map((row) => row.id)).toEqual(firstPageIds);
    }

    const reportCalls = rpc.mock.calls.filter(([name]) => name === "admin_list_reports");
    const lastCallParams = reportCalls[reportCalls.length - 1][1];
    expect(lastCallParams).toStrictEqual({
      p_status: "queued",
      p_limit: pageSize,
      p_before: null,
    });
  });

  it.each([
    "2026-09-13", // date only, no time
    "2026-09-13 12:00:00.000Z", // space instead of T
    "2026-09-13T12:00:00", // missing offset entirely
    "2026-09-13T12:00:00.0000001Z", // 7 fraction digits, too precise
    "2026-09-13T12:00:00.000+0100", // malformed numeric offset, no colon
    "2026-09-13T12:00:00.000ZZ", // garbage suffix
    "2026-13-45T12:00:00.000Z", // shape matches, impossible date, Date.parse rejects it
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
