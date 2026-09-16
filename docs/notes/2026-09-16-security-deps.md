# 2026-09-16 security dependency bump + app-ads.txt

Closes every open Dependabot alert on this repo as of 2026-09-16 (alerts 47, 48, 50, 52, 54, 55, 56, 57, 58, 59, 60).
Lane: Codex gpt-5.6-luna edited package.json and wrote app-ads.txt; its sandbox had no npm registry access
(EACCES), so the orchestrator ran `npm install` and `npm update js-yaml nanoid browserslist
baseline-browser-mapping @humanfs/node` from a normal shell. The test typing fix below was a second luna unit.

## Versions (measured with `npm ls` after the install, not copied from the brief)

| Package | Scope | Before | After | Alert needed |
|---|---|---:|---:|---:|
| next | runtime | 16.2.11 | 16.3.5 | >= 16.3.3 (57, 58 CRITICAL) |
| eslint-config-next | dev | 16.1.6 | 16.3.3 | matches next minor |
| sharp | dev + override | 0.35.3 | 0.35.4 | >= 0.35.4 (56) |
| js-yaml (4.x, top level) | dev | 4.3.0 | 4.3.2 | >= 4.3.2 (48, 60) |
| js-yaml (3.x, under @istanbuljs/load-nyc-config) | dev | 3.15.0 | 3.15.2 | >= 3.15.2 (47, 59) |
| nanoid | runtime | 3.3.16 | 3.3.19 | >= 3.3.18 (50) |
| browserslist | dev | 4.28.1 | 4.29.0 | >= 4.28.7 (54) |
| baseline-browser-mapping | runtime | 2.10.0 | 2.11.24 | >= 2.11.0 (55) |
| @humanfs/node | dev | 0.16.7 | 0.16.8 | >= 0.16.8 (52) |

No `overrides` entry was needed beyond raising the existing `sharp` override; every transitive target was
reachable through the existing ranges with `npm update`. The lockfile was rewritten by npm in place, never
regenerated: 0 package keys removed, 1 added (`@humanfs/types`), platform families unchanged
(`@img/sharp-*` 26 -> 26, `@next/swc-*` 8 -> 8, `lightningcss-*` 11 -> 11), and the three linux keys Vercel
needs are each present exactly once (`@img/sharp-linux-x64`, `@next/swc-linux-x64-gnu`,
`lightningcss-linux-x64-gnu`).

## Follow-on fix

`next build` on 16.3.5 type-checks `src/__tests__` and reported TS2493 seven times in
`src/__tests__/api/stripe-webhook-refund.test.ts`: `mockDeleteEq` was declared as a zero-parameter
`jest.fn(() => ...)`, so `mock.calls` was typed `[][]` and the `([col]) =>` destructures could not compile.
The mock now declares the `(column: string, value: string)` signature the production code calls it with.
Assertions unchanged; 13 tests before and after.

## app-ads.txt

`public/app-ads.txt` = `google.com, pub-4316214440317682, DIRECT, f08c47fec0942fa0` (one line, trailing
newline). Served at `/app-ads.txt` as `text/plain; charset=UTF-8`, HTTP 200, verified by curl against a local
server. AdMob crawls it from the store listing's developer website once the listing exists.

## Gates (run by the orchestrator after the install)

- `npx tsc --noEmit -p tsconfig.json`: 0 errors
- `npm test`: 33 suites, 504 tests passed
- `npm run build`: compiled, type check passed, full route table printed (Next.js 16.3.5, Turbopack)
- `npm run lint`: 4 errors, all pre-existing on main in files this change does not touch
  (`__mocks__/framer-motion.js` require import, `src/__tests__/middleware.test.ts` require import and `any`,
  `src/components/legal/BackLink.tsx` raw `<a href="/">`); 128 further errors came from stale untracked
  `.claude/worktrees/wf_*` build folders, which were removed (no junctions, no git metadata, older than main).

## Noted, not done

- Next 16.3 prints a deprecation for the `middleware` file convention ("use proxy instead",
  `npx @next/codemod@canary middleware-to-proxy .`). Works as before; migrate in its own change.
