/**
 * Privacy page retention copy: the waitlist is closed, so waitlist emails are
 * kept until the person asks for deletion, not until a launch email.
 */
import { render } from "@testing-library/react";
jest.mock("next/font/google", () => ({
  Fredoka: () => ({ variable: "f", className: "f" }),
  Nunito: () => ({ variable: "n", className: "n" }),
}));

import PrivacyPage from "@/app/privacy/page";

describe("privacy page waitlist retention", () => {
  it("renders the owner-approved waitlist retention sentence and date", () => {
    const { container } = render(<PrivacyPage />);
    const text = container.textContent ?? "";
    expect(text).toContain(
      "Pre-launch waitlist emails: kept until you ask us to delete them; contact us any time to be removed.",
    );
    expect(text).not.toContain("kept until launch");
    expect(text).toContain("2 October 2026");
  });
});
