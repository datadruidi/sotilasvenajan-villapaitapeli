# App Icon Setup Guide

This guide explains how to add your custom logo/icon for both web (browser tab) and Android app.

## Format

**PNG format is perfect** - no need to convert to other formats.

---

## 1. Web Favicon (Browser Tab Icon)

### Location
Put your icon file here:
```
public/favicon.png
```

### Requirements
- **File name:** `favicon.png` (or `favicon.ico` if you prefer)
- **Size:** Recommended 32x32px to 512x512px (square)
- **Format:** PNG (or ICO)

### What it does
- Shows in browser tabs when the website is open
- Shows when bookmarking the site
- Shows on mobile browsers when adding to home screen

---

## 2. Android App Icon (Phone Home Screen)

Android uses **adaptive icons** with foreground and background layers. You need to provide icons in multiple sizes.

### Location
Replace the existing icon files in:
```
android/app/src/main/res/mipmap-*/
```

### Required Sizes

You need to create **6 different sizes** and place them in these folders:

| Folder | Size | Files Needed |
|--------|------|--------------|
| `mipmap-mdpi` | 48x48px | `ic_launcher.png`, `ic_launcher_round.png`, `ic_launcher_foreground.png` |
| `mipmap-hdpi` | 72x72px | Same 3 files |
| `mipmap-xhdpi` | 96x96px | Same 3 files |
| `mipmap-xxhdpi` | 144x144px | Same 3 files |
| `mipmap-xxxhdpi` | 192x192px | Same 3 files |

### File Types

**Option A: Simple (Recommended)**
- Use your logo as **foreground** on a transparent background
- Use a solid color or gradient as **background**
- Create 3 files per size:
  - `ic_launcher.png` - Full icon (foreground + background combined)
  - `ic_launcher_round.png` - Same, but optimized for round icons
  - `ic_launcher_foreground.png` - Just your logo (transparent background)

**Option B: Adaptive Icons (Advanced)**
- Keep the current XML-based adaptive icons
- Replace only the PNG files in each mipmap folder
- The XML files (`ic_launcher.xml`, `ic_launcher_round.xml`) will combine foreground + background

### Quick Setup Steps

1. **Create your icon** in PNG format (square, transparent background recommended)
2. **Resize to all 6 sizes** (48, 72, 96, 144, 192px)
3. **For each size, create 3 versions:**
   - Full icon (logo + background)
   - Round version (same, but ensure it looks good in a circle)
   - Foreground only (just the logo, transparent background)
4. **Replace files** in each `mipmap-*` folder:
   ```
   android/app/src/main/res/mipmap-mdpi/ic_launcher.png
   android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
   android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
   ```
   (Repeat for hdpi, xhdpi, xxhdpi, xxxhdpi)

### Tools

You can use online tools to generate all sizes automatically:
- **Android Asset Studio**: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
- Upload your logo → it generates all sizes and formats

---

## 3. After Adding Icons

### Web Favicon
- Just rebuild: `npm run build`
- The favicon will appear in browser tabs

### Android App Icon
1. Rebuild the app: `npm run build`
2. Sync Capacitor: `npx cap sync android`
3. Rebuild in Android Studio or run: `npx cap run android`

---

## Summary

**For Web:**
- Put `favicon.png` in `public/` folder
- Done! ✅

**For Android:**
- Create 6 sizes (48, 72, 96, 144, 192px)
- For each size, create 3 files (ic_launcher.png, ic_launcher_round.png, ic_launcher_foreground.png)
- Replace files in `android/app/src/main/res/mipmap-*/` folders
- Or use Android Asset Studio to generate everything automatically

**PNG format is perfect for both!** No conversion needed.
