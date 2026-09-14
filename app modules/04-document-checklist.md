# Stitch Prompt — Document Checklist Generator

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Document Checklist (`/checklist`) — SRS Module 6 (FR6.1–FR6.4)
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System
Base: `user onboarding/00-design-system.md`. App components (nav bar, checklist checkbox): `00-design-system-extension.md`.

## 1. Page Purpose & Tone
A practical, task-oriented "get ready to apply" utility. Tone: helpful and organized, like a packing list — should feel satisfying to check items off, not like more paperwork.

## 2. Layout — Desktop
Top Navigation Bar fixed at top. Below it, max-width 800px centered content, 40px top padding (narrower than Dashboard/Explorer — this is a focused, linear task, not a browsing surface).

1. **Header:** Fraunces Bold 30px Ink: "Your document checklist" — subtext below, General Sans 15px Body: "Everything you need across your 11 matched schemes, in one list." (dynamically states the matched-scheme count per FR6.1).
2. **Progress summary strip, 20px below:** a slim horizontal bar (Primary-green fill representing % complete over a Border-grey track, 8px tall, full width, rounded) + a text label above it "7 of 15 documents ready" (General Sans Medium 14px) — this single progress bar is the page's one moment of "gamified" motivation; keep everything else calm/functional.
3. **Category groups, 24px below (per FR6.2):** each category (ID Proof, Income Proof, Address Proof, Educational Certificate, Bank Details, Photograph, Other) is its own section:
   - Section header: small category icon + label (Fraunces Semi-Bold 17px, Ink) + a count badge ("3 items").
   - Beneath it, each document as a checklist row (per extension doc's Toggle/Checklist Item component): checkbox + document name + small overlapping scheme-name tags (e.g. two small pill tags "PM Kisan" "Scholarship" showing which matched schemes require this specific document, per FR6.4) — if more than 2 schemes require it, show "+2 more" as a third tag, expandable on click/hover to reveal the full list in a small tooltip.
4. **Bottom summary card:** once ALL items are checked, a celebratory card appears (Primary-green-tinted background, small claymorphism checkmark-badge illustration, ~80px, per the "illustrations only in empty/milestone states" rule) with text "You're ready to apply!" and a button "Review your schemes" routing back to Dashboard.

## 3. States to Specify
- **Checkbox check/uncheck:** per extension doc's check-draw micro-animation; progress bar and header count update live and smoothly (animated fill transition, not an instant jump) on every toggle.
- **Empty state (no Strong matches yet, so nothing to check):** centered claymorphism illustration + "No checklist yet" + "Complete your profile to see what documents you'll need" + button routing to Profile/Dashboard.
- **Section collapse/expand:** each category section header is clickable to collapse its rows (chevron rotates), useful once many categories are populated — default state: all expanded.
- **Scheme-tag tooltip:** small dark bubble (per onboarding's tooltip pattern established in `07-onboarding-step4-category-education.md`) listing all contributing scheme names when a "+N more" tag is hovered/tapped.

## 4. Mobile Layout (390×844)
- Progress strip and header remain full width, unchanged proportionally.
- Category sections remain full-width single column (already suited to mobile).
- Scheme-name tags on each row: if space-constrained, show only 1 tag + "+N more" more aggressively (lower threshold than desktop's 2) to avoid row overflow/wrapping awkwardly.

## 5. Accessibility Notes
- Checkbox rows are real checkboxes semantically (`role="checkbox"` or native `<input type="checkbox">`), keyboard-toggleable (space bar), with checked state exposed via `aria-checked`.
- Progress bar exposes its value via `aria-valuenow`/`aria-valuemax` (e.g. "7 of 15 documents ready"), announced on change.
- Collapsible section headers use `aria-expanded` and are keyboard-operable (Enter/Space to toggle).
