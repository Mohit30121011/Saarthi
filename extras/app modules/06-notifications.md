# Stitch Prompt — Notifications

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Notification Dropdown (anchored component, not a standalone route) + full Notifications page (`/notifications`) — SRS Module 10 (FR10.1–FR10.3)
**Frame:** Desktop (1440×1024) primary for both variants, then Mobile (390×844)

---

## 0. Design System
Base: `user onboarding/00-design-system.md`. App components (nav bar, notification dropdown row styling): `00-design-system-extension.md`.

## 1. Page Purpose & Tone
Two surfaces for the same data: a **quick dropdown** (glanceable, from any page) and a **full page** (complete history, for when the dropdown isn't enough). Tone: informative, never alarming — even deadline reminders should feel helpful, not anxiety-inducing.

## 2. Surface A — Notification Dropdown (per extension doc, elaborated here)
Anchored below the Top Nav Bar's bell icon, 360px wide, white, 16px radius, soft tinted shadow, max-height ~440px with internal scroll.
1. **Header row:** "Notifications" (General Sans Semi-Bold 15px) + "Mark all as read" text link (Primary green, 13px) right-aligned.
2. **Row list:** each row per extension doc — icon matching type (a small star-badge for NEW_MATCH per FR10.1, a small clock for DEADLINE_APPROACHING per FR10.2), title (Medium 14px, Ink), 1-line description (Muted 13px), relative timestamp ("2h ago"), unread state = light green-tinted row background + small green dot at the row's left edge.
3. **Footer:** a "View all notifications" link centered at the bottom of the dropdown, routing to the full page (Surface B).
4. **Empty state (within the dropdown):** centered small state — no illustration needed here (too small a surface), just a muted bell-with-slash icon + "You're all caught up" text, compact.

## 3. Surface B — Full Notifications Page (`/notifications`)
Top Navigation Bar fixed at top. Below it, max-width 720px centered content, 40px top padding.
1. **Header:** Fraunces Bold 30px Ink "Notifications" + "Mark all as read" button (outlined pill, Primary green) right-aligned.
2. **Filter tabs, 16px below:** simple underline tabs "All" / "Unread" (per extension doc's tab styling), lighter-weight than Scheme Detail's 4-tab row since there are only 2 options here.
3. **Grouped list, 24px below:** notifications grouped under date headers ("Today," "Yesterday," "Earlier this week," "Older") — Muted 12px uppercase letterspaced group labels — each notification as a full-width row (larger than the dropdown's compact version): icon, title, full description (not truncated), timestamp, and — specifically for NEW_MATCH notifications — a small inline "View scheme →" link; for DEADLINE_APPROACHING, a small inline days-remaining badge ("5 days left," Accent-gold-tinted).
4. **Empty state (full page):** centered claymorphism illustration (a citizen relaxing, "all caught up" mood, established style) + "No notifications yet" + subtext "We'll let you know when new schemes match your profile or a deadline approaches."

## 4. States to Specify
- **Read/unread visual distinction:** consistent between dropdown and full page (light-green-tint + dot = unread; plain white = read).
- **Mark-as-read interaction:** clicking any notification row marks it read immediately (dot disappears, background fades from tinted to white over ~200ms) in addition to navigating, if it has a target link.
- **"Mark all as read" action:** all unread indicators clear with a soft staggered fade (rows animate in quick succession, not all at once instantly) for a satisfying batch-clear feel.
- **New notification arrival (real-time, if applicable):** the bell icon's unread-count badge should be describable as incrementing with a small bounce/pulse, and — if the dropdown is open — the new row slides in at the top rather than silently appearing.

## 5. Mobile Layout (390×844)
- Dropdown becomes a full-height bottom sheet or full-screen takeover when the bell is tapped (a 360px floating dropdown doesn't work well on mobile widths) — slides up, rounded top corners, same row content.
- Full Notifications page: header, filter tabs, and grouped list all remain full width, single column — already mobile-suited.

## 6. Accessibility Notes
- The bell icon's unread count must be announced (e.g. "Notifications, 3 unread") via its accessible label, not conveyed by the red dot alone.
- Notification rows are operable via keyboard (Enter to open/mark-read) and each has a clear accessible name combining title + read state.
- Date group headers use appropriate heading structure so screen reader users can navigate by group.
