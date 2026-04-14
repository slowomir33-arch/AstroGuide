# Landing Page Design — AstroSoul Navigator

**Date:** 2026-04-14  
**Status:** Approved

## Summary

Implement a full-screen landing page as the app entry point. The main application is gated behind a fake login (single button click, no credentials). Design source: `landing page idea` file in project root.

## Architecture

**Approach:** Option A — replace the existing "Sesja wygasła" overlay in `App.tsx` with a full `LandingPage` component. Leverages existing `sessionActive` / `loginDemo` state in Zustand store.

**Flow:**
1. User opens app → `sessionActive: false` → `<LandingPage>` rendered fullscreen
2. User clicks any CTA → `loginDemo()` → `sessionActive: true`
3. `AnimatePresence` fades out landing, fades in main app

## Files Changed

| File | Change |
|------|--------|
| `client/src/views/LandingPage.tsx` | New component — full landing page |
| `client/src/App.tsx` | Replace overlay with `<LandingPage>` conditional render |
| `client/src/store/appStore.ts` | Change `sessionActive` default `true` → `false` |
| `client/src/index.css` | Add global CSS: nebula glows, diamond rotate, float, glow-pulse, twinkle, reveal, glass, cta-glow, etc. |
| `client/index.html` | Add Google Fonts link (Cormorant Garamond + Outfit) |

## LandingPage Component Structure

```
LandingPage
├── Nebula glow divs (fixed background effects)
├── Stars container (80 particles, generated in useEffect)
├── Nav (logo + pricing anchor)
├── Hero section (diamond SVG, h1, CTA button)
├── Resonance canvas (wave animation, useEffect + useRef)
├── Pain points section (3 glass cards)
├── Comparison section (Old vs AstroSoul)
├── Features grid (8 items from array.map())
├── How it works (3 steps)
├── Testimonials (3 glass cards)
├── Pricing section (Free + Pro cards with CTA buttons)
├── Final CTA section
└── Footer
```

## Canvas Wave Animation

- Pure React: `useRef<HTMLCanvasElement>`, `useEffect` for init + RAF loop
- 5 wave systems (Harmonic Analysis, Numerology, Mayan Tzolkin, Sidereal, Western)
- Each system: 6 harmonic components with dispersion, Stokes sharpening, group envelope
- Crossfade between systems every ~6s
- Legend text fades between system names

## Styling Strategy

- Tailwind for layout, spacing, typography
- Custom CSS in `index.css` for: `.glass`, `.cta-glow`, `.nebula-glow-1/2`, `.diamond-rotate`, `.float-animation`, `.glow-intense`, `.reveal`, `.star-particle`, `.text-gradient-gold`, `.gold-divider`, `.pricing-highlight`, `.chart-ring/line/dot`
- Color palette via Tailwind config extension: `space`, `gold`, `lunar`, `nebula` (already in project or added inline)

## CTA Buttons → Login

All three CTA buttons call `loginDemo()` from `useAppStore`:
1. Hero: "Begin Your Free Exploration"
2. Pricing Free tier: "Start Free"  
3. Pricing Pro tier: "Begin Your Journey"
4. Final CTA: "Begin Your Free Exploration"

## State Change

`appStore.ts` line ~261: `sessionActive: true` → `sessionActive: false`

Note: `sessionActive` is persisted in localStorage. Users who were already logged in will remain logged in on next visit.

## Scroll Reveal

`IntersectionObserver` in `useEffect` watches all `.reveal` elements, adds `.visible` class when in viewport (threshold 0.1).

## Constraints

- No new npm packages
- Lucide icons via `lucide-react` (already installed)
- Tailwind already configured — extend colors in `tailwind.config` if needed
