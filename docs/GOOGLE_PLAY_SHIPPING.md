# Shipping to Google Play – checklist

Your app is already set up as an Android app (Capacitor). Use this checklist to publish it on Google Play.

---

## 1. Google Play Developer account (one-time)

1. Go to [Google Play Console](https://play.google.com/console).
2. Sign in with a Google account.
3. Pay the **one-time registration fee** (about 25 USD). After that you can publish apps.

---

## 2. Build a signed release (AAB)

Follow the steps in **[android/RELEASE.md](../android/RELEASE.md)**:

- Create and secure an **upload keystore** (one-time).
- Configure **keystore.properties** (one-time).
- For each release: bump **versionCode** and **versionName** in `android/app/build.gradle`, then:
  ```bash
  npm run build:release
  cd android && gradlew bundleRelease   # Windows: gradlew.bat bundleRelease
  ```
- Your upload file: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 3. Create the app in Play Console

1. In Play Console: **All apps** → **Create app**.
2. Fill in:
   - **App name:** Sotilasvenäjän villapaitapeli
   - **Default language:** Finnish (or your choice)
   - **App or game:** Game (or App, depending on how you classify it)
   - **Free or paid:** Free
3. Accept the declarations (e.g. export compliance, content guidelines).

---

## 4. Store listing (required for publishing)

In **Release** → **Main store listing** (or **Grow** → **Store presence** → **Main store listing**):

| Field | What to provide |
|-------|------------------|
| **Short description** | Max 80 characters. Example: "Harjoittele sotilasvenäjän sanastoa, lyhenteitä ja sotilasarvoja." |
| **Full description** | Longer text (max 4000 chars). Describe modules: sanasto, lyhenteet, sotilaspiirit, sotilasarvot, kertauslistat. |
| **App icon** | 512×512 px PNG (no transparency). |
| **Feature graphic** | 1024×500 px. Used at the top of the store listing. |
| **Screenshots** | At least 2 (phone). Min length 320 px, max 3840 px. Take screens from your app on a device or emulator. |

You can add optional **video**, **phone/tablet screenshots**, and **TV** assets if needed.

---

## 5. Content rating (required)

1. In Play Console: **Policy** → **App content** → **Content rating**.
2. Start the questionnaire; choose **Game** (or **App**).
3. Answer the questions (e.g. violence, user-generated content). For this educational quiz app, answers are typically “None” or “No”.
4. Submit to get the **IARC** rating (e.g. PEGI 3, USK 0). Save the certificate.

---

## 6. Privacy policy (required if you collect data)

- If the app **does not** send personal data to your servers (only local storage, no analytics, no accounts): you can often state “No data collected” and link to a short page that says so.
- If you use analytics, ads, or accounts: you **must** have a **public URL** to a privacy policy and add it in **App content** → **Privacy policy**.
- For “no data collected”, a simple GitHub Pages or project page with 1–2 sentences is usually enough; add the URL in Play Console.

---

## 7. Target audience and news app (if asked)

- **Target age group:** Set according to your content (e.g. 13+ or 18+ if only for adults). Educational material is often “all ages” or “13+”.
- If asked “Is your app a news app?”: answer **No** unless it is.

---

## 8. Upload the AAB and publish

1. In Play Console: **Release** → **Production** (or **Testing** → **Internal/Closed** first).
2. **Create new release**.
3. **Upload** `app-release.aab` from `android/app/build/outputs/bundle/release/`.
4. Add **Release name** (e.g. “1.0.3”) and optional **Release notes** (in Finnish for Finnish users).
5. Complete any remaining checks (e.g. **App signing** – prefer “Let Google manage key” for new apps).
6. **Review release** → **Start rollout to Production** (or save and roll out later).

---

## 9. After first upload

- **Review time:** First app can take from a few hours to several days.
- **Updates:** For every new version, increase **versionCode** in `android/app/build.gradle`, run `npm run build:release` and `gradlew bundleRelease`, then upload the new AAB in a new release.
- Keep **upload-keystore.jks** and **keystore.properties** safe and backed up; you need them for all future updates.

---

## Quick reference

| Step | Where | When |
|------|--------|------|
| Developer account | play.google.com/console | Once |
| Keystore + signing | [android/RELEASE.md](../android/RELEASE.md) | Once |
| Bump versionCode/versionName | `android/app/build.gradle` | Every release |
| Build AAB | `npm run build:release` then `gradlew bundleRelease` | Every release |
| Store listing (text + graphics) | Play Console → Main store listing | Once (then update as needed) |
| Content rating | Play Console → App content → Content rating | Once (then if content changes) |
| Privacy policy URL | Play Console → App content | Once |
| Upload AAB | Play Console → Release → Create new release | Every release |

For build and signing details, always refer to **android/RELEASE.md**.
