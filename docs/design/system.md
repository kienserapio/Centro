# Centro — Design System

7.1 Design Philosophy
Centro's visual language is "Modern Minimalist SaaS." Every design decision optimizes for clarity and speed-of-comprehension. Users — many of whom are not power users — should be able to accomplish any task without instruction. The interface should feel clean, trustworthy, and never cluttered.
7.2 Color System
Token
Value & Usage
Primary — Forest Green
#2D5A27 — Primary actions, active nav states, success indicators, section headings
Accent — Sunset Orange
#FF8C42 — Alerts, CTAs, overdue badges, emergency buttons, attention-needed states
Background
#FFFFFF — Page background; keep surfaces white for readability
Surface
#F8F9FA — Card backgrounds, input fills, sidebar background
Border
#E5E7EB — Dividers, input borders, table rules
Text Primary
#111827 — Headings and body text with high contrast
Text Secondary
#6B7280 — Labels, captions, metadata, placeholder text
Danger
#DC2626 — Destructive actions, error states, critical alerts
Info
#2563EB — Informational banners, neutral alert states


7.3 Color Mapping: Green vs. Orange
Use Forest Green (#2D5A27) for...
Use Sunset Orange (#FF8C42) for...
Primary buttons (Submit, Save, Confirm)
Emergency alert button
Navigation active/selected state
Overdue balance badge
Success toast notifications
"Action Required" badges
Positive stats (Paid, Resolved)
High-priority announcement labels
Logo and brand marks
Collection shortfall indicators
Form focus rings
Onboarding CTA buttons on landing page


7.4 Typography
Element
Specification
Font Family
Product Sans — clean, legible at all sizes, wide Unicode support
Heading 1 (Page)
30px / 700 weight / tight tracking
Heading 2 (Section)
24px / 600 weight
Heading 3 (Card)
18px / 600 weight
Body
14px / 400 weight / 1.6 line height
Caption / Label
12px / 500 weight / uppercase tracking for labels
Monospace (amounts)
JetBrains Mono — used for peso amounts and IDs for visual alignment


7.5 Grid & Spacing System
Layout: 12-column grid with 24px gutters on desktop, 16px on tablet, 8px on mobile.
Container max-width: 1280px, centered.
Base spacing unit: 4px. All spacing values are multiples of 4 (4, 8, 12, 16, 24, 32, 48, 64).
Sidebar width (desktop): 240px fixed. Main content: fluid fill of remaining columns.
Mobile: sidebar collapses to bottom navigation bar (4 primary icons).

7.6 Component Specifications
Buttons
Variant
Spec
Primary
bg: Forest Green, text: white, border-radius: 8px, padding: 10px 20px, hover: darken 10%
Secondary
bg: transparent, border: 1.5px Forest Green, text: Forest Green, hover: bg tint green
Danger
bg: #DC2626, text: white — for destructive actions only (Delete, Remove)
Ghost
bg: transparent, text: Gray — for tertiary actions in tables or menus
Alert / CTA
bg: Sunset Orange, text: white, border-radius: 8px — for Emergency and key CTAs


Cards
Background: #FFFFFF, border: 1px solid #E5E7EB, border-radius: 12px.
Box shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06).
Internal padding: 20px. Header padding (title area): 16px 20px.
Hover state (for clickable cards): shadow increases, border transitions to Forest Green.


## Component Inventory
| Component | Path | Status |
|-----------|------|--------|
| Button | `src/components/ui/Button.tsx` | ✅ Done |
| Badge | `src/components/ui/Badge.tsx` | ✅ Done |
| Card | `src/components/ui/Card.tsx` | ✅ Done |
| MacosWindow | `src/components/ui/MacosWindow.tsx` | ✅ Done |
| Sidebar | `src/components/layout/Sidebar.tsx` | 🚧 Skeleton |
| EmergencyAlert | `src/components/sections/EmergencyAlert.tsx` | 🚧 Skeleton |
| DuesChart | `src/components/sections/DuesChart.tsx` | 🚧 Skeleton |

## Spacing Scale
Follows Tailwind defaults (`p-4` = 16px, `p-6` = 24px, `p-8` = 32px).
