# Security

This document summarizes security-related choices and checks for this project.

## Data and input

- **No server or user accounts:** The app runs in the browser (and as a packaged Android app via Capacitor). No personal data is sent to any server. No API keys or secrets are used in the frontend.
- **localStorage:** Used only for preferences (e.g. mute) and user-created review lists (Kertaus). All stored data is validated when read (type checks, array filters). Review list size is capped (max 500 items per list) to avoid localStorage exhaustion.
- **Fetch:** Only used to load app-owned resources:
  - CSV word lists from `public/data/*.csv` (URLs built from fixed list IDs, not user input).
  - Markdown info pages (README, UPDATES, lahteet) from the same origin.
- **No `eval`, `new Function`, `innerHTML`, or `dangerouslySetInnerHTML`:** User- or file-sourced text is not executed as code or rendered as raw HTML. Markdown from the app’s own files is rendered with `react-markdown` (no raw HTML by default).

## Dependencies

- Run `npm audit` regularly and address reported vulnerabilities.
- Lockfile is committed; install with `npm ci` in CI to get reproducible dependency versions.

## Android (Capacitor)

- The Android app is a WebView wrapper around the same web app. No extra permissions beyond what the web content needs (e.g. no contacts, location, or identity).
- Release builds are signed; keystore and credentials are not committed (see `android/RELEASE.md`).

## Reporting issues

If you find a security issue, please report it responsibly (e.g. to the maintainer contact in the README) rather than opening a public issue.
