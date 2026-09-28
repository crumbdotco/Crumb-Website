/**
 * src/__tests__/components/landing/WaitlistForm.test.tsx
 *
 * Covers the four visible states of the hero waitlist form: idle,
 * submitting (button disabled), success, already-on-the-list, and error
 * rendering the server's own message verbatim.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

describe("WaitlistForm", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  function fillAndSubmit(email = "person@gmail.com") {
    fireEvent.change(screen.getByTestId("waitlist-email-input"), { target: { value: email } });
    fireEvent.click(screen.getByTestId("waitlist-submit"));
  }

  it("renders the idle state with the default status line", () => {
    render(<WaitlistForm />);
    expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
      "Be first to know when Crumbify opens.",
    );
    expect(screen.getByTestId("waitlist-submit")).toBeEnabled();
  });

  it("disables the button while submitting", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    global.fetch = jest.fn(
      () => new Promise((resolve) => { resolveFetch = resolve; }),
    ) as unknown as typeof fetch;

    render(<WaitlistForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("waitlist-submit")).toBeDisabled();
    });

    resolveFetch({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true, alreadyExists: false }),
    });
  });

  it("shows the success message for a new signup", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true, alreadyExists: false }),
    }) as unknown as typeof fetch;

    render(<WaitlistForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
        "You're on the list. See you soon.",
      );
    });
  });

  it("shows the already-on-the-list message for a duplicate signup", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true, alreadyExists: true }),
    }) as unknown as typeof fetch;

    render(<WaitlistForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
        "You're already on the list.",
      );
    });
  });

  it("shows the server's exact error message on rejection", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      headers: { get: () => "application/json" },
      json: async () => ({
        error: "Please use a personal email like Gmail, iCloud or Outlook. Student emails work too.",
      }),
    }) as unknown as typeof fetch;

    render(<WaitlistForm />);
    fillAndSubmit("person@example.com");

    await waitFor(() => {
      expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
        "Please use a personal email like Gmail, iCloud or Outlook. Student emails work too.",
      );
    });
  });

  it("shows a generic error message on a network failure", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    render(<WaitlistForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByTestId("waitlist-status")).toHaveTextContent(
        "Something went wrong, please try again.",
      );
    });
  });

  it("does not render the Turnstile widget when no site key is configured", () => {
    render(<WaitlistForm />);
    expect(screen.queryByTestId("waitlist-turnstile")).not.toBeInTheDocument();
  });
});
