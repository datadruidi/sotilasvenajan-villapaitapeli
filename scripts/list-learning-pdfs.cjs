#!/usr/bin/env node

/**
 * Builds the media lists used by the learning-material menus.
 * Drop PDFs or MP3s into the folders below; dev/build regenerates the manifest.
 */
const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..')
const materialsRoot = path.join(root, 'public', 'learning-materials')
const categories = ['fill-the-blank', 'reading-comprehension']
const soundtrackCategory = 'soundtrack-loop'

const manifest = {}

for (const category of categories) {
  const directory = path.join(materialsRoot, category)
  fs.mkdirSync(directory, { recursive: true })
  manifest[category] = fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }))
}

const soundtrackDirectory = path.join(materialsRoot, soundtrackCategory)
fs.mkdirSync(soundtrackDirectory, { recursive: true })
manifest[soundtrackCategory] = fs.readdirSync(soundtrackDirectory, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.mp3'))
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }))

fs.writeFileSync(
  path.join(materialsRoot, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)

console.log(`Listed ${categories.reduce((total, category) => total + manifest[category].length, 0)} learning PDF(s) and ${manifest[soundtrackCategory].length} soundtrack MP3(s).`)
