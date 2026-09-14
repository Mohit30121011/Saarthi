# Stitch Prompt — Onboarding Step 3 of 6: Income & Occupation

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Onboarding Step 3 (`/onboarding/income-occupation`) — collects Annual Family Income, Occupation (SRS FR2.1)
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System
Full tokens/typography/shape/illustration rules: see `00-design-system.md`. Master onboarding frame: see `04-onboarding-step1-basic-info.md` §1 — reuse identically.

## 1. Progress State
Segments 1–2 completed (Primary green), **segment 3 = current (Accent gold)**, segments 4–6 upcoming. Label: "Step 3 of 6".

## 2. This Step's Content (Left Panel)
1. **Headline:** "What's your household's annual income?" — Fraunces Bold, 30px, Ink. (Slightly smaller than Step 1/2's headline since this line is longer — keep single-line if possible, wrap gracefully if not.)
2. **Subtext:** "Income determines eligibility for most financial-aid and subsidy schemes. This stays private and is never shown to other users." — General Sans Regular, 15px, Body color. (The privacy reassurance matters specifically for this sensitive field — do not omit it.)
3. **Income field:** NOT a plain number input — a **slider + editable number field combo**, since income ranges matter more than exact precision for matching (mirrors the reference's data-forward widget style, e.g. the "645h" / efficiency chart cards):
   - A horizontal rounded slider track (Border-grey background, Primary-green filled portion up to the current value), with a circular Primary-green thumb handle (white inner dot, subtle shadow).
   - Directly above the slider, a large editable numeric readout: "₹ [value]" in Fraunces Bold 28px, Ink — typing here also moves the slider, and dragging the slider updates this number (two-way bound).
   - Small tick labels beneath the track at key bands: "0", "2.5L", "5L", "10L", "25L+" in Muted 12px text.
4. **Occupation field, 32px below:** label "Occupation", then a **grid of selectable cards** (not a plain dropdown — this field benefits from visual scanning) — 3 columns × 2 rows on desktop: Student, Farmer, Self-Employed, Salaried, Homemaker, Unemployed. Each card: white fill, `#E7ECE3` border, rounded 16px, a small clay-style icon on top (a graduation cap, a wheat stalk, a briefcase, an ID badge, a house, a search-icon respectively — each in brand-limited palette) + label below in General Sans Medium 14px. Selected card: Primary-green border (2px) + light Primary-green tint background `#E8F2EC` + small checkmark badge top-right corner.

## 3. This Step's Illustration (Right Panel)
Scene: a claymorphism figure standing next to a simple rising bar-chart made of soft rounded clay blocks (echoing the reference's "Strong Buy" chart card, but reimagined as chunky 3D clay bars rather than a flat line chart) with a small floating rupee-coin, in brand palette. Lighting consistent with Steps 1–2.

## 4. States to Specify
- **Slider drag state:** thumb scales up slightly (1.15×) while dragging, track fill updates live, numeric readout updates live with no lag/debounce.
- **Manual number entry:** typing directly into the readout field clamps to the slider's min/max range (0 to a defined cap, e.g. 25,00,000+) and snaps the slider thumb to match.
- **Occupation card hover:** subtle lift (2px translate up) + border darkens slightly, on non-selected cards only.
- **Occupation card selected:** as described above; only one card selectable at a time (single-select, not multi-select).
- **Continue enabled state:** requires both a set income value (even at 0) and one Occupation card selected.

## 5. Mobile Layout (390×844)
- Slider + readout stack full-width, unchanged interaction model (still draggable on touch).
- Occupation card grid collapses to 2 columns × 3 rows.
- Standard illustration-banner-collapse and fixed-footer-nav rules from Step 1 apply.

## 6. Accessibility Notes
- Slider must be operable via keyboard (arrow keys increment/decrement, Home/End jump to min/max) and expose current value via `aria-valuenow`/`aria-valuetext` (e.g. "₹5,00,000").
- Occupation cards behave as a radio-group semantically (single selection, arrow-key navigable, `aria-checked` state) even though visually styled as cards, not radio buttons.
