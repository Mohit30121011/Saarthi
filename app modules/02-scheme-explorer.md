# Stitch Prompt — Scheme Explorer & Search

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Explorer (`/explore`) — SRS Module 4 (FR4.1–FR4.4)
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System
Base: `user onboarding/00-design-system.md`. App components (nav bar, scheme card, filter chips, filter sidebar): `00-design-system-extension.md`.

## 1. Page Purpose & Tone
Independent of the citizen's profile — a full catalog browse, closer to an e-commerce category page than a personalized feed. Tone: neutral, comprehensive, "everything is here, find it your way." Accessible to Guests too (FR4.1), so this page must work without assuming a logged-in identity.

## 2. Layout — Desktop
Top Navigation Bar fixed at top (for Guests, the nav bar's right side shows "Log in" / "Create account" text+button pair instead of the bell/avatar). Below it: a 280px left Filter Sidebar (per extension doc) + main content area, 24px gutter between them.

1. **Search bar, top of main content area:** full-width rounded search input (16px radius, 52px height, `#E7ECE3` border), leading search icon (custom line icon), placeholder "Search by scheme name, keyword, or benefit…", trailing clear-icon (×) appears once text is entered.
2. **Result count + sort row, 16px below:** left side "1,842 schemes" (Muted 14px); right side a sort dropdown ("Most relevant" / "Name A–Z" / "Deadline soonest") styled as a small text button with a chevron, opening a compact dropdown panel on click.
3. **Scheme grid, 20px below:** 3-column grid (2-column if the sidebar is present and viewport is narrower than typical — describe the grid as responsive to available width, not a fixed count) using the same Scheme Card component as the Dashboard — for Guests, cards omit the bookmark-heart icon and Match Confidence tag entirely (since there's no profile to match against), showing only name/authority/benefit/category-badge.
4. **Pagination, bottom of grid:** simple numbered pagination (rounded square page-number buttons, active page Primary-green fill) + "Load more" as an alternative pattern — pick "Load more" as primary (better mobile ergonomics, more modern feel than numbered pages) with a Primary-green outlined pill button centered below the grid.

## 3. Filter Sidebar Detail (per extension doc, elaborated)
- **State section:** searchable dropdown-style filter (type to filter the list of states), each selected state becomes a small removable chip shown above the search row.
- **Category section:** checkbox list, each with a count in parentheses, checked items move to the top of their section's list once selected (so active filters are always visible without scrolling).
- **Ministry section:** same checkbox-list pattern, collapsed by default (fewer citizens filter by ministry — deprioritize its visual weight, collapsed state saves vertical space).
- Selected filters also appear as a horizontal row of removable chips directly above the search bar in the main content area (a "you have filtered by: [chips]" summary), so filters are visible even while scrolled past the sidebar on mobile.

## 4. States to Specify
- **Search-as-you-type:** result count and grid update live (debounced) as the citizen types — describe a brief, subtle loading pulse on the result count number during the debounce window, not a full-page spinner.
- **No results state:** centered claymorphism illustration (a citizen with a magnifying glass finding nothing, matching established illustration style) + "No schemes match your search" + a "Clear all filters" button.
- **Filter checkbox states:** default, hover, checked (per extension's checklist-item checkbox styling, reused here for consistency).
- **Sort dropdown open/closed/selected states.**

## 5. Mobile Layout (390×844)
- Filter Sidebar becomes a "Filters" button (outlined pill, filter-funnel icon + active-filter-count badge) below the search bar, opening a full-height bottom sheet containing the same State/Category/Ministry sections, with a sticky "Apply filters" button pinned to the sheet's bottom.
- Search bar and result-count/sort row remain full width, stacked.
- Grid becomes single-column.
- "Load more" button remains centered, full width minus margins.

## 6. Accessibility Notes
- Search input must have an associated label (visually hidden if needed) beyond just the placeholder.
- Filter checkboxes must be a properly grouped fieldset per section with a legend, for screen reader users to understand grouping.
- The mobile filter bottom sheet must trap focus while open and return focus to the "Filters" button on close.
