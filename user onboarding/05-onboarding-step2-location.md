# Stitch Prompt — Onboarding Step 2 of 6: Location

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Onboarding Step 2 (`/onboarding/location`) — collects State, District (SRS FR2.1)
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System
Full tokens/typography/shape/illustration rules: see `00-design-system.md`. Master onboarding frame (outer bezel, 60/40 split, progress indicator, nav row): see `04-onboarding-step1-basic-info.md` §1 — reuse identically, only the content below changes.

## 1. Progress State
6 segments: **segment 1 = completed (Primary green)**, **segment 2 = current (Accent gold)**, segments 3–6 = upcoming (Border grey). Label: "Step 2 of 6". "Back" button is now active (returns to Step 1).

## 2. This Step's Content (Left Panel)
1. **Headline:** "Where do you live?" — Fraunces Bold, 32px, Ink.
2. **Subtext:** "Many schemes are state-specific, or offer higher benefits in certain districts. This narrows your matches to what's actually available to you." — General Sans Regular, 15px, Body color.
3. **State field:** label "State", a large searchable dropdown/select — rounded 16px input showing a chevron-down icon (custom-styled, matching icon weight elsewhere), placeholder "Select your state". On open: a dropdown panel (white, 16px radius, soft shadow) listing Indian states alphabetically, each row with a small clay-style location-pin icon, search input pinned at the top of the panel for type-to-filter.
4. **District field, 24px below State:** same dropdown style, label "District", **disabled/greyed until a State is selected** (Muted background, Muted text, not clickable) — once State is chosen, it enables and populates with that state's districts.
5. **Contextual micro-detail:** once both State and District are selected, show a small inline confirmation chip below the fields: a rounded tag (Primary-green-tinted background `#E8F2EC`, Primary-green text) reading "📍 [District], [State]" — a small satisfying acknowledgment that the system has understood the input, in the same spirit as the reference's checkmark badges.

## 3. This Step's Illustration (Right Panel)
Scene: a claymorphism figure standing beside a stylized, simplified India map shape (abstract clay-rendered landmass, not geographically precise/sensitive — simple rounded blob silhouette in a muted cream tone) with a single glowing location-pin (Accent gold) dropping onto it. Floating props: a small compass icon, a small house/home icon, in brand-limited palette. Soft rim light from upper-left, consistent with Step 1's lighting direction (maintain lighting consistency across all onboarding illustrations).

## 4. States to Specify
- **State dropdown open/closed, search-filtering, hover-row, selected-row states** — hover row gets a light `#F3F7F1` background tint; selected row shows a small Primary-green checkmark on the right.
- **District disabled state:** exactly as described above — must be visually obviously non-interactive (Muted colors, no hover response, slightly lower opacity ~60%) before a State is chosen.
- **Continue enabled state:** disabled (grey) until both State and District are selected, then transitions to Primary green fill immediately (no explicit submit needed to "validate").
- **Empty search results** (typing a state/district that doesn't exist): dropdown panel shows a small centered message "No matches found" in Muted 14px text, no icon needed.

## 5. Mobile Layout (390×844)
- Same master frame rules as Step 1 (illustration banner collapses to ≤22% viewport height, fixed footer Back/Continue bar).
- On mobile, State/District dropdowns open as a full-height bottom sheet (slides up from bottom, rounded top corners 24px) rather than an inline dropdown panel — better touch ergonomics, and a nice deliberate mobile-specific pattern (not just a squeezed desktop layout).

## 6. Accessibility Notes
- Dropdowns must be fully keyboard-operable (arrow keys to navigate options, type-ahead to jump to a letter, Enter to select, Escape to close).
- District's disabled state must be exposed via `aria-disabled`, not just visual styling.
- The confirmation chip's location-pin emoji/icon must have an accessible text equivalent (not just a decorative pin with no label).
