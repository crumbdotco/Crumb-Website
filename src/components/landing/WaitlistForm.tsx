"use client";
import { useWaitlist } from "@/hooks/useWaitlist";

/**
 * Compact hero waitlist signup form. Above-the-fold email capture for the
 * event QR-code flow: type=email input, one submit button, one aria-live
 * status line. Honeypot field for bots; Turnstile is opt-in via
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY and otherwise fully absent from the form.
 *
 * Brand rules enforced: no em/en dashes, no letter-spacing, no all-caps
 * spaced labels, gold never used as a text colour, no glow/spotlight effect,
 * no money amounts, UK English.
 *
 * testIDs: waitlist-form, waitlist-email-input, waitlist-submit, waitlist-status
 */
export function WaitlistForm() {
  const { email, setEmail, status, errorMessage, submit, honeypotId } = useWaitlist();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const isSubmitting = status === "submitting";

  let statusMessage = "";
  if (status === "success") {
    statusMessage = "You're on the list. See you soon.";
  } else if (status === "alreadyExists") {
    statusMessage = "You're already on the list.";
  } else if (status === "error") {
    statusMessage = errorMessage ?? "Something went wrong, please try again.";
  }

  const isDone = status === "success" || status === "alreadyExists";

  return (
    <form
      id="waitlist"
      className="waitlist-form"
      data-testid="waitlist-form"
      onSubmit={submit}
      noValidate
    >
      <div className="waitlist-form-row">
        <label htmlFor="waitlist-email" className="waitlist-label">
          Email address
        </label>
        <input
          id="waitlist-email"
          data-testid="waitlist-email-input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          required
          disabled={isSubmitting || isDone}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          id={honeypotId}
          name="website"
          className="waitlist-hp"
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
        />
        <button
          type="submit"
          data-testid="waitlist-submit"
          className="waitlist-submit"
          disabled={isSubmitting || isDone}
        >
          {isSubmitting ? "Joining..." : "Join the waitlist"}
        </button>
      </div>
      <p className="waitlist-status" data-testid="waitlist-status" aria-live="polite">
        {statusMessage || "Be first to know when Crumbify opens."}
      </p>
      {turnstileSiteKey ? (
        <div
          className="cf-turnstile"
          data-sitekey={turnstileSiteKey}
          data-testid="waitlist-turnstile"
        />
      ) : null}
    </form>
  );
}
