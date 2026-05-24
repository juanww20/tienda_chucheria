'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function ctx() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single()
  if (!profile?.company_id) throw new Error('Sin empresa asignada')
  return { supabase, companyId: profile.company_id as string }
}

// ---------- Products ----------
export async function addProduct(formData: FormData): Promise<void> {
  const { supabase, companyId } = await ctx()
  const name = String(formData.get('name') || '').trim()
  if (!name) return
  const price = Number(formData.get('price') || 0)
  const stock = parseInt(String(formData.get('stock') || '0'), 10) || 0
  const emoji = String(formData.get('emoji') || '🍬').trim() || '🍬'

  // Optional product image (uploaded via service role -> public bucket)
  let image_url: string | null = null
  const image = formData.get('image') as File | null
  if (image && image.size > 0 && image.type.startsWith('image/')) {
    const admin = createAdminClient()
    const ext = (image.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${companyId}/${Date.now()}.${ext}`
    const { error } = await admin.storage
      .from('products')
      .upload(path, image, { contentType: image.type, upsert: true })
    if (!error) {
      image_url = admin.storage.from('products').getPublicUrl(path).data.publicUrl
    }
  }

  await supabase
    .from('products')
    .insert({ company_id: companyId, name, price, stock, emoji, image_url })
  revalidatePath('/admin')
}

export async function updateStock(formData: FormData): Promise<void> {
  const { supabase } = await ctx()
  const id = String(formData.get('id') || '')
  const stock = Math.max(0, parseInt(String(formData.get('stock') || '0'), 10) || 0)
  if (!id) return
  await supabase.from('products').update({ stock }).eq('id', id)
  revalidatePath('/admin')
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const { supabase } = await ctx()
  const id = String(formData.get('id') || '')
  if (!id) return
  await supabase.from('products').delete().eq('id', id)
  revalidatePath('/admin')
}

/** Quick sell: record a sale and decrement stock ("bajar inventario"). */
export async function recordSale(formData: FormData): Promise<void> {
  const { supabase, companyId } = await ctx()
  const productId = String(formData.get('productId') || '')
  if (!productId) return
  const { data: product } = await supabase
    .from('products')
    .select('price, stock')
    .eq('id', productId)
    .single()
  if (!product || product.stock <= 0) return
  await supabase.from('sales').insert({
    company_id: companyId,
    product_id: productId,
    qty: 1,
    unit_price: product.price,
  })
  await supabase
    .from('products')
    .update({ stock: product.stock - 1 })
    .eq('id', productId)
  revalidatePath('/admin')
}

// ---------- Combos ----------
export async function createCombo(formData: FormData): Promise<void> {
  const { supabase, companyId } = await ctx()
  const name = String(formData.get('name') || '').trim()
  const priceOffer = Number(formData.get('priceOffer') || 0)
  const productIds = formData.getAll('productIds').map(String).filter(Boolean)
  if (!name || productIds.length < 2 || !priceOffer) return

  const { data: prods } = await supabase
    .from('products')
    .select('price')
    .in('id', productIds)
  const originalPrice = (prods ?? []).reduce((t, p) => t + Number(p.price), 0)

  const { data: combo } = await supabase
    .from('combos')
    .insert({
      company_id: companyId,
      name,
      price_offer: priceOffer,
      original_price: originalPrice,
    })
    .select()
    .single()
  if (!combo) return

  await supabase
    .from('combo_items')
    .insert(productIds.map((pid) => ({ combo_id: combo.id, product_id: pid })))
  revalidatePath('/admin')
}

export async function toggleComboTv(formData: FormData): Promise<void> {
  const { supabase } = await ctx()
  const id = String(formData.get('id') || '')
  const next = String(formData.get('next') || '') === 'true'
  if (!id) return
  await supabase.from('combos').update({ on_tv: next }).eq('id', id)
  revalidatePath('/admin')
}

export async function deleteCombo(formData: FormData): Promise<void> {
  const { supabase } = await ctx()
  const id = String(formData.get('id') || '')
  if (!id) return
  await supabase.from('combos').delete().eq('id', id)
  revalidatePath('/admin')
}

/** Sell a combo: record sale and decrement each member product's stock. */
export async function sellCombo(formData: FormData): Promise<void> {
  const { supabase, companyId } = await ctx()
  const comboId = String(formData.get('comboId') || '')
  if (!comboId) return

  const { data: combo } = await supabase
    .from('combos')
    .select('price_offer, combo_items(product_id)')
    .eq('id', comboId)
    .single()
  if (!combo) return

  await supabase.from('sales').insert({
    company_id: companyId,
    combo_id: comboId,
    qty: 1,
    unit_price: combo.price_offer,
  })

  const items = (combo.combo_items as { product_id: string }[]) ?? []
  for (const it of items) {
    const { data: p } = await supabase
      .from('products')
      .select('stock')
      .eq('id', it.product_id)
      .single()
    if (p) {
      await supabase
        .from('products')
        .update({ stock: Math.max(0, p.stock - 1) })
        .eq('id', it.product_id)
    }
  }
  revalidatePath('/admin')
}

// ---------- Company settings ----------
export async function updateCompany(formData: FormData): Promise<void> {
  const { companyId } = await ctx()
  const name = String(formData.get('name') || '').trim()
  const logo = formData.get('logo') as File | null

  const patch: { name?: string; logo_url?: string } = {}
  if (name) patch.name = name

  // Use the service-role client (scoped by the authenticated company id).
  // companies has no UPDATE RLS policy, so the user client would be denied.
  const admin = createAdminClient()

  if (logo && logo.size > 0) {
    const ext = (logo.name.split('.').pop() || 'png').toLowerCase()
    const path = `company-${companyId}-${Date.now()}.${ext}`
    const { error } = await admin.storage
      .from('logos')
      .upload(path, logo, { contentType: logo.type, upsert: true })
    if (!error) {
      patch.logo_url = admin.storage.from('logos').getPublicUrl(path).data.publicUrl
    }
  }

  if (Object.keys(patch).length > 0) {
    await admin.from('companies').update(patch).eq('id', companyId)
  }
  revalidatePath('/admin')
}
