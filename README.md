# Bitcoin Layers Map

An interactive map of Bitcoin and its scaling layers, published as a self-contained single HTML file per language. It runs inside a CMS via embed with no server, no framework runtime, and no external dependencies beyond Google Fonts.

---

## How it works (the short version)

You edit files in `src/`. Running `npm run build` produces `dist/en.html` and `dist/fr.html` — two fully self-contained HTML files with all CSS and JavaScript inlined. You paste those into your CMS. That's the whole workflow.

The build tool is [Astro](https://astro.build), which handles the templating and per-locale page generation. [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) then inlines everything so each output is a single file with zero external dependencies (except Google Fonts, which loads from the CDN at runtime).

The codebase is written in **TypeScript** throughout (`src/types.ts` defines all shared interfaces). Astro and Vite handle the compilation — you never run `tsc` directly.

---

## Prerequisites

- [Node.js](https://nodejs.org) version 18 or later. Check with `node -v`.
- npm (comes with Node). Check with `npm -v`.

---

## Getting started

```bash
npm install      # install dependencies (only needed once)
npm run dev      # start local dev server at http://localhost:4321
```

Open `http://localhost:4321/en` or `http://localhost:4321/fr` to preview. The dev server hot-reloads on every file save.

To build the final files for the CMS:

```bash
npm run build    # outputs dist/en.html and dist/fr.html
```

---

## Project structure

```
src/
├── types.ts                  ← all shared TypeScript interfaces
│
├── pages/
│   └── [lang]/
│       └── index.astro       ← entry point, one page per locale
│
├── i18n/
│   ├── en.json               ← all English UI strings
│   └── fr.json               ← all French UI strings
│
├── content/
│   ├── topology.ts           ← shared structure (nodes, edges, tiers)
│   ├── nodes.en.json         ← English node text (name, body, tagline…)
│   └── nodes.fr.json         ← French node text
│
├── logos/
│   ├── icons/                ← one SVG file per node with a logo
│   │   ├── btc.svg
│   │   ├── ln.svg
│   │   ├── spark.svg
│   │   ├── citrea.svg
│   │   ├── liquid.svg
│   │   ├── rsk.svg
│   │   ├── bitvm.svg
│   │   ├── rgb.svg
│   │   ├── ordinals.svg
│   │   └── index.ts          ← exports ICONS: Record<string, string> (SVG strings)
│   └── details.ts            ← exports DETAILS: Record<string, {src, alt}> for panel images
│
├── components/               ← Astro components (static HTML templates)
│   ├── Header.astro
│   ├── Stage.astro           ← the map canvas area; renders all Node components
│   ├── Node.astro            ← one map node (icon, label, ring)
│   ├── Panel.astro           ← right-side detail panel shell
│   ├── PanelDetail.astro     ← one node's full panel content (pre-rendered, hidden by default)
│   ├── PanelEmpty.astro      ← default "select a node" state
│   ├── InfoBar.astro         ← collapsible "Reading the map / Edge legend" tab strip (mobile only, above the stage)
│   └── Tweaks.astro          ← settings popup (edge style, toggles)
│
├── styles/                   ← CSS split by concern
│   ├── index.css             ← imports all other CSS files (don't edit this)
│   ├── vars.css              ← color tokens, CSS variables
│   ├── app.css
│   ├── header.css
│   ├── stage.css
│   ├── strata.css            ← the horizontal tier lines on the map
│   ├── nodes.css
│   ├── edges.css
│   ├── panel.css
│   ├── footer.css
│   ├── tweaks.css
│   ├── toggles.css           ← CSS-only feature toggles (labels, rings, bgtype, tweaks open/close)
│   ├── mobile.css            ← all @media (max-width: 768px) overrides
│   └── info-bar.css
│
└── scripts/                  ← TypeScript modules (browser-only, bundled at build time)
    ├── main.ts               ← boot: calls everything in order
    ├── data.ts               ← merges window.__APP_DATA__ + topology into typed runtime values
    ├── dom.ts                ← typed DOM element references (browser-only)
    ├── nodes.ts              ← layout math and node positioning
    ├── slabs.ts              ← generates the Bitcoin block / LN mesh SVG visuals
    ├── edges.ts              ← draws SVG lines between nodes + shelf labels
    ├── interaction.ts        ← hover, click, highlight logic
    ├── panel.ts              ← shows/hides pre-rendered panel details
    ├── tweaks.ts             ← edge style segmented control (JS); other toggles are CSS-only
    └── iframe.ts             ← reports height to parent when embedded in an iframe
```

---

## How data flows

Understanding this saves a lot of confusion.

**At build time**, Astro reads the i18n JSON and node content JSON, then:
- Renders all map nodes as static HTML via `Node.astro` (including inline SVG icons)
- Pre-renders all 11 panel detail sections as static HTML via `PanelDetail.astro` (with `hidden` attribute)
- Renders the empty panel state via `PanelEmpty.astro`
- Injects the node content into a `<script is:inline>` tag as `window.__APP_DATA__`

**At runtime** (in the browser), `data.ts` picks up `window.__APP_DATA__` and merges it with the static topology to produce the typed `NODES`, `CATEGORIES`, `EDGES`, etc. that the rest of the scripts use.

The only things that still need JavaScript at runtime are:
- **Node positioning** — x/y layout depends on measured pixel dimensions
- **SVG edge drawing** — paths between nodes require computed coordinates
- **Edge style switching** — curved vs. straight requires redrawing SVG paths
- **Node selection** — toggling the active node and showing the correct panel detail
- **Info bar tabs** — the collapsible tab strip on mobile is toggled by JS (it triggers a full re-layout so the stage recalculates its available height)

**Mobile interaction model** differs from desktop. On desktop, hovering a node highlights its edges and pre-fills the panel; clicking opens the panel. On mobile (≤ 768 px) there is no hover, so the flow is two-step: the first tap highlights the node and its connections and shows a small **READ MORE →** / **LIRE PLUS →** button (coloured in the node's category colour) positioned near the node. Tapping that button — or tapping the same node a second time — opens the full-screen panel. Tapping empty stage space clears the selection.

Labels, rings, the bgtype overlay, and the tweaks panel open/close are all CSS-only, driven by hidden checkboxes and [`:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors/Using_the_has_pseudo-class) selectors in `toggles.css`.

---

## Common tasks

### Edit a node's text content

Open `src/content/nodes.en.json` (or `nodes.fr.json` for French). Each node is an object in the array:

```json
{
  "id": "liquid",
  "name": "Liquid",
  "learnMore": "https://offchain.media/article/liquid-network-...",
  "short": "Federated sidechain.",
  "tagline": "Confidential transactions, 2 minutes block time.",
  "consensus": "Strong Federation · 15 functionaries · 1-min blocks",
  "bridge": "Federated peg - 11-of-15 signers custody",
  "body": "Liquid is a production federated sidechain...",
  "bridgePath": ["BTC", "Federation Peg-in", "L-BTC", "Liquid Network"]
}
```

Fields:
- `short` — one-line description shown in the specs table under "Role"
- `tagline` — italic subtitle shown at the top of the panel
- `body` — main paragraph(s). Separate paragraphs with `\n\n`.
- `bridgePath` — the step-by-step diagram at the bottom of the panel. An array of strings, rendered as boxes with arrows between them. Set to `null` to hide it.
- `learnMore` — URL for the "Read more" button

`name` and `subtitle` (optional, shown below the node name for multi-protocol nodes like e-cash) are also translatable here, but `id`, `tier`, `category`, and `symbol` live in `topology.ts` and are shared across locales.

### Edit UI strings (buttons, labels, legend text)

Open `src/i18n/en.json` or `src/i18n/fr.json`. Every piece of text that isn't node content lives here: the page title, tier labels, legend entries, settings panel labels, etc.

`tierLabels` uses keys `"1"`, `"2"`, `"15"`, and `"ln"` matching the tier values in `topology.ts`. HTML is allowed here (the tier-2 label uses `<br>`).

`categories` maps category keys to their display labels in the panel tag and node sub-label.

### Add a new node

You need to touch four locations:

**1. `src/content/topology.ts`** — add the node's structural data:

```ts
// In NODE_META array:
{ id: 'mynode', tier: 2, category: 'rollup', symbol: '?' },
```

- `tier`: `1` = Bitcoin, `'ln'` = Lightning row, `15` = Native Primitives row, `2` = Sidechains/Rollups/Mints row
- `category`: one of `channel`, `sidechain`, `rollup`, `client`, `ecash`, `inscription`
- `symbol`: fallback text shown in the node circle if no SVG icon is registered

Also add any edges in the `EDGES` array:

```ts
{ from: 'btc', to: 'mynode', kind: 'Bridge description', style: 'dashed' },
```

Edge `style` options: `solid`, `dashed`, `dotted`, `cryptographic`. Add `secondary: true` for dimmed secondary connections (like Lightning gateway links).

**2. `src/logos/icons/mynode.svg`** — add the SVG icon for the map circle (22×22 px viewBox recommended). If the node has no logo, skip this and JS will fall back to showing `symbol`.

**3. `src/logos/icons/index.ts`** — register the icon:

```ts
import mynode from './mynode.svg?raw';

export const ICONS: Record<string, string> = {
  // existing entries...
  mynode,
};
```

If your node has a distinct panel logo (larger image shown in the side panel), also add it to **`src/logos/details.ts`**:

```ts
export const DETAILS: Record<string, { src: string; alt: string }> = {
  // existing entries...
  mynode: { src: 'https://...logo.png', alt: 'My Node logo' },
};
```

If there is no entry in `DETAILS`, the panel header shows no image.

**4. `src/content/nodes.en.json`** — add the English text:

```json
{
  "id": "mynode",
  "name": "My Node",
  "learnMore": "https://...",
  "short": "One-line description.",
  "tagline": "Italic subtitle here.",
  "consensus": "How it achieves consensus.",
  "bridge": "How BTC is pegged in.",
  "body": "Longer description paragraph.",
  "bridgePath": ["BTC", "Step", "Step", "Result"]
}
```

And `src/content/nodes.fr.json` — the French translation with the same `id`.

### Add a new locale

1. Copy `src/i18n/en.json` → `src/i18n/xx.json` and translate the values.
2. Copy `src/content/nodes.en.json` → `src/content/nodes.xx.json` and translate the text fields.
3. In `src/pages/[lang]/index.astro`, add the import and register the locale:

```ts
// At the top of the frontmatter (between the --- lines):
import xx from '../../i18n/xx.json';
import nodesXx from '../../content/nodes.xx.json';

const LOCALES = {
  en: { t: en as Strings, nodesContent: nodesEn as NodeContent[] },
  fr: { t: fr as Strings, nodesContent: nodesFr as NodeContent[] },
  xx: { t: xx as Strings, nodesContent: nodesXx as NodeContent[] },  // ← add this line
};

// In getStaticPaths:
export function getStaticPaths() {
  return [
    { params: { lang: 'en' } },
    { params: { lang: 'fr' } },
    { params: { lang: 'xx' } },  // ← add this line
  ];
}
```

Running `npm run build` will now produce `dist/xx.html` as well.

### Edit the visual design

All CSS is in `src/styles/`. CSS variables (colors, the `light-dark()` theme tokens, category colors) are in `vars.css` — that's the first place to look for design changes.

The map uses [CSS `light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) for automatic dark/light mode based on the user's OS preference. No JavaScript involved.

Mobile overrides are all in `mobile.css` under a single `@media (max-width: 768px)` block.

Feature toggles (labels, rings, background type overlay) are in `toggles.css` and use CSS `:has()`:

```css
.app:has(#tk-labels:not(:checked)) .node-label    { display: none; }
.app:has(#tk-rings:not(:checked))  .node-core::after { display: none; }
.app:has(#tk-bgtype:not(:checked)) .bg-type        { display: none; }
```

No JavaScript needed for these — flipping the hidden checkbox via the label is enough.

### Edit the map layout or behavior

The TypeScript in `src/scripts/` is split by responsibility:

| What to change | File | Key export |
|---|---|---|
| Node positions (x/y percent by tier) | `nodes.ts` | `layoutAll()` |
| How SVG edges are drawn and labeled | `edges.ts` | `drawEdges()` |
| Click/tap interactions, mobile CTA | `interaction.ts` | `attachInteractions()` |
| Info bar tab expand/collapse (mobile) | `interaction.ts` | `attachInfoBar()` |
| Which panel detail becomes visible | `panel.ts` | `showPanelDetail(id)` |
| The Bitcoin block slab visual | `slabs.ts` | `renderBtcSlab(width, height)` |
| The Lightning mesh visual | `slabs.ts` | `renderLnMesh(width, height)` |
| Edge style segmented control | `tweaks.ts` | `attachTweaks()` |
| Typed DOM element references | `dom.ts` | named exports |
| Runtime data (NODES, EDGES, state…) | `data.ts` | named exports |

**Important**: `dom.ts` and `data.ts` use browser APIs (`document`, `window`) and must only be imported by other scripts, never by Astro components. `slabs.ts` and `topology.ts` are pure (no DOM) and are safe to import from Astro at build time.

---

## Build and deploy

```bash
npm run build
```

Output: `dist/en.html` and `dist/fr.html`. Each file is fully self-contained — all CSS and JavaScript are inlined. The only external request at runtime is Google Fonts.

Paste the contents of each file into the appropriate CMS field for that locale.

### Preview the built files locally

```bash
npm run preview   # serves dist/ at http://localhost:4321
```

Navigate to `http://localhost:4321/en.html` or `/fr.html`.

---

## How Astro fits in (for people new to it)

Astro is a static site generator. You write templates in `.astro` files, which look like HTML with a TypeScript section at the top (between `---` lines) where you can import data and compute values. Astro runs this at build time and outputs plain HTML — there's no Astro runtime in the browser.

The `[lang]` folder name in `src/pages/[lang]/index.astro` is Astro's convention for dynamic routes. `getStaticPaths()` tells Astro which values `lang` can take, and it generates one HTML file per value.

`<script>` tags inside `.astro` files are processed by Vite (the bundler Astro uses under the hood). They get compiled from TypeScript, bundled, tree-shaken, and — thanks to `vite-plugin-singlefile` — inlined directly into the HTML output. `<script is:inline>` bypasses processing and outputs the tag as-is; we use this only for the small data-injection block that sets `window.__APP_DATA__`.

If you're ever confused about what Astro is doing, `npm run dev` is your friend — it shows build errors with line numbers and hot-reloads instantly on save.

---

## File size reference

| File | Purpose |
|---|---|
| `dist/en.html` | ~100 KB — everything inlined, ready for CMS |
| `dist/fr.html` | ~100 KB — French version |
| `src/logos/icons/*.svg` | Individual SVG files per node (~1–5 KB each) |

The dist files are minified by Vite during build — SVG strings, CSS, and TypeScript are all compacted into the final output.
