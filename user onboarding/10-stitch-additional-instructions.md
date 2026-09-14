# Stitch — "Additional Instructions" Field (paste into the box shown in the screenshot)

Copy everything in the code block below directly into Stitch's "Additional instructions" textarea. This is deliberately shorter than the per-page files — its job is to set generation priorities and resolve ambiguity Stitch might otherwise default on, not repeat the full spec.

```
This is Saarthi — a personalized government scheme discovery platform for Indian citizens. Treat 00-design-system.md as the single authoritative style guide: its color tokens, Fraunces + General Sans typography, shape language, and claymorphism illustration direction override any default styling you would otherwise choose. Do not fall back to a generic SaaS look (no purple/blue gradients, no all-Inter type, no default rounded-2xl-shadow-lg card templates).

The attached website (dribbble.com/.../Onboarding) is reference for LAYOUT AND COMPOSITION ONLY — the split-screen structure, the rounded "device frame" bezel around the illustration panel, the multi-step progress indicator style, the floating-icon-cluster-around-a-character composition habit, and the general warmth/friendliness of tone. Do NOT copy its literal green color values, its exact icon set, or its copy — use the palette and content defined in 00-design-system.md and the individual page files instead. The two should feel like siblings in spirit, not identical twins in color.

Generate the uploaded page files (01-login.md, 02-signup.md, etc.) as one coherent multi-screen flow, not independent one-off designs — reuse the same logo lockup, the same claymorphism character design system (consistent facial style, proportions, and material rendering across every illustration, even though the pose/scene/props change per page), the same button/input/chip component styling, and the same spacing rhythm on every screen. A user should be able to tell these screens belong to the same product at a glance.

Illustration priority: this is the single highest-risk area for looking AI-generated/generic. Render every character as a grounded, specific Indian citizen in everyday dress (not a stylized generic tech mascot), using soft matte "clay" material — gentle rim lighting, soft ambient occlusion, a touch of surface grain — explicitly avoiding glossy/glassy plastic-look AI-render sheen. Keep every illustration's color palette limited to the brand tokens (green, saffron/gold, warm cream, skin tones, near-black outlines); do not introduce colors that only appear in the illustrations.

If Fraunces or General Sans aren't available in your font library, acceptable substitutes in priority order are: headings — Fraunces → Lora → Source Serif 4 → Georgia; body/UI — General Sans → Inter → Manrope. Never substitute a heading font with a plain sans-serif — the serif/sans pairing is load-bearing for this not looking like a generic AI SaaS mockup.

Build fully responsive: each page file specifies both a Desktop (1440×1024) and Mobile (390×844) layout — generate both, don't assume desktop-only and let responsiveness be an afterthought.

Every interactive element (buttons, inputs, chips, toggles, sliders) needs its stated states: default, hover, focus, error/invalid, disabled, and loading where specified in the page file — don't only generate the happy-path default state.

Priority order if you can't generate everything at once: 01-login.md and 02-signup.md first (the two auth entry points), then the six onboarding steps (04 through 09) in sequence, then 03-forgot-password.md last (lowest-traffic page).
```

---

## Notes on what's already uploaded (per your screenshot)
- `00-design-system.md` ✅ correctly named/visible.
- The 4 hash-named files are almost certainly `01-login.md`, `02-signup.md`, `03-forgot-password.md`, and one onboarding step — Stitch renamed them on upload. Worth double-checking each one's content in Stitch's file preview before generating, since if it silently dropped or renamed one file, you'd want to know before spending a generation on it rather than after.
- Only one onboarding step file appears uploaded so far (5 total exist: `04` through `09`, six files). If you're generating everything in one batch, upload the remaining step files too — otherwise Stitch has no way to know steps 2–6 exist and can't keep them visually consistent with step 1.
- The website reference field has the dribbble URL — good. That pairs with the "layout only, not color" instruction above.
