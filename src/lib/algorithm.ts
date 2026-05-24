import type { Product, Sale, ComboSuggestion } from './types'

const WINDOW_DAYS = 30
const DISCOUNT = 0.15 // 15% off the combined price

/**
 * Units sold per day for each product over the recent window.
 * When there is no sales history yet, every product scores 0 and the
 * pairing falls back to stock (more stock = assumed slower mover).
 */
export function computeVelocity(
  sales: Sale[],
  windowDays = WINDOW_DAYS
): Map<string, number> {
  const since = Date.now() - windowDays * 86_400_000
  const totals = new Map<string, number>()
  for (const s of sales) {
    if (!s.product_id) continue
    if (new Date(s.sold_at).getTime() < since) continue
    totals.set(s.product_id, (totals.get(s.product_id) ?? 0) + s.qty)
  }
  const velocity = new Map<string, number>()
  for (const [id, qty] of totals) velocity.set(id, qty / windowDays)
  return velocity
}

/**
 * Pair fast sellers with slow movers so a combo drags slow stock along
 * with a popular product. Slowest is matched with fastest, etc.
 */
export function suggestCombos(
  products: Product[],
  sales: Sale[],
  max = 5
): ComboSuggestion[] {
  const inStock = products.filter((p) => p.stock > 0)
  if (inStock.length < 2) return []

  const velocity = computeVelocity(sales)

  // Rank: faster first. Tiebreak by lower stock (selling out = faster).
  const ranked = [...inStock].sort((a, b) => {
    const va = velocity.get(a.id) ?? 0
    const vb = velocity.get(b.id) ?? 0
    if (vb !== va) return vb - va
    return a.stock - b.stock
  })

  const half = Math.floor(ranked.length / 2)
  const fastPool = ranked.slice(0, Math.max(1, half))
  const slowPool = ranked.slice(half).reverse() // slowest first

  const out: ComboSuggestion[] = []
  const used = new Set<string>()
  const pairs = Math.min(fastPool.length, slowPool.length, max)

  for (let i = 0; i < pairs; i++) {
    const slow = slowPool[i]
    const fast = fastPool[i]
    if (!slow || !fast || slow.id === fast.id) continue
    if (used.has(slow.id) || used.has(fast.id)) continue
    used.add(slow.id)
    used.add(fast.id)

    const originalPrice = round2(fast.price + slow.price)
    const suggestedPrice = round2(originalPrice * (1 - DISCOUNT))
    const slowV = velocity.get(slow.id) ?? 0
    const fastV = velocity.get(fast.id) ?? 0

    out.push({
      fast,
      slow,
      originalPrice,
      suggestedPrice,
      discountPct: Math.round(DISCOUNT * 100),
      reason:
        slowV === 0 && fastV === 0
          ? `Sin ventas aún: "${slow.name}" tiene alto stock; júntalo con "${fast.name}" para empezar a moverlo.`
          : `"${fast.name}" se vende rápido (${fastV.toFixed(2)}/día) y "${slow.name}" lento (${slowV.toFixed(
              2
            )}/día). El combo arrastra el stock lento.`,
    })
  }

  return out
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
