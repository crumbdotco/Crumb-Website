# HANDOFF — Crumb-Website (Crumbify marketing site)

## What this repo is
Marketing + legal site for the Crumbify app. **Next.js 16, app-router**, pages live in `src/app/`. Deployed on **Vercel**, repo `crumdotco/Crumb-Website` (verify exact remote), live at **https://crumbify.co.uk** on `main`.

Existing pages (`src/app/`): `page.tsx` (home), `privacy/`, `terms/`, `delete-account/`, `support/`, `founding-member/`, `admin/` (+ `admin/referrals/`), `referral/` (redirect route), plus `api/`.

> **2026-07-18 REBUILD (branch `feat/site-handoff-rebuild`):** the landing was rebuilt 1:1 from the approved design package `C:\Users\aliba\Downloads\SITE_HANDOFF` (cream editorial, live Leaflet hero map, marquee feed, parallax bands, redesigned #founding section). Deleted: old landing components, waitlist signup (hooks + POST/count APIs; the `waitlist` table + founding counter + Stripe webhook REMAIN), `/ref`, `/invite` (both 301 → `/`), Preloader, SmoothScroll provider, rate-limit lib. Added: `/referral?code=X` store-redirect with Supabase `referral_clicks` logging (table already applied to prod) + magic-link-gated `/admin/referrals` dashboard. Owner still to set in Vercel: `NEXT_PUBLIC_APP_STORE_URL`, `NEXT_PUBLIC_PLAY_STORE_URL`. See CLAUDE.md Structure + implementation-notes.md.

These URLs are used by the **app store listings** as legal/support links:
- Privacy: `https://crumbify.co.uk/privacy` (live) — NEEDS v0.8.14(2) deltas, see Task 1
- Delete account: `https://crumbify.co.uk/delete-account` (live) — NEEDS v0.8.14(2) copy update, see Task 2
- Support: `https://crumbify.co.uk/support` (live but NEEDS FIXES, see Task 3)

---

## ⚠ WHY THIS SESSION EXISTS (read first)
The app shipped **v0.8.14 build 2** (epics: **global feed** + **Food Soulmate** stranger messaging + **personalized ads** via AdMob/ATT). These add data collection (user photos, messages, ad device-ID tracking) that the **legal pages must reflect BEFORE build 2 is submitted to Apple + Google**. The store consoles' Data Safety / privacy-label changes are gated on these pages being accurate.

**Tasks 1-3 = legal pages (do in one session, then redeploy `main` to Vercel and tell the app session the URLs are verified):**
1. Privacy policy — add 3 paragraphs (photos / posts+messages / advertising).
2. `/delete-account` — update "what gets deleted" for posts/photos/messages.
3. `/support` — branding + factual + money-rule fixes (pre-existing blocker).

**Task 4 = product change (can be a separate session): Founding Member → "first 100" cap + close-at-sellout.** See Task 4 below. Owner-decided 2026-06-09: founding membership changes from "anyone who signs up before launch" to "the first 100 paying members"; when 100 are claimed, close the offer on the site, the Stripe link, AND in the app.

Source of truth for 1 & 2: app repo `app/docs/v0814-2-compliance-and-deploys.md` + `app/docs/website-handoff-delete-account.md`.

---

## ▶ TASK 1 — Privacy policy deltas (`src/app/privacy/page.tsx`)

Add these 3 paragraphs to the existing policy (plain hyphens only, no em/en dashes, no money/£ language):

1. **Photos** — "When you add a photo to a feed post or your profile, we store it and run automated safety screening (Google Vision SafeSearch) before it is shown."
2. **Social posts and messages** — "Posts you publish (with optional photo and note) and the one-time opener messages you send through Food Soulmate are stored so they can be shown to the intended audience. You can report or block content and users in the app."
3. **Advertising** — "We show ads via Google AdMob and, with your consent, use your device advertising identifier to personalize them. You can decline via the in-app consent prompt and (iOS) the App Tracking prompt."

Also sweep the page for stale "Crumb" → "Crumbify" branding while here.

---

## ▶ TASK 2 — `/delete-account` copy update (`src/app/delete-account/page.tsx`)

The "what gets deleted" list must now include the epic data. Full drop-in copy lives in app repo `app/docs/website-handoff-delete-account.md`. Key additions to the **What gets deleted** list:
- "Feed posts you created, their photos, likes, and comments"
- "Food Soulmate matches and the opener messages you sent or received"

And in the deletion-mechanics line: "Photos you uploaded (avatar and feed post photos) are deleted from storage as part of the same flow." (Backed by `delete-user` edge fn v10 which now removes `post-photos/{uid}/` + `avatars/{uid}.jpg`.)

Keep URL exactly `https://crumbify.co.uk/delete-account` (locked in Play Console Data Safety). Keep contact `admin@crumbify.co.uk`. Keep the Founding-Member-email-retained line (real behaviour, founder status keyed on email in `waitlist`, survives deletion).

---

## ▶ TASK 3 — fix `/support` page before using it as Apple App Store "Support URL"

The App Store Connect listing for Crumbify needs a Support URL that resolves to a page with accurate support/contact info. `src/app/support/page.tsx` already exists and is styled, but it has **stale branding, one factually wrong answer, and a content-rule violation**. Fix these, redeploy, then the Support URL `https://crumbify.co.uk/support` is good to submit.

### Fixes required in `src/app/support/page.tsx`

1. **Branding "Crumb" → "Crumbify"** (app was renamed). Occurrences:
   - L4 `title: "Support - Crumb"` → `"Support - Crumbify"`
   - L33 `"How does Crumb access my order history?"` → Crumbify
   - L34 `"Crumb connects..."` → Crumbify
   - L49 `"What's included in Crumb Plus?"` → premium is **"Crumbify Premium"** (RC products `crumbify_premium_monthly/annual`), not "Crumb Plus"

2. **🔴 FAQ Q1 is FACTUALLY WRONG — rewrite.** Current (L33-34) claims:
   > "Crumbify connects to your delivery accounts (Uber Eats, Just Eat) through their official APIs using OAuth 2.0."
   This is FALSE. The app does **NOT** use delivery-platform APIs/OAuth for order import. It uses **OCR / screenshot import** (the app reads screenshots of your order history; see app repo `services/ocr/` + `services/sync/`). OAuth in the app is only for **sign-in** (Google/Apple), not order data. Rewrite to describe the real flow, e.g.:
   > "Crumbify reads your order history from screenshots you import. You stay in control of what you share. We never ask for your delivery-account password and never connect to those accounts directly."
   Also fix the related "How do I disconnect a platform?" answer (L45-46) which references a "Connected Platforms" OAuth model that does not match OCR import. Reword to match the real app (e.g. removing imported data in-app), or confirm against the current app before rewording.

3. **🔴 MONEY-RULE VIOLATION — L49-50.** Current: `"Crumbify Premium unlocks spending analytics, ..."`. The app has a HARD RULE: **no money/spend displays anywhere**. "Spending analytics" must be removed. Rewrite premium features to match what the app actually gates — check the app repo `components/premium/comparison-features.ts` for the real premium feature list and mirror it, with **zero money/£/spend language**. Likely: extra stats, deeper friend comparisons, ad-free, etc.

4. **Verify platform list (L41-42).** Says "Uber Eats and Just Eat... Deliveroo coming soon." The app already has a Deliveroo OCR parser (`services/ocr/parsers/deliveroo.ts`) — confirm whether Deliveroo is live and update the copy accordingly.

5. **Contact details (already OK, just confirm):** `contact@crumbify.co.uk` (L75/95) and `https://x.com/crumbifyco` (@crumbifyco, L100/120). Make sure `contact@crumbify.co.uk` is a monitored inbox. (Store review contact uses `appreview@crumbify.co.uk`, separate.)

### After fixing
- `npm run build` to confirm no errors, then deploy to Vercel (`main`).
- Open `https://crumbify.co.uk/support` and confirm it loads + reads correctly.
- Tell the app-repo session the Support URL is verified so it can be locked into App Store Connect.

### Design rules (app-wide, apply here too)
- No letter-spacing > 0, no em/en dashes (use plain hyphens), no spaced caps. (`tracking-tight` = negative tracking, allowed.)
- No money/spend/£ amounts anywhere in copy.

---

## ▶ TASK 4 — Founding Member: "first 100" cap + close-at-sellout

**Goal:** founding membership = the **first 100 paying members** (not "anyone before launch"). When 100 spots are claimed, close the offer everywhere: the founding-member CTA, the Stripe payment link, and the in-app founder option.

**Mechanism (mostly already built):** a founding member = a `public.waitlist` row with `tier='founding_member'` (+ `stripe_payment_id`, `created_at`). Created by `src/app/api/stripe/webhook/route.ts` on `checkout.session.completed` / `payment_intent.succeeded`, upserting `onConflict: 'email'` → **already deduped, one spot per email** (no double-spending). "First 100" = ordered by `created_at`; `remaining = max(0, 100 - count(tier='founding_member'))`; `closed = count >= 100`.

### 4a. Count endpoint — filter by tier
`src/app/api/waitlist/count/route.ts` currently counts **ALL** waitlist rows (`select * count exact head`), not just founders. Change it (or add `api/waitlist/founding/route.ts`) to count `where tier = 'founding_member'` and return `{ count, remaining, closed }`. (First confirm whether `waitlist` holds non-founding tiers — the webhook only ever writes `founding_member`, but a separate signup form might add others; filter by tier to be safe.)

### 4b. Close the Stripe link at 100 — THE core new logic (authoritative cutoff)
In `src/app/api/stripe/webhook/route.ts`, AFTER the successful `waitlist` upsert, count founders and deactivate the payment link at the cap:
```ts
const { count } = await getSupabase()
  .from('waitlist').select('*', { count: 'exact', head: true })
  .eq('tier', 'founding_member');
if ((count ?? 0) >= 100) {
  await getStripe().paymentLinks.update(process.env.STRIPE_FOUNDING_PAYMENT_LINK_ID!, { active: false });
}
```
Idempotent (safe to call when already inactive). Add `STRIPE_FOUNDING_PAYMENT_LINK_ID` to Vercel env.

### 4c. Live counter + checkout guard (founding-member CTA)
Wherever the "Become a Founding Member" button + Stripe link render (home `src/app/page.tsx` and/or a founding page), read 4a: show "X / 100 founding spots claimed", and when `closed` swap the buy button for a "Founding membership is now closed" state. (Client guard is UX only; 4b is the real enforcement.)

### 4d. Overshoot policy — DECIDE
Concurrent buyers near the boundary can overshoot (101-103) because 4b's count-check is not atomic with the charge. Options:
- **Recommended (simplest + hard):** set the **Stripe Payment Link's built-in usage limit to 100** (`restrictions.completed_sessions.limit = 100` on the link, or toggle in the Stripe dashboard). Stripe then refuses the 101st checkout itself — no race — and 4b becomes belt-and-suspenders.
- Accept tiny overshoot (close as soon as count >= 100); 102 founders is harmless.
- Strict in-DB: a counter row with a CHECK / `select ... for update` transaction in the webhook.
- Refunds: treat 100 = successful, non-refunded payments (ignore for v1).

### 4e. App side — hide the founder option when sold out (Crumbify APP repo, separate session)
Once founding membership is `closed`, the app should stop offering the founder entry point to non-founders:
- Gate visibility of `components/account/AccountSettings.tsx` "Restore Founding Member" row + `components/account/FounderClaimPrompt.tsx` on an "open" signal.
- **NUANCE / owner decision:** KEEP the actual OTP claim flow (`claim-founder` edge fn) reachable for a legitimate founder who PAID but whose premium did not auto-detect (Apple Hide-My-Email relay case) — the OTP is secure (only a real `waitlist` email passes), so hiding is a UX/marketing choice, not security. Safest = hide the prominent "Restore Founding Member" CTA when sold out but keep the claim path accessible (less-prominent link, or a short grace window after sellout). Do NOT hard-remove the claim path at "100 created" or you can lock out a paid founder who hasn't opened the app yet.

### 4f. Supabase shared signal (app repo)
Add an RPC `founding_spots_remaining()` / `founding_open()` returning `100 - count(tier='founding_member')` (granted to `anon`+`authenticated`, or expose via the count endpoint) so the website (4c) and app (4e) read ONE source of truth.

**Decisions for the owner:** (1) overshoot = Stripe usage-limit-100 (recommended) vs simple-close; (2) app = hide-prompt-only vs fully-remove when sold out; (3) the cap number (100 confirmed).

---

## ▶ TASK 5 — Name Crumbify LTD as legal entity / data controller (legal pages + footer)

**Context:** The business is now incorporated as **Crumbify LTD** (UK Ltd). The legal pages currently read as an individual operator. They must now identify **Crumbify LTD** as the company behind the app and the **data controller**. This is a legal requirement (UK GDPR controller identity) AND is reviewed by Apple/Google. Do this BEFORE the org-account transition completes so store-listing legal links are consistent with the new entity.

**Inputs needed (fill in — do NOT guess):**
- `COMPANY_NUMBER` = `17288992` (Companies House registration number for Crumbify LTD)
- `REGISTERED_OFFICE` = `60 Millmead Business Centre, Millmead Road, London, United Kingdom, N17 9QU`

### 5a. Privacy policy (`src/app/privacy/page.tsx`)
- Add / update the **data controller** identity near the top:
  > "Crumbify is operated by Crumbify LTD, a company registered in England and Wales (company number `COMPANY_NUMBER`), registered office `REGISTERED_OFFICE`. Crumbify LTD is the data controller for personal data processed through the Crumbify app and this website."
- Ensure the contact line points to `support@crumbify.co.uk` (per email policy) for data/privacy requests.
- (UK GDPR note: ICO data-protection registration is a separate owner admin action, not a page change.)

### 5b. Terms of service (`src/app/terms/page.tsx`)
- Replace any individual-operator phrasing with **Crumbify LTD**.
- Add a company-identity clause: legal name **Crumbify LTD**, company number `COMPANY_NUMBER`, registered office `REGISTERED_OFFICE`, governing law England and Wales.
- "These terms are between you and Crumbify LTD."

### 5c. Footer (`src/components/landing/` footer + `src/components/legal/` shells)
- Add a small copyright line naming the entity: `© <year> Crumbify LTD`. (Plain hyphen / no em dash, no spaced caps — honour the HARD design rules.)
- Sweep `delete-account/` + `support/` for any "operated by" / individual phrasing and align to Crumbify LTD.

### Design + content rules (apply here too)
- No money/£/spend language; no em/en dashes (plain hyphens); no letter-spacing > 0 / spaced caps.
- Do NOT change locked external strings (emails, delete URL, X handle) — Task 5 is entity identity only.

### After fixing
- `npm run build` to confirm no errors, then deploy `main` to Vercel.
- Confirm `/privacy` + `/terms` render the Crumbify LTD identity correctly.

---

## Notes
- Same warm cream/brown palette as the app (`crumb-cream`, `crumb-brown`, `crumb-dark`, `crumb-card`, `crumb-line`, `crumb-muted` Tailwind tokens).
- Other legal pages (`privacy`, `terms`, `delete-account`) may also still say "Crumb" instead of "Crumbify" — worth a sweep while you're in here, but the Support page is the blocker for the store submission.
- **Org transition (2026-06-20):** Individual→Organization migration underway for Apple Dev + Google Play under **Crumbify LTD**; DUNS requested, awaiting issuance. Task 5 (entity identity on legal pages) should ship alongside so store legal links match the new org seller name.
