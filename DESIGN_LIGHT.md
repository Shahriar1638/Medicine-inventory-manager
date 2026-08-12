---
name: Clinical Precision
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#434652'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#737783'
  outline-variant: '#c3c6d4'
  surface-tint: '#2b5bb5'
  primary: '#003178'
  on-primary: '#ffffff'
  primary-container: '#0d47a1'
  on-primary-container: '#a1bbff'
  inverse-primary: '#b0c6ff'
  secondary: '#546067'
  on-secondary: '#ffffff'
  secondary-container: '#d7e4ec'
  on-secondary-container: '#5a666d'
  tertiary: '#003d35'
  on-tertiary: '#ffffff'
  tertiary-container: '#00564c'
  on-tertiary-container: '#70ccbc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b0c6ff'
  on-primary-fixed: '#001945'
  on-primary-fixed-variant: '#00429c'
  secondary-fixed: '#d7e4ec'
  secondary-fixed-dim: '#bbc8d0'
  on-secondary-fixed: '#111d23'
  on-secondary-fixed-variant: '#3c494f'
  tertiary-fixed: '#97f3e2'
  tertiary-fixed-dim: '#7ad7c6'
  on-tertiary-fixed: '#00201b'
  on-tertiary-fixed-variant: '#005047'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 2rem
  widget-gap: 1.5rem
  sidebar-width: 280px
  cart-width: 320px
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

The design system is engineered for high-stakes medical environments where clarity and speed of recognition are paramount. The aesthetic is **Minimalist** with a **Corporate/Modern** influence, prioritizing a "medical-grade" feel that balances authority with accessibility.

The visual narrative focuses on "Information First." By utilizing high-contrast ratios and a reductionist approach to decorative elements, the UI minimizes cognitive load for pharmacists and medical staff. The emotional response is one of reliability, sterility, and absolute precision. Surfaces are primarily stark white, punctuated by deep architectural blues and functional status colors to guide the eye toward critical actions and data points.

## Colors

This design system utilizes a high-contrast palette to ensure legibility under various lighting conditions in medical facilities.

- **Primary (#0D47A1):** Used for primary actions, navigation headers, and brand identification.
- **Secondary (#263238):** A deep charcoal for text and sidebar backgrounds to provide a grounded, professional contrast.
- **Tertiary (#00796B):** A professional teal used for specialized data visualizations or secondary status indicators.
- **Functional Colors:**
  - **Success (#2E7D32):** Specifically for revenue growth indicators and "In Stock" statuses.
  - **Warning (#C62828):** Reserved for low-stock alerts, expired medication, and critical system errors.
- **Neutrals:** The background is a clean white (#FFFFFF), with secondary surfaces using a subtle cool gray (#F5F7FA) to define sections without adding visual noise.

## Typography

**Inter** is the sole typeface, chosen for its exceptional legibility in data-heavy interfaces and its comprehensive glyph set for medical notation.

- **Data Density:** For inventory lists and pricing, use `mono-data` which utilizes tabular sizing to ensure numbers align vertically for easy comparison.
- **Hierarchy:** Use `label-caps` for table headers and sidebar categories to create a clear structural distinction from content.
- **Invoices:** Use `body-md` for line items with a weight of 500 to ensure clarity when printed in black and white.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model optimized for desktop displays (1440px+).

- **Grid:** A 12-column grid is used for the main dashboard content.
- **Sidebars:** The navigation and filter sidebars are fixed to the left (280px). The persistent cart sidebar is pinned to the right (320px) to facilitate "scan-and-add" workflows.
- **Dashboard Widgets:** Use a standard 24px (`stack-lg`) gap between cards to maintain a breathable, "medical-grade" spatial rhythm.
- **Negative Space:** Avoid dense clusters. Every data group must be separated by at least 16px of whitespace to prevent misreading dosage or quantity information.

## Elevation & Depth

In alignment with the high-contrast aesthetic, the design system uses **Low-contrast outlines** combined with **Tonal layers**.

- **Surfaces:** Level 0 is the app background (#F5F7FA). Level 1 is the primary card surface (#FFFFFF) with a 1px solid border (#E0E6ED).
- **Shadows:** Use a single, highly diffused "Medicine Shadow" for interactive elements like medicine cards on hover: `0px 4px 12px rgba(13, 71, 161, 0.08)`.
- **Modals:** Use a heavy backdrop blur (8px) with a semi-transparent dark overlay to keep the focus strictly on the clinical task at hand.
- **Active States:** Interactive elements (buttons, active filters) should not just change color but gain a distinct 2px primary-colored border to indicate focus.

## Shapes

The shape language is **Rounded** (8px - 16px radius). This provides a professional yet friendly and approachable feel that reduces the perceived complexity of medical data.

- **Medicine Cards:** Use `rounded-lg` (16px) to create a container that feels safe and modern.
- **Input Fields & Buttons:** Use standard `rounded` (8px) for a balanced, tactile appearance.
- **Status Tags:** Use `rounded-xl` (24px) or full pills to distinguish status indicators from clickable buttons.

## Components

### Medicine Cards & List Items

- **Cards:** Must feature a 48x48px icon placeholder for medication types (tablet, syrup, injection). Titles use `title-sm`. Price is right-aligned in `mono-data`.
- **List View:** Compact rows (48px height) with zebra-striping (alternating white and #F9FAFB) for high-speed scanning of large inventories.

### Filter & Search Bars

- **Search:** Large, persistent top-bar search with a 2px border on focus. Include a "Scan Barcode" icon as a secondary action.
- **Filter Sidebar:** Grouped by "Category," "Manufacturer," and "Stock Status." Use checkboxes with a clear blue fill for active states.

### Persistent Cart Sidebar

- **Header:** Sticky header with a total item count.
- **Items:** Each item includes a stepper control (+ / -) for quantity. Low-stock warnings appear as a red sub-label under the medication name if the cart quantity exceeds stock.
- **Checkout:** A full-width primary blue button at the bottom.

### Dashboard Widgets

- **Revenue Tracking:** Use large `display-lg` numbers. Trend indicators (up/down arrows) must be colored in `success` or `warning` tokens.
- **Stock Alerts:** A vertical list of the top 5 items requiring reorder, using a `warning` progress bar to show remaining stock.

### Invoices

- **Typography:** Stick to `Inter` but maximize contrast for legibility.
- **Structure:** No shadows. Use 1px solid black or dark gray dividers. Table headers must have a light gray background (#F5F7FA) for clear row/column definition when printed.
