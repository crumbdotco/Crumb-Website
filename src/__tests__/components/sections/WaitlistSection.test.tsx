/**
 * WaitlistSection component tests
 * Tests form submission, loading state, success/error states, validation, and founding member card.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WaitlistSection } from "../../../components/sections/WaitlistSection";

describe("WaitlistSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the main heading", () => {
    render(<WaitlistSection />);
    expect(
      screen.getByRole("heading", { name: /Ready to see your food story\?/i })
    ).toBeInTheDocument();
  });

  it("renders the sub-description", () => {
    render(<WaitlistSection />);
    expect(screen.getByText(/Crumb is launching soon. Join the waitlist/i)).toBeInTheDocument();
  });

  it("renders the email input", () => {
    render(<WaitlistSection />);
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
  });

  it("renders the join button", () => {
    render(<WaitlistSection />);
    expect(screen.getByRole("button", { name: /Join Free/i })).toBeInTheDocument();
  });

  it("renders the Founding Member heading", () => {
    render(<WaitlistSection />);
    // "Become a Founding Member" appears in both the h3 and the Stripe CTA button
    expect(screen.getAllByText(/Become a Founding Member/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Founding Member price", () => {
    render(<WaitlistSection />);
    expect(screen.getByText("£4.99")).toBeInTheDocument();
  });

  it("renders the pay once tagline", () => {
    render(<WaitlistSection />);
    expect(screen.getByText(/Pay once. Get premium forever./i)).toBeInTheDocument();
  });

  it("renders founding member benefits list", () => {
    render(<WaitlistSection />);
    expect(screen.getByText(/First-day access when Crumb launches/i)).toBeInTheDocument();
    expect(screen.getByText(/Lifetime premium/i)).toBeInTheDocument();
    expect(screen.getByText(/Exclusive "Founding Member" badge in your profile/i)).toBeInTheDocument();
    expect(screen.getByText(/All future premium features included forever/i)).toBeInTheDocument();
  });

  it("renders the founding member Stripe link with correct href", () => {
    render(<WaitlistSection />);
    const stripeLink = screen.getByRole("link", { name: /Become a Founding Member - £4.99/i });
    expect(stripeLink).toHaveAttribute("href", "https://buy.stripe.com/3cI8wJ6zPaaG5XE7M33ks00");
    expect(stripeLink).toHaveAttribute("target", "_blank");
    expect(stripeLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the UK availability note", () => {
    render(<WaitlistSection />);
    expect(screen.getByText(/Available in the UK. More regions coming soon./i)).toBeInTheDocument();
  });

  it("renders the section with id waitlist", () => {
    render(<WaitlistSection />);
    const section = document.getElementById("waitlist");
    expect(section).toBeInTheDocument();
  });

  it("updates email input value when user types", async () => {
    render(<WaitlistSection />);
    const input = screen.getByPlaceholderText(/Enter your email/i);
    await userEvent.type(input, "test@example.com");
    expect(input).toHaveValue("test@example.com");
  });

  it("shows loading state during form submission", async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 500))
    );

    render(<WaitlistSection />);
    const input = screen.getByPlaceholderText(/Enter your email/i);
    await userEvent.type(input, "test@example.com");
    fireEvent.submit(input.closest("form")!);

    expect(screen.getByRole("button", { name: /Joining.../i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Joining.../i })).toBeDisabled();
  });

  it("shows success state after successful submission", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(<WaitlistSection />);
    const input = screen.getByPlaceholderText(/Enter your email/i);
    await userEvent.type(input, "test@example.com");
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/You're on the list!/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/We'll email you on launch day./i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Enter your email/i)).not.toBeInTheDocument();
  });

  it("shows error message when API returns non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    render(<WaitlistSection />);
    const input = screen.getByPlaceholderText(/Enter your email/i);
    await userEvent.type(input, "test@example.com");
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText(/Something went wrong. Please try again./i)
      ).toBeInTheDocument();
    });
  });

  it("shows error message when fetch throws a network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network failure"));

    render(<WaitlistSection />);
    const input = screen.getByPlaceholderText(/Enter your email/i);
    await userEvent.type(input, "test@example.com");
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText(/Something went wrong. Please try again./i)
      ).toBeInTheDocument();
    });
  });

  it("does not submit if email has no @ character", async () => {
    render(<WaitlistSection />);
    const input = screen.getByPlaceholderText(/Enter your email/i);
    await userEvent.type(input, "invalidemail");
    fireEvent.submit(input.closest("form")!);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("calls fetch with correct payload on valid submission", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(<WaitlistSection />);
    const input = screen.getByPlaceholderText(/Enter your email/i);
    await userEvent.type(input, "valid@test.co.uk");
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "valid@test.co.uk" }),
      });
    });
  });

  it("error state keeps form visible", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    render(<WaitlistSection />);
    const input = screen.getByPlaceholderText(/Enter your email/i);
    await userEvent.type(input, "test@example.com");
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
  });
});
