# Spec: `/ref` referral landing page

Status: ready to pick up. Owner of app-side contract: `../app`. This doc is the single
source of truth for building the page. Read it fully before touching code — there are
existing mismatches you must reconcile, not just a blank page to fill.

---

## 1. Goal (one line)

A public landing at `https://crumbify.co.uk/ref?u=<username>` that takes someone who
tapped a friend's invite link and gets them into the Crumbify app, with the referrer's
username carried through so the app can auto-open "add friend" pre-filled with it.

---

## 2. The contract (and the three mismatches to fix first)

The app already has both ends of the referral wired, but the pieces disagree on the param
name, and a stale website page disagrees on everything. Before building, **standardise on
the canonical contract below**, then fix the outliers.

### Canonical contract (target state)

| Thing | Value |
|-------|-------|
| Web route | `https://crumbify.co.uk/ref` |
| Query param | `?u=<username>` (URL-encoded with `encodeURIComponent`) |
| App custom scheme | `crumbify://` |
| App deep link | `crumbify://ref?u=<username>` |
| Android package | `com.crumbify.app` |
| iOS bundle | `com.crumbify.app` (App Store URL not live yet — see §6) |

### Mismatch 1 — the app shares `?u=` but listens for `?ref=` (app bug)

- Outbound (correct): `app/utils/referral-link.ts:23-25` builds `…/ref?u=<encoded-username>`.
- Inbound (wrong): `app/app/_layout.tsx:720-736` reads `parsed.queryParams?.ref` and validates
  `^[A-Za-z0-9-]{3,32}$`, then calls `setPendingReferral`.

So a link the app itself generates would **not** be picked up by the app, because the
handler looks for `ref`, not `u`. **App-side fix required** (one of the two must change).
Recommendation: keep `?u=` (it is the documented canonical in `referral-link.ts` and the
app HANDOFF), and change the inbound handler in `_layout.tsx` to read `queryParams?.u`.
This is an app-repo change, not website — flag it back to the app session. Do not silently
build the website around `?ref=`.

### Mismatch 2 — a stale `/invite` page exists and contradicts the app

`src/app/invite/InviteClient.tsx` already exists and is wrong on nearly every axis:
- Wrong route (`/invite`, not `/ref`).
- Reads `?ref=` as a code (`^[A-Z0-9]{4,12}$`), not `?u=` as a username.
- Persists `crumb_referral_code` to **localStorage**, which the app **never reads** (the app
  ingests the referral via deep link in `_layout.tsx`, not from web storage). That whole
  mechanism is dead.
- Promises "7 days of Premium" — not what the app does (see §3, the follow-friend reality).
- Stale `Crumb` branding, `com.crumb.app`, light `#E0D5C9` theme, a TestFlight placeholder.
- Violates design rules: `tracking-wider uppercase` spaced-caps badge + an em dash in copy.

**Decision needed:** either (a) repurpose `/invite` into `/ref` (rename + rewrite), or
(b) build `/ref` fresh and delete `/invite`. Recommendation: **build `/ref` fresh, delete
`/invite`** — almost nothing in the current file survives, and keeping a dead route invites
confusion. If any external material has already shared `/invite?ref=…`, add a redirect from
`/invite` → `/ref` preserving the param (renamed `ref`→`u`).

### Mismatch 3 — localStorage does nothing

Re-stated because it is the most tempting trap: **the app cannot read the website's
localStorage.** The only channels that reach the app are (1) a deep link that opens the app,
or (2) a deferred-deep-link service. Do not "store the ref and hope." See §5.

---

## 3. Product decision: what a referral actually does

As built, the app's referral is a **follow-a-friend** flow, not a reward:
`pendingReferral` is consumed by `app/app/friends/index.tsx:47-55`, which pre-fills the
add-friend search with the referrer's username and opens the add-friend modal. There is
**no premium credit** on this path. (A `grant-referral-premium` edge function was scaffolded
but is **not deployed** — see app memory `feedback-failclosed-secret-deploy`.)

**Therefore copy must NOT promise Premium / rewards** unless the owner decides to fund that
as a separate app + backend workstream. Default the page to the honest "find and follow your
friend on Crumbify" framing.

> OPEN DECISION (owner): keep follow-friend only, or invest in a real referral reward
> (requires: deploy `grant-referral-premium`, attribution storage, anti-abuse). Until that
> ships, no reward language on the page.

---

## 4. Page behaviour

1. **Parse `?u=`.** Read the username param. Trim. Treat missing/empty as the no-referrer
   case (still a valid "get the app" page, just without the personalised line).
2. **Validate** against the app's accepted charset. The app inbound regex is currently
   `^[A-Za-z0-9-]{3,32}$` — confirm this matches the real username rules in the app's
   `UsernameStep` validation and use the stricter of the two. If invalid, render the page
   without the personalised line and without attempting attribution (do not pass junk to the
   app).
3. **Detect platform** (iOS / Android / desktop) from user agent.
4. **Attempt to open the app if installed**, then fall back to the store:
   - Fire the deep link `crumbify://ref?u=<encoded-username>`.
   - After a short timeout (~1.2s) with no app, redirect to the platform store (§6).
   - Prefer Universal Links / App Links if configured (§5) so the plain `https` link opens
     the app directly without a scheme prompt; the custom-scheme fire is the fallback.
5. **Desktop:** no auto-redirect. Show store badges + a "open this on your phone" hint and
   (optional) a QR code of the same `/ref?u=` URL.
6. **Always render a usable landing** even if every redirect fails.

---

## 5. Attribution across a fresh install (the real engineering decision)

If the visitor already has the app, a Universal Link / App Link (or the custom-scheme
fallback) opens it with the param intact — done.

If the visitor does **not** have the app, they go to the store, install, and open a cold app
that has **no idea** about `?u=`. The param is lost. Options, pick one:

- **A. Accept the gap (cheapest).** Referral only works for people who already have the app
  installed. Fresh installs are not attributed. Ship this first; revisit if referral matters.
- **B. Deferred deep linking (Branch / Firebase Dynamic Links / Adjust).** Survives the
  store round-trip and delivers `u` on first open. Requires SDK + app changes + a service
  account. Real scope, not a website-only task.
- **C. Lightweight clipboard / paste-on-first-run.** Fragile, iOS paste-permission prompts,
  not recommended.

Recommendation: **ship A now**, log B as a follow-up. Whatever is chosen, say so at the top
of the implementation PR so the app side knows whether to expect deferred params.

### If using Universal Links / App Links (recommended for installed-app UX)

- iOS: host `/.well-known/apple-app-site-association` (no extension, `application/json`,
  served at the apex) listing the `com.crumbify.app` app ID and the `/ref` path; app needs
  the Associated Domains entitlement `applinks:crumbify.co.uk`.
- Android: host `/.well-known/assetlinks.json` with the `com.crumbify.app` package +
  signing-cert SHA-256; app manifest needs the `/ref` intent filter with
  `android:autoVerify="true"`.
- Both are **app-repo + domain config** changes. If not in scope for this pass, the page
  still works via the custom-scheme fallback (with a one-tap scheme prompt). Note it.

---

## 6. Store + scheme constants

```
PLAY_STORE_URL = https://play.google.com/store/apps/details?id=com.crumbify.app
APP_STORE_URL  = (not live yet)  ->  placeholder until the App Store listing exists.
                 Use the TestFlight public link OR a "coming soon to iPhone" state.
                 Do NOT hardcode a guessed apps.apple.com id.
APP_SCHEME     = crumbify://
DEEP_LINK      = crumbify://ref?u=<encodeURIComponent(username)>
```

Mark the App Store URL with a `SWAP-SLOT` comment so it is easy to find when the listing
goes live.

---

## 7. Design + copy (must follow the hard rules)

Match the current dark cocoa site (see website `CLAUDE.md`), not the old light `/invite`
card. Tokens: bg `#1A1208`, surfaces `#241712` / `#2E1E14`, text `#F4ECDF` / `#C4B09A`,
single gold accent `#E6C39B` / `#C9A077`. Fonts Fredoka (display) + Nunito (body).

Hard rules (enforced — the old `/invite` breaks several):
- **No money / spend / £ figures.** None.
- **No letter-spacing > 0.** No `uppercase tracking-[Npx]`, no spaced caps, no spaced pill
  labels. (`tracking-tight` is fine.)
- **No em (—) or en (–) dashes** in any copy. Commas, colons, or plain hyphens only.
- **No decorative `·` separator dots, no spotlight/glow animations.** Allowed: fade, scale,
  translate, opacity, spring, color, particle float, crossfade.
- Reuse `LedgeButton` (Duolingo-sink pressable) from `src/components/landing/` for the CTAs
  rather than a bare `<a>`.

Suggested copy (rule-compliant, follow-friend framing — adjust to taste):
- Eyebrow: `Your friend invited you` (sentence case, no tracking).
- Heading (with referrer): `Join {username} on Crumbify`
- Heading (no referrer): `Join Crumbify`
- Body: `Crumbify turns your takeaway history into your food stats: top spots, cuisines,
  your food personality, and a yearly Wrapped. Install the app to find {username} and start
  yours.`
- Personalised note (only if `u` valid): `We will help you find {username} as soon as you
  sign in.`
- CTAs: `Get it on iPhone` / `Get it on Android` (or a single primary that deep-links then
  falls back).
- Desktop hint: `Open this link on your phone for the fastest install.`

Do not claim it connects to delivery APIs/OAuth (it is OCR + manual entry). Do not promise
Premium (see §3).

---

## 8. Edge cases

- No `u` param → generic install page, no personalised line, no attribution attempt.
- Invalid `u` (fails charset) → treat as no `u`.
- Private mode / SSR → page must still render; never throw on storage access.
- Very long / encoded username → render decoded for display, keep encoded in the deep link.
- App not installed, custom-scheme fire → must not hang; timeout to store.

---

## 9. Acceptance criteria

- [ ] Route is `/ref`, reads `?u=`, on the dark cocoa theme, passes all design rules.
- [ ] iOS visitor with app installed: tapping the link (or auto-deeplink) opens the app and,
      after sign-in, the add-friend modal is pre-filled with the referrer username.
- [ ] iOS/Android visitor without app: lands on the page, then routes to the correct store
      (App Store placeholder handled gracefully).
- [ ] Desktop visitor: no auto-redirect, store badges + phone hint (optional QR).
- [ ] No `u` / invalid `u`: still a clean install page.
- [ ] `/invite` is deleted or 301-redirects to `/ref` (param renamed `ref`->`u`).
- [ ] `npm run build` + lint + tests green. Add a Playwright test covering: valid `u`
      renders personalised heading; missing `u` renders generic; invalid `u` is ignored.
- [ ] App-side mismatch (Mismatch 1) is filed back to the app session — page is built to the
      canonical `?u=` contract regardless.

---

## 10. Open decisions for the owner (resolve before / during build)

1. **Param name:** confirm canonical `?u=` and fix the app inbound handler `ref`->`u`
   (recommended), or instead change the share builder to `?ref=`. Pick one.
2. **Attribution depth:** §5 option A (installed-only, ship now) vs B (deferred deep linking,
   later). Recommendation: A now.
3. **Universal Links / App Links:** configure now (better installed-app UX, needs app +
   `.well-known` files) or rely on custom-scheme fallback for v1.
4. **Reward vs follow-only:** keep follow-friend (no reward language), confirmed default.

---

## 11. References

App repo (`../app`):
- `utils/referral-link.ts` — canonical URL format + share sheet (outbound).
- `app/_layout.tsx:720-736` — inbound deep-link handler (currently reads `ref`, the bug).
- `app/friends/index.tsx:47-55` — consumes `pendingReferral` (follow-friend behaviour).
- `stores/auth-store.ts:92,220,321-322` — `pendingReferral` state + setter.
- `docs/security-review-2026-06-09.md:47` — username-enumeration note on referral lookup
  (move lookups behind a rate-limited RPC; relevant if attribution is hardened later).

Website repo (this repo):
- `src/app/invite/InviteClient.tsx` — the stale page to retire/redirect.
- `src/components/landing/` — `LedgeButton`, tokens, particles to reuse.
- `CLAUDE.md` — brand, theme, hard design rules, email policy.

Build note: per repo convention the orchestrator does not hand-author `.ts/.tsx`; delegate
the page + test implementation to `tdd-guide @ sonnet`. This doc is the brief.
