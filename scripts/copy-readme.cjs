/**
 * Copies README.md and UPDATES.md from project root to public/tiedot-ja-asetukset
 * so the splash screens can load them.
 * Run before build: npm run build (uses prebuild) or node scripts/copy-readme.cjs
 * Edit only the root files; do not edit public/README.md or public/UPDATES.md by hand.
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const settingsDir = path.join(root, 'public', 'tiedot-ja-asetukset')

fs.mkdirSync(settingsDir, { recursive: true })

const copies = [
  { src: 'README.md', dest: 'README.md' },
  { src: 'UPDATES.md', dest: 'UPDATES.md' },
]

for (const { src, dest } of copies) {
  const srcPath = path.join(root, src)
  const destPath = path.join(settingsDir, dest)
  if (!fs.existsSync(srcPath)) {
    console.warn(`${src} not found at project root, skipping copy.`)
    continue
  }
  fs.copyFileSync(srcPath, destPath)
  console.log(`Copied ${src} to public/tiedot-ja-asetukset/${dest}`)
}
