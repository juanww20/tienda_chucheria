// Seed test data: 5 companies with admins, 20-40 products each, varied
// expiry dates, ages and sales so the rotation algorithm has signal.
//
// Usage:  node scripts/seed.mjs
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local
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
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL_ || !KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}
const s = createClient(URL_, KEY, { auth: { persistSession: false } })

const DAY = 86_400_000
const rnd = (min, max) => Math.random() * (max - min) + min
const rndInt = (min, max) => Math.floor(rnd(min, max + 1))
const pick = (arr) => arr[rndInt(0, arr.length - 1)]
const isoDaysFromNow = (d) => new Date(Date.now() + d * DAY).toISOString()
const dateDaysFromNow = (d) => new Date(Date.now() + d * DAY).toISOString().slice(0, 10)

const POOL = [
  ['Chocolate Savoy', '🍫'], ['Cocosette', '🥥'], ['Susy', '🍫'], ['Pirulín', '🍭'],
  ['Toronto', '🍫'], ['Samba', '🍫'], ['Ping Pong', '🍫'], ['Bombones Bianchi', '🍬'],
  ['Galletas Bilo', '🍪'], ['Oreo', '🍪'], ['Doritos', '🌮'], ['Cheese Tris', '🧀'],
  ['Pepito', '🍫'], ['Platanitos', '🍌'], ['Chupa Chups', '🍭'], ['Frunas', '🍬'],
  ['Halls', '🍬'], ['Trululu', '🐻'], ['Bon o Bon', '🍫'], ['Gomitas', '🐻'],
  ['Maní Japonés', '🥜'], ['Nestlé Crunch', '🍫'], ['Carré', '🍫'], ['Chocmelos', '🍡'],
  ['Pirucream', '🍫'], ['Galak', '🍫'], ['Cri Cri', '🍫'], ['Barra de Cereal', '🥖'],
  ['Refresco', '🥤'], ['Malta', '🍺'], ['Agua Mineral', '💧'], ['Jugo Natural', '🧃'],
  ['Café con Leche', '☕'], ['Tequeños', '🧀'], ['Cachito', '🥐'], ['Pastelito', '🥧'],
  ['Empanada', '🥟'], ['Chicle Globo', '🫧'], ['Paleta de Hielo', '🍦'], ['Cono Helado', '🍦'],
  ['Papas Fritas', '🍟'], ['Cotufas', '🍿'], ['Toddy', '🥤'], ['Maltín', '🍺'],
]

const COMPANIES = [
  { name: 'Garitas Club', slug: 'garitas-club', email: 'admin@garitas.com', rate_mode: 'bcv', custom_rate: null },
  { name: 'Dulce Manía', slug: 'dulce-mania', email: 'admin@dulcemania.com', rate_mode: 'bcv', custom_rate: null },
  { name: 'Snack Express', slug: 'snack-express', email: 'admin@snackexpress.com', rate_mode: 'euro', custom_rate: null },
  { name: 'Kiosko Don Pepe', slug: 'kiosko-don-pepe', email: 'admin@donpepe.com', rate_mode: 'binance', custom_rate: null },
  { name: 'La Golosina', slug: 'la-golosina', email: 'admin@lagolosina.com', rate_mode: 'custom', custom_rate: 700 },
]
const PASSWORD = 'Chuchu123!'

async function wipe(slug) {
  const { data: company } = await s.from('companies').select('id').eq('slug', slug).maybeSingle()
  if (!company) return
  const { data: profiles } = await s.from('profiles').select('id').eq('company_id', company.id)
  for (const p of profiles ?? []) await s.auth.admin.deleteUser(p.id).catch(() => {})
  await s.from('companies').delete().eq('id', company.id)
}

async function seedCompany(c) {
  await wipe(c.slug)

  const { data: company, error: ce } = await s
    .from('companies')
    .insert({ name: c.name, slug: c.slug, active: true, rate_mode: c.rate_mode, custom_rate: c.custom_rate })
    .select()
    .single()
  if (ce) throw new Error(`company ${c.slug}: ${ce.message}`)

  const { data: created, error: ue } = await s.auth.admin.createUser({
    email: c.email, password: PASSWORD, email_confirm: true,
  })
  if (ue) throw new Error(`user ${c.email}: ${ue.message}`)
  await s.from('profiles').insert({ id: created.user.id, email: c.email, role: 'admin', company_id: company.id })

  // Products: pick a unique subset of 20-40
  const count = rndInt(20, 40)
  const pool = [...POOL].sort(() => Math.random() - 0.5).slice(0, Math.min(count, POOL.length))
  const productsPayload = pool.map(([name, emoji]) => {
    // Age: some old (mature), some brand new
    const ageDays = pick([0, 1, 2, 3, 10, 15, 20, 25, 30, 40])
    // Expiry: mix of expired, very-soon, soon, far, and none
    const expRoll = Math.random()
    let expires_at = null
    if (expRoll < 0.12) expires_at = dateDaysFromNow(rndInt(-5, -1)) // expired
    else if (expRoll < 0.32) expires_at = dateDaysFromNow(rndInt(1, 7)) // very soon
    else if (expRoll < 0.55) expires_at = dateDaysFromNow(rndInt(8, 30)) // soon
    else if (expRoll < 0.85) expires_at = dateDaysFromNow(rndInt(40, 200)) // far
    return {
      company_id: company.id,
      name,
      emoji,
      price: Math.round(rnd(0.5, 8) * 100) / 100,
      stock: rndInt(2, 45),
      expires_at,
      rate_mode: null,
      custom_rate: null,
      created_at: isoDaysFromNow(-ageDays),
    }
  })

  const { data: products, error: pe } = await s.from('products').insert(productsPayload).select('id, price, created_at')
  if (pe) throw new Error(`products ${c.slug}: ${pe.message}`)

  // Sales: ~60% of products get sales over the last 30 days, varied volume.
  const salesPayload = []
  for (const p of products) {
    const ageDays = Math.floor((Date.now() - new Date(p.created_at).getTime()) / DAY)
    if (ageDays < 3) continue // brand-new -> leave as "nuevo"
    if (Math.random() > 0.6) continue // ~40% have no sales -> slow
    const events = rndInt(1, 12) // more events = faster mover
    for (let i = 0; i < events; i++) {
      salesPayload.push({
        company_id: company.id,
        product_id: p.id,
        qty: rndInt(1, 4),
        unit_price: p.price,
        sold_at: isoDaysFromNow(-rndInt(0, Math.min(ageDays, 30))),
      })
    }
  }
  if (salesPayload.length) {
    const { error: se } = await s.from('sales').insert(salesPayload)
    if (se) throw new Error(`sales ${c.slug}: ${se.message}`)
  }

  console.log(`✓ ${c.name.padEnd(18)} rate=${c.rate_mode.padEnd(8)} productos=${products.length} ventas=${salesPayload.length}`)
}

console.log('Sembrando datos de prueba…\n')
for (const c of COMPANIES) {
  try { await seedCompany(c) } catch (e) { console.error('✗', c.name, '-', e.message) }
}
console.log('\nListo. Admins (clave para todos: ' + PASSWORD + '):')
for (const c of COMPANIES) console.log('  ' + c.email.padEnd(28) + ' -> /display/' + c.slug)
