/**
 * Unit tests for the log redaction helper (Crumb-Website#18).
 * Ported from the app repo's supabase/functions/_shared/redact.ts semantics.
 */

import { redactForLog, MAX_LOG_LENGTH, MAX_INPUT_LENGTH } from "@/lib/redact-log";

describe("redactForLog: emails", () => {
  it.each([
    ["plain", "user foo@example.com not found", "user [redacted-email] not found"],
    ["plus tag", "key foo+tag@example.com dup", "key [redacted-email] dup"],
    ["subdomain", "a.b@mail.sub.example.co.uk failed", "[redacted-email] failed"],
    ["uppercase", "FOO.BAR@EXAMPLE.COM bad", "[redacted-email] bad"],
    ["url encoded", "email=foo%40example.com&x=1", "email=[redacted-email]&x=1"],
  ])("redacts an email (%s)", (_name, input, expected) => {
    expect(redactForLog(input)).toBe(expected);
  });

  it("redacts an email inside JSON output of an object", () => {
    expect(
      redactForLog({ message: "dup", details: "Key (email)=(a@b.io) already exists" }),
    ).toBe('{"message":"dup","details":"Key (email)=([redacted-email]) already exists"}');
  });

  it("redacts several emails in one string", () => {
    expect(redactForLog("a@b.io and c@d.io")).toBe("[redacted-email] and [redacted-email]");
  });
});

describe("redactForLog: credential parameters", () => {
  it("redacts credential query values while keeping the rest of the URL", () => {
    expect(
      redactForLog("fetch https://x.test/p?maxWidthPx=400&key=AIzaFAKE123&z=1 failed"),
    ).toBe("fetch https://x.test/p?maxWidthPx=400&key=[redacted]&z=1 failed");
  });

  it("redacts every listed spelling case-insensitively", () => {
    const names = [
      "key", "apikey", "api_key", "access_token", "refresh_token", "id_token",
      "token", "secret", "password", "code", "sig", "signature", "API_KEY",
    ];
    for (const name of names) {
      expect(redactForLog(`?${name}=abc123`)).toBe(`?${name}=[redacted]`);
    }
  });

  it("does not touch parameters that only contain a credential word", () => {
    expect(redactForLog("?monkey=1&status_code=2")).toBe("?monkey=1&status_code=2");
  });
});

describe("redactForLog: value shapes", () => {
  it("formats and redacts an Error instance", () => {
    expect(redactForLog(new TypeError("target foo@example.com failed"))).toBe(
      "TypeError: target [redacted-email] failed",
    );
  });

  it("passes plain strings and primitives through", () => {
    expect(redactForLog("plain failure")).toBe("plain failure");
    expect(redactForLog(42)).toBe("42");
    expect(redactForLog(true)).toBe("true");
    expect(redactForLog(null)).toBe("null");
    expect(redactForLog(undefined)).toBe("undefined");
  });

  it("stringifies non-Error objects as JSON", () => {
    expect(redactForLog({ code: "23505", n: 1 })).toBe('{"code":"23505","n":1}');
  });

  it("falls back to String for circular objects", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(redactForLog(circular)).toBe("[object Object]");
  });

  it("falls back to String when JSON returns undefined", () => {
    expect(redactForLog({ toJSON: () => undefined })).toBe("[object Object]");
  });

  it("returns a marker when every conversion throws", () => {
    const hostile = {
      toJSON: () => { throw new Error("no json"); },
      toString: () => { throw new Error("no string"); },
    };
    expect(redactForLog(hostile)).toBe("[unloggable]");
  });

  it("returns a marker when an Error message getter throws", () => {
    const err = new Error("x");
    Object.defineProperty(err, "message", { get: () => { throw new Error("boom"); } });
    expect(redactForLog(err)).toBe("[unloggable]");
  });
});

describe("redactForLog: truncation", () => {
  it("leaves a string at the limit unchanged", () => {
    const s = "a".repeat(MAX_LOG_LENGTH);
    expect(redactForLog(s)).toBe(s);
  });

  it("truncates very long input and marks it", () => {
    const out = redactForLog("a".repeat(MAX_LOG_LENGTH * 4));
    expect(out).toBe("a".repeat(MAX_LOG_LENGTH) + "...[truncated]");
  });

  it("redacts before truncating so a cut-off email never survives", () => {
    const input = "x".repeat(MAX_LOG_LENGTH - 3) + " foo@example.com";
    const out = redactForLog(input);
    expect(out).not.toContain("foo@");
    expect(out).not.toContain("example");
  });
});

describe("redactForLog: emails the site accepts (isValidEmail)", () => {
  it.each([
    ["unicode local part", "jösé@gmail.com failed", "[redacted-email] failed"],
    ["unicode digits", "٣٤@example.com failed", "[redacted-email] failed"],
    ["rfc special in local part", "bob!@gmail.com failed", "[redacted-email] failed"],
    ["more specials", "a#b$c*d'e@example.com x", "[redacted-email] x"],
    ["quoted local part", '"bob"@gmail.com failed', "[redacted-email] failed"],
    ["unicode domain", "user@exämple.com failed", "[redacted-email] failed"],
    ["punycode domain", "user@xn--exmple-cua.com failed", "[redacted-email] failed"],
    ["url encoded unicode", "e=jösé%40gmail.com&x=1", "e=[redacted-email]&x=1"],
    ["query context stays", "email=a@b.io&x=1", "email=[redacted-email]&x=1"],
    ["parenthesised (pg detail)", "Key (email)=(bob@example.com) already", "Key (email)=([redacted-email]) already"],
  ])("redacts %s", (_name, input, expected) => {
    expect(redactForLog(input)).toBe(expected);
  });

  it("redacts the literal JSON escape user\u0040example.com", () => {
    expect(redactForLog(String.raw`{"m":"user@example.com"}`)).toBe('{"m":"[redacted-email]"}');
  });

  it("does not redact ordinary text without an @", () => {
    const text = "jösé said hello.world! Nothing to see: 100% fine, cost $5 (approx) ~ok";
    expect(redactForLog(text)).toBe(text);
  });

  it("leaves a bare @ handle or an incomplete address alone", () => {
    expect(redactForLog("ping @jose and a@b")).toBe("ping @jose and a@b");
  });
});

describe("redactForLog: bounded input and linear time", () => {
  const timed = (input: string): number => {
    const start = performance.now();
    redactForLog(input);
    return performance.now() - start;
  };

  it.each([
    ["a run with no @", "a".repeat(50_000)],
    ["a run ending in @", "a".repeat(50_000) + "@"],
    ["dotted run", "a.".repeat(25_000)],
    ["domain-like tail", "a@" + "a.".repeat(25_000) + "!"],
    ["percent run", "%".repeat(50_000) + "@a"],
    ["percent-40 run", "a%40".repeat(12_500)],
    ["quote run", '"'.repeat(50_000)],
    ["unicode run", "é".repeat(50_000)],
  ])("finishes well under 100 ms on 50k of %s", (_name, input) => {
    expect(timed(input)).toBeLessThan(100);
  });

  it("caps the raw input before the regexes run", () => {
    const out = redactForLog("k".repeat(MAX_INPUT_LENGTH * 3));
    expect(out).toBe("k".repeat(MAX_LOG_LENGTH) + "...[truncated]");
  });

  it("never leaks a fragment of an email that spans the cap", () => {
    const unit = "a".repeat(200) + "@b.io ";
    const units = Math.floor((MAX_INPUT_LENGTH - 20) / unit.length);
    const prefix = unit.repeat(units);
    const pad = " ".repeat(MAX_INPUT_LENGTH - 8 - prefix.length);
    const input = pad + prefix + "foo@example.com and more text";
    expect(input.slice(0, MAX_INPUT_LENGTH).endsWith("foo@exam")).toBe(true);
    const out = redactForLog(input);
    expect(out.length).toBeLessThan(MAX_LOG_LENGTH);
    expect(out).not.toContain("foo");
    expect(out).not.toContain("exam");
    expect(out).not.toContain("@");
  });

  it("keeps whole text when it is exactly at the input cap", () => {
    const input = "ab ".repeat(MAX_INPUT_LENGTH / 3);
    expect(input.length).toBeLessThanOrEqual(MAX_INPUT_LENGTH);
    expect(redactForLog(input).startsWith("ab ab")).toBe(true);
  });

  it("still logs a capped input that is one unbroken run", () => {
    expect(redactForLog("z".repeat(MAX_INPUT_LENGTH + 5))).toBe(
      "z".repeat(MAX_LOG_LENGTH) + "...[truncated]",
    );
  });
});
