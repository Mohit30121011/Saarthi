# Stitch Prompt — Profile View & Edit Page

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Profile (`/profile`) — edits the same fields collected during Onboarding Steps 1–5 (SRS FR2.3, FR2.4)
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System
Base: `user onboarding/00-design-system.md`. App components (nav bar): `00-design-system-extension.md`. Field components (chips, sliders, segmented controls, toggles) reuse the exact same styling established across the six onboarding step files — do not re-invent new input styles for this page, since a citizen should recognize these as the same controls they used during onboarding.

## 1. Page Purpose & Tone
Unlike onboarding's one-question-per-screen flow, this is a single consolidated settings-style page — efficient for a citizen who already knows their own data and just wants to update one field (e.g. income changed after a new job). Tone: utilitarian but still warm, not a cold settings dump.

## 2. Layout — Desktop
Top Navigation Bar fixed at top. Below it, max-width 720px centered content, 40px top padding.

1. **Header:** Fraunces Bold 30px Ink "Your profile" — subtext "Keep this up to date so we can find every scheme you qualify for." (General Sans 15px Body).
2. **Section cards, 24px below, each a white card (20px radius, 1px Border, 24px padding) — mirrors the five onboarding step groupings so the mental model carries over:**
   - **Basic Info card:** small calendar icon + "Basic Info" header (Fraunces Semi-Bold 16px) + an inline "Edit" text link (Primary green) at the card's top-right. Default state shows read-only values ("14 Aug 2001 (23 yrs) · Male" in General Sans 15px Ink). Clicking Edit reveals the actual Step-1 input controls (segmented DOB inputs + gender chips) inline within the card, with Save/Cancel buttons appearing at the card's bottom.
   - **Location card:** same pattern, State/District dropdowns (Step 2's controls) on Edit.
   - **Income & Occupation card:** same pattern, income slider + occupation card-grid (Step 3's controls) on Edit — the slider/grid should feel identical to onboarding's, not simplified.
   - **Category & Education card:** same pattern, category chips + education segmented bar (Step 4's controls) on Edit.
   - **Additional Details card:** same pattern, the three toggle rows (Step 5's controls) on Edit — remains clearly optional here too, with the same helper subtext reused.
3. **Account section, below the five profile cards, visually separated by extra spacing (40px) and a thin divider:** email address (read-only, with a small "Change email" link opening a separate flow — out of scope to detail further here), "Change password" link, and a "Log out" text button in Error-red-tinted color (not the full Error red — a muted warm red, since logging out isn't a destructive/dangerous action and shouldn't be styled as alarming).

## 3. States to Specify
- **Card default (read-only) vs. edit-expanded state:** smooth height-expand transition when entering edit mode (~250ms ease), not an abrupt jump; Edit link becomes hidden while a card is in edit mode (replaced by the Save/Cancel row).
- **Save action:** on save, the card collapses back to read-only state showing the updated values, with a brief inline confirmation (a small green checkmark flash next to the card header, fading after ~1.5s) — per FR2.4, saving also triggers the matching engine to re-run, so also show a small transient toast (bottom-center, matches the Bookmarks page's toast styling): "Profile updated — refreshing your matches…"
- **Cancel action:** reverts to the read-only values with no confirmation needed, simple collapse.
- **Validation states:** identical per-field validation rules/styling to the corresponding onboarding step (e.g. DOB validation exactly matches `04-onboarding-step1-basic-info.md` §4).
- **Only one card editable at a time:** opening Edit on a second card while another is still open auto-collapses the first (with an unsaved-changes confirmation only if that first card actually has unsaved edits) — keeps the page from becoming a sprawling mess of open forms.

## 4. Mobile Layout (390×844)
- Section cards remain full-width single column (already suited to mobile).
- Edit-mode field controls reuse each onboarding step's mobile-specific behavior where applicable (e.g. State/District dropdowns open as bottom sheets here too, per `05-onboarding-step2-location.md` §5).
- Account section (email/password/logout) remains at the bottom, unchanged proportionally.

## 5. Accessibility Notes
- Entering edit mode on a card should move focus to the first input within that card.
- The re-matching toast (per FR2.4) must be announced via an `aria-live` region.
- "Log out" must have a confirmation step (a small inline "Are you sure?" state replacing the button momentarily, or a lightweight confirm dialog) rather than logging out on a single accidental tap.
