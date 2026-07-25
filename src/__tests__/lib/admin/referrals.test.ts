/**
 * Unit tests for the referral codes registry + stats join, with a mocked
 * Supabase client (service-role queries must never hit a real project in
 * tests).
 */

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

type Row = Record<string, unknown>;

let clicksData: Row[] = [];
let clicksError: unknown = null;
let codesData: Row[] = [];
let codesError: unknown = null;
let insertResult: { data: Row | null; error: unknown } = { data: null, error: null };
let updateResult: { data: Row | null; error: unknown } = { data: null, error: null };

function buildTableApi(table: string) {
  if (table === "referral_clicks") {
    return {
      select: jest.fn(() => Promise.resolve({ data: clicksData, error: clicksError })),
    };
  }

  if (table === "referral_codes") {
    return {
      select: jest.fn((_cols: string) => {
        // fetchReferralStats: select(...) with no filter, awaited directly.
        // listReferralCodes: select(...).order(...).
        const thenable = Promise.resolve({ data: codesData, error: codesError });
        return Object.assign(thenable, {
          order: jest.fn(() => Promise.resolve({ data: codesData, error: codesError })),
        });
      }),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve(insertResult)),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve(updateResult)),
          })),
        })),
      })),
    };
  }

  throw new Error(`Unexpected table in test: ${table}`);
}

const mockFrom = jest.fn((table: string) => buildTableApi(table));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

import {
  fetchReferralStats,
  createReferralCode,
  setReferralCodeActive,
} from "@/lib/admin/referrals";

beforeEach(() => {
  clicksData = [];
  clicksError = null;
  codesData = [];
  codesError = null;
  insertResult = { data: null, error: null };
  updateResult = { data: null, error: null };
  mockFrom.mockClear();
});

describe("createReferralCode", () => {
  it("rejects an invalid code before hitting Supabase", async () => {
    const result = await createReferralCode({
      code: "bad code!",
      creatorName: "Jess",
    });

    expect(result).toEqual({ ok: false, error: "invalid_code" });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("rejects a missing creator name", async () => {
    const result = await createReferralCode({ code: "JESS10", creatorName: "  " });
    expect(result).toEqual({ ok: false, error: "invalid_code" });
  });

  it("returns a friendly duplicate error instead of throwing on a unique violation", async () => {
    insertResult = { data: null, error: { code: "23505", message: "duplicate key" } };

    const result = await createReferralCode({ code: "JESS10", creatorName: "Jess" });

    expect(result).toEqual({ ok: false, error: "duplicate" });
  });

  it("creates a normalised, typed record on success", async () => {
    insertResult = {
      data: {
        code: "JESS10",
        creator_name: "Jess",
        note: null,
        is_active: true,
        created_at: "2026-07-01T00:00:00.000Z",
      },
      error: null,
    };

    const result = await createReferralCode({ code: "jess10", creatorName: "Jess" });

    expect(result).toEqual({
      ok: true,
      record: {
        code: "JESS10",
        creatorName: "Jess",
        note: null,
        isActive: true,
        createdAt: "2026-07-01T00:00:00.000Z",
      },
    });
  });
});

describe("setReferralCodeActive", () => {
  it("returns not_found when the code does not exist", async () => {
    updateResult = { data: null, error: null };
    const result = await setReferralCodeActive("MISSING", false);
    expect(result).toEqual({ ok: false, error: "not_found" });
  });

  it("returns ok on a successful update", async () => {
    updateResult = { data: { code: "JESS10" }, error: null };
    const result = await setReferralCodeActive("JESS10", false);
    expect(result).toEqual({ ok: true });
  });
});

describe("fetchReferralStats join", () => {
  it("includes registered codes with zero clicks", async () => {
    codesData = [
      {
        code: "ZERO1",
        creator_name: "No Clicks Yet",
        note: null,
        is_active: true,
        created_at: "2026-07-01T00:00:00.000Z",
      },
    ];
    clicksData = [];

    const stats = await fetchReferralStats();

    expect(stats.codes).toHaveLength(1);
    expect(stats.codes[0]).toMatchObject({
      code: "ZERO1",
      creatorName: "No Clicks Yet",
      total: 0,
      ios: 0,
      android: 0,
      other: 0,
      last7d: 0,
      firstClickAt: null,
      lastClickAt: null,
    });
    expect(stats.unregistered).toHaveLength(0);
  });

  it("surfaces clicked-but-unregistered codes separately from registered codes", async () => {
    codesData = [
      {
        code: "REG1",
        creator_name: "Registered Creator",
        note: null,
        is_active: true,
        created_at: "2026-07-01T00:00:00.000Z",
      },
    ];
    clicksData = [
      { code: "REG1", platform: "ios", created_at: "2026-07-02T00:00:00.000Z" },
      { code: "GHOST1", platform: "android", created_at: "2026-07-03T00:00:00.000Z" },
    ];

    const stats = await fetchReferralStats();

    expect(stats.codes).toHaveLength(1);
    expect(stats.codes[0]).toMatchObject({ code: "REG1", total: 1, ios: 1 });

    expect(stats.unregistered).toHaveLength(1);
    expect(stats.unregistered[0]).toMatchObject({
      code: "GHOST1",
      total: 1,
      android: 1,
    });

    expect(stats.totalUniqueClicks).toBe(2);
    expect(stats.activeCodes).toBe(1);
    expect(stats.totalCodes).toBe(1);
  });
});
