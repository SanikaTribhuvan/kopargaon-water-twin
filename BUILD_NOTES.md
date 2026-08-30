# 🏗️ KopargaonTwin Visual Rebuild Notes (Reference UI Exact Match)

## 🎨 Design System & Color Palette
- **Splash Gate Background:** Near-black dark plum (`#241B26`)
- **Light Section Background:** Warm off-white cream (`#F7F4EC`)
- **Dark Full-Bleed Background:** Near-black photography & 3D backdrop (`#0B080D` / `#140F18`)
- **Headline Text on Light Sections:** Near-black (`#1A1420`)
- **Primary Accent (Buttons, Active Status, Success):** Bright grass green (`#7ED957` / `#6BC943`)
- **Secondary Accent Green (Nav labels, subtitles):** Deeper forest green (`#23531F` / `#2B6B26`)
- **Splash CTA Button & Numbered Badge Circles:** Gold/Amber (`#F5B814`)
- **Glow / Wireframe Overlay on 3D Scenes:** Cyan-blue glassy & translucent (`#38BDF8` / `rgba(56, 189, 248, 0.75)`)
- **Decorative Floating Button (Sparkle/Asterisk):** Tan / terracotta (`#D89B72`)
- **Card Backgrounds:** Pure white (`#FFFFFF`) with soft drop shadow (`0 10px 30px rgba(26,20,32,0.06)`), 0px border.

---

## 🏛️ Typography Hierarchy
- **Giant Condensed Headlines:** `Cabinet Grotesk` (weights 800/900), uppercase, tight leading (`line-height: 0.95 - 1.0`), 2 lines max, margin from top-left.
- **Body / Support Text:** Positioned in dedicated bottom-right viewport quadrant (not stacked directly under giant headline).
- **Numbered Badges:** `32px` circular badge with gold fill/outline, bold numeral (`01`, `02`, etc.).
- **Nav Label Text:** Medium weight, small-caps letter spacing (`0.8px`).

---

## 📐 Section-by-Section Mapping to Reference Footage
1. **Section A (Splash Gate):** `#splash-gate` overlay in `#241B26` with centered brand mark, subtitle, gold pill button (`#btn-enter-twin`), and bottom-right legal disclaimer. One-time dismissible with smooth slide-up.
2. **Section B (Hero):** Cream `#F7F4EC` with scroll-scrubbed hero flythrough video, top-left 2-line giant headline, bottom-right support paragraph, bottom-left mouse-scroll indicator, and floating terracotta sparkle icon on right edge.
3. **Section C (Horizontal Phased Card Carousel):** Pinned left preview thumbnail + horizontal scroll track of the 6 Core Modules with gold numbered badges (`01`-`06`) and partial-word highlight.
4. **Section D (Sticky Split-Screen Prioritization):** Left pane scrolls Batch 1 / Batch 2 / Deferred cards; right pane is pinned Leaflet GIS map with active reach highlighting and "Scroll to Next Batch" pill button.
5. **Section E (Full-Bleed Phase Sections):** 3 full-bleed screens with giant wordmarks:
   - `BATCH 1 · GATES OPEN`
   - `BATCH 2 · SCHEDULED`
   - `DEFERRED · ROTATION HOLD`
   with bottom-right explanatory caption cards.
6. **Section F (Hotspot-Annotated Facility View):** 5-Ward starvation ledger with interactive map pins and pill tooltips + top-right green "Get in Touch / Sluice Dispatch" button.
7. **Sections G & H (Raw Land & Ghosted Pipe Network):** Interactive state toggle between raw terrain parcel boundary (cyan outline) and glowing cyan-blue pipe network with active flow saturation.
8. **Section I (Phase Stepper Card):** Pure white rounded card floated over hydraulic network, numbered steps 1–4, thin divider lines, and anchored green action button.
9. **Preserved Core Modules:** Live Challenges Hub (Challenge 1 DB Wipeout & Challenge 2 SatyaSetu Truth Engine), Explainability SHAP cluster, Marathi Voice AI, Cryptographic SHA-256 Audit Ledger, Section 28 Equity Radar, and Historical Simulator—all restyled into the exact cream/dark plum rhythm.

---

## 🔒 Preserved Business Logic (Untouched Core)
- Multi-Criteria Knapsack prioritization scoring (`triageEngine.js`).
- SHAP feature attributions & contrastive counterfactual reasoning (`explainabilityEngine.js`).
- SHA-256 Merkle blockchain hash chain (`auditLedger.js`).
- Dual-Tier Merkle WAL & In-Flight Quorum Buffer for Challenge 1 (`resilienceEngine.js`).
- SatyaSetu Laboratory Telemetry & Anti-Sybil Defense for Challenge 2 (`truthEngine.js`).
- Marathi Voice AI & Audio Synthesizer (`voiceAI.js`).
