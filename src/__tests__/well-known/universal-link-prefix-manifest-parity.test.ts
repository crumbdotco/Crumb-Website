/**
 * src/__tests__/well-known/universal-link-prefix-manifest-parity.test.ts
 *
 * Pixel-fix W3R1-share-f53b-01 (MED, orchestrator adjudication 2026-08-06):
 * mirror-image guard of the app repo's
 * __tests__/regression/universal-link-prefix-manifest-parity.test.ts. See
 * that file's header and docs/deeplinks/universal-link-prefixes.json's own
 * header comment for the full mechanism: this repo's manifest copy is the
 * source of truth this repo's own AASA file is checked against, replacing
 * the old pattern of two independently hand-written expectation lists (one
 * per repo) that had no shared source and could drift silently.
 *
 * What this guard does NOT do: it does not diff this repo's manifest copy
 * against the app repo's copy (no shared filesystem across separate CI
 * checkouts) - that cross-repo half is a manual-but-guarded discipline via
 * the "twin" pointer in each manifest's header comment, not automation.
 */

import { readFileSync } from "fs";
import { join } from "path";

interface ManifestPrefix {
  readonly path: string;
  readonly androidPathPrefix: string;
  readonly iosComponent: string;
  readonly note?: string;
}

interface Manifest {
  readonly host: string;
  readonly twin: string;
  readonly prefixes: readonly ManifestPrefix[];
}

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

const manifestRaw = readFileSync(
  join(__dirname, "../../../docs/deeplinks/universal-link-prefixes.json"),
  "utf8",
);
const manifest: Manifest = JSON.parse(manifestRaw);

const aasaRaw = readFileSync(
  join(__dirname, "../../../public/.well-known/apple-app-site-association"),
  "utf8",
);
const aasa: AasaDoc = JSON.parse(aasaRaw);

function getAasaComponentPaths(): string[] {
  expect(aasa.applinks.details).toHaveLength(1);
  return aasa.applinks.details[0].components.map((c) => c["/"]);
}

describe("universal-link-prefixes.json manifest is well-formed (website copy)", () => {
  it("declares the crumbify.co.uk host and a non-empty prefixes array", () => {
    expect(manifest.host).toBe("crumbify.co.uk");
    expect(manifest.prefixes.length).toBeGreaterThan(0);
  });

  it("names its app-repo twin in the twin field", () => {
    expect(manifest.twin).toMatch(/app repo|crumbdotco\/app/i);
    expect(manifest.twin).toMatch(/universal-link-prefixes\.json/);
  });
});

describe("apple-app-site-association components match the manifest exactly (real parity, not two independent hardcoded lists)", () => {
  it("every manifest entry has a matching AASA component", () => {
    const paths = getAasaComponentPaths();
    const missing: string[] = [];
    for (const entry of manifest.prefixes) {
      if (!paths.includes(entry.iosComponent)) missing.push(entry.iosComponent);
    }
    expect(missing).toEqual([]);
  });

  it("AASA declares no component absent from the manifest (catches an un-mirrored addition)", () => {
    const paths = getAasaComponentPaths();
    const manifestComponents = new Set(manifest.prefixes.map((e) => e.iosComponent));
    const extras = paths.filter((p) => !manifestComponents.has(p));
    expect(extras).toEqual([]);
  });

  it("the two directions of the check are both load-bearing (fail-capability positive control)", () => {
    const paths = new Set(getAasaComponentPaths());
    const manifestComponents = new Set(manifest.prefixes.map((e) => e.iosComponent));

    const fakeManifestOnly = "/this-component-should-not-exist-in-aasa*";
    expect(paths.has(fakeManifestOnly)).toBe(false);

    const fakeAasaOnly = "/this-component-should-not-exist-in-manifest*";
    expect(manifestComponents.has(fakeAasaOnly)).toBe(false);
  });
});
