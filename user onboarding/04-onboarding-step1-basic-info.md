# Stitch Prompt — Onboarding Step 1 of 6: Basic Info

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Onboarding Step 1 (`/onboarding/basic-info`) — collects Date of Birth, Gender (SRS FR2.1)
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System (identical to `01-login.md` §0 — apply without deviation)

**Color tokens:** Primary `#1F6E43` · Primary hover `#195A37` · Accent `#F2A93B` · Ink `#10241A` · Body `#3C4A42` · Muted `#8A9A90` · Background `#FBFBF6` · Card `#FFFFFF` · Border `#E7ECE3` · Error `#C0473B` · Focus ring Primary @ 35% opacity.

**Typography:** Fraunces for headings, General Sans (fallback Inter) for body/UI — no substitutions.

**Illustration/Anti-slop checklist:** identical to `01-login.md` §0.

---

## 1. Onboarding Master Layout (applies to all 6 onboarding steps — establish this frame here, reuse identically in Steps 2–6)

Unlike the auth pages (full split-screen), onboarding uses **one unified page** with the content anchored in a soft, borderless white/off-white area — directly inspired by the reference's card-based feel, but as an actual full page, not a floating panel.

**IMPORTANT — do not wrap the whole step (both the left content and right illustration together) in the dark-green "device frame" bezel.** That bezel belongs ONLY to the illustration side, exactly as on Login/Signup — a self-contained inset panel on the right, not an outer border around the entire page. Wrapping the whole page in it makes the step look like a floating overlay/modal sitting on top of the canvas instead of being the page itself. If page-level chrome (a top bar, footer, etc.) is present, this step's content sits directly on the page background as normal page content — no additional outer border, frame, or shadow implying it's a separate floating layer.

- **Outer container:** centered on Background `#FBFBF6`, max-width 1100px, no outer border, no bezel, no wrapping shadow — just normal page layout.
- **Inner split, 60/40:**
  - **Left (60%, white `#FFFFFF`, plain — no border/frame):** step content — progress indicator, headline, form fields, nav buttons.
  - **Right (40%):** the illustration lives inside its OWN self-contained rounded panel — Primary green `#1F6E43` field with subtle radial gradient, rounded 24px corners, `#10241A` dark-green bezel border 10-14px thick (this is the ONE place the device-frame motif applies on this page), soft tinted shadow beneath just this panel. The bezel frames the illustration, not the page.
- **Top of left panel:** small logo mark (top-left, 28px) + a "Save and exit" text link (top-right, Muted color, 13px) so a citizen can leave without losing progress.
- **Progress indicator:** directly below the logo row — 6 thin rounded segments (pill-shaped, 4px tall, 2px gap) spanning the left panel's width. Completed segments: Primary green fill. Current segment: Accent gold `#F2A93B` fill. Upcoming segments: Border `#E7ECE3` fill. Small label beneath, left-aligned: "Step 1 of 6" in Muted 13px General Sans Medium.
- **Bottom of left panel (persistent across all steps):** a horizontal nav row — "Back" as a text button (Muted color, disabled/hidden on Step 1 since there's nowhere to go back to) on the left, "Continue" as a Primary-green pill button (same style as auth CTAs) on the right. Continue is disabled (Border-grey fill, Muted text) until the step's required fields are valid.

## 2. This Step's Content (Left Panel, below progress indicator)
1. **Headline:** "When were you born?" — Fraunces Bold, 32px, Ink. (Conversational, one question per screen — mirrors the reference's "What kind of work do you do?" phrasing pattern; avoid dry field-label phrasing like "Date of Birth" as the headline.)
2. **Subtext:** "This helps us match age-based scholarships, pensions, and youth schemes to you." — General Sans Regular, 15px, Body color. (Always explain *why* a field is being asked — this is what makes government-adjacent data collection feel respectful rather than invasive.)
3. **Date of birth field:** three separate small inputs side by side — Day / Month / Year — each a rounded box (16px radius, 64–96px wide depending on digit count), Muted placeholder text "DD" / "MM" / "YYYY", large centered digits (General Sans Medium, 20px). This segmented style reads as more custom/considered than a single generic date-picker input.
4. **Gender field, below DOB, spaced 32px down:** label "Gender" (General Sans Medium, 14px, Ink), then three selectable pill/chip options laid out horizontally: "Male", "Female", "Other" — unselected state: white fill, `#E7ECE3` border, Body-color text; selected state: Primary green fill, white text, small clay-style checkmark icon appearing to the left of the label inside the chip.

## 3. This Step's Illustration (Right Panel)
Scene: a claymorphism figure — a young adult sitting cross-legged, holding up a small birthday-cake-like calendar page (a clay-rendered calendar icon with a candle, playful but not childish) — floating props: a small clock icon, a small floating "18+" or age-badge shape, both in brand-limited palette (green/saffron/cream). Soft rim light from upper-left.

## 4. States to Specify
- **Field validation:** DOB fields reject invalid values (e.g. day 32, month 13) inline — the invalid box gets an Error-red border immediately on blur, with small helper text below the DOB row: "Enter a valid date of birth."
- **Age-boundary validation:** if computed age is implausible (e.g. under 0 or over 120, per SRS FR2.5), same red-border pattern with text: "Please check the year — that doesn't look right."
- **Continue button enabled state:** transitions from disabled (grey) to Primary green fill the moment DOB + Gender are both valid/selected — describe this as an immediate, no-submit-needed state change (not requiring a button press to "validate").

## 5. Mobile Layout (390×844)
- Outer frame becomes full-viewport-width with 12px side margins, bezel border thins to 6px.
- Illustration panel collapses to a compact banner above the form content (≤22% viewport height), same scene simplified.
- DOB's three-input row stays horizontal (still fits at mobile width) but each box shrinks proportionally; Gender chips wrap to two rows if needed (2 chips, then 1).
- Bottom nav row (Back/Continue) becomes a fixed footer bar pinned to the bottom of the viewport, full width, so it's always reachable without scrolling.

## 6. Accessibility Notes
- DOB's three separate inputs must have individually associated labels ("Day," "Month," "Year") for screen readers, even though visually only placeholders are shown.
- Gender chip selection must be operable via keyboard (arrow keys to move between options, space/enter to select) and expose selected state via `aria-pressed` or equivalent, not color alone.
