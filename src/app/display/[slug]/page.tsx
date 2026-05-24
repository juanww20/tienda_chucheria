import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import DisplayMenu, { type Slide } from './DisplayMenu'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DisplayPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const admin = createAdminClient()

  const { data: company } = await admin
    .from('companies')
    .select('id, name, logo_url, active')
    .eq('slug', slug)
    .single()

  if (!company || company.active === false) notFound()

  const { data: combosData } = await admin
    .from('combos')
    .select('id, name, description, price_offer, original_price, combo_items(products(name, emoji, image_url))')
    .eq('company_id', company.id)
    .eq('on_tv', true)
    .order('created_at', { ascending: false })

  const slides: Slide[] = (combosData ?? []).map((c) => {
    const items =
      (c.combo_items as unknown as {
        products: { name: string; emoji: string | null; image_url: string | null } | null
      }[] | null) ?? []
    return {
      id: c.id as string,
      name: c.name as string,
      description: (c.description as string | null) ?? '',
      price: Number(c.price_offer),
      original: Number(c.original_price),
      items: items
        .map((i) => i.products)
        .filter((p): p is { name: string; emoji: string | null; image_url: string | null } => !!p)
        .map((p) => ({ name: p.name, emoji: p.emoji ?? '🍬', image: p.image_url })),
    }
  })

  return (
    <DisplayMenu
      companyName={company.name as string}
      companyLogo={(company.logo_url as string | null) ?? null}
      slides={slides}
    />
  )
}
