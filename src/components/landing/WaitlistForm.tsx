"use client";
import Script from "next/script";
import { useWaitlist } from "@/hooks/useWaitlist";
import { useTurnstile } from "@/hooks/useTurnstile";

/**
 * Compact hero waitlist signup form. Above-the-fold email capture for the
 * event QR-code flow: type=email input, one submit button, one aria-live
 * status line. Honeypot field for bots. Turnstile is only rendered when its
 * public site key is present in the build.
 *
 * Brand rules enforced: no em/en dashes, no letter-spacing, no all-caps
 * spaced labels, gold never used as a text colour, no glow/spotlight effect,
 * no money amounts, UK English.
 *
 * testIDs: waitlist-form, waitlist-email-input, waitlist-submit, waitlist-status
 */
export function WaitlistForm() {
  const {
    token,
    containerRef,
    hasTurnstile,
    errorMessage: turnstileError,
    handleScriptLoad,
    handleScriptError,
    reset,
  } = useTurnstile("light");
  const {
    email,
    setEmail,
    status,
    errorMessage,
    submit,
    honeypotId,
    waitingForTurnstile,
    turnstileWaitingMessage,
  } = useWaitlist({
    turnstileToken: token,
    turnstileRequired: hasTurnstile,
    turnstileError,
    resetTurnstile: reset,
  });

  const isSubmitting = status === "submitting" && !turnstileError;

  let statusMessage = "";
  if (status === "success") {
    statusMessage = "You're on the list. See you soon.";
  } else if (status === "alreadyExists") {
    statusMessage = "You're already on the list.";
  } else if (status === "error") {
    statusMessage = errorMessage;
  } else if (turnstileError) {
    statusMessage = turnstileError;
  } else if (waitingForTurnstile) {
    statusMessage = turnstileWaitingMessage;
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
          disabled={isSubmitting || isDone || Boolean(turnstileError)}
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
          disabled={isSubmitting || isDone || Boolean(turnstileError)}
        >
          {waitingForTurnstile ? "One moment..." : isSubmitting ? "Joining..." : "Join the waitlist"}
        </button>
      </div>
      {hasTurnstile && (
        <>
          <Script
            id="cf-turnstile-script"
            data-testid="turnstile-script"
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
            onLoad={handleScriptLoad}
            onError={handleScriptError}
          />
          <div
            ref={containerRef}
            className="waitlist-turnstile"
            data-testid="waitlist-turnstile"
            role="group"
            aria-label="Bot check"
          />
        </>
      )}
      <p className="waitlist-status" data-testid="waitlist-status" aria-live="polite">
        {statusMessage || "Be first to know when Crumbify opens."}
      </p>
    </form>
  );
}
