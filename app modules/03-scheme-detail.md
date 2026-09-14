# Stitch Prompt — Scheme Detail Page

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Scheme Detail (`/schemes/:id`) — SRS Module 5 (FR5.1–FR5.4)
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System
Base: `user onboarding/00-design-system.md`. App components (nav bar, tabs, Match Confidence tags): `00-design-system-extension.md`.

## 1. Page Purpose & Tone
The most information-dense page in the product — a citizen lands here to make a real decision ("do I actually qualify, what do I need, where do I apply"). Tone: clear, authoritative, calm — this is where trust is won or lost, so favor clarity and generous whitespace over cramming.

## 2. Layout — Desktop
Top Navigation Bar fixed at top. Below it, max-width 960px centered content, 40px top padding.

1. **Breadcrumb row:** "Explore / Education / [Scheme Name]" — Muted 13px, Primary-green on hover for clickable segments.
2. **Header block, 16px below:**
   - Category badge (small icon-circle + label, per Scheme Card's badge style) above the title.
   - Scheme name: Fraunces Bold 34px, Ink.
   - Issuing authority + state/central tag: General Sans 15px, Muted, on one line ("Ministry of Rural Development · Central").
   - Match Confidence tag (if logged in and matched, per FR5.1's personalized explanation) OR, for a Guest/non-match, this section is simply omitted rather than shown empty.
   - Bookmark button (outlined pill, heart icon + "Save", per extension doc's bookmark styling) and a "Verified [date]" small provenance line (per SRS's `source_url`/`verified_at` fields — a small shield-check icon + "Verified 12 Aug 2026" in Muted 12px) sit in the header's right-aligned action area.
3. **Plain-language eligibility banner (FR5.1), full width, 24px below header:** Primary-green-tinted background `#F5FAF7`, rounded 16px, 20px padding, a small checkmark-badge icon + Fraunces Semi-Bold 18px text: *"You qualify because you are under 25, a student, and from Maharashtra."* — this is the single most important sentence on the page; give it real visual weight, don't bury it in a tab. For a Guest, this banner instead reads (Ink text, neutral background, no checkmark): "Log in to see if you qualify" with a small "Log in" link inline.
4. **Tabs row (per extension doc), 32px below banner:** Overview · Eligibility · Documents · How to Apply.
   - **Overview tab (default):** full scheme description (General Sans 15px, Body, generous line-height), a "Key Benefits" subsection as a bulleted list with small checkmark icon bullets (not default browser bullets).
   - **Eligibility tab:** each `eligibility_rules` row rendered as its own small row — an icon (matching the attribute: calendar for age, rupee for income, map-pin for state, etc.) + the rule stated in plain language + a small pass/fail/unknown indicator dot when logged in (green check / red cross / grey question-mark, per Section 5.1–5.2's STRONG/PARTIAL/NOT_MATCHED evaluation) — this is the literal, itemized version of the plain-language banner above.
   - **Documents tab:** required documents list grouped by category (ID Proof, Income Proof, etc.), each with a mandatory/optional tag, and a "Add all to my checklist" button (Primary-green outline pill) at the top of this tab per Module 6's integration.
   - **How to Apply tab:** numbered step list (custom numbered badges, not default `<ol>` numerals) describing the application process, ending with a large Primary-green pill CTA button "Apply on official portal ↗" that visually anchors the whole page's end-goal.
5. **Related schemes, below the tab content:** a horizontal row of 2–4 smaller Scheme Cards (per FR5.3), section header "Related schemes" in Fraunces Semi-Bold 20px.

## 3. States to Specify
- **Tab switching:** underline-slide transition (per extension doc), content crossfades (150ms), scroll position resets to top of the tab content area, not the whole page.
- **Eligibility rule row states:** pass (Primary-green check icon + normal text), fail (Error-red cross icon + Muted strikethrough-free text — don't strikethrough, that reads as "removed" rather than "not met"), unknown/unverifiable (Accent-gold question-mark icon + text, ties to Partial-match logic) — each state's icon must be distinct in shape, not just color, for accessibility.
- **Bookmark button toggle:** outline heart → filled heart + label changes "Save" → "Saved", small scale-bounce.
- **"Add all to my checklist" button:** on click, brief inline confirmation ("Added ✓") replacing the button label for 2 seconds before reverting.

## 4. Mobile Layout (390×844)
- Header block stacks vertically: badge → title → authority line → confidence tag → action buttons (bookmark + verified-line) below, full width.
- Plain-language eligibility banner remains full width, same prominence.
- Tabs become horizontally scrollable if all four labels don't fit at once (rather than shrinking text below legible size).
- Related schemes row becomes horizontal-scroll (cards peek at the edge to hint more content) rather than wrapping to a grid.

## 5. Accessibility Notes
- Tab panel content must be properly associated with its tab (`role="tabpanel"`, `aria-labelledby`) and keyboard-navigable (arrow keys between tabs).
- Eligibility pass/fail/unknown states must never rely on icon color alone — pair with distinct icon shapes as specified above.
- The "Apply on official portal" link must indicate it opens externally (both visually, via the ↗ glyph, and via `aria-label` / `target` handling).
