# Stitch Prompt — Admin Panel (Scheme & Eligibility Management)

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Admin Dashboard + Scheme Management (`/admin`, `/admin/schemes`) — SRS Module 9 (FR9.1–FR9.5)
**Frame:** Desktop (1440×1024) ONLY — admin tooling is not designed for mobile use; skip the mobile variant entirely for this file.

---

## 0. Design System Deviation — Read This First
This page is used by internal Saarthi staff, not citizens, and intentionally departs from the rest of the product's warm/illustrated language. **Keep the color tokens and typography from `user onboarding/00-design-system.md` unchanged** (same Primary green, Ink, Body, Border, Error, same Fraunces + General Sans pairing) — the admin panel should still be unmistakably Saarthi, just in a denser, more utilitarian register. **Do NOT use:**
- Claymorphism illustrations or floating props of any kind
- Large rounded chip/pill selectors as primary inputs (fine for small tags, not for data entry)
- Generous card-based whitespace — this page favors density (per the synopsis's own "data-dense but clean, trust through simplicity" reference)

Reference feel: an internal ops console — closer to Zerodha's Kite dashboard or a Zoho admin console than to the citizen-facing app's card-heavy layouts.

## 1. Page Purpose & Tone
Where Saarthi staff keep the scheme catalog and eligibility rules accurate over time (this is the actual mechanism behind `DATASET_PLAN.md`'s "no live API — periodic verified refresh" approach). Tone: efficient, precise, trustworthy — a data-entry tool for people who will use it daily, not a showcase.

## 2. Layout — Desktop
A persistent **left sidebar** (240px, `#10241A` dark-Ink fill — the one place in the whole product a dark surface appears, deliberately marking "you are in admin mode," distinct from the light citizen app) containing: small logo mark (light variant, white/cream) + "Admin" label, then nav items (Dashboard, Schemes, Eligibility Rules, Audit Log) as simple text rows with icons, active item highlighted with a Primary-green left-edge bar + lighter text.

Main content area (remaining width, white/Background-tinted):

### 2.1 Admin Dashboard (`/admin`)
1. **Header row:** "Admin Dashboard" (Fraunces Semi-Bold 24px, Ink) + current admin's name/avatar top-right.
2. **Stat tile row:** 4 compact stat cards (white, 1px Border, 12px radius, 20px padding — noticeably smaller/denser than citizen-facing cards): "Active Schemes" (large number), "Pending Verification" (large number, Accent-gold accent if >0), "Total Citizens Matched Today," "Avg. Match Time" — each with a small label above and a tiny trend indicator (up/down arrow + %) below the number.
3. **Recent Activity table, below:** a dense data table (per extension doc's Data Table component — 44px rows, no zebra striping, sortable column headers) listing recent `admin_scheme_audit` entries: Scheme, Field Changed, Old Value, New Value, Changed By, Timestamp — directly surfaces the audit trail from SRS §11/FR9.3.

### 2.2 Scheme Management (`/admin/schemes`)
1. **Header row:** "Schemes" (Fraunces Semi-Bold 24px) + a Primary-green solid button "+ Add Scheme" top-right (smaller/squarer than citizen-facing pill buttons — 8px radius, not full-pill, reinforcing the utilitarian register).
2. **Toolbar row, below header:** a compact search input (left), and filter dropdowns for Category/State/Status (Active/Inactive/Needs Verification) — small, dense, text-button-style dropdowns, not large card-based filters.
3. **Data table, full width:** columns — Scheme Name, Category, State, Status (small colored dot + label: green="Active", grey="Inactive", gold="Needs Verification" — per `verified_at` staleness), Last Verified date, Actions (small icon buttons: Edit pencil, Deactivate toggle, per-row). Row click opens the Scheme Edit panel.
4. **Scheme Edit panel:** opens as a **right-side slide-over drawer** (480px wide, slides in from the right, dims the table behind it with a scrim) rather than a separate page or centered modal — keeps the admin in list context. Contains standard form fields (text inputs, textareas, dropdowns — NOT onboarding's chip/slider components; plain dense form controls here) for all `schemes` table attributes (name, description, ministry, category, state, benefit_summary, benefit_amount, application_url, official_portal, deadline), plus a distinct **"Verification" section** at the bottom: `source_url` field + `verified_at` date picker + a "Mark as verified today" quick-action button (per FR9.4) — visually separated (a divider + subtle Accent-gold-tinted section background) since this is the field group tied to data-accuracy/trust, worth calling attention to.
5. **Eligibility Rules sub-section**, within the same drawer or a linked secondary view: a small repeatable rule-row builder — each row: Attribute dropdown (age/income/gender/category/state/etc.), Operator dropdown (`=`, `>=`, `<=`, `IN`, etc.), Value input, small delete-row icon button, "+ Add rule" link beneath the list. Directly mirrors the `eligibility_rules` table structure from the SRS.

## 3. States to Specify
- **Table sort:** clicking a sortable column header shows a small chevron indicating direction, row order updates (can describe as instant re-sort, no animation needed — this is a utility tool, not a delight-focused surface).
- **Status dot legend:** must be consistent everywhere it appears (Dashboard's Pending Verification stat, the Schemes table's Status column).
- **Slide-over drawer open/close:** slides in/out (~200ms ease), scrim fades in/out in sync, closing via the × icon, clicking the scrim, or Escape.
- **Save/Cancel in the edit drawer:** Save button shows a brief inline spinner, then the drawer closes and the table row updates in place (small highlight-flash on the updated row, ties back to the audit trail being created per FR9.3).
- **Empty/loading table states:** simple skeleton rows (grey shimmer bars in place of text, matching row height) — no illustration, consistent with this page's utilitarian register.

## 4. Accessibility Notes
- Data table must use proper table semantics (`<table>`, `<th scope="col">`) so screen readers can navigate rows/columns correctly.
- The slide-over drawer must trap focus while open and restore focus to the triggering row on close.
- Status dots must be paired with their text label (already specified above) — never color alone.
