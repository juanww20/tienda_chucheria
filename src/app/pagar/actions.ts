'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getDolarParalelo, usdToBs } from '@/lib/dolar'
import { isPaymentProof } from '@/lib/gemini'
import { sendPaymentTelegram } from '@/lib/telegram'
import { PLANS, METHOD_LABEL } from '@/lib/plans'
import type { Plan, PaymentMethod, PaymentStatus } from '@/lib/types'

export type CheckoutState = { error?: string; success?: string }

const METHODS: PaymentMethod[] = ['binance', 'pagomovil', 'transferencia']

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function submitPayment(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const plan = String(formData.get('plan') || '') as Plan
  const method = String(formData.get('method') || '') as PaymentMethod
  const reference = String(formData.get('reference') || '').trim()
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const proof = formData.get('proof') as File | null

  if (!PLANS[plan]) return { error: 'Plan inválido.' }
  if (!METHODS.includes(method)) return { error: 'Método de pago inválido.' }
  if (!name || !email) return { error: 'Indica tu nombre y correo.' }
  if (!reference) return { error: 'Indica el número de referencia del pago.' }
  if (!proof || proof.size === 0) return { error: 'Sube la captura de tu pago.' }
  if (!proof.type.startsWith('image/')) return { error: 'El comprobante debe ser una imagen.' }
  if (proof.size > 8 * 1024 * 1024) return { error: 'La imagen es muy grande (máx 8MB).' }

  const bytes = await proof.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')

  // 1) Validate it's actually a payment proof. The IA can produce false
  // negatives, so we never block the buyer: we still save the payment but
  // flag it as 'rejected' for the owner to review manually.
  const check = await isPaymentProof(base64, proof.type)
  const status: PaymentStatus = check.ok ? 'pending' : 'rejected'

  const admin = createAdminClient()

  // 2) Upload proof
  const ext = (proof.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${plan}-${Date.now()}.${ext}`
  const { error: upErr } = await admin.storage
    .from('payments')
    .upload(path, proof, { contentType: proof.type, upsert: true })
  if (upErr) return { error: `No se pudo subir la imagen: ${upErr.message}` }
  const proofUrl = admin.storage.from('payments').getPublicUrl(path).data.publicUrl

  // 3) Amounts
  const amountUsd = PLANS[plan].priceUsd
  const rate = await getDolarParalelo()
  const amountBs = rate > 0 ? usdToBs(amountUsd, rate) : null

  // 4) Persist
  const { error: insErr } = await admin.from('payments').insert({
    plan,
    amount_usd: amountUsd,
    amount_bs: amountBs,
    dolar_rate: rate || null,
    method,
    reference,
    proof_url: proofUrl,
    buyer_name: name,
    buyer_email: email,
    buyer_phone: phone || null,
    status,
  })
  if (insErr) return { error: `No se pudo registrar el pago: ${insErr.message}` }

  // 5) Notify via Telegram
  const bsLine =
    method === 'binance'
      ? `💵 Monto: <b>$${amountUsd} USD</b>`
      : `💵 Monto: <b>$${amountUsd}</b>${amountBs ? ` ≈ <b>Bs ${amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</b>` : ''}`

  const caption = [
    '<b>💰 NUEVO PAGO RECIBIDO</b>',
    '━━━━━━━━━━━━━━━',
    `🏷 Plan: <b>${esc(PLANS[plan].name)}</b>`,
    `💳 Método: <b>${METHOD_LABEL[method]}</b>`,
    bsLine,
    `🔖 Referencia: <code>${esc(reference)}</code>`,
    '👤 Cliente:',
    `   • ${esc(name)}`,
    `   • ✉️ ${esc(email)}`,
    phone ? `   • 📱 ${esc(phone)}` : '',
    `🕒 ${new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' })}`,
    `📌 Estado: <b>${status === 'rejected' ? '❌ RECHAZADO por IA' : '🕓 Pendiente'}</b>`,
    '',
    status === 'rejected'
      ? '⚠️ <i>La IA marcó la imagen como NO comprobante. Puede ser un falso negativo: revísalo en el panel y valídalo si es correcto.</i>'
      : '⚠️ <i>Verifica el comprobante antes de activar.</i>',
  ]
    .filter(Boolean)
    .join('\n')

  await sendPaymentTelegram({
    bytes,
    filename: `pago-${path}`,
    mimeType: proof.type,
    caption,
  })

  return {
    success:
      '¡Pago enviado! Lo verificaremos y activaremos tu cuenta muy pronto. Te contactaremos por correo.',
  }
}
