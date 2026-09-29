/**
 * Stripe webhook log redaction (Crumb-Website#18): an email echoed by a
 * Supabase or Stripe error must never reach console.error unredacted. Asserts
 * the DATA that was logged, not just that a log happened.
 */

const mockUpsert = jest.fn();
const mockDeleteSelect = jest.fn();
const mockDelete = jest.fn(() => ({ eq: () => ({ select: mockDeleteSelect }) }));
const mockRpc = jest.fn();
const mockFrom = jest.fn(() => ({ upsert: mockUpsert, delete: mockDelete }));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: mockFrom, rpc: mockRpc })),
}));

const mockConstructEvent = jest.fn();
jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    webhooks: { constructEvent: mockConstructEvent },
  })),
);

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: ResponseInit) => ({ body, status: init?.status ?? 200 })),
  },
}));

import { POST } from "../../app/api/stripe/webhook/route";

const EMAIL = "secret.person+tag@example.co.uk";

function buildRequest(): Request {
  return {
    text: jest.fn().mockResolvedValue("{}"),
    headers: { get: (name: string) => (name === "stripe-signature" ? "sig" : null) },
  } as unknown as Request;
}

function loggedText(spy: jest.SpyInstance): string {
  return spy.mock.calls.map((args) => args.map(String).join(" ")).join("\n");
}

describe("stripe webhook log redaction", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    process.env.STRIPE_SECRET_KEY = "sk_test_key";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  });

  afterEach(() => {
    errorSpy.mockRestore();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("redacts an email inside a signature verification error", async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error(`bad payload for ${EMAIL}`);
    });
    await POST(buildRequest());
    expect(loggedText(errorSpy)).toContain("Error: bad payload for [redacted-email]");
    expect(loggedText(errorSpy)).not.toContain("example.co.uk");
  });

  it("redacts an email echoed by the waitlist upsert error", async () => {
    mockUpsert.mockResolvedValueOnce({
      error: { message: `duplicate key (email)=(${EMAIL})` },
    });
    mockConstructEvent.mockReturnValueOnce({
      type: "checkout.session.completed",
      data: { object: { customer_details: { email: EMAIL }, payment_intent: "pi_1" } },
    });
    mockRpc.mockResolvedValue({ data: 100, error: null });
    await POST(buildRequest());
    expect(loggedText(errorSpy)).toContain("duplicate key (email)=([redacted-email])");
    expect(loggedText(errorSpy)).not.toContain("example.co.uk");
  });

  it("redacts an email echoed by the refund delete error", async () => {
    mockDeleteSelect.mockResolvedValueOnce({ data: null, error: { message: `row ${EMAIL} locked` } });
    mockConstructEvent.mockReturnValueOnce({
      type: "payment_intent.canceled",
      data: { object: { id: "pi_2" } },
    });
    await POST(buildRequest());
    expect(loggedText(errorSpy)).toContain("row [redacted-email] locked");
    expect(loggedText(errorSpy)).not.toContain("example.co.uk");
  });

  it("redacts an email echoed by the demote RPC error", async () => {
    mockDeleteSelect.mockResolvedValueOnce({ data: [{ email: EMAIL }], error: null });
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: `no profile for ${EMAIL}` } });
    mockConstructEvent.mockReturnValueOnce({
      type: "payment_intent.canceled",
      data: { object: { id: "pi_3" } },
    });
    await POST(buildRequest());
    expect(loggedText(errorSpy)).toContain("no profile for [redacted-email]");
    expect(loggedText(errorSpy)).not.toContain("example.co.uk");
  });
});
