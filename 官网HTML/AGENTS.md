# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

The admin must keep each content area on its own management page, open create/edit forms in modal dialogs, and expose configurable website header navigation (including second-level menus), footer navigation, filing text/links, page banners, and uploadable image fields. Do not expose a standalone image-resource module; page Banner configuration belongs in its own internal tab inside Navigation & Footer.

Keep long configuration surfaces split into internal tabs. Do not expose a separate page-module manager. Combine news and articles into one content-center module with separate tabs. Image upload fields belong to their corresponding content or product forms instead of a central image-resource manager.

Use “商品分类” as the user-facing term for product categories. Each product category has a configurable name, description, detail-button text, and image, and products associate with one category. Every category row has a direct “管理商品” action that opens its filtered product list. On the frontend, category cards expose an explicit detail action and reveal only the published products assigned to that selected category.

Product records include standard name, short name, joint/SKU code, version, operating status, brand, category, flavor, unit, weight, bone/content attribute, storage condition, solid-content percentage, shelf life, spiciness, sales channel, barcode, in-stock and out-of-stock delivery limits, descriptive content, and a dedicated product render/effect image. The frontend product detail view exposes these configured fields.

Do not expose management-overview or global-site-settings pages in the admin navigation. The admin starts from the brand-and-group content module, where brand introduction and group introduction are independently editable and feed the corresponding frontend pages.

The reference sections for production/R&D/quality, milestones, honors, culture, supply-chain capabilities, channel distribution, business cooperation, and recruitment are all configurable. Keep them grouped into the independent Brand & Group, Supply Chain, and Channel & Careers admin pages; edit each submodule in a modal with text, data items, and image fields.

Footer navigation is hierarchical: first-level items are display-only column headings, while second-level items are the clickable links. The footer editor must support second-level items just like the header navigation editor.

Match the footer reference with a six-column orange desktop layout; keep the configurable copyright and filing bar below it. The HTML footer replaces any footer embedded in the homepage design image.
