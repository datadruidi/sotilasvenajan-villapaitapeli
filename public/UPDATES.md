# Updates

This file is a cumulative changelog: newest versions are listed first. Older entries are kept.

**Current version:** 1.0.5

---

## Version 1.0.5 (2026-02-26)

This release finalizes web release readiness, security fixes, and UI consistency updates.

- Performed web release checks: `eslint`, TypeScript build, and production Vite build.
- Resolved npm security findings (`npm audit`), including a high-severity `minimatch` ReDoS advisory in the dependency tree.
- Verified `npm audit --omit=dev` reports **0 vulnerabilities**.
- Updated app version metadata to `1.0.5`:
  - `package.json` version -> `1.0.5`
  - Android `versionName` -> `1.0.5`
  - Android `versionCode` -> `7`
- Updated and stabilized UI behavior and visual consistency:
  - Splash and landing controls refined for spacing/alignment and clearer hierarchy.
  - Language picker placement and control grouping improved on the option screen.
  - Unified button palette behavior (blue/yellow/green/red roles) across menus and game views.
  - Review/Kertaus and round counter visual treatments corrected and standardized.
  - In-game action buttons now clearly encode state (review add/remove, home, mute).
  - Finnish splash title corrected: `Sotilasvenäjän villapaitapeli`.
- Updates page content has been fully converted to English.

---

## Version 1.0.4 (2026-02-25)

This update focused on UI/UX cleanup, clearer menu flow, and tactical symbol content support.

- Added support for loading tactical symbol images from **.png** files and updated tactical symbol path generation workflow.
- Refined game menu hierarchy and naming (including numbering/order changes and renames).
- Improved layered menu popup behavior and close/back flows.
- Unified visual style across views: typography, tighter spacing, button borders, and colors.
- Updated action button color coding by role:
  - home/back buttons in **green**
  - mute buttons in **red**
- Improved info page header layout (`About`, `Updates`, `Sources and licenses`) and aligned controls with headings.
- Updated header branding/graphics (favicon size/position and language flag placement on splash/menu screens).
- Fine-tuned HUD layout in game views (home/mute positions, title display, counters, and review button placement).

Goal: make navigation clearer, visual hierarchy calmer, and gameplay views more consistent with each other.

---

## Version 1.0.3

### Vocabulary (Sotilassanasto)

- **Translation direction:** Direction selection moved to a popup. Direction is selected after choosing a word list (1.1 Military Operations). Abbreviations (1.2) do not ask direction; they use Finnish -> Russian flow.
- **Numbering:** Vocabulary structure updated to 1.1 Military Operations (1.1.1-1.1.8) and 1.2 Military Abbreviations (1.2.1-1.2.7). The former generic vocabulary branch was removed.
- **Abbreviations module:** 1.2 is now its own category with six sublists plus Review (1.2.7). Each list loads its own CSV file (`lyhenteet-turvallisuus.csv`, etc.) using format **prompt,ve1,ve2,ve3,ve4** (one prompt + four Russian options; `ve1` is correct).
- **Popup text:** Vocabulary popup uses direction choices equivalent to “Answer in Finnish” / “Answer in Russian”.
- **Abbreviations layout:** Prompt text in abbreviation rounds now matches answer button sizing for better readability.

### Review lists

- **Review implemented:** Vocabulary, abbreviations, military districts, and ranks each have their own review list. Users can add entries (green action) or remove entries (red action) and play from Review using only saved entries.
- **Unified naming:** All review lists use the name **Review / Kertaus** consistently across modules.
- **No round counter on review button:** Review launch buttons do not show x/100 counters; review sessions are unlimited.

### Technical

- Word CSV parsing supports 2-, 5-, and 8-column formats. The 5-column format (`prompt, ve1, ve2, ve3, ve4`) is used for abbreviations.
- Word lists load from `public/data/` using UTF-8 encoding.

---

*When publishing a new version: add a new **## Version X.Y.Z** section above older entries and describe the changes. Do not remove previous version notes.*
