#!/usr/bin/env node

const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const host = '127.0.0.1'
const port = 4174
const dataFile = path.join(__dirname, '..', 'public', 'data', 'typing', 'sentences.json')
const levels = new Set(['easy', 'harder', 'svo'])

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;')

function page(message = '', values = {}) {
  const notice = message ? `<p class="notice">${escapeHtml(message)}</p>` : ''
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tank Racer text editor</title><style>
  body{margin:0;background:#e8edf1;color:#172018;font:16px system-ui,sans-serif}main{box-sizing:border-box;width:min(760px,100%);margin:auto;padding:24px}form{display:grid;gap:16px;padding:24px;background:#fff;border:2px solid #526250;border-radius:14px}label{display:grid;gap:6px;font-weight:700}textarea,select{box-sizing:border-box;width:100%;padding:10px;border:2px solid #66756a;border-radius:8px;font:inherit}textarea{min-height:110px;resize:vertical}button{padding:12px;border:2px solid #004fa5;border-radius:9px;background:#005bbb;color:#fff;font-weight:700;font-size:1rem;cursor:pointer}.notice{padding:12px;border-radius:8px;background:#dcfce7;color:#166534}small{font-weight:400;color:#526250}
  </style></head><body><main><h1>Tank Racer text editor</h1><p>Add an exercise to the local game data. Refresh Tank Racer after saving.</p>${notice}<form method="post">
  <label>Russian text<textarea name="russian" required>${escapeHtml(values.russian)}</textarea><small>The exact text the player must type.</small></label>
  <label>Finnish translation<textarea name="fi" required>${escapeHtml(values.fi)}</textarea></label>
  <label>English translation<textarea name="en" required>${escapeHtml(values.en)}</textarea></label>
  <label>Level<select name="difficulty"><option value="easy">Easy</option><option value="harder"${values.difficulty === 'harder' ? ' selected' : ''}>Harder</option><option value="svo"${values.difficulty === 'svo' ? ' selected' : ''}>SVO</option></select></label>
  <button type="submit">Add to Tank Racer</button></form></main></body></html>`
}

function send(response, status, html) {
  response.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
  response.end(html)
}

const server = http.createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/') return send(response, 200, page())
  if (request.method !== 'POST' || request.url !== '/') return send(response, 404, page('Page not found.'))

  let body = ''
  request.setEncoding('utf8')
  request.on('data', (chunk) => {
    body += chunk
    if (body.length > 100_000) request.destroy()
  })
  request.on('end', () => {
    const form = new URLSearchParams(body)
    const values = {
      russian: (form.get('russian') ?? '').normalize('NFC').trim(),
      fi: (form.get('fi') ?? '').trim(),
      en: (form.get('en') ?? '').trim(),
      difficulty: form.get('difficulty') ?? '',
    }
    if (!values.russian || !values.fi || !values.en || !levels.has(values.difficulty)) {
      return send(response, 400, page('Please complete every field.', values))
    }
    if (/\r|\n/.test(values.russian)) return send(response, 400, page('Russian text must be on one line.', values))

    try {
      const entries = JSON.parse(fs.readFileSync(dataFile, 'utf8'))
      const prefix = values.difficulty.toUpperCase()
      const sequence = entries.reduce((highest, entry) => {
        const match = typeof entry.id === 'string' && entry.id.startsWith(`${prefix}-`) ? Number(entry.id.slice(prefix.length + 1)) : 0
        return Number.isFinite(match) ? Math.max(highest, match) : highest
      }, 0) + 1
      entries.push({
        id: `${prefix}-${String(sequence).padStart(3, '0')}`,
        difficulty: values.difficulty,
        russian: values.russian,
        translations: { fi: values.fi, en: values.en },
        vocabulary: [],
        enabled: true,
      })
      fs.writeFileSync(dataFile, `${JSON.stringify(entries, null, 2)}\n`)
      return send(response, 200, page(`Saved ${prefix}-${String(sequence).padStart(3, '0')}.`))
    } catch (error) {
      return send(response, 500, page(`Could not save: ${error instanceof Error ? error.message : String(error)}`, values))
    }
  })
})

server.listen(port, host, () => {
  console.log(`Tank Racer text editor: http://${host}:${port}`)
  console.log('Press Ctrl+C to stop.')
})
