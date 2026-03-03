#!/usr/bin/env node

const { execSync } = require('node:child_process')

const env = { ...process.env }
delete env.CAPACITOR_DEV_SERVER

function run(command) {
  execSync(command, {
    env,
    stdio: 'inherit',
    windowsHide: true,
  })
}

console.log('Building release web assets...')
run('npm run build')

console.log('Syncing Capacitor Android project...')
run('npx cap sync android')
