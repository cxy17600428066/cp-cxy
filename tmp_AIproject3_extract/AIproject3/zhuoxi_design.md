# Design System Inspiration of Zhuoxi

## 1. Visual Theme & Atmosphere

脱骨侠（Zhuoxi）v3.0 抛弃了粗野主义的生硬（粗黑边框、0px无模糊阴影），全面演进为具有呼吸感、极简质感且充满高能物理交互的**「高级空间动态体验 (Premium Soft & Dynamic Spaces)」**。

页面的基础不再是刺眼的纯白，而是采用具有顶级餐厅温度与克制感的高级**脱骨白（Bone White, `#faf8f5`）**作为大环境漫反射底色。在这一温柔静谧的画布之上，所有的核心信息块（如Hero主视区、商品主图）被装载于**纯白（`#ffffff`）浮岛卡片**之上，辅以具有极大包容度的 `32px` 圆角和极其细腻深邃的弥散光影，形成“悬浮跳跃”的层级空间感。

这套系统的核心在于**“视觉唤醒（Visual Awakening）”**的交互哲学：所有可互动的关键节点（购物车、立即选购），在基态时极为收敛且降低饱和度（如温柔的赤土奶橙），绝不强加视觉压迫；而一旦用户滑过（Hover），它们便如通电般瞬间点燃成为高饱和的品牌色（英雄亮橙、纯高能金），伴随着硅谷顶级的 Y 轴物理抗重力漂浮和光环放射。这创造了一种从“冷静高级”到“狂热食欲”的极致张力，从而高效催化消费者的购买行动。

**Key Characteristics:**
- **绝对空间感 (Absolute Spatial Layering)**：彻底移除所有的边框实线，仅通过底色温差（`#faf8f5` 托举 `#ffffff`）和超平滑弥散阴影（`0px 12px 32px`）创造 3D 悬浮阶层。
- **全动态唤醒机制 (Absolute Interactive Feedback)**：按键系统采取“低饱和敛息 -> 高饱和爆发”的双态物理悬浮映射系统。
- **零按键沉浸轮播 (Zero-Chevron Carousel)**：革除一切 `<`/`>` 传统翻页UI，依托“左右50%隐形互动场域”结合物理微缩略图弹出来控制图层穿梭。
- **巨大的流体圆角**：`24px` 至 `32px` 的全局切割曲线，提供绝对友好的食用亲和力。

## 2. Color Palette & Roles

### Primary Brand
- **亮橙 (Hero Orange)** (`#f34f01`): 主力品牌色。代表极致的食欲、能量。多用于核心文案高光，或组件被激活/ Hover 时爆发的高饱和反馈。
- **酸甜黄 (Zesty Yellow)** (`#f5e46a`): 第二品牌色。充满活力，作为次要行动点或大色块对撞的补充。

### Interactive & States
- **奶橙 (Terracotta Base)** (`#E38859`): 软化后的主力行动色。作为“加入购物车”按钮的默认静默底色，不扎眼，安静等候触发。
- **纯黄 (Energy Gold)** (`#ffe100`): 交互按钮专属的觉醒悬停色（Hover），释放极致行动诱导。
- **清爽绿 (Fresh Green)** (`#09a552` / `#0dd16b`): 成功路径、安全、畅通无阻的辅助交互色。

### Neutral Scale
- **脱骨白 (Bone White)** (`#faf8f5`): 全局的“米白色”物理大环境变量，温柔、护眼、烘托空间感。
- **纯白浮岛 (Pure White)** (`#ffffff`): 绝对坐标系中的上层面板质感，用于包裹核心交互区域，提供极致清晰的阅读性。
- **夜影黑 (Shadow Black)** (`#171717`): 不使用纯黑（#000），改用此具有纵深的暗黑作为标题的主标题字色。

### Accent Colors
- **火爆红 (Spicy Red)** (`#E52E2E`): 高纯度警示与口味标签（如“特辣推荐”），强烈吸引眼球。

## 3. Typography Rules

### Font Family
- **Primary**: `Alibaba PuHuiTi` (阿里普惠体), with fallback: `PingFang SC, Microsoft YaHei, system-ui`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | PuHuiTi | 72px | 900 (Black) | 1.10 (tight) | normal | 用于 Hero 区巨大口号，压迫力极强 |
| Section Title | PuHuiTi | 40px | 800 (Heavy) | 1.25 | normal | 模块主标题，如下方划有黄色饰线 |
| Card Title | PuHuiTi | 24px | 700 (Bold) | 1.30 | -0.5px | 紧凑的商品卡片标题 |
| Subtitle Hero | PuHuiTi | 20px | 500 (Medium)| 1.50 | normal | 品牌长句宣言、副标 |
| Body / Button | PuHuiTi | 16px - 18px | 500/700 | 1.50 | normal | 购物按钮极力要求加粗 (700) 以显示力量 |
| Tag / Badge  | PuHuiTi | 14px | 700 (Bold) | 1.20 | normal | 标签字体，需具有“压印”感 |

### Principles
- **保持力量感**: 就算去掉了硬黑边框，字体的 Weight 仍然要保持重磅（Heavy/Bold），以此保留新粗野主义遗留下来的街头爆发力。
- **无渐变文本**: 所有标题与文字保持实心纯色，禁止使用渐变字。Hero区特殊的高光词语（无骨就是爽）可直接采用不同颜色的纯色字对撞。

## 4. Component Stylings

### Buttons

**Primary Button (Add to Cart)**
- Baseline: `#E38859` (Terracotta), text `#ffffff`, box-shadow `none`.
- Hover/Active: Background ignites to `#f34f01` (Hero Orange), `transform: translateY(-2px)`, generates matched glow shadow `rgba(243, 79, 1, 0.5) 0px 8px 24px`. Click yields physical drop to `translateY(2px)`.

**Secondary Button (Buy Now)**
- Baseline: `#f5e46a` (Zesty Yellow), text `#171717`.
- Hover: Electrifies to `#ffe100`, `transform: translateY(-2px)`, generates golden glow `rgba(245, 228, 106, 0.6) 0px 8px 24px`.

### Cards & Focus Islands
- **Hero Focus Island**: pure white `#ffffff`, massive `32px` radius, thick `padding: 48px`, separated from `#faf8f5` background by soft shadow `rgba(0,0,0,0.06) 0px 12px 32px`.
- **Product Cards**: `border: none`, soft rounding `24px`. Product images may implement *Pop-out* aesthetics (escaping top bounding boxes) visually.
- **Badges**: `#E52E2E` (Spicy Red) container, `#ffffff` text, pill radius.

### Zero-Chevron Carousel
- **Architecture**: No visible `<` `>` arrows. The `div` overlay is split 50/50 functionally into `.zone-left` and `.zone-right`.
- **Hover Micro-interaction**: Entering a zone smoothly unhides an absolute scaled up `140x90px` image thumbnail of the previous/next slide along the edge boundary. 
- **Pagination**: Dots at bottom, default `rgba(255,255,255,0.5)`. Active dot becomes `var(--hero-orange)` and `scale(1.3)`.

## 5. Layout Principles

### Spacing System
- Standard massive padding rules typical of modern spacious design: sections use `80px` or `120px` Y-axis padding to allow elements to float unhindered.

### Whitespace Philosophy
- **"浮岛理论 (Floating Islands)"**: 核心内容必须被视为飘在我们底板上的实体，留白不仅仅是距离，而是为了呈现这些实体的悬停阴影轨迹的“领空”。

### Border Radius Scale
- Badge/Tag: Pill shape / `20px`
- Action Buttons: `999px` (Capsule / Pill shape)
- Standard Product Cards: `24px`
- Giant Canvas / Hero Elements: `48px` to `32px`

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow / Base background (`#faf8f5`) | Page container base |
| Island (Level 1) | `rgba(0,0,0,0.06) 0px 12px 32px, rgba(0,0,0,0.02) 0px 0px 0px 1px` | 英雄区卡片、主要信息容纳盒 |
| Product (Level 2) | `rgba(0,0,0,0.08) 0px 8px 24px` | 商品展示卡片，保证立体展现框架 |
| Interaction (Hover) | `rgba([R,G,B], 0.5) 0px 8px 24px` (Color-matched glow) | 按钮被激发时的独立专属光晕 |
| Peak (Level 4) | `rgba(0,0,0,0.4) 0px 16px 32px` | 轮播微缩略图悬停弹出时（模拟跳出屏幕） |

**Shadow Philosophy (光影重铸)**：Zhuoxi v3.0 的精髓在于彻底放弃 v2.0 僵硬的二维黑块偏移投影。所有深度均由大半径（`24px~32px`）极低不透明度（`0.06~0.08`）的完美物理弥散阴影承担。值得注意的是，交互控件本身（如按钮）悬空时，其散射出的阴影与其本底高光的颜色挂钩以产生**同色系光晕**，而不是普通的黑灰阴影。

## 7. Do's and Don'ts

### Do
- 必须使用米白或其他低对比度暖色（如 `#faf8f5`）作为最底层的宇宙铺垫底色。
- 只在确实需要用户聚焦点击与阅读的区块，投射高光纯白背景块。
- 在所有主要的 CTA 行动点上，贯彻“弱色静待 -> 强色激燃”的视觉唤醒反馈。
- 保证交互动画的手感如真实弹簧般快速和敏锐。

### Don't
- 严禁召回和使用任何 1px - 2px 的全包围实心深色粗边框（即抛弃彻底粗野主义）。
- 严禁在大型主按钮静默态时使用高饱和颜色灼伤用户眼球。
- 严禁使用系统默认的左右切换箭头，永远坚持采用悬停触发场景缩略图的隐形切图法则。
- 严禁对文本框、按钮进行复杂的渐变填充。

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <768px | 单列瀑布流，Hero区域分块上下堆叠排列。 |
| Tablet | 768-1024px | 双列卡片，图片宽度收紧。 |
| Desktop | >1024px | 完整宽屏体感，Hero图片右侧摆放，呈现左右完美平衡与巨大的呼吸空间。 |

## 9. Agent Prompt Guide

### Quick Color Reference
- **Env Base**: Bone White (`#faf8f5`)
- **Focus Base**: Pure White (`#ffffff`)
- **Primary Awake**: Hero Orange (`#f34f01`)
- **Primary Sleep**: Terracotta (`#E38859`)
- **Secondary Awake**: Energy Gold (`#ffe100`)
- **Secondary Sleep**: Zesty Yellow (`#f5e46a`)
- **Titles**: Shadow Black (`#171717`)
- **Alert**: Spicy Red (`#E52E2E`)

### Example Component Prompts
- "Create a focus card over a `#faf8f5` base: Use `#ffffff` background with generous `48px` padding and massive `32px` border radius. Lift it using a soft shadow `rgba(0,0,0,0.06) 0px 12px 32px`. Inside, use heavy PuHuiTi text in `#171717`."
- "Build a CTA button: Start with `#E38859` (rest state) and no shadow, `999px` capsule radius. On hover, abruptly change background to high-saturation `#f34f01`, shift `-2px` up on Y axis, and erupt a color-matched shadow `rgba(243, 79, 1, 0.5) 0px 8px 24px`. On active, sink it `2px` down."
- "Implement a carousel without typical controls: Define `.carousel-zone` overlays on the left 50% and right 50% limits. When hovered, trigger a physical `img` scaled thumbnail (`140x90px`) to appear (`opacity: 1`) bound to the far edges."