// Backfill: fetch a themed image for every product without one, upload to the
// 'products' bucket and save the public URL.
//
// Usage: node scripts/backfill-images.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

function loadEnv() {
  const env = {}
  try {
    const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
      if (m) env[m[1]] = m[2].trim()
    }
  } catch {}
  return env
}

const env = loadEnv()
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

function keywordFor(name) {
  const n = name.toLowerCase()
  const map = [
    [/chocolate|savoy|toronto|samba|carr|crunch|galak|bon|cri|pirucream|pepito|susy/, 'chocolate,candy'],
    [/galleta|oreo|bilo|cookie/, 'cookies'],
    [/coco/, 'coconut,sweet'],
    [/pirul|chupa|paleta|lollipop/, 'lollipop,candy'],
    [/gomita|trululu|frunas|chicle|gummy/, 'gummy,candy'],
    [/dorito|papas|chips|platanit|cotufa|cheese tris|cheez/, 'chips,snack'],
    [/man[ií]|nuts/, 'peanuts,snack'],
    [/refresco|toddy|malt[ií]n|malta|jugo|soda|drink/, 'soda,drink'],
    [/agua|water/, 'water,bottle'],
    [/caf[eé]|coffee/, 'coffee'],
    [/tequeñ|empanada|cachito|pastelito|helado|cono/, 'food,snack'],
    [/halls|menta|mint/, 'mints,candy'],
    [/cereal|barra/, 'cereal,bar'],
  ]
  for (const [re, kw] of map) if (re.test(n)) return kw
  return 'candy,sweets,snack'
}

async function fetchImage(name) {
  const kw = keywordFor(name)
  const lock = Math.floor(Math.random() * 100000)
  const url = `https://loremflickr.com/512/512/${encodeURIComponent(kw)}?lock=${lock}`
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 15000)
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'follow' })
    if (!res.ok) return null
    const ct = res.headers.get('content-type') || 'image/jpeg'
    if (!ct.startsWith('image/')) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.byteLength < 800) return null
    return { buf, ct }
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

async function processOne(p) {
  const img = await fetchImage(p.name)
  if (!img) return { id: p.id, ok: false }
  const path = `${p.company_id}/backfill-${p.id}.jpg`
  const { error: ue } = await s.storage.from('products').upload(path, img.buf, {
    contentType: img.ct,
    upsert: true,
  })
  if (ue) return { id: p.id, ok: false }
  const url = s.storage.from('products').getPublicUrl(path).data.publicUrl
  const { error: pe } = await s.from('products').update({ image_url: url }).eq('id', p.id)
  return { id: p.id, ok: !pe }
}

const { data: products, error } = await s
  .from('products')
  .select('id, name, company_id')
  .is('image_url', null)
if (error) {
  console.error('query error:', error.message)
  process.exit(1)
}

console.log(`Productos sin imagen: ${products.length}`)
let ok = 0
let fail = 0
const CHUNK = 6
for (let i = 0; i < products.length; i += CHUNK) {
  const batch = products.slice(i, i + CHUNK)
  const results = await Promise.all(batch.map(processOne))
  for (const r of results) r.ok ? ok++ : fail++
  console.log(`  ${Math.min(i + CHUNK, products.length)}/${products.length} (ok=${ok} fail=${fail})`)
}
console.log(`\nListo. Imágenes asignadas: ${ok}, fallidas: ${fail}`)
