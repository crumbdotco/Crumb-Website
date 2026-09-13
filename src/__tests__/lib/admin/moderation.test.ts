import {
  createModerationService,
  type ModerationDependencies,
  type ModerationReport,
} from "@/lib/admin/moderation";

const report = {
  source: "post_reports",
  id: "11111111-1111-4111-8111-111111111111",
  target_type: "post",
  target_id: "22222222-2222-4222-8222-222222222222",
  reporter_id: "33333333-3333-4333-8333-333333333333",
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

function createDependencies(overrides: Partial<ModerationDependencies> = {}) {
  const rpc = jest.fn((name: string) => {
    if (name === "admin_list_reports") return Promise.resolve({ data: [report], error: null });
    if (name === "admin_list_bans") return Promise.resolve({ data: [ban], error: null });
    if (name === "admin_audit_log") return Promise.resolve({ data: [audit], error: null });
    return Promise.resolve({ data: null, error: null });
  });
  const updateUserById = jest.fn(() => Promise.resolve({ error: null }));
  const fetch = jest.fn(() => Promise.resolve({ ok: true }));

  return {
    dependencies: {
      createBearerClient: jest.fn(() => ({ rpc })),
      createServiceRoleClient: jest.fn(() => ({ auth: { admin: { updateUserById } } })),
      fetch,
      getEnvironment: jest.fn(() => ({
        resendApiKey: "resend-key",
        reportsEmailFrom: "Crumbify <alerts@crumbify.co.uk>",
        reportsEmailTo: "configured-recipient",
      })),
      now: jest.fn(() => new Date("2026-09-13T12:00:00.000Z")),
      ...overrides,
    } as ModerationDependencies,
    rpc,
    updateUserById,
    fetch,
  };
}

describe("moderation service", () => {
  it("maps successful report, ban, and audit RPC rows through the verified bearer", async () => {
    const { dependencies, rpc } = createDependencies();
    const service = createModerationService(dependencies);

    await expect(service.fetchModerationData("verified-admin-token")).resolves.toEqual({
      reports: { available: true, rows: [report] },
      bans: { available: true, rows: [ban] },
      audit: { available: true, rows: [audit] },
    });
    expect(dependencies.createBearerClient).toHaveBeenCalledWith("verified-admin-token");
    expect(rpc.mock.calls.map(([name]) => name)).toEqual([
      "admin_list_reports",
      "admin_list_bans",
      "admin_audit_log",
    ]);
  });

  it("keeps a report email delivery state when the RPC returns unknown", async () => {
    const { dependencies } = createDependencies({
      createBearerClient: jest.fn(() => ({
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

  it.each([
    ["admin_list_reports", "reports"],
    ["admin_list_bans", "bans"],
    ["admin_audit_log", "audit"],
  ] as const)("keeps %s unavailable without hiding the other moderation data", async (failedRpc, key) => {
    const { dependencies } = createDependencies({
      createBearerClient: jest.fn(() => ({
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

  it("rejects an invalid report mutation before creating a client", async () => {
    const { dependencies } = createDependencies();
    const service = createModerationService(dependencies);

    await expect(service.setModerationReportStatus("verified-admin-token", {
      source: "other" as "post_reports",
      reportId: "not-a-uuid",
      status: "pending" as "queued",
    })).rejects.toThrow("Invalid moderation report status input");
    expect(dependencies.createBearerClient).not.toHaveBeenCalled();
  });

  it("sends a valid report mutation through the verified bearer", async () => {
    const { dependencies, rpc } = createDependencies();
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
  });

  it("unbans in GoTrue before recording the caller-scoped database action", async () => {
    const events: string[] = [];
    const updateUserById = jest.fn(() => {
      events.push("gotrue");
      return Promise.resolve({ error: null });
    });
    const { dependencies } = createDependencies({
      createBearerClient: jest.fn(() => ({
        rpc: jest.fn(() => {
          events.push("rpc");
          return Promise.resolve({ data: null, error: null });
        }),
      })),
      createServiceRoleClient: jest.fn(() => ({
        auth: { admin: { updateUserById } },
      })),
    });
    const service = createModerationService(dependencies);

    await service.unbanModerationUser("verified-admin-token", ban.user_id);

    expect(events).toEqual(["gotrue", "rpc"]);
    expect(updateUserById).toHaveBeenCalledWith(ban.user_id, { ban_duration: "none" });
  });

  it("does not call admin_unban when GoTrue rejects the unban", async () => {
    const rpc = jest.fn(() => Promise.resolve({ data: null, error: null }));
    const { dependencies } = createDependencies({
      createBearerClient: jest.fn(() => ({ rpc })),
      createServiceRoleClient: jest.fn(() => ({
        auth: { admin: { updateUserById: jest.fn(() => Promise.resolve({ error: { message: "denied" } })) } },
      })),
    });
    const service = createModerationService(dependencies);

    await expect(service.unbanModerationUser("verified-admin-token", ban.user_id)).rejects.toThrow(
      "Unable to unban moderation user",
    );

    expect(rpc).not.toHaveBeenCalled();
  });

  it("sends a high-priority alert only to the configured moderation mailbox", async () => {
    const { dependencies, fetch } = createDependencies();
    const service = createModerationService(dependencies);

    await service.sendUnauthorizedModerationAlert("user-1", "person@example.com");

    expect(fetch).toHaveBeenCalledWith("https://api.resend.com/emails", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ "X-Priority": "1" }),
      body: JSON.stringify({
        from: "Crumbify <alerts@crumbify.co.uk>",
        to: ["configured-recipient"],
        subject: "Unauthorized moderation access attempt",
        text: "Unauthorized moderation access attempt. User ID: user-1. Email: person@example.com. Path: /admin/moderation. Timestamp: 2026-09-13T12:00:00.000Z.",
      }),
    }));
  });

  it("swallows alert delivery failures", async () => {
    const { dependencies } = createDependencies({
      fetch: jest.fn(() => Promise.reject(new Error("network failure"))),
    });
    const service = createModerationService(dependencies);

    await expect(service.sendUnauthorizedModerationAlert("user-1", null)).resolves.toBeUndefined();
  });
});
