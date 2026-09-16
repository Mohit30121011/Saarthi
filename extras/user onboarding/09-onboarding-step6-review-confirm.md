# Stitch Prompt — Onboarding Step 6 of 6: Review & Confirm

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Onboarding Step 6 (`/onboarding/review`) — summary of all profile data before matching runs (ties to SRS FR2.4/FR3.1 — profile save triggers the Eligibility Matching Engine)
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System
Full tokens/typography/shape/illustration rules: see `00-design-system.md`. This is the one onboarding step that **deliberately breaks the Steps 1–5 master frame** (see `04-onboarding-step1-basic-info.md` §1) — no illustration side-panel here, because the content itself (the summary) is the visual interest. **Do not apply the dark-green device-frame bezel anywhere on this page** — that motif exists only to frame an illustration panel, and this step has none. The content sits directly on the plain page background, full width, no outer border/frame/wrapping shadow of any kind — it must read as a normal page, not a floating card. Continuity with Steps 1–5 comes from the shared logo, progress indicator, and typography/color — not from a repeated frame.

## 1. Progress State
All 6 segments Primary green (segment 6 shown as current/Accent-gold-outlined even though filled, to indicate "you are here, about to finish"). Label: "Step 6 of 6 — Review".

## 2. Layout — Desktop
Single full-width panel (not 60/40 split), max content width 720px centered within the outer bezel frame, generous 56px top padding.
1. **Headline:** "You're all set — let's check" — Fraunces Bold, 32px, Ink, centered.
2. **Subtext:** "Review your details below. You can edit anything before we find your schemes." — General Sans Regular, 15px, Body color, centered.
3. **Summary card list:** five compact summary rows, each corresponding to Steps 1–5, styled as a horizontal card (white fill, `#E7ECE3` border, 16px radius, 16px vertical padding, 20px horizontal padding), stacked with 12px gaps:
   - Each row layout: small clay-style icon on the left matching that step's theme (calendar for Basic Info, location-pin for Location, rupee for Income & Occupation, graduation-cap for Category & Education, heart-hand for Additional Details) → a two-line text block (small Muted 12px label e.g. "Basic Info", then the actual entered values in Ink 14px General Sans Medium, e.g. "22 years old · Male") → a right-aligned "Edit" text button in Primary green, 14px, underline-on-hover.
   - **Additional Details row special case:** if the citizen skipped Step 5 entirely, this row shows "Not provided — tap Edit to add" in Muted italic text instead of values, and the Edit link reads "Add" instead of "Edit".
4. **Clicking any "Edit"/"Add" link** routes back to that specific step (not a generic "back to step 1") and, per standard flow behavior, returning to Step 6 afterward preserves all other steps' already-entered data.
5. **Final CTA section, 40px below the last row:** centered, a large Primary-green pill button, 56px height (slightly taller than other steps' Continue button, since this is the flow's culminating action), white text **"Find my schemes"** (never generic "Submit" or "Finish" — always benefit-stated, consistent with the Signup page's philosophy). Small helper text beneath the button, Muted 13px, centered: "This takes just a moment."

## 3. Illustration / Visual Interest (in place of a side-panel)
Instead of a right-panel illustration, place a **small horizontal decorative strip** directly above the headline: 4–5 small floating clay-style icons in a loose arc (a document, a rupee coin, a graduation cap, a heart, a checkmark-shield) — a condensed callback to the icons used across Steps 1–5, visually "collecting" everything the citizen just told us into one friendly cluster. This replaces a full illustration scene and reinforces "we've gathered what we need."

## 4. States to Specify
- **Row hover (desktop):** subtle background tint `#FAFBF9` on the row, Edit link underlines.
- **Loading/transition state on "Find my schemes" tap:** the button's label is replaced by a small inline spinner (white ring), and — since the Eligibility Matching Engine runs synchronously per SRS FR3.1 — show a brief, reassuring full-panel transition state: the summary content fades, replaced by a centered message "Finding your schemes…" (Fraunces 20px, Ink) with a subtle pulsing clay-badge animation beneath it, before routing to the Dashboard. This transition should feel purposeful (like something real is happening), not just a generic spinner.
- **Empty/incomplete required fields** (should not normally happen since Steps 1–4 block Continue until valid, but defensive state): if somehow a required row has no data, that row's "Edit" link is styled in Error red instead of Primary green with helper text "Required — please complete this."

## 5. Mobile Layout (390×844)
- Summary rows remain full-width single-column (already suited to mobile).
- Decorative icon strip shrinks/simplifies to 3 icons instead of 5 to avoid crowding.
- "Find my schemes" button and its helper text pin to a fixed footer bar (consistent with Steps 1–5's fixed-footer-nav pattern), full width, always reachable.

## 6. Accessibility Notes
- Each summary row's Edit/Add link must clearly state which section it edits in its accessible name (e.g. "Edit Basic Info"), not a bare "Edit" repeated five times with no differentiation for screen reader users.
- The loading/transition state's "Finding your schemes…" message must be announced (e.g. via an `aria-live` region) so screen reader users aren't left in silence during the wait.
