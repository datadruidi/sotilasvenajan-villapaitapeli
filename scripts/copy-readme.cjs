/**
 * Copies README.md from project root to public/README.md so the "Tietoa" screen can load it.
 * Run before build: npm run build (uses prebuild) or node scripts/copy-readme.cjs
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const src = path.join(root, 'README.md')
const dest = path.join(root, 'public', 'README.md')

if (!fs.existsSync(src)) {
  console.warn('README.md not found at project root, skipping copy.')
  process.exit(0)
}

fs.copyFileSync(src, dest)
console.log('Copied README.md to public/README.md')
