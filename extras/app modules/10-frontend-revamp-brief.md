# Saarthi — Citizen App Revamp Brief (Dashboard, Navigation & Every Core Page)

**For:** Claude Design, generating UI mockups for a from-scratch visual/UX revamp of the logged-in citizen app.
**Do not restate the brand system** — read `user onboarding/00-design-system.md` and `app modules/00-design-system-extension.md` first and keep every color token, font pairing, corner-radius scale, and the claymorphism illustration style **exactly as defined there**. This brief is a **structural and UX overhaul**, not a re-theme. If anything below seems to conflict with a token/rule in those two files, the token/rule wins — only layout, hierarchy, information architecture, and component composition are up for reinvention here.

Frames needed per page: **Desktop (1440×auto)** and **Mobile (390×auto)** — this is a citizen-facing product real people will use on phones, unlike the admin panel (which is explicitly desktop-only). Don't skip mobile.

---

## 0. Why this brief exists

The current implementation is functionally complete but visually reads as a **generic admin-y CRUD app wearing nice colors** — a plain white top bar with text links, and every content page is "heading + filter row + a uniform grid of identical white rounded-rectangle cards." Nothing before the fold tells the citizen anything about *their own situation* — the same layout would work for a shopping site, a job board, or a hotel search. For a platform whose entire value proposition is **personalized** government benefit discovery, the personalization needs to be visible in the layout itself, not just inside the cards.

Two specific complaints driving this brief:
1. **The navbar is too basic** — a bare white strip with 4 text links, a bell, and an avatar. It doesn't feel like the front door of a product; it feels like a placeholder.
2. **The Dashboard is "cards, cards, cards"** — a title, a refresh button, a row of filter chips, then flat repeating grids of scheme cards grouped by category, forever. There is no hierarchy, no summary, no sense of "here's what matters most to you right now."

The goal: **overhaul the structure and hierarchy of every page below** so the product feels like a considered, personal advisor experience — while staying unmistakably Saarthi (tricolor green + saffron, Fraunces headlines, warm claymorphism, soft irregular rounding). No purple-blue SaaS gradients, no generic dashboard-template look, no dense enterprise-analytics vibe. Warm, editorial, trustworthy, distinctly Indian-civic — just structured with actual visual hierarchy this time.

---

## 1. Navigation Overhaul (appears identically on every citizen-facing page)

### 1.1 The core structural change
Replace the single flat top bar with a **two-tier navigation system**:

**A. Persistent left icon rail (new — this is the main fix for "navbar too basic")**
- 88px wide, warm cream surface (`Background base #FBFBF6` or a hair darker tint of it — NOT the dark `#10241A` used in Admin; that dark rail is reserved for Admin mode only, per the design-system-extension's own cross-page rule. The citizen rail must read as warm and light, distinct from the admin panel).
- Top: small Saarthi mark only (no wordmark needed at this width), 20px from top.
- Center: vertical stack of primary destinations as icon-over-microlabel buttons (custom claymorphism-weight icons, ~24px, matching the accent-prop icon style from the design system, not a generic icon font): **Dashboard, Explorer, Checklist, Bookmarks**. Active item gets a filled Primary-green rounded-square backdrop (16px radius) behind the icon + Ink-colored label; inactive items are Muted-colored icon+label with no backdrop.
- Bottom of the rail: Profile avatar (36px circle) sitting above a thin divider, with a small colored ring around it indicating **profile completeness %** (a slim arc, Primary-green for the completed portion, Border-color for the remainder — this single detail does a lot of work: it turns the avatar into a subtle nudge instead of a dead-end icon). Below/beside it on hover or tap: a tooltip/quick-link to Profile.
- On mobile: this rail collapses into a standard **bottom tab bar** (same 4 destinations + Profile as a 5th tab), fixed to the viewport bottom, white surface, active tab gets the same filled-backdrop treatment scaled down.

**B. Slim top utility bar (replaces the old full nav bar's job, now doing less)**
- 64px height, sits to the right of the icon rail (full width on mobile, above the bottom tab bar), white, 1px bottom border.
- Left: a **global search field** (not present at all today) — pill-shaped, Border outline, placeholder "Search schemes, documents, or ask a question…", search icon leading. This single field should be able to jump straight into Explorer's search or (later) the chatbot — for this revamp, just design it as a prominent, always-available search entry point.
- Right: notification bell (keep exactly as specified in the design-system-extension — that component is already well-specified and doesn't need reinvention) + a small greeting fragment on wider viewports only, e.g. "Namaste, Priya" in Ink, General Sans Medium — a tiny humanizing touch that a bare icon bar doesn't give you.

### 1.2 States to show
- Rail active/inactive states for each of the 4 destinations.
- Profile completeness ring at 0%, ~50%, 100% (100% = ring fully Primary-green, maybe a tiny checkmark badge overlay).
- Notification bell with and without unread badge (unchanged from existing spec).
- Mobile bottom tab bar, active/inactive.
- Top utility bar with search field focused (border → Primary green + focus ring, per existing input spec).

---

## 2. Dashboard (`/dashboard`) — the page every user lands on after login

This is the single most important page in this brief. Rebuild it around **"tell me my situation, then let me browse,"** not "here is a filterable card grid."

### 2.1 New page structure, top to bottom

**1. Personal summary header (new section — does not exist today)**
- Large Fraunces headline: dynamic greeting + name, e.g. *"Good morning, Priya"* (time-of-day aware: morning/afternoon/evening).
- Directly below, one Body-sized sentence that does real synthesis, not a static caption — e.g. *"You may qualify for **12 schemes** worth up to **₹2.4L** this year."* (aggregate potential benefit value, computed from Strong-confidence matches' `benefitAmount` where parseable — if amounts aren't cleanly summable across schemes, phrase it as "12 schemes across Education, Healthcare and 3 more categories" instead; the point is a synthesized sentence, not a bare count).
- If the user's profile is incomplete (missing fields reduce match confidence), this is where a warm, non-scary inline prompt lives: *"Complete 3 more details to unlock stronger matches →"* linking to Profile — styled as a soft Accent-gold-tinted inline banner, not a blocking modal.
- This header sits on a very subtle tinted background panel (a whisper of Primary-green at ~4% opacity, or the illustration-panel bezel treatment from the design system used sparingly) to visually separate it from the browsing area below — this is the asymmetric/deliberate element the anti-slop checklist wants per page.

**2. At-a-glance stat strip (new — replaces jumping straight to cards)**
- Row of 3–4 compact stat tiles, **citizen-warm styling** (white surface, 20px radius, soft tinted shadow — NOT the dense admin stat-tile style from `09-admin-panel.md`, which is deliberately utilitarian; these should feel more like the Scheme Card's warmth, larger padding, maybe a small claymorphism icon badge per tile instead of a bare number).
- Suggested tiles: **Matched Schemes** (total count, small up-arrow if increased since last refresh), **Documents Ready** (checked/total from the Checklist module — pulls the user back into Checklist), **Upcoming Deadline** (nearest deadline date across matches, or "None right now"), **Saved Schemes** (bookmark count).
- Each tile is clickable and routes to the relevant page (Checklist, Bookmarks) — these aren't decorative, they're navigation shortcuts disguised as insights.

**3. Spotlight: Top matches for you (new — the actual fix for "cards, cards, cards")**
- A horizontally-scrollable row (not a static grid) of the **top 3–5 highest-confidence matches**, in a visually larger "spotlight" card variant than the standard Scheme Card: bigger benefit-amount display, the category icon-badge enlarged, a short "why this matches you" one-liner pulled from the strongest matching rule (e.g. "Matches your age, income and occupation"). This is the section that should feel hand-curated even though it's algorithmic — it's the antidote to "everything looks the same."
- Section heading: *"Top matches for you"* with a small Fraunces treatment, not the same weight as category section headers below it — this needs to visually outrank the category grid.

**4. Browse by category (the existing grid — demoted, not deleted)**
- Everything currently on the Dashboard (category-grouped grid of standard Scheme Cards) still belongs here, but now as the third/fourth section, clearly subordinate to the summary + spotlight above. Keep the category chips filter control, but consider moving it to feel like a "browse mode" toggle rather than the page's primary control — e.g. a lighter-weight section header like *"Or browse all your matches by category"* introduces it, so it doesn't compete with the spotlight for attention.
- Consider a **grid/list view toggle** here for users who prefer scanning a denser list — small, optional, not load-bearing for this revamp.

**5. Empty state (first-time / zero-match users)**
- Currently a single line of plain text. Replace with an actual claymorphism illustration moment (per the design system's own rule: "illustrations appear only in empty states and the chatbot" — this is exactly that moment, use it) — a small warm scene (e.g., a citizen looking at a checklist with a magnifying glass prop) + headline *"Let's find what you qualify for"* + a clear single CTA button to complete/continue the profile.

### 2.2 Interaction/states to show
- Header with a fully complete profile (no nudge banner) vs. incomplete profile (nudge banner present).
- Spotlight row at rest and mid-scroll (showing partial next card, to signal scrollability).
- Stat tile hover state (subtle lift, matching Scheme Card's hover-shadow-only convention).
- "Refresh matches" action — keep this control, but relocate it to feel like a secondary/tertiary action (e.g. a small icon-button near the spotlight or summary header) rather than a prominent pill button competing with the page headline the way it does today.
- Full empty state (illustrated).
- Mobile: spotlight row, stat strip (likely 2×2 wrap instead of 1 row), category grid single-column.

---

## 3. Scheme Explorer (`/explorer`)

Today: search bar → category chips + a state dropdown → plain result count → grid. Functionally fine, structurally flat.

- Introduce the **Filter Sidebar** component already specified in `00-design-system-extension.md` §1 ("Filter Sidebar (Explorer)") on desktop — it's speced but not yet reflected in the live page's flat chips-and-dropdown layout. Left rail, 280px, collapsible sections (State/Category/Ministry), "Clear all filters" link. This alone turns Explorer from "search box on top of a grid" into a real browse-and-narrow experience.
- Add a **sort control** next to the result count ("Most relevant," "Newest," "Deadline soonest").
- Add a **grid/list toggle** (same control as Dashboard's browse section, for consistency).
- Zero-results state: give it the same illustrated-empty-state treatment as the Dashboard's empty state (different prop/scene — e.g. a citizen with a magnifying glass finding nothing), not just plain text + a clear-filters button.
- Mobile: filter sidebar becomes a bottom-sheet "Filters" modal triggered by a filter icon-button next to the search field, matching the mobile pattern most citizens already know from shopping apps.

---

## 4. Scheme Detail (`/schemes/:id`)

Today: back link → title block → a single benefit callout box → underline tabs → tab content. Reasonable bones, needs a stronger hero and better use of the eligibility/documents data that already exists.

- **Hero section**: give this page an actual header treatment instead of plain white background — a soft category-tinted background band behind the title block (using the category's icon-badge tint color at low opacity, e.g. the same `#E8F2EC`-style tint used in Scheme Card badges), so landing on a Healthcare scheme *feels* different from landing on an Agriculture one, reinforcing the category system visually.
- **Sticky apply CTA**: on scroll, the primary "Apply now →" button (currently buried in the last tab, "How to Apply") should persist as a small sticky bar/button at the bottom of the viewport (mobile) or floating within the content column (desktop) — a citizen who has decided to apply shouldn't have to scroll back up through tabs to find the button.
- **Eligibility tab upgrade**: for a logged-in user, don't just list rules as flat sentences — show each rule with a pass/fail/unknown indicator against the user's own profile data where available (small colored dot: green check = you meet this, gold = missing profile data to confirm, per the existing Strong/Partial visual language) — this reuses data the matching engine already computes (`missingFields`) but currently only surfaces on the Dashboard card, not here where it matters most.
- **Documents tab**: add a small inline "Add to my checklist" affordance if these documents aren't already tracked (most will be, automatically, per the checklist dedup algorithm — but make that connection visible here rather than only discoverable via the separate Checklist page).
- Keep the underline-tab pattern exactly as speced — it's already good and shouldn't be reinvented.

---

## 5. Document Checklist (`/checklist`)

Today: title + fraction text + category-grouped checkbox lists. Functionally solid; needs a stronger sense of progress and less flat list fatigue.

- Add a **progress ring or bar** near the top (visual, not just the "6 of 14" text) — this is a checklist-completion product moment and deserves to feel satisfying, matching the existing checkbox micro-animation's playful spirit.
- Consider a **toggle**: "Group by category" (current) vs. "Group by scheme" (see which documents unlock which specific scheme) — since one document often serves multiple schemes (the whole point of the dedup algorithm), letting a user see it from the scheme angle too adds real value the current one-dimensional list can't show.
- When a category reaches 100%, give it a small celebratory state (checkmark badge next to the category heading, section slightly recedes/collapses) rather than just sitting there fully struck-through.

---

## 6. Bookmarks (`/bookmarks`)

Today: title + count + the same standard grid as everywhere else. Lowest-priority page for structural change, but:
- Add a **sort control** (by date saved, by deadline soonest, by category) — a saved-schemes list is exactly where "which one's deadline is coming up" matters most.
- Empty state: same illustrated treatment as Dashboard/Explorer (different scene — e.g. a citizen tucking a document into a folder), not plain text.

---

## 7. Notifications (`/notifications`)

Today: title + mark-all-read + a flat list of rows. Already reasonably specified in the design-system-extension; refine:
- Group rows under **day headers** ("Today," "Yesterday," "Earlier this week") instead of one continuous flat list — improves scannability as the list grows.
- Use the claymorphism-styled custom icons per notification type (star for new match, clock for deadline) consistently — currently the live page uses raw emoji (⭐⏰) as placeholders; replace with real custom icons matching the rest of the icon system.

---

## 8. Profile (`/profile`)

Today: a single long form in one white card — every field at equal visual weight, no sense of what's already filled in or why any of it matters.

- **Split into sectioned cards** instead of one monolithic form: "Personal Details" (DOB, gender), "Location" (state, district), "Financial & Occupation" (income, occupation), "Category & Education" (social category, education level), "Additional Details" (disability/BPL/minority toggles) — each its own white card with its own small heading, matching the onboarding wizard's step groupings this data originally came from (so Profile feels like "your onboarding answers, editable," reinforcing product consistency).
- Add a **profile completeness summary** at the top of the page (reuses the same ring/percentage concept from the nav rail's avatar) with a one-line explanation: *"A complete profile unlocks stronger matches — you're at 80%."*
- Per the design system's own rule ("every data-collection field is paired with a one-line why-we-ask rationale") — the current live form has bare labels with zero rationale text; add the short helper line under each field or section that the onboarding pages already model, so Profile doesn't regress relative to onboarding's own standard.
- Keep the single full-width "Save changes" button, but consider per-section save affordances as a stretch option if it doesn't complicate the mockup — not required for this revamp, full-form save is fine.

---

## 9. What is explicitly OUT of scope for this brief

- **Login, Signup, Forgot Password, and the 6-step Onboarding wizard** — already well-specified in `user onboarding/00-design-system.md` and not part of the current complaint. Leave these designs alone unless separately requested.
- **Admin Panel** (`/admin`, `/admin/schemes`) — has its own deliberate utilitarian, dark-sidebar design language per `09-admin-panel.md`, intentionally distinct from the citizen app. Do not apply any of the above to Admin.
- **Chatbot widget** — deferred at the product level (not yet built); only the floating-bubble spec in the design-system-extension applies whenever it eventually is.

---

## 10. Anti-Slop Checklist for this revamp specifically

In addition to the full checklist in `00-design-system.md` §8 (still applies to every frame):
- [ ] The Dashboard's personal-summary sentence must read as computed/personal, not a generic "Welcome back!" banner — show real numbers.
- [ ] The new left icon rail must NOT reuse the Admin panel's dark `#10241A` fill — citizen app stays light/warm; only Admin gets the dark rail.
- [ ] No dashboard "widget soup" — every new module (stat strip, spotlight row, progress ring) must justify its presence with real data already in the product (matches, deadlines, checklist %, bookmarks), never a placeholder metric invented for visual density.
- [ ] Spotlight cards must look like an intentionally elevated variant of the standard Scheme Card (same family, larger/richer), not a completely different card style competing for its own identity.
- [ ] Every new empty state uses the claymorphism illustration style with page-appropriate props — no two empty states reuse the identical illustration.
- [ ] Mobile frames are real adaptations (bottom tab bar, bottom-sheet filters, stacked stat tiles) — not the desktop layout shrunk down.

---

## 11. Deliverables checklist for Claude Design

For each of: **Navigation shell (rail + top bar), Dashboard, Explorer, Scheme Detail, Checklist, Bookmarks, Notifications, Profile** —
1. Desktop frame (1440 wide), full page, real (not lorem-ipsum) sample content pulled from the kinds of scheme names/categories already in the product (Education, Healthcare, Housing, Financial Aid, Agriculture, Employment — e.g. PM-KISAN, Ayushman Bharat, PMAY).
2. Mobile frame (390 wide), full page.
3. At least one populated state AND one empty/zero-data state per page where an empty state is described above.
4. Call out, in a short caption under each frame, which specific complaint from §0 or which numbered section above that frame is addressing — so it's traceable back to this brief during review.
