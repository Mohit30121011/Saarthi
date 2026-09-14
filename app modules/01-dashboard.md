# Stitch Prompt — Personalized Scheme Dashboard

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Dashboard (`/dashboard`) — SRS Module 3, the platform's core module (FR3.1–FR3.9)
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System
Base tokens/typography/shape: `user onboarding/00-design-system.md`. App-specific components (nav bar, scheme card, filter chips, Match Confidence tags): `00-design-system-extension.md`. This page uses the Top Navigation Bar.

## 1. Page Purpose & Tone
The moment a citizen sees the actual product value: "here's what you qualify for." Should feel like opening a personalized results page, not a generic list — confident, specific, a little celebratory on first load (per SRS FR3.1–FR3.3).

## 2. Layout — Desktop
Top Navigation Bar (per extension doc) fixed at top. Below it, a single-column content area, max-width 1200px centered, 40px top padding.

1. **Header row:** Fraunces Bold 30px Ink headline: "Your schemes" — beside it, right-aligned, a "Refresh matches" text button (small refresh icon + label, Muted color, Primary-green on hover) per FR3.4.
2. **Match summary strip, 24px below:** a wide, low-height (88px) card, Primary-green-tinted background `#F5FAF7`, rounded 20px, containing: a large number in Fraunces Bold 36px Primary-green ("14") + label "schemes you qualify for" (General Sans 16px Ink) on the left; on the right, a small horizontal breakdown: "11 Strong · 3 Partial" using the Match Confidence tag colors as small dot-indicators, plus a subtle claymorphism micro-illustration (a small celebratory badge/checkmark icon, ~64px, per the "illustrations only in empty states" rule this is the one sanctioned exception — a small celebratory accent, not a full scene) anchored to the strip's far right edge, slightly overflowing the card's top edge for a touch of dimensional interest.
3. **Category filter chips row, 24px below** (per extension doc) — horizontal scroll on overflow, "All" selected by default.
4. **Scheme grid, 24px below:** 3-column grid on desktop (per extension doc's Scheme Card component), 20px gutter, grouped with small section headers between category groups when "All" is selected (e.g. "Education" as a Fraunces Semi-Bold 20px label above its row of cards, matching the categorization from FR3.2) — OR, when a specific category chip is active, a single ungrouped grid of just that category's cards.
5. **Partial-match nudge (FR3.9):** on any Partial-confidence card, below the benefit summary, a thin inline hint row: a small info-dot + "Add your income to confirm this match" in Accent-gold-tinted text, 12px — directly names the missing field per FR3.9, and is clickable, routing to the Profile page's relevant field.

## 3. States to Specify
- **First-load state (immediately after onboarding):** the match summary strip's number should feel like a reveal — describe a brief count-up animation from 0 to the final number (per SRS's "Finding your schemes…" transition from onboarding Step 6 landing here) rather than appearing instantly static.
- **Empty state (0 matches — profile too sparse):** replace the grid with a centered claymorphism illustration (a citizen looking at an empty/searching magnifying glass scene, in the established illustration style) + headline "No matches yet" + subtext "Complete a few more profile details to unlock your schemes" + a Primary-green button "Complete your profile" routing to Profile.
- **Loading state (refresh in progress):** scheme cards show a skeleton-shimmer placeholder (soft grey-green gradient sweep, matching card dimensions) rather than a generic grey box — tint the shimmer with brand green at low opacity, not neutral grey.
- **Category chip active/hover states:** per extension doc.
- **Card hover state:** per extension doc's Scheme Card hover shadow.

## 4. Mobile Layout (390×844)
- Top Nav Bar collapses: logo + hamburger menu (left/right), nav links move into a slide-out drawer; notification bell and avatar remain visible in the collapsed bar.
- Match summary strip stacks: number+label on top, Strong/Partial breakdown below it, illustration accent shrinks/repositions to not crowd the text.
- Category chips remain a horizontal scroll row.
- Scheme grid becomes single-column, full width, cards retain all the same content/states.

## 5. Accessibility Notes
- The match-count strip's number must be in a live region or otherwise announced when it updates after a refresh, not just visually updated.
- Category filter chips behave as a tab-like radio group (single active selection), keyboard-navigable.
- Partial-match hint links must have a clear accessible name (e.g. "Add income to confirm match for [Scheme Name]"), not a bare "Add your income."
