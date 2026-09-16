# Stitch Prompt — Bookmarks & Saved Schemes

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Bookmarks (`/bookmarks`) — SRS Module 7 (FR7.1–FR7.3)
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System
Base: `user onboarding/00-design-system.md`. App components (nav bar, scheme card): `00-design-system-extension.md`.

## 1. Page Purpose & Tone
The simplest page in the product — a personal shortlist. Tone: light, low-friction, "your saved-for-later list." This page should feel like the fastest, least effortful one to build (deliberately simple relative to Dashboard/Explorer's complexity), since its job is small.

## 2. Layout — Desktop
Top Navigation Bar fixed at top. Below it, max-width 1200px centered content, 40px top padding.

1. **Header:** Fraunces Bold 30px Ink: "Saved schemes" — subtext "8 schemes you've bookmarked" (General Sans 15px Muted, dynamic count per FR7.3).
2. **Grid, 24px below:** identical 3-column Scheme Card grid to Dashboard/Explorer (per extension doc) — every card here already shows a filled/solid bookmark-heart icon (since everything on this page is, by definition, bookmarked) and its current Match Confidence tag (Strong/Partial), re-evaluated live against the citizen's current profile per FR7.3 ("including current Match Confidence if the user is still eligible").
3. **No grouping/categories/filters on this page** — deliberately simpler than Explorer; it's a flat personal list, not a browsable catalog. This simplicity is intentional, not a missing feature.

## 3. States to Specify
- **Un-bookmark action:** clicking the filled heart on a card here immediately removes that card from the grid with a brief fade-and-collapse transition (the grid reflows smoothly to close the gap, not an abrupt jump-cut) — plus a small transient "Removed from saved" toast/snackbar (bottom-center, dark `#10241A` background, white text, auto-dismisses after ~3s) with an "Undo" text action in Accent gold.
- **Empty state:** centered claymorphism illustration (a citizen holding an empty basket/folder, in established illustration style) + "No saved schemes yet" + subtext "Bookmark schemes from your dashboard or the explorer to find them here." + a button "Browse schemes" routing to Explorer.
- **Stale-match indicator:** if a previously-Strong bookmarked scheme has since become Partial or even fully ineligible (profile changed since bookmarking), show a small Accent-gold-tinted banner strip at the top of that specific card: "Your match status changed" — a small, honest signal rather than silently updating the tag with no explanation.

## 4. Mobile Layout (390×844)
- Header remains full width.
- Grid becomes single-column, same card content/behavior including the un-bookmark-with-undo pattern.

## 5. Accessibility Notes
- The un-bookmark action's toast/snackbar must be announced via an `aria-live="polite"` region, and its Undo action must be reachable via keyboard immediately after the action (not requiring a tab-through of the whole page).
- Stale-match banners must include the specific change in their accessible text where possible (e.g. "Match status changed from Strong to Partial"), not just a generic "changed" label.
