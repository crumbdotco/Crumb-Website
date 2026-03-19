import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the Crumb marketing homepage.
 * Encapsulates selectors and actions so tests stay readable and resilient.
 */
export class HomePage {
  readonly page: Page;

  // Navbar
  readonly navBrand: Locator;
  readonly navJoinWaitlist: Locator;

  // Hero section
  readonly heroHeading: Locator;
  readonly heroSubheading: Locator;
  readonly heroCTA: Locator;

  // Section headings (used to verify section presence)
  readonly whatYoullDiscoverHeading: Locator;
  readonly howItWorksHeading: Locator;
  readonly wrappedPreviewHeading: Locator;
  readonly featuresGridHeading: Locator;
  readonly socialProofHeading: Locator;

  // Waitlist section
  readonly waitlistSection: Locator;
  readonly waitlistHeading: Locator;
  readonly waitlistEmailInput: Locator;
  readonly waitlistSubmitButton: Locator;
  readonly waitlistSuccessMessage: Locator;
  readonly waitlistErrorMessage: Locator;

  // Founding member
  readonly foundingMemberCard: Locator;
  readonly foundingMemberLink: Locator;

  // Footer
  readonly footer: Locator;
  readonly footerPrivacyLink: Locator;
  readonly footerTermsLink: Locator;
  readonly footerContactLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navbar
    this.navBrand = page.locator("nav").getByText("crumb").first();
    this.navJoinWaitlist = page.locator("nav").getByRole("link", {
      name: "Join the waitlist",
    });

    // Hero
    this.heroHeading = page.getByRole("heading", {
      name: /see exactly how.*you really eat/i,
      level: 1,
    });
    this.heroSubheading = page.getByText(
      /Connect your Uber Eats and Just Eat accounts/i
    );
    this.heroCTA = page
      .locator("section")
      .first()
      .getByRole("link", { name: /join the waitlist/i });

    // Section headings
    this.whatYoullDiscoverHeading = page.getByRole("heading", {
      name: /your food life, finally in numbers/i,
    });
    this.howItWorksHeading = page.getByRole("heading", {
      name: /three steps to your stats/i,
    });
    this.wrappedPreviewHeading = page.getByRole("heading", {
      name: /your year in food delivery/i,
    });
    this.featuresGridHeading = page.getByRole("heading", {
      name: /everything you need/i,
    });
    this.socialProofHeading = page.getByText(/ready to see yours\?/i).first();

    // Waitlist section
    this.waitlistSection = page.locator("#waitlist");
    this.waitlistHeading = page.getByRole("heading", {
      name: /ready to see your food story/i,
    });
    this.waitlistEmailInput = page.locator("#waitlist input[type='email']");
    this.waitlistSubmitButton = page.locator("#waitlist button[type='submit']");
    this.waitlistSuccessMessage = page.getByText(/you're on the list/i);
    this.waitlistErrorMessage = page.getByText(
      /something went wrong/i
    );

    // Founding member
    this.foundingMemberCard = page.getByRole("heading", {
      name: /become a founding member/i,
    });
    this.foundingMemberLink = page.getByRole("link", {
      name: /become a founding member.*£4\.99/i,
    });

    // Footer
    this.footer = page.locator("footer");
    this.footerPrivacyLink = page.locator("footer").getByRole("link", {
      name: "Privacy Policy",
    });
    this.footerTermsLink = page.locator("footer").getByRole("link", {
      name: "Terms of Service",
    });
    this.footerContactLink = page.locator("footer").getByRole("link", {
      name: "Contact",
    });
  }

  async goto() {
    await this.page.goto("/");
    // Wait for at least the hero heading to be visible before proceeding
    await this.heroHeading.waitFor({ state: "visible", timeout: 15000 });
  }

  async scrollToWaitlist() {
    await this.waitlistSection.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(400);
  }

  async submitWaitlistEmail(email: string) {
    await this.scrollToWaitlist();
    await this.waitlistEmailInput.fill(email);
    await this.waitlistSubmitButton.click();
  }
}
