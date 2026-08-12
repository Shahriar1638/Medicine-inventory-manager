---
name: Clinical Precision Dark
colors:
  surface: '#111316'
  surface-dim: '#111316'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#bfc7d3'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#89919c'
  outline-variant: '#404751'
  surface-tint: '#99cbff'
  primary: '#99cbff'
  on-primary: '#003355'
  primary-container: '#42a5f5'
  on-primary-container: '#00395e'
  inverse-primary: '#00629d'
  secondary: '#45d8ed'
  on-secondary: '#00363d'
  secondary-container: '#00bacd'
  on-secondary-container: '#00444d'
  tertiary: '#ffb952'
  on-tertiary: '#452b00'
  tertiary-container: '#d99000'
  on-tertiary-container: '#4d3000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#cfe5ff'
  primary-fixed-dim: '#99cbff'
  on-primary-fixed: '#001d34'
  on-primary-fixed-variant: '#004a78'
  secondary-fixed: '#98f0ff'
  secondary-fixed-dim: '#45d8ed'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#ffddb4'
  tertiary-fixed-dim: '#ffb952'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#633f00'
  background: '#111316'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is a high-performance, dark-mode evolution of the clinical interface. It prioritizes extreme legibility, rapid data scanning, and a sense of "digital calm" for high-stakes medical or analytical environments.

The style is **Minimalist-Professional** with a focus on **Tonal Layering**. By utilizing deep charcoal foundations and surgical-blue accents, the UI reduces eye strain during prolonged use while maintaining a rigorous, authoritative atmosphere. The emotional response is one of reliability, precision, and advanced technological capability.

## Colors

This design system utilizes a "Deep Charcoal" palette to provide a low-glare environment.

- **Primary (#42A5F5):** An energized version of the original medical blue, adjusted for higher luminance to ensure it "pops" against dark backgrounds without causing haloing. Use for primary actions and critical status indicators.
- **Surface Strategy:** Instead of shadows, depth is communicated through increasing brightness. The "Background" is the darkest layer, with "Surface-High" being the lightest, used for elevated modals or cards.
- **Semantic Contrast:** Text levels are strictly enforced. High-emphasis text uses near-white for maximum contrast, while secondary metadata uses muted grays to maintain visual hierarchy.

## Typography

Typography in the design system is optimized for "at-a-glance" reading of complex data.

- **Inter** is the primary driver for UI and prose, chosen for its tall x-height and exceptional clarity on digital displays.
- **JetBrains Mono** is utilized specifically for data values, IDs, and timestamps. Its monospaced nature prevents "jumping" when numbers update in real-time and provides a technical, clinical edge.
- **Weight Usage:** Bold weights are used sparingly to highlight critical diagnoses or primary headings. Standard body text should remain at 400 weight to prevent "ink bleed" on dark backgrounds.

## Layout & Spacing

The design system employs a strict 4px baseline grid. All margins and paddings must be multiples of 4px to maintain mathematical harmony.

- **Grid:** A 12-column fluid grid for desktop, collapsing to 4 columns on mobile.
- **Density:** To mimic clinical charts, use "Compact" spacing for data-heavy views (e.g., patient lists) and "Comfortable" spacing for educational or onboarding flows.
- **Alignment:** All data labels should be top-aligned with their corresponding values. In tables, numerical data must be right-aligned using the `data-tabular` token to ensure decimal points align.

## Elevation & Depth

In this dark mode system, traditional shadows are replaced by **Tonal Elevation** and **Inner Stroke** methods.

1. **Luminance Tiers:** Elements closer to the user are lighter in color. A modal sits on `surface-high`, while the base page sits on `background`.
2. **The "Surgical" Outline:** To define boundaries between similar dark tones, use a 1px solid border with 10% white opacity. This creates a crisp, laser-etched look.
3. **No Soft Shadows:** Avoid large, blurry shadows which can appear muddy in dark mode. If depth must be reinforced, use a sharp, 2px shadow with 40% black opacity, tightly hugging the element.

## Shapes

The shape language is **Rounded (0.5rem)**.

This more pronounced rounding provides a contemporary, approachable feel while maintaining the professional clarity required for medical software.

- **Buttons and Inputs:** Use `rounded` (8px).
- **Cards and Containers:** Use `rounded-lg` (16px).
- **Status Indicators:** Use `rounded-full` (pill) for status badges to differentiate them from interactive buttons.

## Components

- **Buttons:** Primary buttons use a solid `#42A5F5` fill with black text. Secondary buttons use a `surface-medium` fill with a 1px light-gray border.
- **Inputs:** Fields should have a `surface-low` background. The active state is indicated by a 1px primary-color border and a subtle primary-colored outer glow (2px blur).
- **Cards:** Cards should not have shadows. Use `surface-low` as the base and a 1px border of `surface-high` to define the perimeter.
- **Data Tables:** Row separators should be 1px solid at 5% white opacity. Hover states on rows should shift the background to `surface-medium`.
- **Status Chips:** Use high-saturation, low-luminance backgrounds with high-luminance text (e.g., Deep Emerald background with Light Mint text) to ensure accessibility without overwhelming the dark interface.
- **Clinical Charts:** Lines and plot points should use the Primary and Secondary accent colors. Grid lines within charts must be subtle (`on-surface-low` at 20% opacity).
