/**
 * Log redaction for server-side console output (Crumb-Website#18).
 *
 * Supabase and PostgREST errors on email-keyed tables can echo the address
 * (constraint details, RLS messages), and fetch rejections can carry secrets
 * in URL query strings. Vercel logs reach a wider audience than the data
 * deserves, so every console.* argument that carries an error, a message or
 * any unknown value goes through redactForLog. The static guard in
 * src/__tests__/security/log-redaction-guard.test.ts enforces that.
 *
 * Semantics ported from the app repo's
 * supabase/functions/_shared/redact.ts, plus URL-encoded emails, more
 * credential parameter names and a length bound.
 */

/** Longest logged value, in characters, before the truncation marker. */
export const MAX_LOG_LENGTH = 500;

/** Raw input is cut to this many characters before any regex runs. */
export const MAX_INPUT_LENGTH = MAX_LOG_LENGTH * 8;

/** Longest address isValidEmail accepts; bounds the trailing fragment drop. */
const MAX_EMAIL_LENGTH = 254;

const CREDENTIAL_PARAM_RE =
  /\b(key|apikey|api_key|access_token|refresh_token|id_token|token|secret|password|code|sig|signature)=[^&\s"'`)]+/gi;

/*
 * Email matching mirrors what isValidEmail (src/lib/waitlist-guards.ts)
 * accepts: any non-space, non-@ local part, so Unicode letters and digits,
 * RFC specials and quoted local parts are covered. URL delimiters (= & ? /)
 * stay OUT of the local class so "email=a@b.io" keeps its "email=" context.
 * The lookbehind anchors an unquoted match to the start of a local run, which
 * keeps the scan linear on long runs with no @ (no per-position rescans). A
 * quoted local part is bounded to 64 characters for the same reason.
 * Separators: @, %40 (URL encoded) and the literal six characters backslash-
 * u-0040 (how a JSON string spells @).
 */
const LOCAL_CHARS = String.raw`\p{L}\p{N}._%+!#$*'^` + "`" + String.raw`{|}~-`;
const EMAIL_RE = new RegExp(
  String.raw`(?:"[^"\s@]{1,64}"|(?<![${LOCAL_CHARS}])[${LOCAL_CHARS}]+)` +
    String.raw`(?:@|%40|\\u0040)[\p{L}\p{N}.-]+\.\p{L}{2,}`,
  "gu",
);

function toLogString(input: unknown): string {
  if (typeof input === "string") return input;
  if (input instanceof Error) return `${input.name}: ${input.message}`;
  if (input !== null && typeof input === "object") {
    try {
      return JSON.stringify(input) ?? String(input);
    } catch {
      return String(input);
    }
  }
  return String(input);
}

/**
 * Bound the raw input before the regexes run. A cut can leave half an email
 * at the end that no pattern recognises, so a capped input also drops its
 * trailing non-space run (an address never contains whitespace), but never
 * more than MAX_EMAIL_LENGTH characters of it, so one unbroken run still logs.
 */
function capInput(raw: string): string {
  if (raw.length <= MAX_INPUT_LENGTH) return raw;
  const sliced = raw.slice(0, MAX_INPUT_LENGTH);
  const floor = sliced.length - MAX_EMAIL_LENGTH;
  let end = sliced.length;
  while (end > floor && !/\s/.test(sliced[end - 1])) end -= 1;
  return sliced.slice(0, end);
}

export function redactForLog(input: unknown): string {
  try {
    const redacted = capInput(toLogString(input))
      .replace(CREDENTIAL_PARAM_RE, "$1=[redacted]")
      .replace(EMAIL_RE, "[redacted-email]");
    return redacted.length > MAX_LOG_LENGTH
      ? `${redacted.slice(0, MAX_LOG_LENGTH)}...[truncated]`
      : redacted;
  } catch {
    return "[unloggable]";
  }
}
