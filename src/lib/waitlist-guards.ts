/**
 * Pure, dependency-injected guard helpers for POST /api/waitlist.
 * Kept separate from the route so they can be unit tested directly.
 *
 * ALLOWED_WAITLIST_EMAIL_DOMAINS mirrors the live DB trigger `trg_block_bot_inserts`
 * on `public.waitlist` exactly (verified 2026-09-28). Do not add/remove a domain here
 * without also updating the trigger, or the two will silently disagree.
 */

// RFC 5322-compliant email regex (practical subset)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const ALLOWED_WAITLIST_EMAIL_DOMAINS = new Set([
  // Google
  "gmail.com", "googlemail.com",
  // Microsoft
  "outlook.com", "hotmail.com", "hotmail.co.uk", "live.com", "live.co.uk", "msn.com",
  // Apple
  "icloud.com", "me.com", "mac.com",
  // Yahoo
  "yahoo.com", "yahoo.co.uk", "yahoo.co.in",
  // ProtonMail
  "protonmail.com", "proton.me", "pm.me",
  // AOL
  "aol.com",
  // Zoho
  "zoho.com",
  // UK ISPs
  "btinternet.com", "sky.com", "virginmedia.com", "talktalk.net",
  // Other common
  "mail.com", "fastmail.com", "tutanota.com", "hey.com",
]);

// Disposable/throwaway email providers - block on signup
export const DISPOSABLE_WAITLIST_EMAIL_DOMAINS = new Set([
  "guerrillamail.com", "guerrillamail.net", "guerrillamailblock.com",
  "guerrillamail.de", "guerrillamail.info",
  "mailinator.com", "tempmail.com", "throwaway.email", "yopmail.com",
  "sharklasers.com", "grr.la", "dispostable.com", "temp-mail.org",
  "fakeinbox.com", "maildrop.cc", "10minutemail.com", "trashmail.com",
  "tempinbox.com", "getairmail.com", "mohmal.com", "emailondeck.com",
  "crazymailing.com", "tmail.ws", "burnermail.io", "inboxbear.com",
]);

// Keep in sync with src/middleware.ts's BOT_UA_FRAGMENTS list.
export const WAITLIST_BOT_UA_FRAGMENTS = [
  "headlesschrome",
  "phantomjs",
  "puppeteer",
  "selenium",
  "playwright",
  "python-requests",
  "python-urllib",
  "node-fetch",
  "go-http-client",
  "scrapy",
  "curl/",
  "wget/",
  "httpie",
  "postman",
];

export function isBotUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  if (!ua) return true;
  return WAITLIST_BOT_UA_FRAGMENTS.some((fragment) => ua.includes(fragment));
}

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

function domainOf(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

export function isAllowedEmailDomain(email: string): boolean {
  const domain = domainOf(email);
  if (ALLOWED_WAITLIST_EMAIL_DOMAINS.has(domain)) return true;
  if (domain.endsWith(".ac.uk") || domain.endsWith(".edu")) return true;
  return false;
}

export function isDisposableEmailDomain(email: string): boolean {
  return DISPOSABLE_WAITLIST_EMAIL_DOMAINS.has(domainOf(email));
}

export interface OriginCheckEnv {
  nodeEnv: string | undefined;
  vercelEnv: string | undefined;
}

/**
 * Pure origin check - all inputs are passed in (no reads of process.env inside)
 * so it can be unit tested directly with an explicit env object.
 */
export function isAllowedOrigin(origin: string, env: OriginCheckEnv): boolean {
  if (origin === "https://crumbify.co.uk" || origin === "https://www.crumbify.co.uk") {
    return true;
  }
  if (env.nodeEnv === "development" && origin === "http://localhost:3000") {
    return true;
  }
  if (env.vercelEnv === "preview" && /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) {
    return true;
  }
  return false;
}

export const NON_ALLOWED_DOMAIN_MESSAGE =
  "Please use a personal email like Gmail, iCloud or Outlook. Student emails work too.";

export const RATE_LIMITED_MESSAGE =
  "Lots of people are joining right now, please try again in a few minutes.";

export const GENERIC_ERROR_MESSAGE = "Something went wrong, please try again.";
