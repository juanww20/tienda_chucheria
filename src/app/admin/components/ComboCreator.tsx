'use client'

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { createCombo } from '../actions'
import type { ProductWithVelocity } from '@/lib/types'
import SubmitButton from './SubmitButton'

gsap.registerPlugin(useGSAP)

interface Props {
  products: ProductWithVelocity[]
  onClose: () => void
  presetIds?: string[]
  presetName?: string
  presetPrice?: number
}

export default function ComboCreator({
  products,
  onClose,
  presetIds = [],
  presetName = '',
  presetPrice,
}: Props) {
  const [selected, setSelected] = useState<string[]>(presetIds)
  const [name, setName] = useState(presetName)
  const [price, setPrice] = useState(presetPrice ? String(presetPrice) : '')
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.from('.cc-panel', { y: 24, scale: 0.95, opacity: 0, duration: 0.35, ease: 'back.out(1.5)' })
    },
    { scope: root }
  )

  const byId = (id: string) => products.find((p) => p.id === id)
  const original = selected.reduce((t, id) => t + (byId(id)?.price ?? 0), 0)
  const available = products.filter((p) => !selected.includes(p.id))
  const valid = name.trim() && selected.length >= 2 && Number(price) > 0

  return (
    <div
      ref={root}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="cc-panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-800">✨ Nuevo Combo</h2>
          <p className="text-sm text-gray-500">Combina productos para mostrar en la TV</p>
        </div>

        <form
          action={async (fd) => {
            await createCombo(fd)
            onClose()
          }}
          className="space-y-5 p-6"
        >
          {selected.map((id) => (
            <input key={id} type="hidden" name="productIds" value={id} />
          ))}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Nombre del combo</label>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Pack Súper Oferta"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#f06292]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Productos (mínimo 2)
            </label>
            <div className="min-h-[80px] rounded-lg bg-gray-50 p-3">
              {selected.length === 0 ? (
                <p className="text-center text-sm text-gray-400">Selecciona productos</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selected.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelected((s) => s.filter((x) => x !== id))}
                      className="rounded-full bg-[#f06292] px-3 py-1 text-sm text-white transition-colors hover:bg-[#d81b60]"
                    >
                      {byId(id)?.emoji} {byId(id)?.name} ✕
                    </button>
                  ))}
                </div>
              )}
            </div>
            {available.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {available.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelected((s) => [...s, p.id])}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm transition-colors hover:bg-gray-200"
                  >
                    + {p.emoji} {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Precio oferta ($)</label>
            <input
              name="priceOffer"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Precio promocional"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-[#f06292]"
            />
            {original > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                Precio original: ${original.toFixed(2)}
                {Number(price) > 0 && ` · Ahorro: $${(original - Number(price)).toFixed(2)}`}
              </p>
            )}
          </div>

          <div className="flex gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </button>
            <SubmitButton
              pendingText="Creando…"
              className={`flex-1 rounded-lg px-4 py-2 font-bold transition-all ${
                valid
                  ? 'bg-gradient-to-r from-[#fff176] to-[#ffd966] text-gray-800 hover:shadow-lg'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400'
              }`}
            >
              Crear Combo
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}
