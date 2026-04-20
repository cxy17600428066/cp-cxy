# Design System Inspiration: Premium Floating Island (轻舟浮岛 System)

## 1. Visual Theme & Atmosphere

This design system is built around a single governing metaphor: **content as physical objects floating in warm ambient air**. The environment is not white — it is a carefully chosen bone-white (`#faf8f5`) that carries the faint warmth of natural light, creating a canvas that feels premium without the clinical coldness of pure white.

On this warm ground plane, all meaningful content surfaces — cards, panels, action blocks — are rendered in pure white (`#ffffff`) with `32px` corner radii and omnidirectional diffused shadows. These surfaces appear to hover above the base layer, as if weightless. The system makes no use of hard borders or dividing lines; depth is communicated entirely through two mechanisms: **background temperature contrast** (warm base vs. cooler white island) and **diffused glow shadows** with zero X/Y offset.

The color system is built around a **single dynamic primary variable** (`--primary-color`). In its default state this is a high-energy amber (`#ffaa00`). In multi-context products, this variable is swapped per module to create strong emotional differentiation between sections, while the neutral structural tokens (backgrounds, text, shadows) remain constant. This architecture gives each module its own emotional identity without ever fracturing the overall visual coherence.

The system natively supports **two lighting modes**: a warm daytime mode built on bone-white environments, and a precision-engineered dark mode using GitHub-calibrated near-black tones (`#0d1117`, `#161b22`). The transition between modes is animated at 1 second — never instantaneous.

**Key Characteristics:**
- `#faf8f5` bone-white as the global page environment — warm, eye-safe, depth-enabling
- `#ffffff` pure white surfaces as "floating islands" hovering above the environment
- Zero directional shadows — all depth via omnidirectional diffused glow
- Zero border lines — no `1px solid` dividers are ever used for structural separation
- Single `--primary-color` variable drives all interactive elements and emotional tone
- `32px` border radius on cards; `999px` on all pill-shaped interactive elements
- Spring-curve physics for all state transitions (`cubic-bezier(0.34, 1.56, 0.64, 1)`)
- Active/press feedback via `scale(0.97–0.98)` — never color flash alone

---

## 2. Color Palette & Roles

### Environmental Base (全局底色)
- **Bone White** (`#faf8f5`): The page environment. Warm, off-white, never blindingly bright. Every page is set against this — it is the "air" that the floating islands breathe in.
- **Pure White** (`#ffffff`): The island surface. Applied to all cards, panels, modals, and interactive containers. Creates a clear perceptual layer above `#faf8f5` without requiring borders.
- **Shadow Black** (`#171717`): Primary text. Not pure black — contains just enough warmth to live harmoniously on white surfaces without harsh contrast.
- **Smoke Gray** (`#888888`): Secondary / muted text. Used for supporting copy, metadata, placeholder text, and timestamps.

### Primary Brand Color (动态主色)
Controlled by a single CSS variable `--primary-color`. The default is:
- **Amber** (`#ffaa00`): High-energy, warm. Default brand color for navigation accents, progress indicators, and primary buttons.

In multi-module products, the variable may be reassigned per context. Suggested palette for extended systems:

| Emotion          | Color Name      | Hex       | Personality |
|-----------------|-----------------|-----------|-------------|
| Default / Warm  | Amber           | `#ffaa00` | energetic, accessible |
| Precision / Tech | Electric Blue   | `#00c3ff` | analytical, cool |
| Creative / Deep  | Violet          | `#7b61ff` | mysterious, premium |
| Warmth / Care    | Coral           | `#ff6b6b` | emotional, inviting |
| Growth / Fresh   | Mint Green      | `#4dbd74` | optimistic, vital |
| Calm / Clear     | Sky Blue        | `#20a8d8` | serene, trustworthy |
| Power / Urgent   | Crimson         | `#e74c3c` | authority, intensity |
| Understated / Pro| Slate           | `#34495e` | professional, muted |

### Interactive States (交互状态)
- **Hover default**: Primary color darkened ~10% (e.g. `#ffaa00` → `#e69900`) + `translateY(-2px)` lift
- **Active / Pressed**: Primary color darkened + `translateY(2px)` sink + shadow compression
- **Danger**: `#ff5252` — reserved exclusively for destructive actions (delete, clear)
- **Tinted shadow**: All buttons produce a same-color glow shadow (`rgba(primary, 0.3)`) on hover, never a black shadow

### Neutral Warm Backgrounds (温暖中性)
- **Parchment** (`#fffdf9`): Warm variant surface, used for contextually warmer panels (editorial sections, historical card variants)
- **Cream Border** (`#efead3`): Soft warm divider, only used when a border is semantically necessary (e.g., card outlines in warm-background contexts, never on bone-white base)
- **Progress Track** (`#eae7e0`): Progress/slider track fill — warm-toned to harmonize with bone-white environment

### Dark Mode Palette (深色模式)
- **Dark BG** (`#0d1117`): Page base — GitHub-calibrated near-black with a cold blue undertone
- **Dark Card** (`#161b22`): Floating card surface in dark mode. One step above the base.
- **Dark Border** (`#30363d`): The only structural border used in dark mode — on cards only
- **Dark Panel** (`#21262d`): Subtle panel or recessed state
- **Dark Primary Text** (`#c9d1d9`): Soft near-white — readable without eye strain
- **Dark Secondary Text** (`#8b949e`): Muted content text in dark mode
- **Dark Accent Blue** (`#58a6ff`): Replaces `--primary-color` in dark mode for accessibility contrast

---

## 3. Typography Rules

### Font Family
- **Primary (Web)**: `'Inter', 'Noto Sans SC', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
- **Primary (Mobile/App)**: `-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
- **Display / Hero**: `Impact, 'Arial Black', sans-serif` — reserved exclusively for hero result codes where maximum visual weight and compressed character width is required (stamp effect)
- **No custom fonts required** — the system is intentionally built on system stacks for performance and native fidelity

### Type Scale

| Role             | Size (px) | Weight | Line Height | Letter Spacing | Notes |
|-----------------|-----------|--------|-------------|----------------|-------|
| Display Hero     | 70px      | Impact | 1.1         | −0.5px         | Stamp-effect result headline, max visual weight |
| Page Title       | 24px      | 800    | 1.25        | −0.5px         | Section headings, greet headers |
| Section Headline | 22px      | 800    | 1.3         | normal         | Card headers, module titles |
| Ceremonial Label | 28px      | 900    | 1.0         | +2px           | Classification codes, ceremonial identifiers (wide tracking) |
| Card Title       | 18px      | 700    | 1.3         | −0.25px        | Item names in list cards |
| Body Strong      | 16px      | 700    | 1.5         | normal         | Primary CTA text, emphasized body |
| Body             | 14px      | 400    | 1.6–1.8     | normal         | Descriptions, analysis paragraphs |
| Body Medium      | 14px      | 500    | 1.5         | normal         | Interactive labels, option text |
| Sub Text         | 12px      | 400    | 1.4         | normal         | Supporting info, subtitles, timestamps |
| Badge / Tag      | 10–11px   | 700    | 1.2         | normal         | Capsule labels, category chips |
| Progress Text    | 14px      | 700    | 1.0         | normal         | Step counters (e.g., "3 / 10") |

### Principles
- **Weight carries hierarchy**. In a borderless floating system, font weight is the primary signal of information importance. `400` reads; `700` announces; `800+` commands.
- **Impact is a weapon, not decoration**. The Impact / `font-family: Impact` display role should be used exactly once per major result screen to create a visual anchor — a stamp that the eye immediately goes to. Never use it for body copy.
- **Wide tracking signals ceremony**. Key classifications and codes use positive letter-spacing (1–2px) to evoke the feeling of stamped labels, official badges, or classified markers. Normal body copy never has positive tracking.
- **Generous line height for reading**: Any text over 2 sentences uses `line-height: 1.6–1.8` — this is the "sofa reading" standard; content that is long needs room to breathe.

---

## 4. Component Stylings

### Buttons

**Primary Button** — The main conversion action
- Background: `var(--primary-color)` at rest; darkened ~10% on hover/active
- Text: `#ffffff`, weight 700
- Radius: `999px` (pill)
- Padding: `14px 32px`
- Shadow at rest: none
- Shadow on hover: `0 8px 24px rgba(primary, 0.35)` — same-color glow, not black
- Active: `translateY(2px)` physical press-down feel

**Secondary / Tinted Outline Button** — Supporting action at same level
- Background: `#ffffff`
- Border: `2–4px solid var(--primary-color)`
- Text: `var(--primary-color)`, weight 700
- Shadow: `0 8px 20px -5px rgba(primary, 0.25)` near-field glow

**Ghost Button** — De-emphasized, tertiary action
- Background: `#fcfcfc`
- Border: `1px solid #e5e5e5`
- Text: `#666`, weight 500
- Shadow: `0 4px 12px rgba(0,0,0,0.02)`
- No hover color change — only shadow response

**Icon / Circular Button** — Global-level or minimal UI action
- Shape: Fixed `40×40px` circle
- Background: `var(--primary-color)`
- Text / Icon: `#ffffff`, weight 800
- Shadow: `0 4px 12px rgba(0,0,0,0.10)`
- No `border-radius` shorthand — use explicit `border-radius: 50%`

### Cards & Surfaces

**Standard Floating Island Card** — The system's foundational container
```css
background: #ffffff;
border-radius: 32px;     /* or 16px for tighter layouts */
padding: 20px;
box-shadow: 0 12px 32px rgba(0, 0, 0, 0.05);
/* NO border */
```

**Insight / Analysis Card** — Secondary informational block
```css
background: #ffffff;
border-radius: 32px;
padding: 20px;
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
/* Section header uses ::before pseudo-element with 4px accent left-bar */
```

**Accent-Border Card** — Single-edge brand emphasis (document / archive feel)
```css
background: #ffffff;
border-radius: 15px;
border-left: 6px solid var(--primary-color);
padding: 20px;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
```

**Warm Variant Card** — Contextual warmer surface (editorial, archive)
```css
background: #fffdf9;
border: 1px solid #efead3;
border-radius: 20px;
padding: 15px;
```

**Ambient Color Block** — Full-bleed color surface (emotional / atmospheric)
```css
background: linear-gradient(/* dynamic per context */);
border-radius: 32px;
box-shadow: 0 16px 48px rgba(0, 0, 0, 0.10);
animation: pulseBreath 3s infinite alternate;   /* scale 1 → 1.02 */
```

### Selection / Option Items

**Option at rest**
```css
background: #faf8f5;    /* matches page environment — "blended in" */
border-radius: 12px;
padding: 18px 20px;
transition: all 0.2s ease;
```

**Option selected / pressed**
```css
background: var(--primary-color);
color: #ffffff;
transform: scale(0.97);
```
No border change, no outline — only background fills and scale.

### Badges & Tags

**Category Pill** — Tinted label using the current primary color
```css
background: rgba(primary, 0.10);   /* 10% opacity tint of primary */
color: var(--primary-color);
border-radius: 999px;
padding: 3px 10px;
font-size: 11px;
font-weight: 700;
```

**Neutral Tag** — No color dependency
```css
background: rgba(0, 0, 0, 0.04);
color: #555;
border-radius: 999px;
padding: 4px 12px;
font-size: 12px;
font-weight: 600;
```

**Warm Classified Pill** — For formal classifications in warm-background contexts
```css
background: #f1ebd7;
color: #5c4b37;
border: 1px solid rgba(0, 0, 0, 0.05);
border-radius: 999px;
padding: 4px 10px;
```

### Navigation & Structure

**Top Navigation Bar**
- Background: `#faf8f5` — matches page. The nav has no border — it simply is the page.
- After scroll: `background: rgba(250,248,245,0.92)` + `backdrop-filter: blur(16px)` + soft shadow `0 4px 16px rgba(0,0,0,0.04)`
- Text: `#171717`, weight 600, 15px
- Logo treatment: paired brand mark + wordmark, left-aligned

**Tab Switcher**
```css
/* Active tab */
color: #171717;
font-weight: 700;
/* Active indicator bar below */
::after { width: 18px; height: 3px; background: var(--primary-color); border-radius: 99px; }
/* Entering: */ animation: tabSlide 0.3s ease-out;
@keyframes tabSlide { from { width: 0; opacity: 0; } to { width: 18px; opacity: 1; } }

/* Inactive tab */
color: #888888;
font-weight: 500;
```

**Search Input**
```css
background: #ffffff;
border-radius: 999px;
padding: 9px 15px;
box-shadow: 0 4px 16px rgba(0,0,0,0.04);
/* NO border — distinguished from environment by shadow and surface color only */
```

**Progress Bar**
```css
/* Track */
background: #eae7e0;
border-radius: 99px;
height: 10px;

/* Fill */
background: var(--primary-color);
border-radius: 99px;
transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); /* spring overshoot */
```

---

## 5. Layout Principles

### Spacing Scale
| Token | Value | Use |
|-------|-------|-----|
| `--spacing-xs` | 8px | Icon gaps, inline micro spacing |
| `--spacing-sm` | 12px | Between related items within a card |
| `--spacing-md` | 16–20px | Standard inter-component margin |
| `--spacing-lg` | 24px | Card padding, section dividers |
| `--spacing-xl` | 32–40px | Container padding, section gaps |
| `--spacing-2xl` | 60–80px | Between major sections |

### Floating Island Philosophy (浮岛法则)

The system has four laws:

1. **The environment is `#faf8f5`** — not white, not any other color. This is non-negotiable.
2. **Islands are `#ffffff`** — every content container lives at exactly this elevation. There is no third neutral surface (no `#f5f5f5` panels, no grey boxes).
3. **Depth is air, not weight** — all shadows use `0 0` X/Y offset. There is no implied light direction. The shadow radiates from the card itself, as if it glows slightly.
4. **No border lines** — structural separation happens through spacing and background contrast. A `1px solid #eee` line divider is a design failure in this system.

### Grid & Layout
- **Max content width**: `1200px` (desktop), `100% - 32px` padding (mobile)
- **Card grid**: 2–3 columns desktop; 1 column mobile; `24px` gap
- **Page padding**: `20px` mobile, `40px` desktop (horizontal)
- **Section spacing**: `80–120px` vertical between major sections (desktop), `48px` mobile
- All layouts are **single-column flow on mobile** — never horizontal scroll, never truncated content

---

## 6. Depth & Elevation

| Level | Surface | Shadow | Use |
|-------|---------|--------|-----|
| Level 0 — Ground | `#faf8f5` | none | Page background, the environment |
| Level 1 — Island | `#ffffff` | `0 12px 32px rgba(0,0,0,0.05)` | Standard cards, panels |
| Level 1.5 — Low Island | `#ffffff` | `0 8px 30px rgba(0,0,0,0.03)` | Secondary info cards, softer panels |
| Level 2 — Raised | `#ffffff` | `0 12px 40px rgba(0,0,0,0.10)` | Images, featured media |
| Level 2.5 — Hero | `#ffffff` / gradient | `0 16px 48px rgba(0,0,0,0.10)` | Feature hero blocks, atmospheric elements |
| Level 3 — Dark Card | `#161b22` | `0 10px 40px rgba(0,0,0,0.40)` | Dark mode floating cards |
| Hover — CTA Glow | — | `0 8px 24px rgba(primary, 0.35)` | Interactive elements on hover |

**Shadow Philosophy**: This system entirely abandons directional shadows (`2px 4px 8px`). All depth is expressed via omnidirectional, large-radius, low-opacity diffusion. The shadow says "I float here" — not "light comes from top-left." This creates a spatial quality that feels like physically lifted material rather than a 2D element with a drop shadow applied.

---

## 7. Motion & Animation

### Core Easing Curves

| Curve | Value | Feel |
|-------|-------|------|
| Standard | `cubic-bezier(0.4, 0, 0.2, 1)` | Material-style, smooth |
| Spring (overshoot) | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy, overshoots target by ~5%, then settles — "alive" |
| Enter | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Fast initial, decelerates gently |
| Exit | `cubic-bezier(0.4, 0.0, 1, 1)` | Accelerates to completion |

### Named Animation Patterns

**Horizontal Panel Swap (Left ← Right content transition)**
```css
@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fadeOutLeft {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(-20px); }
}
/* Forward navigation: exit (0.3s) then enter (0.4s) */
```

**Content Reveal (image or card appearing)**
```css
@keyframes revealScale {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
/* Duration: 0.8s ease-out — creates "photo developing" feel */
```

**Ambient Breath (living background blocks)**
```css
@keyframes breathe {
  from { transform: scale(1); }
  to   { transform: scale(1.02); }
}
/* animation: breathe 3s infinite alternate — gentle, cyclical, background-only */
```

**Indicator Entry (tab underline, badge count)**
```css
@keyframes growIn {
  from { width: 0; opacity: 0; }
  to   { width: var(--target-width); opacity: 1; }
}
/* 0.3s ease-out */
```

### Interaction Response Times
| Action | Duration | Notes |
|--------|----------|-------|
| Button press feedback | `0.15–0.2s` | `scale(0.97)` — near-instant physical response |
| Progress bar fill | `0.4s` spring curve | Overshoot and settle |
| Card hover lift | `0.25s` ease | `translateY(-4px)` + shadow expansion |
| Tab switch | `0.3s` ease | Indicator width animation |
| Dark mode transition | `1.0s` ease | Background color only, never jarring |
| Content reveal | `0.4–0.8s` ease-out | Scenes, media reveal |

---

## 8. Dark Mode

This system implements a complete, pre-designed dark mode — not a simple CSS `filter: invert()` operation. All values below are independently specified.

### Color Remapping
| Light Mode Token | Dark Mode Value | Notes |
|-----------------|-----------------|-------|
| Page BG `#faf8f5` | `#0d1117` | GitHub-calibrated; cold-toned near-black |
| Card Surface `#ffffff` | `#161b22` | One step above base |
| Panel / Trough | — | `#21262d` |
| Card Border | none | `1px solid #30363d` — the ONLY context where a border appears |
| Primary Text `#171717` | `#c9d1d9` | Warm near-white |
| Secondary Text `#888` | `#8b949e` | Muted cool-gray |
| Primary color accent | `#58a6ff` | Overrides `--primary-color` for contrast safety |
| Progress track `#eae7e0` | `#21262d` | Dark trough |

### Mode Transition
```css
.dark-mode,
.dark-mode [data-surface] {
  transition: background-color 1.0s ease,
              border-color 0.5s ease,
              color 0.5s ease;
}
```
Never transition at `0s` — the 1s duration makes day/night switching feel natural and intentional, not accidental.

---

## 9. Do's and Don'ts

### Do
- Use `#faf8f5` as the global page base color — this is the single most important constraint in the system
- Make shadows omnidirectional (`box-shadow: 0 Npx Mpx rgba(0,0,0,X)` with X/Y always 0)
- Use `--primary-color` as the sole chromatic variable — change it per module for emotional differentiation
- Use `999px` border-radius for all pill-shaped elements (search bars, buttons, tags)
- Use `32px` border-radius for cards and major containers
- Give every primary button a **same-color glow shadow** on hover (`rgba(primary, 0.3)`)
- Keep dark mode values independently specified — do not approximate with filters or opacity tricks
- Use spring easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`) for progress fills and loading states
- Make all press/active states produce a physical `scale(0.97–0.98)` downward push

### Don't
- Do not use `#ffffff` as the page background — only `#faf8f5` is the correct environment
- Do not use directional shadows (x/y offset) — they imply a light source and break the floating metaphor
- Do not draw `1px solid` dividing lines inside cards, between sections, or below navigation
- Do not use `font-weight: 700+` for body-length reading text — weight is reserved for labels and headings
- Do not apply multiple brand colors to the same page — one primary color per context
- Do not use flat color transitions for mode switching — always use `transition` with `1s ease`
- Do not scale down cards on hover — only lift them (`translateY(-4px)` + shadow)
- Do not use colored backgrounds for ghost/secondary buttons — they exist in white or transparent only

---

## 10. Agent Prompt Guide

### Quick Color Reference
```
Page environment:       #faf8f5  (Bone White)
Card surface:           #ffffff  (Pure White)
Primary text:           #171717  (Shadow Black)
Secondary text:         #888888  (Smoke Gray)
Default primary:        #ffaa00  (Amber)
Danger action:          #ff5252  (Alert Red)
Progress track:         #eae7e0  (Warm Stone)

Dark BG:                #0d1117
Dark card:              #161b22
Dark border:            #30363d
Dark panel:             #21262d
Dark primary text:      #c9d1d9
Dark secondary text:    #8b949e
Dark accent (replaces primary): #58a6ff
```

### CSS Variable Starter Template
```css
:root {
  /* Environment */
  --bg-base:        #faf8f5;
  --surface:        #ffffff;
  --text-primary:   #171717;
  --text-muted:     #888888;

  /* Brand (swap per module) */
  --primary:        #ffaa00;
  --primary-dark:   #e69900;

  /* Semantic */
  --danger:         #ff5252;
  --track-fill:     #eae7e0;

  /* Elevation */
  --shadow-card:    0 12px 32px rgba(0,0,0,0.05);
  --shadow-soft:    0 8px 30px rgba(0,0,0,0.03);
  --shadow-raised:  0 12px 40px rgba(0,0,0,0.10);
  --shadow-cta:     0 8px 24px rgba(255,170,0,0.35); /* update per primary */

  /* Radius */
  --r-pill:     999px;
  --r-card:      32px;
  --r-panel:     20px;
  --r-inner:     12px;
  --r-badge:     99px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-base:      #0d1117;
    --surface:      #161b22;
    --text-primary: #c9d1d9;
    --text-muted:   #8b949e;
    --primary:      #58a6ff;
    --track-fill:   #21262d;
  }
}
```

### Example Component Prompts
- **「Create a standard card」**: "Place a `#ffffff` background container with `32px` border-radius, `20px` padding, and `box-shadow: 0 12px 32px rgba(0,0,0,0.05)`. Do not give it any border. It sits on a `#faf8f5` page background."
- **「Create a primary CTA button」**: "Pill-shaped button (`border-radius: 999px`), `#ffaa00` background, white bold text, no shadow at rest. On hover: background darkens to `#e69900`, `translateY(-2px)` lift, shadow erupts to `0 8px 24px rgba(255,170,0,0.35)`. On active: `translateY(2px)` press-down."
- **「Create a category badge」**: "10–11px bold text in the current primary color. Background is primary color at 10% opacity (`rgba(primary, 0.10)`). Pill radius `999px`. No border."
- **「Create dark mode card」**: "Background `#161b22`, border `1px solid #30363d` (the only context a border appears in this system), shadow `0 10px 40px rgba(0,0,0,0.40)`. Text in `#c9d1d9`. Accent elements use `#58a6ff` instead of `--primary`."
- **「Create a progress bar」**: "Track `#eae7e0`, fill `var(--primary)`, both with `999px` radius. Fill transition: `width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)` — spring easing that overshoots before settling."
- **「Create dark-mode transition」**: "On `.dark-mode` class toggle: `transition: background-color 1s ease`. Never 0s. The 1 second duration makes the mode change feel like sunset, not a switch flipped."
