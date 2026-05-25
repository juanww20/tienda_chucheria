'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { addProduct, updateStock, deleteProduct } from '../actions'
import type { Company, ProductWithVelocity, RateMode, RotationStatus } from '@/lib/types'
import { type Rates, convertPrice, formatConverted, resolveRate, RATE_LABEL } from '@/lib/rates'
import SubmitButton from './SubmitButton'

gsap.registerPlugin(useGSAP)

const STATUS_TAG: Record<RotationStatus, { label: string; cls: string }> = {
  nuevo: { label: '🆕 Nuevo', cls: 'bg-blue-100 text-blue-700' },
  rapido: { label: '🚀 Rápido', cls: 'bg-green-100 text-green-700' },
  lento: { label: '🐢 Lento', cls: 'bg-orange-100 text-orange-700' },
}

function expiryTag(days: number | null) {
  if (days === null) return null
  if (days < 0) return { label: '⛔ Vencido', cls: 'bg-red-100 text-red-700' }
  if (days <= 7) return { label: `⏰ ${days}d`, cls: 'bg-red-100 text-red-700' }
  if (days <= 30) return { label: `⏳ ${days}d`, cls: 'bg-amber-100 text-amber-700' }
  return { label: `${days}d`, cls: 'bg-gray-100 text-gray-500' }
}

interface Props {
  products: ProductWithVelocity[]
  company: Company
  rates: Rates
}

export default function Inventario({ products, company, rates }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [rateMode, setRateMode] = useState<'' | RateMode>('')

  useGSAP(
    () => {
      gsap.from('.inv-row', { x: -16, opacity: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' })
    },
    { scope: root, dependencies: [products.length] }
  )

  return (
    <div ref={root} className="mx-auto max-w-7xl">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">📦 Inventario</h1>
      <p className="mb-6 text-gray-500">
        Agrega productos en USD, define vencimiento y cómo se muestran en la TV.
      </p>

      {/* Add product card */}
      <form
        ref={formRef}
        action={async (fd) => {
          await addProduct(fd)
          formRef.current?.reset()
          setPreview(null)
          setRateMode('')
        }}
        className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gradient-to-r from-[#8e44ad]/5 to-[#f06292]/5 px-5 py-3">
          <span className="text-lg">✨</span>
          <h2 className="font-bold text-gray-800">Nuevo producto</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-[auto_1fr]">
          {/* Image + emoji */}
          <div className="flex gap-3">
            <label className="group relative flex h-28 w-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-[#f06292] hover:bg-[#f06292]/5">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <>
                  <span className="text-3xl">📷</span>
                  <span className="mt-1 text-xs font-medium text-gray-400 group-hover:text-[#f06292]">
                    Subir foto
                  </span>
                </>
              )}
              <input
                name="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  setPreview(f ? URL.createObjectURL(f) : null)
                }}
              />
            </label>
            <div className="flex flex-col items-center gap-1">
              <input
                name="emoji"
                maxLength={2}
                defaultValue="🍬"
                aria-label="Emoji"
                className="h-16 w-16 rounded-2xl border border-gray-300 text-center text-3xl outline-none focus:ring-2 focus:ring-[#f06292]"
              />
              <span className="text-[10px] text-gray-400">Emoji</span>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-4">
              <label className="mb-1 block text-xs font-semibold text-gray-600">Nombre</label>
              <input
                name="name"
                required
                placeholder="Ej: Chocolate Savoy"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#f06292]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Precio (USD)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#f06292]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Stock</label>
              <input
                name="stock"
                type="number"
                required
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#f06292]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Vencimiento</label>
              <input
                name="expires_at"
                type="date"
                aria-label="Fecha de vencimiento"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-[#f06292]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Tasa en TV</label>
              <select
                name="rate_mode"
                value={rateMode}
                onChange={(e) => setRateMode(e.target.value as RateMode | '')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-[#f06292]"
              >
                <option value="">Heredar ({RATE_LABEL[company.rate_mode]})</option>
                <option value="binance">Binance</option>
                <option value="bcv">BCV</option>
                <option value="euro">Euro</option>
                <option value="custom">Tasa propia</option>
              </select>
            </div>

            {rateMode === 'custom' && (
              <div className="col-span-2 sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Tasa propia (Bs por USD)
                </label>
                <input
                  name="custom_rate"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 40.00"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#f06292]"
                />
              </div>
            )}

            <div className="col-span-2 sm:col-span-4">
              <SubmitButton
                pendingText="Agregando…"
                className="w-full rounded-lg bg-gradient-to-r from-[#8e44ad] to-[#d81b60] py-2.5 font-bold text-white transition hover:shadow-lg disabled:opacity-50"
              >
                + Agregar producto
              </SubmitButton>
            </div>
          </div>
        </div>
        <p className="border-t border-gray-100 px-5 py-2 text-xs text-gray-400">
          💡 La foto y el vencimiento son opcionales. Sin foto se usa el emoji. La tasa "Heredar"
          usa la de la empresa (cámbiala en Ajustes).
        </p>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="p-4 font-semibold">Producto</th>
                <th className="p-4 font-semibold">Precio</th>
                <th className="p-4 font-semibold">En TV</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold">Rotación</th>
                <th className="p-4 font-semibold">Vence</th>
                <th className="p-4 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const tag = STATUS_TAG[p.status]
                const exp = expiryTag(p.daysToExpiry)
                const r = resolveRate(p.rate_mode, p.custom_rate, company.rate_mode, company.custom_rate)
                const conv = convertPrice(p.price, r.mode, r.custom, rates)
                return (
                  <tr key={p.id} className="inv-row border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <Image
                            src={p.image_url}
                            alt={p.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xl">
                            {p.emoji}
                          </span>
                        )}
                        {p.name}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-[#4dd0e1]">${p.price}</p>
                      <p className="text-xs text-gray-400">{formatConverted(conv)}</p>
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {conv.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <form action={updateStock} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          name="stock"
                          type="number"
                          aria-label={`Stock de ${p.name}`}
                          defaultValue={p.stock}
                          className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-center"
                        />
                        <SubmitButton
                          pendingText="…"
                          className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                        >
                          ✓
                        </SubmitButton>
                      </form>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${tag.cls}`}>
                        {tag.label}
                      </span>
                    </td>
                    <td className="p-4">
                      {exp ? (
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${exp.cls}`}>
                          {exp.label}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <form
                        action={deleteProduct}
                        onSubmit={(e) => {
                          if (!confirm(`¿Eliminar "${p.name}"?`)) e.preventDefault()
                        }}
                      >
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="text-red-400 transition hover:text-red-600">
                          🗑
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400">
                    Sin productos todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-gradient-to-r from-[#fff176]/20 to-[#f06292]/20 p-4">
        <p className="text-sm text-gray-700">
          💡 <strong>Tip Chuchu:</strong> Los productos 🐢 lentos y los ⏰ próximos a vencer se
          combinan automáticamente con los 🚀 rápidos en <strong>Sugerencias IA</strong>. Los 🆕
          nuevos no se penalizan hasta tener una semana de ventas.
        </p>
      </div>
    </div>
  )
}
