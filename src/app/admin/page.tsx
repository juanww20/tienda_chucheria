import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/auth'
import { suggestCombos, computeVelocity } from '@/lib/algorithm'
import type { Product, Sale } from '@/lib/types'
import AdminApp from './AdminApp'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { profile, company } = await getSessionContext()
  if (!profile) redirect('/login')
  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] p-6 text-center text-gray-500">
        Tu usuario no tiene empresa asignada. Contacta al propietario.
      </div>
    )
  }

  const supabase = await createClient()
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString()

  const [{ data: productsData }, { data: combosData }, { data: salesData }] =
    await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('combos')
        .select('*, combo_items(product_id, products(name, emoji))')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('sales')
        .select('*')
        .eq('company_id', company.id)
        .gte('sold_at', since),
    ])

  const products = (productsData ?? []) as Product[]
  const sales = (salesData ?? []) as Sale[]

  const combos = (combosData ?? []).map((c) => {
    const items = (c.combo_items as unknown as
      | { product_id: string; products: { name: string; emoji: string | null } | null }[]
      | null) ?? []
    return {
      id: c.id as string,
      name: c.name as string,
      price_offer: Number(c.price_offer),
      original_price: Number(c.original_price),
      on_tv: c.on_tv as boolean,
      productIds: items.map((i) => i.product_id),
      productNames: items.map((i) => i.products?.name ?? '—'),
    }
  })

  // Velocity tags for inventory view
  const velocity = computeVelocity(sales)
  const productsWithVelocity = products.map((p) => ({
    ...p,
    velocity: velocity.get(p.id) ?? 0,
  }))

  const suggestions = suggestCombos(products, sales)

  // Report stats
  const now = Date.now()
  const startToday = new Date().setHours(0, 0, 0, 0)
  const week = now - 7 * 86_400_000
  let ventasHoy = 0
  let ventasSemana = 0
  let combosVendidos = 0
  let efectoChuchu = 0
  for (const s of sales) {
    const t = new Date(s.sold_at).getTime()
    const amount = Number(s.unit_price) * s.qty
    if (t >= startToday) ventasHoy += amount
    if (t >= week) {
      ventasSemana += amount
      if (s.combo_id) {
        combosVendidos += s.qty
        efectoChuchu += amount
      }
    }
  }

  return (
    <AdminApp
      company={company}
      products={productsWithVelocity}
      combos={combos}
      suggestions={suggestions}
      stats={{
        ventasHoy,
        ventasSemana,
        combosVendidos,
        efectoChuchu,
        ventasRegulares: Math.max(0, ventasSemana - efectoChuchu),
      }}
    />
  )
}
