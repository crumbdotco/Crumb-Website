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

const CREDENTIAL_PARAM_RE =
  /\b(key|apikey|api_key|access_token|refresh_token|id_token|token|secret|password|code|sig|signature)=[^&\s"'`)]+/gi;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+(?:@|%40|\u0040)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

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

export function redactForLog(input: unknown): string {
  try {
    const redacted = toLogString(input)
      .replace(CREDENTIAL_PARAM_RE, "$1=[redacted]")
      .replace(EMAIL_RE, "[redacted-email]");
    return redacted.length > MAX_LOG_LENGTH
      ? `${redacted.slice(0, MAX_LOG_LENGTH)}...[truncated]`
      : redacted;
  } catch {
    return "[unloggable]";
  }
}
