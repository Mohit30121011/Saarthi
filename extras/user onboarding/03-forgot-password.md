# Stitch Prompt — Forgot Password Page

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Forgot Password (`/forgot-password`) — two states in one flow: Request Reset, and Check Your Email confirmation
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System (identical to `01-login.md` §0 — apply without deviation)

**Color tokens:** Primary `#1F6E43` · Primary hover `#195A37` · Accent `#F2A93B` · Ink `#10241A` · Body `#3C4A42` · Muted `#8A9A90` · Background `#FBFBF6` · Card `#FFFFFF` · Border `#E7ECE3` · Error `#C0473B` · Focus ring Primary @ 35% opacity.

**Typography:** Fraunces for headings, General Sans (fallback Inter) for body/UI — no substitutions.

**Shape/Illustration/Anti-slop checklist:** identical to `01-login.md` §0.

---

## 1. Page Purpose & Tone
A brief, reassuring utility screen — the user is likely mildly frustrated here, so the tone should be calm and efficient, not cheerful/marketing. No illustration panel needed at full scale — this page is intentionally **simpler and smaller** than Login/Signup to communicate "this will be quick."

## 2. Layout — Desktop
**Not** a split-screen like Login/Signup. Instead: a single centered card (max-width 480px) on the Background `#FBFBF6` base, with a small decorative element rather than a full illustration panel — this deliberate layout shift (vs. the split-screen auth pages) is itself an anti-slop signal: not every screen in the flow should look identically templated.
- Card: white surface, 28px radius, soft tinted-green shadow, 48px internal padding.
- Small decorative accent above the headline: a single small claymorphism icon (not a full character scene) — e.g. a clay-style key or envelope, ~72px, centered, with one small floating prop (a tiny sparkle/asterisk shape in Accent gold) offset to its upper-right for a touch of personality.

## 3. State A — Request Reset (default)
1. **Small icon** as described above.
2. **Headline:** "Forgot your password?" — Fraunces Bold, 28px, Ink, centered.
3. **Subtext:** "Enter the email linked to your account and we'll send you a reset link." — General Sans Regular, 15px, Body color, centered, max-width 340px.
4. **Email field:** label "Email address", same input styling as Login, full width within the card.
5. **Primary CTA button:** full-width pill, Primary green, white text "Send reset link", 52px height, same hover/loading behavior as other pages.
6. **Back link:** below the button, centered, small arrow-left icon + "Back to login" in Body color, turning Primary green on hover.

## 4. State B — Check Your Email (after successful submit)
Replace the card contents (same card container, same position — a clean content swap, not a new page layout):
1. **Icon swap:** the small decorative icon becomes a clay-style envelope-with-checkmark, same size/position.
2. **Headline:** "Check your email" — Fraunces Bold, 28px, Ink, centered.
3. **Subtext:** "We've sent a password reset link to **[email]**." — General Sans Regular, 15px, centered; the bolded email address is dynamic text, Ink-colored (not a link).
4. **Secondary helper text:** smaller (13px), Muted color: "Didn't get it? Check your spam folder, or " + a "resend link" text-button in Primary green.
5. **Back link:** identical "Back to login" as State A.

## 5. States to Specify
- **Field error** (empty submit, invalid email format): identical red-border + helper-text pattern from Login/Signup.
- **Unknown email:** per good security practice, do **not** reveal whether the email exists — State B (Check Your Email) should display identically regardless of whether the email is registered. Note this explicitly as a design/product requirement, not just a visual one.
- **Rate-limited resend:** if "resend link" is clicked too soon, it becomes temporarily disabled/greyed with small text "You can resend in 30s" replacing the link.
- **Loading state:** button shows inline spinner exactly as in Login/Signup.

## 6. Mobile Layout (390×844)
- Same centered-card approach, card becomes full-width minus 20px side margins, vertically centered in viewport, no illustration panel changes needed since this page never had a full split-screen illustration to begin with.

## 7. Accessibility Notes
- On transition from State A to State B, the new heading should receive focus / be announced (so screen reader users know the state changed).
- The dynamic email address in State B must not be styled identically to a link (avoid implying it's clickable).
