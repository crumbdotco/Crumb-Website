# Crumbify Website Redesign - Design Handoff Brief

> Paste-ready brief for designing the new crumbify.co.uk landing in Claude Design (or any design tool).
> Written 2026-07-16 from the vibe-interview session. The build session will implement whatever
> design comes back from this, in Next.js, pixel-faithfully.

---

## THE PROMPT (copy everything below this line)

Design a complete marketing landing page for **Crumbify**, a social food app. Desktop and mobile.

### What Crumbify is (this is the current truth, the old positioning is dead)

Crumbify is a **feed-first social food app** for the UK, launching **London-first**, audience 18-25 (students, young professionals). It is NOT a food delivery stats tracker (old positioning, do not use).

The core loop: **post the places you eat -> friends react and comment -> discover new spots through friends and taste-matched discovery -> save to Want-to-Try -> go, rate it out of 10, post.**

Real features you can show or reference:
- Social feed of friends' restaurant posts (photo, score like 8.7 out of 10, one-line take, reactions, comments)
- Been-To and Want-to-Try lists (your personal food memory)
- Taste-match % between friends (e.g. "You and Priya: 87% match")
- Discover: a map + TikTok-style scroll of restaurants ranked to your taste
- Groups: shared want-to-try lists with friends, group themes, trips
- Collections on your profile
- Monthly challenge, achievements, food personality
- Premium exists ("Crumbify Premium": ad-free, Monthly Wrapped recap, deeper taste insights) but pricing does NOT appear on the landing page

NEVER show or mention: Food Soulmate, screenshot/OCR import, connecting to Uber Eats / Just Eat / Deliveroo accounts or APIs, money/spend/£ figures of any kind (scores and counts only), yearly Wrapped as a headline feature.

### Brand starting point (evolve it if the design wants, but stay warm)

- Name: **Crumbify**. Tagline: **"Every bite tells a story."**
- Mark: a round cookie with a bite / crumb identity.
- Palette seeds: warm cream `#E0D5C9`, dark brown `#1A1208`, warm gold `#E6C39B` and deeper gold `#C9A077`. The owner is open to a light-cream-first site (the current live site is dark cocoa; continuity is not required).
- Type seeds: Fredoka (display, rounded, friendly) + Nunito (body). Open to evolution.

### The vibe (from the owner's reference interview)

- The mix of **Corner (corner.inc)** energy - alive, gen-z, real user content as the hero, culturally in - with **Beli / Airbnb** warmth and legibility. Playful but not chaotic, clean but not corporate.
- Explicitly rejected: dark tech-minimalism (Linear), mascot-led illustration branding (Duolingo), dark cinematic editorial (Letterboxd).

### HARD layout requirement (the reason this brief exists)

The owner rejected four mocks because they all defaulted to **"headline on the left, app content on the right"**. That hero skeleton is BANNED. The landing must have a genuinely unique structure. Provocations to riff on or beat (not a menu, just seeds):
- The page IS the feed: you land inside a full-bleed scrolling wall of friend posts and the pitch happens on top of / between them
- A London map as the entire hero, with real spots and friend scores pinned on it, the headline set into the map
- A table-top scene shot from above: plates, receipts, phones as the layout grid
- A story scroll: one continuous narrative ("Friday, 7pm, where do we eat?") told screen by screen
- A giant single word/wordmark hero where the letterforms are filled with feed content
Anything works as long as it could not be mistaken for a template SaaS page.

### Content the page must cover (order and framing are yours)

1. Hero with ONE primary CTA: **"Get early access"** (email waitlist; the app is in TestFlight, not yet on the App Store)
2. What it is / how it works (post -> friends see it -> discover -> save -> go)
3. The social proof surface: realistic friend-post content (use the mock data below)
4. Taste-matched discovery (the map/scroll + taste match %)
5. Groups (deciding where to eat together)
6. The London angle ("Starting in London" is a feature, not a limitation - neighbourhood names are welcome: Soho, Shoreditch, Peckham, Brixton, Camden)
7. Footer: Privacy, Terms, Support, Delete Account links, X @crumbifyco, contact@crumbify.co.uk, © Crumbify LTD

### Mock data pack (use this, keep it London-real)

Restaurants: Dishoom (Shoreditch), Tayyabs (Whitechapel), Padella (Borough), Bao (Soho), Franco Manca (Brixton), Bancone (Covent Garden), Normah's (Bayswater), C&R Cafe (Chinatown).
Friends: Amara, Josh, Priya, Tomi, Ellie, Sam.
Scores: 8.7, 9.1, 8.3, 8.9 (always x.x out of 10).
Takes: "the black daal is not optional", "queued 40 mins, worth every one", "the bun still lives in my head", "lamb chops, bring cash for the wait".
Taste match: "You and Priya: 87% match".

### Hard style rules (non-negotiable, they are house law)

- NO letter-spacing above 0, no spaced-out caps, no uppercase+tracking labels
- NO em dashes (—) or en dashes (–) anywhere in copy; use commas, colons, or hyphens
- NO money/£/spend figures anywhere
- NO glow rings, spotlight sweeps, or halo effects; motion allowed: fade, scale, translate, springs, crossfade, marquee/ticker
- NO decorative separator dots (·) in pill labels
- NO decorative notches/tabs on cards; one exception: a pressable button may have a hard shadow ledge below it that it sinks into on press (Duolingo-style press feel)
- Never advertise features that do not exist (list above)

### Deliverable

A full landing page design, desktop and mobile, all sections (not just the hero). When it is done it will be handed back to an engineering session to build in Next.js + Tailwind, so real text (not text-as-image), consistent spacing tokens, and a defined palette + type scale matter.
