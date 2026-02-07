# Building a release for Google Play

## 1. One-time: create an upload keystore

Create a keystore **once** and keep it safe. If you lose it, you cannot update your app on Play Store.

From the project root (or any folder), run:

**Windows (PowerShell):**
```powershell
keytool -genkey -v -keystore android\upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

**macOS/Linux:**
```bash
keytool -genkey -v -keystore android/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

- Use a strong password and store it somewhere safe.
- When asked “What is your first and last name?”, you can use your name or app name.
- The alias `upload` is used in the next step; you can change it if you set the same in `keystore.properties`.

The file `android/upload-keystore.jks` is gitignored. **Back it up** (e.g. encrypted backup); do not commit it.

---

## 2. One-time: configure signing

1. Copy the example properties file:
   - From `android/app/`:  
     `copy keystore.properties.example keystore.properties` (Windows)  
     or `cp keystore.properties.example keystore.properties` (macOS/Linux).

2. Edit `android/app/keystore.properties` and set:
   - **storeFile** – path to the keystore relative to `android/app/`.  
     If the keystore is `android/upload-keystore.jks`, use: `../upload-keystore.jks`
   - **storePassword** – keystore password
   - **keyAlias** – alias you used (e.g. `upload`)
   - **keyPassword** – key password (often same as store password)

Do not commit `keystore.properties`; it is gitignored.

---

## 3. Every release: build the app bundle (AAB)

1. **Bump version** (in `android/app/build.gradle`):
   - Increase **versionCode** (e.g. `1` → `2`) for every upload.
   - Set **versionName** to what users see (e.g. `"1.0.1"`).

2. **Build the web app and sync to Android:**
   ```bash
   npm run build:release
   ```
   (This runs `npm run build` and `cap sync android`.)

3. **Build the signed release AAB** (from project root, then run Gradle in `android/`):
   - **Windows:**  
     `cd android` then `gradlew.bat bundleRelease`
   - **macOS/Linux:**  
     `cd android` then `./gradlew bundleRelease`

4. **Find the AAB:**  
   `android/app/build/outputs/bundle/release/app-release.aab`

Upload **app-release.aab** to Google Play Console (App bundle → Create new release → Upload).

---

## Summary

| Step | When |
|------|------|
| Create `upload-keystore.jks` | Once |
| Create and fill `app/keystore.properties` | Once |
| Increment `versionCode` + set `versionName` | Every release |
| `npm run build` → `npx cap sync android` → `gradlew bundleRelease` | Every release |

If `keystore.properties` is missing, the release build still runs but the AAB will be **unsigned**. You must sign it (e.g. with Play App Signing’s upload key) or configure signing as above so the AAB is signed.
