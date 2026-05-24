'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { addProduct, updateStock, deleteProduct } from '../actions'
import type { ProductWithVelocity } from '@/lib/types'
import SubmitButton from './SubmitButton'

gsap.registerPlugin(useGSAP)

function velocityTag(v: number) {
  if (v <= 0) return { label: 'Sin ventas', cls: 'bg-gray-100 text-gray-500' }
  if (v >= 0.1) return { label: '🚀 Rápido', cls: 'bg-green-100 text-green-700' }
  return { label: '🐢 Lento', cls: 'bg-orange-100 text-orange-700' }
}

export default function Inventario({ products }: { products: ProductWithVelocity[] }) {
  const root = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useGSAP(
    () => {
      gsap.from('.inv-row', { x: -16, opacity: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' })
    },
    { scope: root, dependencies: [products.length] }
  )

  return (
    <div ref={root} className="mx-auto max-w-7xl">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">📦 Inventario</h1>
      <p className="mb-6 text-gray-500">Agrega productos, ajusta stock y observa su rotación.</p>

      {/* Add product */}
      <form
        ref={formRef}
        action={async (fd) => {
          await addProduct(fd)
          formRef.current?.reset()
          setPreview(null)
        }}
        className="mb-6 rounded-xl border border-gray-200 bg-white p-4"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Image / emoji */}
          <div className="flex shrink-0 gap-3">
            <label className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-[#f06292]">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-center text-xs text-gray-400 group-hover:text-[#f06292]">
                  📷<br />Imagen
                </span>
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
            <input
              name="emoji"
              maxLength={2}
              defaultValue="🍬"
              aria-label="Emoji por defecto"
              placeholder="🍬"
              className="h-20 w-14 rounded-xl border border-gray-300 text-center text-2xl outline-none focus:ring-2 focus:ring-[#f06292]"
            />
          </div>

          {/* Fields */}
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
            <input
              name="name"
              required
              placeholder="Nombre del producto"
              className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#f06292] sm:col-span-3"
            />
            <input
              name="price"
              type="number"
              step="0.01"
              required
              placeholder="Precio"
              className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#f06292]"
            />
            <input
              name="stock"
              type="number"
              required
              placeholder="Stock"
              className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#f06292]"
            />
            <SubmitButton
              pendingText="Agregando…"
              className="rounded-lg bg-[#8e44ad] px-3 py-2 font-semibold text-white transition hover:bg-[#7d3c9d] disabled:opacity-50"
            >
              + Agregar
            </SubmitButton>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          La imagen es opcional. Si no subes una, se usa el emoji como imagen por defecto.
        </p>
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="p-4 font-semibold">Producto</th>
                <th className="p-4 font-semibold">Precio</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold">Rotación</th>
                <th className="p-4 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const tag = velocityTag(p.velocity)
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
                    <td className="p-4 font-bold text-[#4dd0e1]">${p.price}</td>
                    <td className="p-4">
                      <form action={updateStock} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          name="stock"
                          type="number"
                          aria-label={`Stock de ${p.name}`}
                          defaultValue={p.stock}
                          className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-center"
                        />
                        <SubmitButton
                          pendingText="…"
                          className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                        >
                          Guardar
                        </SubmitButton>
                      </form>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${tag.cls}`}>
                        {tag.label}
                      </span>
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
                  <td colSpan={5} className="p-10 text-center text-gray-400">
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
          💡 <strong>Tip Chuchu:</strong> Los productos 🐢 lentos se combinan automáticamente con los
          🚀 rápidos en la pestaña <strong>Sugerencias IA</strong> para moverlos más rápido.
        </p>
      </div>
    </div>
  )
}
