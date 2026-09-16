# Stitch Prompt — Onboarding Step 5 of 6: Additional Details

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Onboarding Step 5 (`/onboarding/additional-details`) — collects Disability Status, BPL Status, Minority Status (SRS FR2.1)
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System
Full tokens/typography/shape/illustration rules: see `00-design-system.md`. Master onboarding frame: see `04-onboarding-step1-basic-info.md` §1 — reuse identically.

## 1. Progress State
Segments 1–4 completed (Primary green), **segment 5 = current (Accent gold)**, segment 6 upcoming. Label: "Step 5 of 6".

## 2. This Step's Content (Left Panel)
1. **Headline:** "A few more details" — Fraunces Bold, 32px, Ink. (Deliberately gentler/shorter than prior headlines — this step asks about disability/poverty-line/minority status, which are sensitive; the tone should feel optional and low-pressure, not another mandatory interrogation.)
2. **Subtext:** "These are optional, but answering them can unlock additional welfare and support schemes specifically for you." — General Sans Regular, 15px, Body color. Explicitly reinforce optionality here since these are the most sensitive fields in the whole flow.
3. **Three toggle rows, stacked with 20px gaps, each in its own card-like row (not a checkbox list — Border-grey 1px outline, rounded 16px, 20px internal padding, per row):**
   - **Row 1 — Disability status:** left side: small clay-style icon (a simple accessible/wheelchair-adjacent glyph, respectfully rendered, not a stock medical cross) + label "I have a disability" (General Sans Medium 15px, Ink) + one-line helper "Unlocks disability pensions and support schemes" (General Sans Regular 13px, Muted). Right side: a rounded toggle switch (pill-shaped track, Border-grey when off, Primary-green when on, white circular thumb that slides).
   - **Row 2 — BPL (Below Poverty Line) status:** same row structure, icon: a simple house/shelter glyph, label "My family holds a BPL card", helper "Unlocks poverty-line-specific subsidies", same toggle style.
   - **Row 3 — Minority status:** same row structure, icon: a simple abstract community/people glyph (generic, non-religious-symbol-specific — avoid depicting any single religion's iconography since "minority" spans multiple communities), label "I belong to a religious minority community", helper "Unlocks minority welfare and scholarship schemes", same toggle style.
4. **Skip option:** a small text link beneath the three rows, Muted color: "Prefer not to answer — skip this step" — routes directly to Step 6 without setting any of the three fields (they remain unset/null, not false).

## 3. This Step's Illustration (Right Panel)
Scene: gentler and warmer than prior steps — a claymorphism figure with an open, welcoming posture (arms slightly open, warm expression) standing beside a small floating open-book or open-hands shape symbolizing inclusion/support, NOT any specific religious or medical iconography. Floating props: a small heart-in-hand shape, a small shield-with-checkmark (representing protection/support), in brand palette. Lighting consistent with prior steps but slightly warmer color temperature to reinforce the gentler tone.

## 4. States to Specify
- **Toggle on/off:** smooth slide transition (~150ms), track color crossfades Border-grey ↔ Primary-green, thumb slides with a very slight overshoot/settle easing (not a linear snap) for a tactile, considered feel.
- **Continue button:** unlike prior steps, Continue is **enabled by default** here (never blocked), since every field on this step is optional — reflect this explicitly, it's a deliberate deviation from Steps 1–4's disabled-until-valid pattern.
- **Skip link:** visually de-emphasized (Muted, no underline until hover) so it doesn't compete with the toggles as the primary action, but remains easily findable.

## 5. Mobile Layout (390×844)
- Toggle rows stack full-width unchanged (they were already a vertical stack on desktop).
- Standard illustration-banner-collapse and fixed-footer-nav rules apply.
- Given this step is inherently short, on mobile the illustration banner may be shown slightly taller than other steps (up to ~26% viewport height) since there's more vertical room to spare.

## 6. Accessibility Notes
- Each toggle must have its full row (not just the switch itself) clickable/tappable, and expose `role="switch"` with `aria-checked`.
- Helper text under each label must be programmatically associated with its toggle (e.g. `aria-describedby`), not just visually adjacent.
- The skip link must be reachable and clearly labeled for screen readers as skipping optional fields, not as abandoning the whole flow.
