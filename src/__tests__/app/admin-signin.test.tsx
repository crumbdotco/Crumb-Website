/**
 * Admin sign-in page: the OTP request must never create a Supabase auth user
 * (issue app#964) and must not reveal whether an address exists or is an admin.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockSignInWithOtp = jest.fn();
const mockVerifyOtp = jest.fn();

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ auth: { signInWithOtp: (...a: unknown[]) => mockSignInWithOtp(...a), verifyOtp: (...a: unknown[]) => mockVerifyOtp(...a) } }),
}));

import SignInClient from "@/app/admin/signin/SignInClient";

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  process.env = {
    ...ORIGINAL_ENV,
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  };
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

function submitEmail(email: string) {
  render(<SignInClient />);
  fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
    target: { value: email },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send code" }));
}

describe("admin sign-in OTP request", () => {
  it("never creates a user (shouldCreateUser: false)", async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });
    submitEmail("a@b.co");
    await waitFor(() => expect(mockSignInWithOtp).toHaveBeenCalledTimes(1));
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "a@b.co",
      options: { shouldCreateUser: false },
    });
  });

  it("shows neutral copy on success", async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });
    submitEmail("a@b.co");
    expect(
      await screen.findByText(/If this address has access, a code is on its way\./),
    ).toBeInTheDocument();
  });

  it("shows the same neutral copy when Supabase refuses an unknown email", async () => {
    mockSignInWithOtp.mockResolvedValue({
      error: { message: "Signups not allowed for otp", status: 422, code: "otp_disabled" },
    });
    submitEmail("nobody@b.co");
    expect(
      await screen.findByText(/If this address has access, a code is on its way\./),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Signups not allowed/)).toBeNull();
  });

  it("shows the generic error for a 422 email_provider_disabled (a real admin gets no email)", async () => {
    mockSignInWithOtp.mockResolvedValue({
      error: { message: "Email logins are disabled", status: 422, code: "email_provider_disabled" },
    });
    submitEmail("admin@b.co");
    expect(
      await screen.findByText("Could not send the code. Check your connection and try again."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/code is on its way/)).toBeNull();
  });

  it("shows a generic error on a network failure without echoing the message", async () => {
    mockSignInWithOtp.mockResolvedValue({
      error: { message: "fetch failed to host x", status: 0, name: "AuthRetryableFetchError" },
    });
    submitEmail("a@b.co");
    expect(
      await screen.findByText("Could not send the code. Check your connection and try again."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/fetch failed/)).toBeNull();
  });
});
