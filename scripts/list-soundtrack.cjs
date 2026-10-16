#!/usr/bin/env node

/**
 * Builds the soundtrack list used by the listening menu.
 * Drop MP3s into soundtrack-loop; dev/build regenerates the manifest.
 */
const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..')
const materialsRoot = path.join(root, 'public', 'learning-materials')
const soundtrackCategory = 'soundtrack-loop'

const manifest = {}

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

console.log(`Listed ${manifest[soundtrackCategory].length} soundtrack MP3(s).`)
