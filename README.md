# Bitcoin Layers Map

An interactive map of Bitcoin and its scaling layers, published as a self-contained single HTML file per language. It runs inside a CMS via embed with no server, no framework runtime, and no external dependencies beyond Google Fonts.

---

## How it works (the short version)

You edit files in `src/`. Running `npm run build` produces `dist/en.html` and `dist/fr.html` — two fully self-contained HTML files with all CSS and JavaScript inlined. You paste those into your CMS. That's the whole workflow.

The build tool is [Astro](https://astro.build), which handles the templating and per-locale page generation. [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) then inlines everything so each output is a single file with zero external dependencies (except Google Fonts, which loads from the CDN at runtime).

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
├── pages/
│   └── [lang]/
│       └── index.astro       ← entry point, one page per locale
│
├── i18n/
│   ├── en.json               ← all English UI strings
│   └── fr.json               ← all French UI strings
│
├── content/
│   ├── topology.js           ← shared structure (nodes, edges, tiers)
│   ├── nodes.en.json         ← English node text (name, body, tagline…)
│   └── nodes.fr.json         ← French node text
│
├── components/               ← Astro components (static HTML templates)
│   ├── Header.astro
│   ├── Stage.astro           ← the map canvas area
│   ├── Panel.astro           ← right-side detail panel
│   ├── InfoBar.astro         ← legend bar at the bottom
│   └── Tweaks.astro          ← settings popup (edge style, toggles)
│
├── styles/                   ← CSS split by concern
│   ├── index.css             ← imports all other CSS files (don't edit this)
│   ├── vars.css              ← color tokens, CSS variables
│   ├── header.css
│   ├── stage.css
│   ├── strata.css            ← the horizontal tier lines on the map
│   ├── nodes.css
│   ├── edges.css
│   ├── panel.css
│   ├── footer.css
│   ├── tweaks.css
│   ├── mobile.css            ← all @media (max-width: 768px) overrides
│   └── info-bar.css
│
└── scripts/                  ← JavaScript modules
    ├── main.js               ← boot: calls everything in order
    ├── data.js               ← merges i18n + topology into app data
    ├── logos.js              ← all SVG logos and the LOGOS registry
    ├── nodes.js              ← renders nodes, handles layout math
    ├── slabs.js              ← generates the Bitcoin block / LN mesh visuals
    ├── edges.js              ← draws SVG lines between nodes + labels
    ├── interaction.js        ← hover, click, highlight logic
    ├── panel.js              ← populates the right-side detail panel
    ├── tweaks.js             ← settings toggles (labels, rings, edge style)
    └── iframe.js             ← reports height to parent when embedded
```

---

## How data flows

Understanding this saves you a lot of confusion.

**At build time**, Astro reads the i18n JSON and node content JSON, passes them as props to the components (so headers, tier labels, legend text are rendered as plain HTML), and injects the node content into a `<script>` tag as `window.__APP_DATA__`.

**At runtime** (in the browser), `data.js` picks up `window.__APP_DATA__` and merges it with the shared topology from `topology.js` to produce the `NODES`, `CATEGORIES`, `EDGES` etc. that the rest of the scripts use.

The map canvas (node positions, SVG edges, hover states) is all driven by JavaScript because it depends on measured pixel dimensions — there's no way to do that at build time.

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

`name` and `subtitle` (optional, shown below the node name for multi-protocol nodes like e-cash) are also translatable here, but `id`, `tier`, `category`, and `symbol` live in `topology.js` and are shared across locales.

### Edit UI strings (buttons, labels, legend text)

Open `src/i18n/en.json` or `src/i18n/fr.json`. Every piece of text that isn't node content lives here: the page title, tier labels, legend entries, settings panel labels, etc.

`tierLabels` uses keys `"1"`, `"2"`, `"15"`, and `"ln"` matching the tier values in `topology.js`. HTML is allowed here (the tier-2 label uses `<br>`).

`categories` maps category keys to their display labels in the panel tag and node sub-label.

### Add a new node

You need to touch three files:

**1. `src/content/topology.js`** — add the node's structural data:

```js
// In NODE_META array:
{ id: 'mynode', tier: 2, category: 'rollup', symbol: '?' },
```

- `tier`: `1` = Bitcoin, `'ln'` = Lightning row, `15` = Native Primitives row, `2` = Sidechains/Rollups/Mints row
- `category`: one of `channel`, `sidechain`, `rollup`, `client`, `ecash`, `inscription`
- `symbol`: fallback text shown in the node circle if no logo is registered

Also add any edges in the `EDGES` array:

```js
{ from: 'btc', to: 'mynode', kind: 'Bridge description', style: 'dashed' },
```

Edge `style` options: `solid`, `dashed`, `dotted`, `cryptographic`. Add `secondary: true` for dimmed secondary connections (like Lightning gateway links).

**2. `src/content/nodes.en.json`** — add the English text:

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

**3. `src/content/nodes.fr.json`** — add the French translation with the same `id`.

If your node has a logo, add it to `src/scripts/logos.js`. See the existing entries for the pattern — each entry in the `LOGOS` object has `icon(w, h)` returning an SVG string (shown in the map circle) and `detail(w, h)` returning an image tag or SVG (shown in the panel). Nodes without a LOGOS entry fall back to showing `symbol`.

### Add a new locale

1. Copy `src/i18n/en.json` → `src/i18n/xx.json` and translate the values.
2. Copy `src/content/nodes.en.json` → `src/content/nodes.xx.json` and translate the text fields.
3. In `src/pages/[lang]/index.astro`, add the import and register the locale:

```js
// At the top of the frontmatter (between the --- lines):
import xx from '../../i18n/xx.json';
import nodesXx from '../../content/nodes.xx.json';

const LOCALES = {
  en: { t: en, nodesContent: nodesEn },
  fr: { t: fr, nodesContent: nodesFr },
  xx: { t: xx, nodesContent: nodesXx },  // ← add this line
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

### Edit the map layout or behavior

The JavaScript in `src/scripts/` is split by responsibility. Most things you'd want to change:

| What | File |
|---|---|
| Node positions (x/y percent by tier) | `nodes.js` → `stackPositions()` |
| How edges are drawn and labeled | `edges.js` |
| What happens when you click a node | `interaction.js` → `selectNode()` |
| What appears in the side panel | `panel.js` → `renderPanel()` |
| The Bitcoin block slab visual | `slabs.js` → `renderBtcSlab()` |
| The Lightning mesh visual | `slabs.js` → `renderLnMesh()` |

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

Astro is a static site generator. You write templates in `.astro` files, which look like HTML with a JavaScript section at the top (between `---` lines) where you can import data and compute values. Astro runs this at build time and outputs plain HTML — there's no Astro runtime in the browser.

The `[lang]` folder name in `src/pages/[lang]/index.astro` is Astro's convention for dynamic routes. `getStaticPaths()` tells Astro which values `lang` can take, and it generates one HTML file per value.

`<script>` tags inside `.astro` files are processed by Vite (the bundler Astro uses under the hood). They get bundled, tree-shaken, and — thanks to `vite-plugin-singlefile` — inlined directly into the HTML output. `<script is:inline>` bypasses processing and outputs the tag as-is; we use this only for the small data-injection block that sets `window.__APP_DATA__`.

If you're ever confused about what Astro is doing, `npm run dev` is your friend — it shows build errors with line numbers and hot-reloads instantly on save.

---

## File size reference

| File | Purpose |
|---|---|
| `dist/en.html` | ~100 KB — everything inlined, ready for CMS |
| `dist/fr.html` | ~100 KB — French version |
| `src/scripts/logos.js` | ~340 KB source — large because it contains raw SVG path data for all logos. This is normal. |

The dist files are significantly smaller than the source logos file because Vite minifies all the SVG strings and JavaScript during build.
