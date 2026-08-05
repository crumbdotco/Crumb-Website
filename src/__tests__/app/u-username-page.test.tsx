/**
 * src/__tests__/app/u-username-page.test.tsx
 *
 * Pixel-fix F-53 fix-round r1, F53-R4: the /u/[username] page's
 * USERNAME_PATTERN must accept both real username shapes the app can
 * resolve - a claimed handle (3-30 lowercase letters/digits/underscore) AND
 * the `handle_new_user` trigger's default `user-<32hex>` handle for a
 * profile that never completed username claim (supabase/migrations/
 * 014_fix_profile_trigger.sql:35) - and reject a malformed/pathological
 * segment. Without this widening, a share link built from an unclaimed
 * profile's default username 404s on the website even though the app-side
 * resolver (services/supabase/resolve-username.ts, app repo) resolves it
 * fine - this test fails on the narrower `/^[a-z0-9_]{3,30}$/`-only pattern.
 */

import { render, screen } from "@testing-library/react";
import ProfileSharePage, { generateMetadata } from "@/app/u/[username]/page";

const TRIGGER_DEFAULT_USERNAME = `user-${"a1b2c3d4e5f6".repeat(3).slice(0, 32)}`;

describe("ProfileSharePage username validation (F53-R4)", () => {
  it("renders the profile-share landing for a claimed-username shape", async () => {
    const element = await ProfileSharePage({
      params: Promise.resolve({ username: "alibars" }),
    });
    render(element);
    expect(screen.getByRole("heading", { name: "@alibars" })).toBeInTheDocument();
  });

  it("renders the profile-share landing for the trigger-generated default username shape (user-<32hex>) - NOT 'Profile not found'", async () => {
    const element = await ProfileSharePage({
      params: Promise.resolve({ username: TRIGGER_DEFAULT_USERNAME }),
    });
    render(element);
    expect(
      screen.getByRole("heading", { name: `@${TRIGGER_DEFAULT_USERNAME}` }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Profile not found")).not.toBeInTheDocument();
  });

  it('renders "Profile not found" for a malformed/pathological username (too short)', async () => {
    const element = await ProfileSharePage({ params: Promise.resolve({ username: "a" }) });
    render(element);
    expect(screen.getByText("Profile not found")).toBeInTheDocument();
  });

  it('renders "Profile not found" for a username containing disallowed characters', async () => {
    const element = await ProfileSharePage({
      params: Promise.resolve({ username: "../../etc" }),
    });
    render(element);
    expect(screen.getByText("Profile not found")).toBeInTheDocument();
  });

  it("does NOT accept a 'user-' prefixed value that is not exactly 32 lowercase-hex characters (still rejects genuinely malformed input)", async () => {
    const element = await ProfileSharePage({
      params: Promise.resolve({ username: "user-tooshort" }),
    });
    render(element);
    expect(screen.getByText("Profile not found")).toBeInTheDocument();
  });
});

describe("generateMetadata username validation (F53-R4)", () => {
  it("titles a claimed-shape username with an @handle", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ username: "alibars" }),
    });
    expect(metadata.title).toBe("@alibars on Crumbify");
  });

  it("titles a trigger-default-shape username with an @handle too", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ username: TRIGGER_DEFAULT_USERNAME }),
    });
    expect(metadata.title).toBe(`@${TRIGGER_DEFAULT_USERNAME} on Crumbify`);
  });

  it("falls back to a generic title for a malformed username", () => {
    return generateMetadata({ params: Promise.resolve({ username: "a" }) }).then((metadata) => {
      expect(metadata.title).toBe("Crumbify profile");
    });
  });
});
