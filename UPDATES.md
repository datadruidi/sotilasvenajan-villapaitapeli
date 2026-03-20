# Updates

This file is a cumulative changelog: newest versions are listed first. Older entries are kept.

**Current version:** 1.0.12

---

## Version 1.0.12 (2026-03-15)

This update focuses on slimming the bundled Android payload and preparing a fresh release package after asset cleanup.

- Reduced bundled image payload size for Android:
  - Removed duplicate `01-puolustushaarat` asset tree references and old Aerospace Forces flat image folders.
  - Removed unused UI image files that were no longer referenced by the app.
  - Removed extra images from Navy, Aerospace Forces, Strategic Missile Forces, Airborne Forces, and Unmanned Systems image folders to lower packaged asset size.
  - Reduced `public/assets` to under `200 MB` in the current project state before the new release build.
- Kept gameplay asset indices aligned with the cleaned folders:
  - Regenerated bundled image path data for Aerospace Forces and Unmanned Systems.
  - Preserved answer formatting improvements for Aerospace Forces equipment names.
- Prepared a new Android release package:
  - Updated release version metadata to `1.0.12`.
  - Android `versionCode` -> `14`
  - Android `versionName` -> `1.0.12`
  - `package.json` version -> `1.0.12`

---

## Version 1.0.11 (2026-03-15)

This update focuses on splash-screen navigation, reorganized bundled reference content, expanded branch study materials, and Android release preparation.

- Reworked the main splash/start experience:
  - Added a direct **OSINT Daily Brief / OSINT-paivakatsaus** entry from the splash screen.
  - Added new splash menus for **Sources**, **Equipment catalogs**, and supporting info pages.
  - Added quick-link buttons for **GitHub** and **Google Play** on the main screen.
- Reorganized bundled app content and markdown locations:
  - Moved settings/info assets under `public/tiedot-ja-asetukset/`.
  - Moved bundled OSINT brief files under `public/sitrep/`.
  - Updated app audio/content URLs to use the new folder structure.
- Expanded playable military branch and reference content:
  - Reworked **Navy** into category-based submodes instead of only ship class/name.
  - Added large bundled source/reference sets and kalustokuvasto markdown for branches, military districts, and military symbology.
  - Updated bundled **Aerospace Forces** sources, image assets, and kalustokuvasto to the current structured version.
- Improved Android release readiness:
  - Updated release version metadata to `1.0.11`.
  - Added safer Android signing-keystore checks so an invalid `storeFile` path is not applied automatically during release configuration.
- Updated app version metadata to `1.0.11`:
  - `package.json` version -> `1.0.11`
  - Android `versionName` -> `1.0.11`
  - Android `versionCode` -> `13`

---

## Version 1.0.10 (2026-03-14)

This update focuses on the Ground Forces vehicle refresh and military organization menu renumbering.

- Replaced the Russia Ground Forces image set with the new two-level folder structure and regenerated the image index.
- Added a new Ground Forces category picker before the vehicle quiz starts:
  - Finnish and English labels were added for all seven Ground Forces vehicle categories.
  - The quiz now filters images by the chosen category and still answers from the vehicle folder below it.
- Reordered and renumbered the military capabilities menu:
  - `2.2.1` is now **Maavoimat / Ground Forces**.
  - Navy and Aerospace Forces numbering was shifted to match the new order.
- Swapped the military organization submenu numbering:
  - `2.1` is now **Suorituskyvyt / Military Capabilities**.
  - `2.2` is now **Sotilaspiirit / Military Districts**.
- Updated app version metadata to `1.0.10`:
  - `package.json` version -> `1.0.10`
  - Android `versionName` -> `1.0.10`
  - Android `versionCode` -> `12`

---

## Version 1.0.9 (2026-03-13)

This update focuses on the new military abbreviations study mode, expanded vocabulary content, and refreshed bundled OSINT brief content for Android.

- Added a new **1.2. Sotilaslyhenteet / Military Abbreviations** category under the vocabulary section:
  - Split into six playable abbreviation sublists plus **1.2.7 Review**.
  - Added dedicated CSV-backed datasets for Finnish and English app language variants.
  - Added list labels, menu routing, and loading support for all new abbreviation modules.
- Added a separate **Lyhenteet review list** flow:
  - Players can save abbreviation prompts for later review from the quiz view.
  - Review entries are stored separately from the main vocabulary review list in local storage.
  - The review module launches directly in the fixed abbreviation answer direction.
- Expanded vocabulary coverage:
  - Added the new **1.1.8 Kyberturvallisuuden kasitteistoa / Cybersecurity Terminology** module.
  - Updated README/content structure text to reflect currently playable modules.
- Refreshed bundled markdown content used by the app:
  - Updated the packaged **OSINT Daily Brief** and archive markdown files included in Android builds.
  - Kept source/license references aligned with the new abbreviations section.
- Updated app version metadata to `1.0.9`:
  - `package.json` version -> `1.0.9`
  - Android `versionName` -> `1.0.9`
  - Android `versionCode` -> `11`

---

## Version 1.0.8 (2026-03-07)

This update focuses on the new OSINT Daily Brief entry point, popup controls, and Finnish text rendering fixes.

- Added a standalone **OSINT Daily Brief / OSINT-paivakatsaus** button on the landing page:
  - Moved it outside the numbered `Content type` box.
  - Positioned it between the landing controls and the main content menu.
  - Styled it as a separate red action button with a shorter height than the main menu buttons.
- Expanded the **OSINT Daily Brief** popup header:
  - Added a blue **What is this? / Mika tama on?** button.
  - Styled **Old Briefs / Vanhat katsaukset** as a green button.
  - Replaced the popup close control with a red upper-right close button.
- Added a dedicated **What is this?** info popup for the daily brief:
  - Explains that the brief is an AI-powered automated information gathering tool.
  - Notes that browser content updates daily, while Android updates only with a new app release.
  - Includes a caution note that the content is not separately verified.
- Fixed Finnish OSINT UI labels and encoding issues:
  - Corrected visible text such as **OSINT-paivakatsaus** and **Mika tama on?**
  - Replaced broken mojibake characters in the OSINT popup flow.
  - Standardized popup upper-right close buttons to a simple red `X`.
- Updated app version metadata to `1.0.8`:
  - `package.json` version -> `1.0.8`
  - Android `versionName` -> `1.0.8`
  - Android `versionCode` -> `10`

---

## Version 1.0.7 (2026-03-03)

This update focuses on menu polish, readability, round-counter UI improvements, and a new soundtrack page.

- Updated branding titles on splash and landing:
  - English title changed to **All Things / Russian Military 101** (two-line layout).
  - Finnish title changed to **Sotilasvenajan / villapaitapeli** (two-line layout).
  - Title spacing tightened, top line made larger, and headline styling refined.
- Refined splash/landing control spacing:
  - Language label/flag spacing tightened.
  - Splash button stack moved slightly up.
  - Vertical gap between splash buttons reduced.
- Standardized headline color to black on both splash and landing in both app languages.
- Increased global button outline thickness for clearer visual separation.
- Reworked round counters (`x/100`) in menu rows:
  - Round count now appears in a **separate right-side box** instead of inside the main button.
  - Applied consistently across words, tactical signs, ranks, garrisons, and vehicles menus.
- Added a new splash menu entry: **Soundtrack**:
  - Opens `soundtrack.md` in the same markdown info-page viewer flow.
  - Added first vocabulary soundtrack link under `1.1 Military Operations`.
- Fixed landing header icon regression:
  - Restored mute button icons (`🔇/🔊`) and language flags (`🇫🇮/🇬🇧`).
- Updated Finnish main splash labels:
  - `Paivitykset`
  - `Lahteet ja lisenssit`
- Updated README/module status notes:
  - Removed `Ei julkaistu / NTR` from modules that are now playable.

---

## Version 1.0.6 (2026-02-28)

This update expands Russia military modules with new playable branches, folder-based image loading, and a reworked military districts flow.

- Added new active and playable branch modules under `2.2` using folder-driven image pools:
  - `2.2.2 Aerospace Forces`
  - `2.2.3 Ground Forces`
  - `2.2.4 Strategic Missile Forces`
  - `2.2.5 Airborne Forces`
  - `2.2.6 Unmanned Systems Forces`
- Implemented/updated image path generator scripts and generated path index files for the new branches.
- Standardized newly added unmanned system images to `.png` and removed accidental double extensions (`*.jpg.png`) in that module.
- Improved class-name formatting logic for ground and strategic missile branches (including model code capitalization and `SS-18` formatting).
- Reworked `2.1 Military Districts` navigation:
  - `2.1.1` renamed to **Military District Bases** and simplified so Leningrad launches Combined View directly.
  - Review button moved to the `2.1.1` upper level.
  - Added district list with only Leningrad active; other district buttons are intentionally disabled and marked as future-by-request.
- Added a new **Military District Insignia** image game flow:
  - `2.1.3` now launches the game directly (no lower submenu).
  - Round counter (`x/100`) shown on the `2.1.3` button.
  - Supports loading images from district-specific insignia folders and playing across all available district images.
- Created/updated folder structures for all newly added vehicle and insignia datasets to support `01`, `02`, ... style image additions.
- Refreshed generated image indexes after adding new images and verified production build success.

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
  - Finnish splash title corrected: `Sotilasvenajan villapaitapeli`.
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
