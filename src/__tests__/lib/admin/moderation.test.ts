jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

import {
  createModerationService,
  fetchModerationData,
  sendUnauthorizedModerationAlert,
  type ModerationDependencies,
  type ModerationReport,
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

function createDependencies(overrides: Partial<ModerationDependencies> = {}) {
  const rpc = jest.fn((name: string) => {
    if (name === "admin_list_reports") return Promise.resolve({ data: [report], error: null });
    if (name === "admin_list_bans") return Promise.resolve({ data: [ban], error: null });
    if (name === "admin_audit_log") return Promise.resolve({ data: [audit], error: null });
    return Promise.resolve({ data: null, error: null });
  });
  const updateUserById = jest.fn(() => Promise.resolve({ error: null }));
  const fetch = jest.fn(() => Promise.resolve({ ok: true }));
  const createServiceRoleRpcClient = jest.fn(() => ({ rpc }));

  return {
    dependencies: {
      createServiceRoleRpcClient,
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
    createServiceRoleRpcClient,
    updateUserById,
    fetch,
  };
}

describe("moderation service", () => {
  it("maps successful report, ban, and audit RPC rows through the service-role client with the verified bearer", async () => {
    const { dependencies, rpc, createServiceRoleRpcClient } = createDependencies();
    const service = createModerationService(dependencies);

    const data = await service.fetchModerationData("verified-admin-token");

    expect(data).toEqual({
      reports: { available: true, rows: [report] },
      bans: { available: true, rows: [ban] },
      audit: { available: true, rows: [audit] },
    });
    expect(createServiceRoleRpcClient).toHaveBeenCalledWith("verified-admin-token");
    if (!data.reports.available) throw new Error("Expected reports to be available");
    expect(data.reports.rows[0].reporter_id).toBeNull();
    expect(rpc.mock.calls.map(([name]) => name)).toEqual([
      "admin_list_reports",
      "admin_list_bans",
      "admin_audit_log",
    ]);
  });

  it("keeps a report email delivery state when the RPC returns unknown", async () => {
    const { dependencies } = createDependencies({
      createServiceRoleRpcClient: jest.fn(() => ({
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
      createServiceRoleRpcClient: jest.fn(() => ({
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
      createServiceRoleRpcClient: jest.fn(() => ({
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
      createServiceRoleRpcClient: jest.fn(() => ({
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
    expect(dependencies.createServiceRoleRpcClient).not.toHaveBeenCalled();
  });

  it("rejects a report mutation when the database RPC returns an error", async () => {
    const rpc = jest.fn(() => Promise.resolve({ data: null, error: { message: "denied" } }));
    const { dependencies } = createDependencies({
      createServiceRoleRpcClient: jest.fn(() => ({ rpc })),
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
    const { dependencies, rpc, createServiceRoleRpcClient } = createDependencies();
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
    expect(createServiceRoleRpcClient).toHaveBeenCalledWith("verified-admin-token");
  });

  it("unbans in GoTrue before recording the caller-scoped database action", async () => {
    const events: string[] = [];
    const updateUserById = jest.fn(() => {
      events.push("gotrue");
      return Promise.resolve({ error: null });
    });
    const createServiceRoleRpcClient = jest.fn(() => ({
      rpc: jest.fn(() => {
        events.push("rpc");
        return Promise.resolve({ data: null, error: null });
        }),
      }));
    const createServiceRoleClient = jest.fn(() => ({
      auth: { admin: { updateUserById } },
    }));
    const { dependencies } = createDependencies({
      createServiceRoleRpcClient,
      createServiceRoleClient,
    });
    const service = createModerationService(dependencies);

    await service.unbanModerationUser("verified-admin-token", ban.user_id);

    expect(events).toEqual(["gotrue", "rpc"]);
    expect(createServiceRoleRpcClient).toHaveBeenCalledWith("verified-admin-token");
    expect(createServiceRoleClient).toHaveBeenCalledWith();
    expect(updateUserById).toHaveBeenCalledWith(ban.user_id, { ban_duration: "none" });
  });

  it("does not call admin_unban when GoTrue rejects the unban", async () => {
    const rpc = jest.fn(() => Promise.resolve({ data: null, error: null }));
    const { dependencies } = createDependencies({
      createServiceRoleRpcClient: jest.fn(() => ({ rpc })),
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

  it("rejects an invalid service unban user id before creating clients", async () => {
    const { dependencies } = createDependencies();
    const service = createModerationService(dependencies);

    await expect(service.unbanModerationUser("verified-admin-token", "not-a-uuid")).rejects.toThrow(
      "Invalid moderation user id",
    );

    expect(dependencies.createServiceRoleClient).not.toHaveBeenCalled();
    expect(dependencies.createServiceRoleRpcClient).not.toHaveBeenCalled();
  });

  it("rejects an unban when the caller-scoped RPC returns an error", async () => {
    const rpc = jest.fn(() => Promise.resolve({ data: null, error: { message: "denied" } }));
    const updateUserById = jest.fn(() => Promise.resolve({ error: null }));
    const { dependencies } = createDependencies({
      createServiceRoleRpcClient: jest.fn(() => ({ rpc })),
      createServiceRoleClient: jest.fn(() => ({ auth: { admin: { updateUserById } } })),
    });
    const service = createModerationService(dependencies);

    await expect(service.unbanModerationUser("verified-admin-token", ban.user_id)).rejects.toThrow(
      "Unable to unban moderation user",
    );

    expect(updateUserById).toHaveBeenCalledWith(ban.user_id, { ban_duration: "none" });
    expect(rpc).toHaveBeenCalledWith("admin_unban", { p_user_id: ban.user_id });
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

  it.each(["resendApiKey", "reportsEmailFrom", "reportsEmailTo"])(
    "skips an alert when %s is not configured",
    async (missingEnvironmentValue) => {
      const environment = {
        resendApiKey: "resend-key",
        reportsEmailFrom: "Crumbify <alerts@crumbify.co.uk>",
        reportsEmailTo: "configured-recipient",
      };
      delete environment[missingEnvironmentValue as keyof typeof environment];
      const { dependencies, fetch } = createDependencies({
        getEnvironment: jest.fn(() => environment),
      });
      const service = createModerationService(dependencies);

      await service.sendUnauthorizedModerationAlert("user-1", "person@example.com");

      expect(fetch).not.toHaveBeenCalled();
    },
  );
});

describe("production moderation client wiring", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("uses the service-role key and verified bearer for moderation RPCs", async () => {
    const rpc = jest.fn(() => Promise.resolve({ data: [], error: null }));
    mockCreateClient.mockReturnValue({ rpc });

    await fetchModerationData("verified-admin-token");

    expect(mockCreateClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-role-key",
      expect.objectContaining({
        global: { headers: { Authorization: "Bearer verified-admin-token" } },
      }),
    );
  });

  it.each(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"])(
    "rejects exported moderation reads when %s is missing",
    async (missingEnvironmentVariable) => {
      delete process.env[missingEnvironmentVariable];

      await expect(fetchModerationData("verified-admin-token")).rejects.toThrow(
        "Supabase service role is not configured",
      );
      expect(mockCreateClient).not.toHaveBeenCalled();
    },
  );

  it("rejects an exported unban before GoTrue when the service-role key is missing", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    await expect(unbanModerationUser("verified-admin-token", ban.user_id)).rejects.toThrow(
      "Supabase service role is not configured",
    );
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("uses the production alert adapters for the configured recipient", async () => {
    process.env.RESEND_API_KEY = "resend-key";
    process.env.REPORTS_EMAIL_FROM = "Crumbify <alerts@crumbify.co.uk>";
    process.env.REPORTS_EMAIL_TO = "configured-recipient";
    const fetchMock = jest.fn(() => Promise.resolve({ ok: true }));
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    try {
      await sendUnauthorizedModerationAlert("user-1", "person@example.com");
    } finally {
      globalThis.fetch = originalFetch;
    }

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer resend-key",
          "X-Priority": "1",
        }),
        body: expect.stringContaining("Path: /admin/moderation."),
      }),
    );
  });

  it("keeps GoTrue bearer-free while the admin_unban RPC carries the verified bearer", async () => {
    const updateUserById = jest.fn(() => Promise.resolve({ error: null }));
    const rpc = jest.fn(() => Promise.resolve({ data: null, error: null }));
    mockCreateClient
      .mockReturnValueOnce({ auth: { admin: { updateUserById } } })
      .mockReturnValueOnce({ rpc });

    await unbanModerationUser("verified-admin-token", ban.user_id);

    expect(mockCreateClient).toHaveBeenNthCalledWith(
      1,
      "https://example.supabase.co",
      "service-role-key",
      expect.not.objectContaining({ global: expect.anything() }),
    );
    expect(mockCreateClient).toHaveBeenNthCalledWith(
      2,
      "https://example.supabase.co",
      "service-role-key",
      expect.objectContaining({
        global: { headers: { Authorization: "Bearer verified-admin-token" } },
      }),
    );
  });
});
