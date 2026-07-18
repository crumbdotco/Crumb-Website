import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the Crumbify marketing homepage (SITE_HANDOFF
 * cream editorial design). Encapsulates selectors and actions so tests
 * stay readable and resilient. Class names/ids are ported verbatim from
 * SITE_HANDOFF/site/Crumbify.html — see docs/DESIGN-BRIEF.md.
 */
export class HomePage {
  readonly page: Page;

  // Header / nav
  readonly header: Locator;
  readonly navBrand: Locator;
  readonly navLinks: Locator;
  readonly navGetAppButton: Locator;
  readonly burger: Locator;
  readonly mobileNav: Locator;

  // Hero
  readonly heroHeading: Locator;
  readonly heroMap: Locator;
  readonly heroStores: Locator;

  // Manifesto
  readonly manifesto: Locator;

  // How it works
  readonly howSection: Locator;
  readonly howListItems: Locator;

  // Feed
  readonly feedSection: Locator;
  readonly rowA: Locator;
  readonly rowB: Locator;
  readonly feedCards: Locator;

  // Band
  readonly bandCaption: Locator;

  // Taste match / Discover
  readonly discoverSection: Locator;
  readonly matchCard: Locator;

  // Groups
  readonly groupsSection: Locator;
  readonly groupCard: Locator;

  // Founding
  readonly foundingSection: Locator;

  // CTA
  readonly ctaSection: Locator;
  readonly ctaIn: Locator;

  // Footer
  readonly footer: Locator;
  readonly footerPrivacyLink: Locator;
  readonly footerTermsLink: Locator;
  readonly footerContactLink: Locator;
  readonly footerDeleteAccountLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header / nav
    this.header = page.locator("header#hdr");
    this.navBrand = this.header.locator(".brand");
    this.navLinks = this.header.locator(".nav-links a");
    this.navGetAppButton = this.header.locator(".nav-cta .btn");
    this.burger = page.locator(".burger#burger");
    this.mobileNav = page.locator(".mnav#mnav");

    // Hero
    this.heroHeading = page.locator(".hero-c h1");
    this.heroMap = page.locator("#lmap");
    this.heroStores = page.locator(".hero .stores");

    // Manifesto
    this.manifesto = page.locator("section.manifesto");

    // How it works
    this.howSection = page.locator("section#how");
    this.howListItems = page.locator(".how-list li");

    // Feed
    this.feedSection = page.locator("section#feed");
    this.rowA = page.locator("#rowA");
    this.rowB = page.locator("#rowB");
    this.feedCards = page.locator(".fcard");

    // Band
    this.bandCaption = page.locator(".band-cap p");

    // Taste match / Discover
    this.discoverSection = page.locator("section#discover");
    this.matchCard = page.locator(".match-card");

    // Groups
    this.groupsSection = page.locator("section#groups");
    this.groupCard = page.locator(".gcard");

    // Founding
    this.foundingSection = page.locator("#founding");

    // CTA
    this.ctaSection = page.locator("section.cta");
    this.ctaIn = page.locator(".cta-in");

    // Footer
    this.footer = page.locator("footer");
    this.footerPrivacyLink = this.footer.getByRole("link", { name: "Privacy" });
    this.footerTermsLink = this.footer.getByRole("link", { name: "Terms" });
    this.footerContactLink = this.footer.getByRole("link", {
      name: /contact@crumbify\.co\.uk/i,
    });
    this.footerDeleteAccountLink = this.footer.getByRole("link", {
      name: "Delete account",
    });
  }

  async goto() {
    await this.page.goto("/");
    await this.heroHeading.waitFor({ state: "visible", timeout: 15000 });
  }

  async openMobileMenu() {
    await this.burger.click();
    await expect(this.mobileNav).toHaveClass(/open/);
  }
}
