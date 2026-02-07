# Security Review — Sotilasvenäjän villapaitapeli (Google Play)

**Review date:** 2025-02  
**Scope:** Web app (TS/React), Capacitor/Android, build/release, privacy/data  
**Reviewer role:** Senior mobile + web security engineer

---

## Executive summary (top 5 issues)

| # | Severity | Issue | Location |
|---|----------|--------|----------|
| 1 | **High** | No network security config — cleartext could be allowed if dev server URL is ever baked in | Android |
| 2 | **High** | FileProvider uses broad `path="."` — exposes full external/cache roots to content resolver | `android/.../file_paths.xml` |
| 3 | **Medium** | Release builds ship with no minification/obfuscation — easier reverse engineering | `android/app/build.gradle` |
| 4 | **Medium** | No Content-Security-Policy — defense-in-depth missing for WebView | `index.html` |
| 5 | **Low** | localStorage used for preferences; acceptable for this app but document that no PII/secrets are stored | `App.tsx`, `roundsStorage.ts` |

**Overall:** No critical vulnerabilities (no auth, no API keys in repo, no PII collection). Main improvements are Android hardening (network config, FileProvider, R8) and CSP. **Go for release** after applying the recommended patches and completing the release checklist.

---

## Detailed findings table

| ID | Severity | Category | Finding | File / location | Recommendation |
|----|----------|----------|---------|------------------|----------------|
| F1 | High | Android / Network | No `network_security_config.xml`. Defaults block cleartext on API 28+, but explicit config is best practice and prevents accidental cleartext if env is misused. | `android/app/src/main/res/` | Add `xml/network_security_config.xml` disallowing cleartext; reference from manifest `<application android:networkSecurityConfig="@xml/network_security_config">`. |
| F2 | High | Android / FileProvider | FileProvider `<external-path path="."/>` and `<cache-path path="."/>` expose entire external storage and app cache. | `android/app/src/main/res/xml/file_paths.xml` | Restrict to specific subdirs (e.g. `path="Pictures"` or a dedicated app subfolder); use `cache-path` only for a named cache subdir if needed. |
| F3 | Medium | Build / Release | `minifyEnabled false` and no `shrinkResources` — release APK/AAB is larger and code is not obfuscated. | `android/app/build.gradle` | Set `minifyEnabled true`, `shrinkResources true` for release; add ProGuard keep rules for Capacitor/Reflection if needed. |
| F4 | Medium | WebView / CSP | No Content-Security-Policy on the app page. WebView loads bundled content; CSP adds defense-in-depth. | `index.html` | Add `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; frame-ancestors 'none'">` (tune as needed for your assets). |
| F5 | Low | Storage | Mute and round counts stored in `localStorage`. Not sensitive; app does not store PII or credentials. | `App.tsx` (MUTE_STORAGE_KEY), `roundsStorage.ts` | No code change required. Document in Data safety form: “No personal data collected; optional local progress (round counts) and settings (mute) stored on device only.” |
| F6 | Low | Backup | `android:allowBackup="true"`. Backup can include app data (e.g. WebView/localStorage). For this app risk is low. | `AndroidManifest.xml` | Optional: set `android:fullBackupContent="@xml/backup_rules"` to exclude sensitive dirs if you add them later; or leave as-is and state in Data safety that only non-sensitive local data is backed up. |
| F7 | Info | Config | Capacitor dev server uses `cleartext: true` only when `CAPACITOR_DEV_SERVER` is set (build-time). Production bundle loads from `file://` (no network). | `capacitor.config.ts` | Ensure release builds never set `CAPACITOR_DEV_SERVER`; document in release checklist. |
| F8 | Info | Secrets | No API keys, tokens, or credentials in repo. Config uses `VITE_API_BASE_URL` from env; no `.env` committed. | `config.ts`, `.gitignore` | Add `.env.example` with `VITE_API_BASE_URL=` so future contributors don’t hardcode URLs. |
| F9 | Info | Permissions | Only `INTERNET`. Appropriate for an app that may load remote content in future; currently loads only bundled assets. | `AndroidManifest.xml` | Keep as-is; if you add analytics/crash reporting later, declare only required permissions and document in Data safety. |
| F10 | Info | Exported components | MainActivity `exported="true"` with MAIN/LAUNCHER only — required. FileProvider `exported="false"`. No unintended deep links. | `AndroidManifest.xml` | No change. |
| F11 | Info | Dependencies | `npm audit` reports 0 vulnerabilities. | `package.json` / lockfile | Re-run before each release; pin versions where possible. |
| F12 | Info | Markdown / XSS | `SplashScreen` renders `lahteet.md` and `tietoa.md` via `ReactMarkdown`. Content is same-origin and bundled. | `SplashScreen.tsx` | If you ever load markdown from user input or remote, sanitize or use a safe renderer; for current bundled files, risk is low. |

---

## Fix PR-style steps

### 1. Android: add network security config (disallow cleartext)

- **Add** `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

- **Edit** `AndroidManifest.xml`: on `<application>` add:
  `android:networkSecurityConfig="@xml/network_security_config"`

### 2. Android: restrict FileProvider paths

- **Edit** `android/app/src/main/res/xml/file_paths.xml`:
  - Applied: removed `<external-path path="." />` (exposed full external storage). Kept only `<cache-path name="app_cache" path="." />` so the provider exposes only the app cache directory. If a Capacitor plugin (e.g. Share, Camera) later needs to share files from external storage, add a narrow entry e.g. `<external-path name="app_files" path="Android/data/com.sotilasvenajan.villapaitapeli/files/" />` instead of `path="."`.

### 3. index.html: add Content-Security-Policy meta

- In `<head>`, add (adjust if you use inline scripts or external resources):

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';">
```

### 4. Release build: enable R8/ProGuard and shrinkResources

- In `android/app/build.gradle`, under `buildTypes { release { ... } }`:
  - Set `minifyEnabled true`
  - Set `shrinkResources true`
  - If Capacitor or plugins break, add `-keep` rules in `proguard-rules.pro` (e.g. keep Capacitor bridge classes); test release build after change.

### 5. .env.example

- **Add** `.env.example` in project root:

```
# Optional: API base URL for future backend. Leave empty for same-origin.
VITE_API_BASE_URL=
```

- Ensure `.env` and `.env.*.local` remain in `.gitignore` (already are).

---

## Secrets check

- **Result:** No API keys, tokens, or hardcoded credentials found in the repository.
- **Checked:** `src/**`, `android/**`, `capacitor.config.ts`, `*.json`, root config files. `.env` is gitignored; no `.env` committed.
- **Recommendation:** Keep using env for any future API base URL or keys; add `.env.example` as above.

---

## Dependencies and CVEs

- **npm audit:** 0 vulnerabilities.
- **Recommendation:** Re-run `npm audit` and `npm update` before each release; consider Dependabot or similar for alerts.

---

## Secure defaults validation

| Check | Status | Notes |
|-------|--------|--------|
| HTTPS enforced | OK | No production network requests; Capacitor dev server cleartext only when `CAPACITOR_DEV_SERVER` set. Add network_security_config for explicit block. |
| TLS pinning | N/A | No remote API in current scope. |
| No cleartext in production | OK | Production loads from `file://`; cleartext only in dev. |
| WebView: no dangerous file access | OK | Using Capacitor defaults; no custom `addJavascriptInterface` or universal file access. |
| WebView: mixed content | OK | All assets same-origin/bundled. |
| Safe deep links / intent-filters | OK | No custom deep links; MainActivity only MAIN/LAUNCHER. |
| Exported components | OK | Only launcher activity exported; FileProvider not exported. |
| Permission minimization | OK | Only INTERNET. |
| No secrets in localStorage | OK | Only mute flag and round counts. |
| Secure storage for secrets | N/A | No secrets stored; if added later, use Android Keystore / platform secure storage. |

---

## Google Play release checklist (project-specific)

- [ ] **Privacy policy URL** — Required by Play. Host a page stating: no account, no PII collection; optional local progress/settings on device only; no third-party analytics in current version.
- [ ] **Data safety form** — Declare: “No data collected” or only “App functionality” (e.g. local progress) with “Data not shared,” “Data not collected” for personal info.
- [ ] **Test account** — Not required (no login). If you add login later, provide test credentials in Play Console.
- [ ] **Release build** — Build AAB with release signing; ensure `CAPACITOR_DEV_SERVER` is unset; run `npm run build && npx cap sync android` then build in Android Studio.
- [ ] **Version** — Bump `versionCode` (and optionally `versionName`) in `android/app/build.gradle` for each upload.
- [ ] **Signing** — Use your upload key (keystore); never commit `keystore.properties` or `.jks` (already gitignored).
- [ ] **Network security** — After adding `network_security_config.xml`, test release build and confirm no regressions.
- [ ] **Content rating** — Complete questionnaire (likely low/no sensitive content).
- [ ] **Target API level** — Meet Play’s required target SDK (e.g. 34+); your `targetSdkVersion` is 36 — OK.

---

## Go / no-go recommendation

**Go for release** after:

1. Applying the High and Medium fixes (network security config, FileProvider paths, CSP, and optionally R8/ProGuard).
2. Adding `.env.example` and confirming no secrets in repo.
3. Completing the Play release checklist (privacy policy, Data safety, version, signing).

The app has no authentication, no remote API in use, and no PII collection; remaining work is hardening and policy/process for a smooth Play review.
