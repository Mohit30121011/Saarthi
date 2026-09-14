# Saarthi — App Design System Extension (Dashboard & Core Platform)

This extends `user onboarding/00-design-system.md` — same color tokens, typography (Fraunces + General Sans), light warm theme, shape language, and anti-slop checklist carry over **unchanged** into every page in this folder. Do not re-derive a new palette or mood for the logged-in app; it must feel like the same product a citizen just onboarded into, not a different app.

Paste both this file and `00-design-system.md` alongside every page prompt in this folder.

---

## 1. What's New Here (component types onboarding didn't need)

### Top Navigation Bar (all citizen-facing pages)
- Fixed top bar, white `#FFFFFF` background, 1px bottom border `#E7ECE3`, 72px height.
- Left: logo lockup (same mark as onboarding, 28px).
- Center-left: primary nav links (Dashboard, Explorer, Checklist, Bookmarks) — General Sans Medium 14px, Body color; active page gets Primary-green text + a 2px Primary-green underline offset 8px below the label (not a filled pill — keep this understated).
- Right: notification bell icon (custom line icon, small red dot badge with unread count when >0), then a circular profile avatar (32px) with a small chevron, opening the account dropdown.
- On scroll: bar gains a subtle tinted-green shadow (`0 4px 20px rgba(31,110,67,0.08)`) to lift off the page — no color change.

### Scheme Card (used on Dashboard, Explorer, Bookmarks)
- White surface, 20px radius, 1px `#E7ECE3` border, 20px padding, soft tinted shadow on hover only (flat/borderless at rest — the shadow appearing on hover is what signals interactivity).
- Top row: small category icon-badge (24px, Primary-green-tinted circle background `#E8F2EC`) + category label (Muted 12px uppercase, letterspaced) + a Match Confidence tag pinned top-right: **Strong** = solid Primary-green pill, white text, small filled-checkmark icon; **Partial** = outlined Accent-gold pill, Ink text, small half-filled-circle icon (never the same visual weight as Strong — Partial must read as "almost," not equally confident).
- Scheme name: Fraunces Semi-Bold 18px, Ink, max 2 lines with ellipsis overflow.
- Issuing authority: General Sans Regular 13px, Muted, single line.
- Benefit summary: General Sans Regular 14px, Body, max 2 lines.
- Bottom row: a small "View details →" text link, Primary green, appears/underlines on card hover.
- Bookmark toggle: small outline-heart icon top-left of the card (overlapping the top edge slightly), fills solid Primary-green on tap/save, with a brief scale-bounce micro-animation.

### Category Filter Chips (Dashboard, Explorer)
- Horizontal scrollable row of pill chips: "All", "Education", "Healthcare", "Housing", "Financial Aid", "Agriculture", "Employment", etc. Same chip visual language as onboarding (unselected: white/Border-outline; selected: Primary-green fill + white text). Each chip also shows a small count badge (e.g. "Education (12)") in a lighter inline tone.

### Tabs (Scheme Detail page)
- Underline-style tabs, NOT boxed/pill tabs: "Overview", "Eligibility", "Documents", "How to Apply" — General Sans Medium 15px, Muted when inactive, Ink + Primary-green 3px underline when active, smooth underline-slide transition between tabs (250ms ease).

### Filter Sidebar (Explorer)
- Left rail, 280px wide, white background, sections separated by thin dividers: "State" (searchable dropdown), "Category" (checkbox list), "Ministry" (checkbox list), each section collapsible (chevron toggle). A "Clear all filters" text link at the top of the rail in Primary green, only visible when ≥1 filter is active.

### Data Table (Admin only — see `09-admin-panel.md` for full utilitarian direction)
- Dense rows, 44px row height, `#E7ECE3` row dividers (no zebra striping — keep it calm/dense per the utilitarian brief), column headers in Muted 12px uppercase letterspaced, sortable columns show a small chevron on hover/active.

### Chat Widget (bubble + window)
- Floating circular button, 56px, Primary-green fill, white chat-bubble icon (custom, not a stock icon), fixed bottom-right with 24px margin, soft tinted shadow, subtle idle pulse animation (very slow, low-amplitude) to invite attention without being obnoxious.
- Expanded window: 380px wide, 560px tall, white, 20px radius, anchored above the bubble, soft shadow, header bar (Primary-green fill, white text "Saarthi Assistant" + small online-status dot + close icon), scrollable message area below, input row pinned to bottom.

### Toggle/Checklist Item (Checklist page)
- Row with a custom checkbox (20px, rounded 6px, Border-grey outline unchecked → Primary-green fill + white checkmark when checked, with a satisfying small check-draw animation), document name (General Sans Regular 15px, strikethrough + Muted color when checked), and small tag(s) showing which scheme(s) require it.

### Notification Dropdown
- Anchored below the bell icon, 360px wide, white, 16px radius, soft shadow, list of notification rows (unread = light Primary-green-tinted background `#F5FAF7` + small green dot; read = white background, no dot), each row: small icon (matches notification type — a star for new match, a clock for deadline), title (Medium 14px), timestamp (Muted 12px), max height with internal scroll, "Mark all as read" link at the top.

## 2. Cross-Page Consistency Rules
- The Top Navigation Bar is identical on every citizen-facing page in this folder — generate it once conceptually and reuse, don't restyle per page.
- Match Confidence tags (Strong/Partial) must look pixel-identical everywhere they appear (Dashboard cards, Explorer cards, Bookmarks cards, Scheme Detail header).
- Claymorphism illustrations (per `00-design-system.md`) appear only in empty states and the Chatbot's welcome message here — the main app is primarily data/content-driven, not illustration-driven like onboarding. Don't over-illustrate the dashboard itself.

## 3. Pages Covered by This Extension
1. `01-dashboard.md` — Module 3, core module
2. `02-scheme-explorer.md` — Module 4
3. `03-scheme-detail.md` — Module 5
4. `04-document-checklist.md` — Module 6
5. `05-bookmarks.md` — Module 7
6. `06-notifications.md` — Module 10
7. `07-profile.md` — profile view/edit (not a formal SRS module number, referenced in synopsis's Key UI Screens)
8. `08-chatbot-widget.md` — Module 8
9. `09-admin-panel.md` — Module 9 (utilitarian style, see file for its own design deviation notes)
