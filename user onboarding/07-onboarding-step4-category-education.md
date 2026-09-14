# Stitch Prompt — Onboarding Step 4 of 6: Category & Education

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Onboarding Step 4 (`/onboarding/category-education`) — collects Social Category, Education Level (SRS FR2.1)
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System
Full tokens/typography/shape/illustration rules: see `00-design-system.md`. Master onboarding frame: see `04-onboarding-step1-basic-info.md` §1 — reuse identically.

## 1. Progress State
Segments 1–3 completed (Primary green), **segment 4 = current (Accent gold)**, segments 5–6 upcoming. Label: "Step 4 of 6".

## 2. This Step's Content (Left Panel)
1. **Headline:** "Which category and education level apply to you?" — Fraunces Bold, 28px, Ink. (Two sub-questions on one screen is acceptable here since both are single-select chip choices — keep the screen from feeling too sparse, unlike the slider-heavy Step 3.)
2. **Subtext:** "Reservation-based scholarships and category-specific schemes use this. Choose what applies to you — this is kept confidential." — General Sans Regular, 15px, Body color.
3. **Category field:** label "Social Category", five selectable chips in a horizontal wrapping row: "General", "OBC", "SC", "ST", "EWS" — same chip styling as Step 1's Gender chips (unselected: white/Border-outline; selected: Primary-green fill + white text + leading checkmark icon). Add a small info-icon (custom, circular "i") beside the label that, on hover/tap, shows a tooltip: "Not sure? This usually matches your caste/community certificate." — a respectful, plain-language clarification rather than assuming legal literacy.
4. **Education Level field, 32px below:** label "Highest Education Level", a **horizontal stepped/segmented control** (not a dropdown) since education is inherently ordinal — six segments in a single connected pill-shaped bar: "No formal education" · "Up to 10th" · "12th" · "Diploma" · "Graduate" · "Postgraduate+". Each segment is a clickable region within the connected bar; the selected segment gets Primary-green fill while unselected segments stay white, all sharing one continuous rounded outline (a single pill shape divided by thin internal separators) — visually distinct from the chip style used elsewhere, since this field's ordinal nature deserves its own component language.

## 3. This Step's Illustration (Right Panel)
Scene: a claymorphism figure holding a small stack of graduation-cap and certificate-shaped clay props, standing beside a simple floating badge/medallion shape (representing category/identity, rendered abstractly — NOT any real government emblem or insignia, purely a generic rounded badge shape in Accent gold). Lighting consistent with prior steps.

## 4. States to Specify
- **Category chip selection:** single-select (only one of the 5 chips active at a time), same interaction as Step 1's Gender chips.
- **Info tooltip:** appears on hover (desktop) or tap-and-hold / tap-toggle (mobile), small dark `#10241A` background bubble with white text, small pointer triangle, dismisses on outside click/tap.
- **Education segmented control:** clicking any segment selects it and deselects others; selected segment's internal border merges visually with its neighbors' outlines so the bar still reads as one continuous shape, not six separate boxes.
- **Continue enabled state:** requires one Category chip AND one Education segment selected.

## 5. Mobile Layout (390×844)
- Category chips wrap to 2 rows (3 chips, then 2) at narrow widths.
- Education segmented control: if six segments don't comfortably fit the mobile width even at small text sizes, allow horizontal scroll within the pill bar (the bar itself scrolls, edges soft-fade to indicate more content) rather than wrapping to multiple rows — preserves the "one continuous ordinal bar" concept instead of breaking it into a grid.
- Standard illustration-banner-collapse and fixed-footer-nav rules apply.

## 6. Accessibility Notes
- Category chips and Education segments both behave as radio-groups (arrow-key navigation within each group, `aria-checked`/`aria-selected` state exposed).
- Tooltip content must also be reachable/announced via keyboard focus on the info icon, not only mouse hover.
