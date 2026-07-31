---
name: Ink & Balance
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#615e58'
  on-secondary: '#ffffff'
  secondary-container: '#e7e2da'
  on-secondary-container: '#67645e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1b1a'
  on-tertiary-container: '#868382'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e7e2da'
  secondary-fixed-dim: '#cac6be'
  on-secondary-fixed: '#1d1c17'
  on-secondary-fixed-variant: '#494741'
  tertiary-fixed: '#e6e2df'
  tertiary-fixed-dim: '#cac6c4'
  on-tertiary-fixed: '#1c1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  cinnabar-red: '#C0392B'
  pine-green: '#2E7D5E'
  slate-blue: '#2B6CB0'
  ochre-warning: '#B7610A'
  ink-wash-gray: '#D4CCBC'
  pale-ink: '#6B6B6B'
typography:
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Noto Serif
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Noto Serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Noto Serif
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  number-display:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: 0.05em
  number-standard:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 24px
  gutter: 16px
  section-gap: 40px
  ink-stroke-thin: 1px
  ink-stroke-thick: 3px
---

## Brand & Style
The design system is rooted in the philosophy of **"Liubai" (留白)**—the intentional use of negative space to create a sense of calm and focus in personal finance management. The brand personality is **Contemplative, Minimalist, and Cultured**, aiming to transform the often-stressful act of expense tracking into a serene, ritualistic experience.

The chosen style is a **Modern-Ink Hybrid**. It blends the raw, organic qualities of traditional Chinese ink wash painting with the functional precision of modern SaaS layouts. The UI avoids cluttered containers, instead using varying ink weights and brush-stroke textures to define hierarchy. This "Traditional Chinese Ink Wash" aesthetic evokes a sense of timeless reliability and intellectual depth, positioning the app as a sophisticated companion for financial mindfulness.

## Colors
The palette is inspired by the four treasures of the study. 

- **Primary (Ink Black):** Used for core typography and primary structural elements, representing the permanence of financial records.
- **Secondary (Xuan Paper White):** The foundational background color, providing a warm, textured alternative to sterile digital whites.
- **Functional Colors:** 
    - **Cinnabar Red:** Reserved strictly for expenses and negative balances, echoing the traditional seal paste used in calligraphy.
    - **Pine Green:** Used for income and positive growth, symbolizing vitality.
    - **Slate Blue:** The interactive accent for links, primary buttons, and active states.
    - **Ochre:** Specifically for budget warnings and alerts.

**Color Mode:** The default experience is `light` to mimic the appearance of physical paper. A `dark` mode ("Night Ink") is available, utilizing `#121212` as the deep base to maintain the theme's high-contrast elegance.

## Typography
The typography system creates a rhythmic balance between historical elegance and modern utility. 

- **Songti Style (Noto Serif):** Used for all Chinese and English prose. The serif strokes mimic the chisel of woodblock printing, providing a literary quality to the interface.
- **Numbers (Hanken Grotesk / DIN Alternate proxy):** Financial data must be clear and legible. A clean, high-readability sans-serif is used for all currency and percentage values to ensure clarity at a glance, especially within the "10-second entry" workflow.

Numbers should always use tabular lining (equally spaced digits) to ensure that amounts align perfectly in lists and reports.

## Layout & Spacing
The layout follows a **Fixed Grid** model for desktop and tablet, centered with generous side margins to reinforce the "Liubai" philosophy. 

- **Mobile:** A single-column layout with 24px side margins. Elements are grouped in cards that span the full width minus margins.
- **Desktop:** A 12-column grid with a maximum content width of 1140px. 
- **Rhythm:** An 8px base unit drives all spacing. Large gaps (40px+) are encouraged between major sections to prevent the UI from feeling cramped.

Instead of traditional hairline dividers, use **brush-stroke dividers**—variable width lines that taper at the ends—to separate day groupings in the bill list.

## Elevation & Depth
This design system rejects heavy material shadows in favor of **Tonal Layers** and **Subtle Diffusion**.

- **Surfaces:** The primary background is Xuan Paper (#F5F0E8). Interactive cards sit on a slightly lighter "Pure White" (#FAF7F2) surface.
- **Shadows:** Use extremely soft, low-opacity shadows (`rgba(26, 26, 26, 0.05)`) with a large blur radius to simulate a paper sheet resting on a desk. 
- **Depth via Ink:** Depth is also communicated through ink saturation. Background elements use "Pale Ink," while the active foreground elements use "Deep Ink." 
- **Dividers:** Use hand-drawn, non-uniform lines to create boundaries without the rigidity of digital grids.

## Shapes
Shapes are **Soft** but disciplined. 

- **Cards and Containers:** Use a 0.25rem (4px) or 0.5rem (8px) radius. This provides a gentle organic feel without losing the structure of a professional financial tool.
- **Buttons:** Primary buttons use a 4px corner radius and a solid 1px ink-black border. 
- **Input Fields:** These are defined by a bottom-only border (2px) in Slate Blue when focused, mimicking the underline of a calligrapher’s guide.
- **Icons:** Icons should feature varied line weights (tapered ends) to look hand-drawn rather than vector-perfect.

## Components
- **Buttons:** 
    - *Primary:* Solid Ink Black with Slate Blue text or White text. High contrast, no shadow, subtle 1px border.
    - *Secondary:* Xuan White background with an Ink Black stroke.
- **Cards:** Use "Pure White" (#FAF7F2) with an 8px radius and a soft 6% opacity shadow. No borders.
- **Inputs:** Minimalist style. No background fill. Only a 1px "Ink Wash Gray" bottom border that transitions to a 2px "Slate Blue" stroke on focus.
- **Chips/Categories:** Circular icons (32x32) with a pale ink wash background. Icons inside use variable line weights.
- **Lists:** Daily groups are separated by a custom "brush-stroke" SVG divider. Entries show the amount on the right in DIN-style typography, colored Cinnabar (Expense) or Pine Green (Income).
- **Progress Bars:** For budgets, use a textured "ink bleed" fill effect rather than a solid color block to show progress.
- **Floating Action Button (FAB):** A circular "Seal" button in Cinnabar Red with a white "+" in a hand-drawn style, located at the bottom center for quick entry.