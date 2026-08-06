/**
 * src/__tests__/well-known/apple-app-site-association.test.ts
 *
 * Pixel-fix F-53b (owner directive 2026-08-06): public/.well-known/
 * apple-app-site-association is the iOS-side equivalent of the app repo's
 * app.json Android intentFilters - it is what Apple actually verifies
 * against when deciding which paths open the app as a Universal Link
 * (unlike Android, iOS's `associatedDomains: ["applinks:crumbify.co.uk"]` in
 * the app's app.json is whole-domain; the PATH allow-list lives here, on the
 * website, not in the app repo). Adding a new share surface's Android
 * intent-filter prefix without ALSO adding its AASA `components` entry
 * silently leaves iOS Universal Links broken for that surface while Android
 * works - this static-analysis guard (readFileSync + JSON.parse, per
 * testing-and-gates.md's static-analysis-test pattern, app repo) catches
 * that class of gap.
 */

import { readFileSync } from "fs";
import { join } from "path";

interface AasaComponent {
  readonly "/": string;
  readonly comment?: string;
}

interface AasaDoc {
  readonly applinks: {
    readonly apps: readonly unknown[];
    readonly details: ReadonlyArray<{
      readonly appIDs: readonly string[];
      readonly components: readonly AasaComponent[];
    }>;
  };
}

const raw = readFileSync(
  join(__dirname, "../../../public/.well-known/apple-app-site-association"),
  "utf8",
);
const doc: AasaDoc = JSON.parse(raw);

describe("apple-app-site-association", () => {
  it("parses as valid JSON with the expected top-level shape", () => {
    expect(doc.applinks).toBeDefined();
    expect(doc.applinks.details).toHaveLength(1);
  });

  it("declares the correct app id (KB942C4R47.com.crumbify.app)", () => {
    expect(doc.applinks.details[0].appIDs).toEqual(["KB942C4R47.com.crumbify.app"]);
  });

  it("still declares the pre-existing /invite* and /u/* components (not regressed)", () => {
    const paths = doc.applinks.details[0].components.map((c) => c["/"]);
    expect(paths).toContain("/invite*");
    expect(paths).toContain("/u/*");
  });

  // Pixel-fix F-53b (wave-3 sweep): every new share surface's Android
  // pathPrefix (app repo app.json) needs a matching AASA component here or
  // iOS Universal Links silently 404 through Safari instead of opening the
  // app, even though Android works fine.
  it.each(["/review/*", "/post/*", "/place/*"])(
    "declares the %s component (F-53b wave-3 sweep)",
    (path) => {
      const paths = doc.applinks.details[0].components.map((c) => c["/"]);
      expect(paths).toContain(path);
    },
  );

  it("every component ends in a wildcard (never a bare exact-path match that would miss the dynamic id segment)", () => {
    for (const component of doc.applinks.details[0].components) {
      expect(component["/"]).toMatch(/\*$/);
    }
  });

  it("apps array stays empty (no native iOS app should claim these links besides the associated domain app)", () => {
    expect(doc.applinks.apps).toEqual([]);
  });
});
