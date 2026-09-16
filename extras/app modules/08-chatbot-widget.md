# Stitch Prompt — AI Chatbot Assistant Widget

**Product:** Saarthi — personalized government scheme discovery platform
**Component:** Floating Chat Widget (bubble + expanded window, appears on every citizen-facing page) — SRS Module 8 (FR8.1–FR8.12)
**Frame:** Desktop (1440×1024, shown as an overlay on top of the Dashboard for context) primary, then Mobile (390×844) variant

---

## 0. Design System
Base: `user onboarding/00-design-system.md`. App components (chat bubble/window base styling): `00-design-system-extension.md`.

## 1. Component Purpose & Tone
A secondary, supporting feature (per SRS — "the platform's value exists entirely without it") — must visually read as helpful-but-optional, never as the primary call to action on any page. Tone: friendly, concise, and — critically, per the SRS's grounding requirement (Section 5.6) — **honest about uncertainty** rather than overconfident. The UI itself should reflect this: verified claims look different from hedged ones.

## 2. Collapsed State — Floating Bubble
Per extension doc: 56px circular button, Primary-green fill, white custom chat-bubble icon, fixed bottom-right, 24px margin, soft tinted shadow, slow low-amplitude idle pulse. On first page load only (not every page), a small transient tooltip/callout may appear beside the bubble: a compact rounded speech-bubble "Have a question about a scheme?" that auto-dismisses after ~5s or on any interaction — never persistent/nagging.

## 3. Expanded State — Chat Window
380px wide, 560px tall, anchored bottom-right (bubble sits just below/behind it when open, or transforms into the window's close-affordance — describe it as the bubble morphing into the window header, not two separate disconnected elements).

1. **Header bar:** Primary-green fill, white text "Saarthi Assistant", small white online-status dot, close (×) icon top-right, all in an 8px-radius-topped rounded rectangle matching the window's top corners.
2. **Message area:** scrollable, white/Background-tinted, 16px padding.
   - **Bot messages:** left-aligned, white bubble with `#E7ECE3` border, 16px radius (flat corner on the bottom-left to indicate "from bot," per common chat-UI convention), General Sans 14px Ink text.
   - **User messages:** right-aligned, Primary-green-tinted background `#E8F2EC`, 16px radius (flat corner bottom-right), Ink text.
   - **Grounded/verified bot claims (per Section 5.6):** any scheme name mentioned within a bot message is rendered as an inline Primary-green link (per FR8.8), and the message bubble carries a small trailing footer line in Muted 11px: "Verified against [Scheme Name] · updated [date]" — this small provenance line is a deliberate, visible manifestation of the grounding/anti-hallucination requirement, not just a backend concern.
   - **Hedged/uncertain bot responses (FR8.4):** visually distinct — a slightly different bubble tint (a soft Accent-gold-tinted background instead of plain white) with a small question-mark-badge icon leading the message, for responses like "I don't have verified information on that" — this visual distinction matters: a citizen should be able to tell at a glance which answers are grounded and which are hedges.
   - **Disclaimer line (FR8.9):** small Muted 11px text beneath any scheme-referencing bot message: "Confirm final eligibility on the official portal before applying."
3. **Welcome message (first open, per FR8.6 for Guests):** the one place a small claymorphism illustration appears within the widget — a small (64px) friendly character icon beside the first bot message bubble, plus 2–3 suggested-question chips beneath it ("Am I eligible for any scheme?", "What documents do I need?") as tappable pill buttons that populate the input when tapped.
4. **Input row, pinned to bottom:** rounded input field (16px radius, placeholder "Ask about a scheme…"), trailing send button (circular, Primary-green fill, white paper-plane icon, disabled/greyed when input is empty).

## 4. States to Specify
- **Typing/loading indicator:** three small pulsing dots within a bot-style bubble (not a full-bubble skeleton) while awaiting a response.
- **Rate-limit reached (FR8.11):** the input row becomes disabled, replaced by an inline message: "You've reached today's question limit. Try again tomorrow." in Muted text, send button hidden.
- **Message send:** user bubble appears instantly on send (optimistic), input clears immediately, focus remains in the input field for rapid follow-up questions.
- **Window open/close transition:** scales/fades in from the bubble's position (transform-origin bottom-right), not a generic centered-modal fade.
- **Scroll behavior:** new messages auto-scroll the message area to the bottom, but if a citizen has scrolled up to re-read history, don't forcibly yank them back down — show a small "↓ New message" pill instead, anchored above the input row.

## 5. Mobile Layout (390×844)
- Expanded window becomes a full-screen takeover (not a floating 380px panel — doesn't fit mobile width) with the same header/message-area/input structure, sliding up from the bubble's position.
- Suggested-question chips wrap to 2 rows if needed rather than truncating.

## 6. Accessibility Notes
- The chat window must trap focus while open and be dismissible via Escape, returning focus to the bubble button on close.
- New bot messages should be announced via an `aria-live="polite"` region so screen reader users know a response arrived without needing to poll.
- The hedged-response visual distinction (gold tint + question-mark icon) must also be conveyed in the accessible text (e.g. prefixed "Uncertain: " for screen readers), not color/icon alone.
