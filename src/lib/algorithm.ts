import type { Product, Sale, ComboSuggestion, ProductWithVelocity } from './types'

const WINDOW_DAYS = 30 // sales lookback
const MATURITY_DAYS = 7 // a product must exist this long before we call it "slow"
const EXPIRY_SOON_DAYS = 30 // flag products expiring within this window
const DAY = 86_400_000

function daysBetween(from: number, to: number) {
  return Math.floor((to - from) / DAY)
}

/**
 * Enrich each product with sales velocity, rotation status, age and expiry.
 *
 * Key fairness rule: a product younger than MATURITY_DAYS is "nuevo" and is
 * NOT judged as slow — selling little on day one means nothing. Among MATURE
 * products, classification is RELATIVE (top half = rápido, bottom = lento)
 * instead of a fixed threshold.
 */
export function computeProductMeta(
  products: Product[],
  sales: Sale[]
): ProductWithVelocity[] {
  const now = Date.now()
  const since = now - WINDOW_DAYS * DAY

  const soldByProduct = new Map<string, number>()
  for (const s of sales) {
    if (!s.product_id) continue
    if (new Date(s.sold_at).getTime() < since) continue
    soldByProduct.set(s.product_id, (soldByProduct.get(s.product_id) ?? 0) + s.qty)
  }

  const base = products.map((p) => {
    const ageDays = Math.max(0, daysBetween(new Date(p.created_at).getTime(), now))
    // Only count days the product has actually existed (capped at the window).
    const effectiveDays = Math.min(Math.max(ageDays, 1), WINDOW_DAYS)
    const sold = soldByProduct.get(p.id) ?? 0
    const velocity = sold / effectiveDays
    const daysToExpiry = p.expires_at
      ? daysBetween(now, new Date(p.expires_at).getTime())
      : null
    const nearExpiry = daysToExpiry !== null && daysToExpiry <= EXPIRY_SOON_DAYS
    const mature = ageDays >= MATURITY_DAYS
    return { p, ageDays, velocity, daysToExpiry, nearExpiry, mature }
  })

  // Relative classification among mature products only.
  const mature = base.filter((b) => b.mature).sort((a, b) => b.velocity - a.velocity)
  const fastIds = new Set<string>()
  if (mature.length > 0) {
    const half = Math.ceil(mature.length / 2)
    mature.slice(0, half).forEach((b) => {
      if (b.velocity > 0) fastIds.add(b.p.id)
    })
  }

  return base.map((b): ProductWithVelocity => {
    let status: ProductWithVelocity['status']
    if (!b.mature) status = 'nuevo'
    else if (fastIds.has(b.p.id)) status = 'rapido'
    else status = 'lento'
    return {
      ...b.p,
      velocity: b.velocity,
      status,
      ageDays: b.ageDays,
      daysToExpiry: b.daysToExpiry,
      nearExpiry: b.nearExpiry,
    }
  })
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

/**
 * Suggest combos that pair a fast seller with a product that needs a push:
 * a slow mover OR one close to expiring. Near-expiry items are prioritised and
 * get a deeper discount when very close to the date.
 */
export function suggestCombos(
  products: ProductWithVelocity[],
  max = 6
): ComboSuggestion[] {
  const inStock = products.filter((p) => p.stock > 0)
  if (inStock.length < 2) return []

  const fastPool = inStock
    .filter((p) => p.status === 'rapido')
    .sort((a, b) => b.velocity - a.velocity)

  // Things to move: slow movers, or anything near expiry (even if new/fast).
  const pushPool = inStock
    .filter((p) => p.status === 'lento' || p.nearExpiry)
    .sort((a, b) => {
      // near-expiry first (soonest), then slowest
      const ax = a.nearExpiry ? a.daysToExpiry ?? 9999 : 9999
      const bx = b.nearExpiry ? b.daysToExpiry ?? 9999 : 9999
      if (ax !== bx) return ax - bx
      return a.velocity - b.velocity
    })

  // Partners that actually sell. Fall back to best-moving non-push products.
  const fallbackPartners = inStock
    .filter((p) => !pushPool.includes(p))
    .sort((a, b) => b.velocity - a.velocity)
  const partners = fastPool.length > 0 ? fastPool : fallbackPartners

  const out: ComboSuggestion[] = []
  const used = new Set<string>()

  for (const slow of pushPool) {
    if (out.length >= max) break
    if (used.has(slow.id)) continue
    const fast = partners.find((f) => f.id !== slow.id && !used.has(f.id))
    if (!fast) continue
    used.add(slow.id)
    used.add(fast.id)

    const veryClose = slow.nearExpiry && slow.daysToExpiry !== null && slow.daysToExpiry <= 7
    const discount = veryClose ? 0.2 : 0.15
    const originalPrice = round2(fast.price + slow.price)
    const suggestedPrice = round2(originalPrice * (1 - discount))

    let reason: string
    if (slow.nearExpiry && slow.daysToExpiry !== null) {
      reason =
        slow.daysToExpiry < 0
          ? `⏰ "${slow.name}" ya venció — combínalo con "${fast.name}" y remátalo ya.`
          : `⏰ "${slow.name}" vence en ${slow.daysToExpiry} día(s). Júntalo con "${fast.name}" (rápido) para venderlo antes.`
    } else {
      reason = `"${fast.name}" se vende rápido y "${slow.name}" lento — el combo arrastra el stock lento.`
    }

    out.push({
      fast,
      slow,
      originalPrice,
      suggestedPrice,
      discountPct: Math.round(discount * 100),
      reason,
    })
  }

  return out
}
