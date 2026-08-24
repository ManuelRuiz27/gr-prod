---
name: Azure & Gilded
colors:
  surface: '#FFFFFF'
  surface-dim: '#d2daeb'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff3ff'
  surface-container: '#e6eeff'
  surface-container-high: '#e1e8f9'
  surface-container-highest: '#dbe3f3'
  on-surface: '#141c28'
  on-surface-variant: '#44474e'
  inverse-surface: '#29313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#4e5e82'
  primary: '#031636'
  on-primary: '#ffffff'
  primary-container: '#1a2b4c'
  on-primary-container: '#8293ba'
  inverse-primary: '#b6c6f0'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#001c14'
  on-tertiary: '#ffffff'
  tertiary-container: '#003326'
  on-tertiary-container: '#6c9d8b'
  error: '#9A2A2A'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#b6c6f0'
  on-primary-fixed: '#071b3b'
  on-primary-fixed-variant: '#364669'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#baeed9'
  tertiary-fixed-dim: '#9ed1bd'
  on-tertiary-fixed: '#002117'
  on-tertiary-fixed-variant: '#1d4f40'
  background: '#f8f9ff'
  on-background: '#141c28'
  surface-variant: '#dbe3f3'
  app-bg: '#F8F9FA'
  border: '#D0D5DD'
  text-secondary: '#667085'
  success-light: '#E8F5E9'
  warning: '#B76E00'
  warning-light: '#FFF8E1'
  error-light: '#FFEBEE'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-h3:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-btn:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  caption-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  touch-target-min: 44px
  button-height: 48px
  margin-page: 20px
  gutter-card: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system embodies a "Sober Elite" personality, positioned as a high-end concierge service for significant life milestones. The aesthetic is contemporary and reliable, bridging the gap between a premium financial institution and a luxury event planner. 

The visual style is **Minimalist with Tactile Accents**, focusing on extreme clarity, generous whitespace, and a high-contrast palette. Every interaction is designed to feel intentional and effortless, prioritizing "Utility-driven Elegance" to reduce the friction of high-stakes financial commitments.

- **Tone**: Professional, exclusive, and human-centered.
- **Visual Direction**: Flat, high-quality surfaces with micro-interactions that emphasize precision.
- **Audience**: Graduates and families navigating milestone events with a need for financial transparency.

## Colors
The palette is dominated by **Azul Noche** (#1A2B4C) to establish trust and authority. **Dorado Discreto** (#D4AF37) is reserved strictly for high-value accents, such as progress milestones, achievement badges, or premium status indicators—it should never be used for large surfaces or primary action buttons to maintain its "exclusive" feel.

Functional colors (Success, Warning, Error) utilize high-chroma text paired with ultra-low-saturation backgrounds to ensure accessibility while keeping the interface clean. The background is a crisp, cool gray (#F8F9FA) to differentiate the page level from the pure white (#FFFFFF) of interactive cards and sheets.

## Typography
This design system uses **Inter** exclusively to project a modern, tech-forward, yet professional image. The type scale is optimized for high-speed legibility on mobile devices. 

- **Hierarchy**: Use `display-hero` specifically for financial totals (e.g., "Total pagado") to ensure immediate cognitive recognition of status.
- **Language**: All copy must be "Human-Centered" Spanish. Avoid technical jargon or system-speak.
- **Readability**: Maintain a minimum 14px size for any content requiring user action or comprehension.

## Layout & Spacing
The layout follows a **Fixed-Fluid hybrid** model optimized for a 390px viewport. A persistent 20px side margin creates a "frame" for content, giving the app an editorial, premium feel.

- **Grid**: 8px rhythmic grid system.
- **Touch Targets**: Strictly enforced 44px minimum for all interactive icons. Primary buttons are fixed at 48px height to provide a substantial, confident "click" feel.
- **Bottom Navigation**: Persistent container (56px-64px height) with four clear destinations, utilizing a subtle top border (#D0D5DD) rather than a heavy shadow.

## Elevation & Depth
Depth is conveyed through **Tonal Layering** rather than traditional drop shadows. This keeps the interface looking "Contemporary" and "Sober."

1.  **Level 0 (Background)**: `#F8F9FA` - The canvas.
2.  **Level 1 (Cards/Sheets)**: `#FFFFFF` - Used for all primary content containers. Use a 1px solid border (#D0D5DD) to define boundaries.
3.  **Level 2 (Modals/Overlays)**: Pure white with a very soft, diffused ambient shadow (8% opacity, 16px blur) to suggest height during critical decision-making.
4.  **Scrim**: A 40% opacity blur of `primary_color_hex` to focus attention when bottom sheets or modals are active.

## Shapes
A "Rounded" strategy (0.5rem / 8px) is applied to all primary elements. This balances the "Sober" tone of the colors with a "Friendly/Approachable" tactile feel. 

- **Buttons & Cards**: 8px (standard).
- **Badges/Chips**: 16px (full pill) to distinguish them from interactive buttons.
- **Inputs**: 8px to maintain consistency with the button language.

## Components

### App Header
A minimal, center-aligned title using `headline-h3`. The "Back" button must be a 44px touch target. For the home screen, the brand logo should be left-aligned with a profile shortcut on the right.

### Financial Summary
A high-priority card at the top of the dashboard. Use `display-hero` for the amount. Include a linear progress bar using `secondary_color_hex` (Dorado) for the fill and a light neutral for the track. A small caption should indicate the threshold for specific benefits (e.g., "70% para liberar Termo").

### Event Card
White surface with an 8px radius. Features a top "Status Badge" (e.g., "Próximo") in `primary_color_hex`. Use `headline-h2` for the event name and `caption-sm` with icons for time and location.

### Payment Card
High-contrast card focused on the "Amount Due." Features a primary button (48px) for "Pagar ahora." Use `warning-light` background if a payment is pending, and `success-light` if completed.

### Bottom Navigation
Fixed at the bottom with four slots: **Inicio, Mi grupo, Pagos, Más**. Active state uses `primary_color_hex` for both the icon and the 12px label. Inactive state uses `text-secondary`.

### Buttons
- **Primary**: `primary_color_hex` background, white text, 48px height.
- **Secondary**: White background, `primary_color_hex` border (1px), `primary_color_hex` text.
- **Tertiary**: Ghost style, `primary_color_hex` text, no border.