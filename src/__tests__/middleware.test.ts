/**
 * Tests for src/middleware.ts
 *
 * next/server requires the Edge runtime which is not available in jsdom.
 * We mock it via jest.mock() using a factory that creates fresh jest.fn()
 * instances (avoids the hoisting issue with `const` references).
 */

// Mock next/server using a factory — avoids hoisting issues.
// We grab the mock references via jest.mocked() / require() after setup.
jest.mock("next/server", () => {
  const nextFn = jest.fn().mockReturnValue({ type: "next", status: 200, _next: true });
  const jsonFn = jest.fn().mockImplementation((body: unknown, init?: { status?: number }) => ({
    type: "json",
    body,
    status: init?.status ?? 200,
    _json: true,
  }));
  return {
    NextResponse: {
      next: nextFn,
      json: jsonFn,
    },
  };
});

import { middleware } from "../middleware";

// Resolve mock references post-import
let mockNext: jest.Mock;
let mockJson: jest.Mock;

beforeAll(() => {
  const { NextResponse } = require("next/server");
  mockNext = NextResponse.next as jest.Mock;
  mockJson = NextResponse.json as jest.Mock;
});

beforeEach(() => {
  jest.clearAllMocks();
  // Restore default implementations after clearAllMocks
  mockNext.mockReturnValue({ type: "next", status: 200, _next: true });
  mockJson.mockImplementation((body: unknown, init?: { status?: number }) => ({
    type: "json",
    body,
    status: init?.status ?? 200,
    _json: true,
  }));
});

// ---------------------------------------------------------------------------
// Request factory
// ---------------------------------------------------------------------------

function makeRequest(opts: {
  pathname?: string;
  method?: string;
  ua?: string | null;
  acceptLang?: string | null;
  referer?: string | null;
}): any {
  const {
    pathname = "/api/waitlist",
    method = "POST",
    ua = "Mozilla/5.0 (Windows NT 10.0) Chrome/120",
    acceptLang = "en-GB,en;q=0.9",
    referer = "https://crumbify.co.uk",
  } = opts;

  const headers: Record<string, string | null> = {};
  if (ua !== null) headers["user-agent"] = ua;
  if (acceptLang !== null) headers["accept-language"] = acceptLang;
  if (referer !== null) headers["referer"] = referer;

  return {
    nextUrl: { pathname },
    method,
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? null,
    },
  };
}

// ---------------------------------------------------------------------------
// Non-waitlist paths → NextResponse.next()
// ---------------------------------------------------------------------------

describe("middleware — non-waitlist paths", () => {
  it("passes through requests to home page (/)", () => {
    middleware(makeRequest({ pathname: "/" }));
    expect(mockNext).toHaveBeenCalled();
  });

  it("passes through requests to /privacy", () => {
    middleware(makeRequest({ pathname: "/privacy" }));
    expect(mockNext).toHaveBeenCalled();
  });

  it("passes through requests to /api/stripe/webhook", () => {
    middleware(makeRequest({ pathname: "/api/stripe/webhook" }));
    expect(mockNext).toHaveBeenCalled();
  });

  it("passes through requests to /founding-member/success", () => {
    middleware(makeRequest({ pathname: "/founding-member/success" }));
    expect(mockNext).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Empty / null user-agent → block
// ---------------------------------------------------------------------------

describe("middleware — empty user-agent", () => {
  it("returns fake success for empty UA string", () => {
    middleware(makeRequest({ ua: "" }));
    expect(mockJson).toHaveBeenCalledWith({ success: true }, { status: 200 });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns fake success when UA header is absent (null)", () => {
    middleware(makeRequest({ ua: null }));
    expect(mockJson).toHaveBeenCalledWith({ success: true }, { status: 200 });
    expect(mockNext).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Bot user-agents → block
// ---------------------------------------------------------------------------

describe("middleware — bot user-agent blocking", () => {
  const botUAs = [
    "python-requests/2.28.0",
    "python-urllib/3.11",
    "curl/7.88.1",
    "wget/1.21.4",
    "HeadlessChrome/120.0.0.0",
    "Puppeteer/21.1.0",
    "selenium/4.0",
    "playwright/1.40.0",
    "node-fetch/3.3.0",
    "Go-http-client/2.0",
    "Scrapy/2.9.0",
    "HTTPie/3.2.0",
    "PostmanRuntime/7.30.0",
  ];

  it.each(botUAs)("blocks bot UA: %s", (ua) => {
    middleware(makeRequest({ ua }));
    expect(mockJson).toHaveBeenCalledWith({ success: true }, { status: 200 });
    expect(mockNext).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Missing Accept-Language → block
// ---------------------------------------------------------------------------

describe("middleware — Accept-Language check", () => {
  it("blocks requests without Accept-Language header", () => {
    middleware(makeRequest({ acceptLang: null }));
    expect(mockJson).toHaveBeenCalledWith({ success: true }, { status: 200 });
    expect(mockNext).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Referer check (POST requests only)
// ---------------------------------------------------------------------------

describe("middleware — referer check for POST", () => {
  it("blocks POST from an unrecognised external referer", () => {
    middleware(makeRequest({
      method: "POST",
      referer: "https://attacker.example.com",
    }));
    expect(mockJson).toHaveBeenCalledWith({ success: true }, { status: 200 });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("allows POST from crumbify.co.uk referer", () => {
    middleware(makeRequest({
      method: "POST",
      referer: "https://crumbify.co.uk/",
    }));
    expect(mockNext).toHaveBeenCalled();
  });

  it("allows POST from localhost referer (development)", () => {
    middleware(makeRequest({
      method: "POST",
      referer: "http://localhost:3000",
    }));
    expect(mockNext).toHaveBeenCalled();
  });

  it("does NOT block GET requests with no referer", () => {
    middleware(makeRequest({
      method: "GET",
      referer: null,
    }));
    expect(mockNext).toHaveBeenCalled();
  });

  it("allows POST with empty referer (falsy → referer block skipped)", () => {
    middleware(makeRequest({
      method: "POST",
      referer: "",
    }));
    expect(mockNext).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Legitimate browser request
// ---------------------------------------------------------------------------

describe("middleware — legitimate browser requests", () => {
  it("calls next() for a real browser POST to /api/waitlist", () => {
    middleware(makeRequest({
      pathname: "/api/waitlist",
      method: "POST",
      ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      acceptLang: "en-GB,en;q=0.9",
      referer: "https://crumbify.co.uk/",
    }));
    expect(mockNext).toHaveBeenCalled();
    expect(mockJson).not.toHaveBeenCalled();
  });

  it("calls next() for a real browser GET to /api/waitlist", () => {
    middleware(makeRequest({
      pathname: "/api/waitlist",
      method: "GET",
      ua: "Mozilla/5.0 Chrome/120",
      acceptLang: "en-US,en;q=0.9",
      referer: "https://crumbify.co.uk",
    }));
    expect(mockNext).toHaveBeenCalled();
  });
});
