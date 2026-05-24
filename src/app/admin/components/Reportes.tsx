'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { AdminStats } from '@/lib/types'

gsap.registerPlugin(useGSAP)

interface Props {
  stats: AdminStats
  suggestions: number
}

export default function Reportes({ stats, suggestions }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const total = stats.ventasSemana || 1
  const comboPct = Math.round((stats.efectoChuchu / total) * 100)
  const regularPct = 100 - comboPct

  useGSAP(
    () => {
      gsap.from('.rep-card', { y: 20, opacity: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' })

      // count-up money values
      gsap.utils.toArray<HTMLElement>('.count').forEach((el) => {
        const end = Number(el.dataset.value || 0)
        const obj = { v: 0 }
        gsap.to(obj, {
          v: end,
          duration: 1,
          ease: 'power1.out',
          onUpdate: () => {
            el.textContent = `$${obj.v.toLocaleString('es-AR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          },
        })
      })

      gsap.from('.bar-fill', {
        scaleX: 0,
        transformOrigin: 'left',
        duration: 0.9,
        ease: 'power2.out',
        delay: 0.3,
      })
    },
    { scope: root }
  )

  return (
    <div ref={root} className="mx-auto max-w-7xl">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">📊 Reportes</h1>
      <p className="mb-6 text-gray-500">Rendimiento y efecto Chuchu (últimos 7 días).</p>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rep-card rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">💰 Ventas hoy</p>
          <p className="count text-3xl font-bold text-gray-800" data-value={stats.ventasHoy}>
            $0.00
          </p>
        </div>
        <div className="rep-card rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">📈 Ventas semana</p>
          <p className="count text-3xl font-bold text-gray-800" data-value={stats.ventasSemana}>
            $0.00
          </p>
        </div>
        <div className="rep-card rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">🍱 Combos vendidos</p>
          <p className="text-3xl font-bold text-gray-800">{stats.combosVendidos}</p>
          <p className="mt-1 text-xs text-gray-400">{suggestions} sugerencias pendientes</p>
        </div>
        <div className="rep-card rounded-xl bg-gradient-to-r from-[#f06292] to-[#8e44ad] p-6 shadow-lg">
          <p className="text-sm text-white/80">✨ Efecto Chuchu</p>
          <p className="count text-3xl font-bold text-[#fff176]" data-value={stats.efectoChuchu}>
            $0.00
          </p>
          <p className="mt-1 text-xs text-white/60">Ventas generadas por combos</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 font-bold text-gray-800">Impacto de combos en ventas</h3>
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Ventas regulares</span>
              <span>${stats.ventasRegulares.toFixed(2)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="bar-fill h-2 rounded-full bg-gray-400" style={{ width: `${regularPct}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-[#f06292]">✨ Ventas por combos (Efecto Chuchu)</span>
              <span className="font-bold text-[#f06292]">${stats.efectoChuchu.toFixed(2)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="bar-fill h-2 rounded-full bg-[#f06292]" style={{ width: `${comboPct}%` }} />
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-lg bg-[#fff176]/20 p-4">
          <p className="text-sm text-gray-700">
            🎯 <strong>Conclusión:</strong> Los combos generaron un{' '}
            <strong className="text-[#f06292]">{comboPct}%</strong> de los ingresos de la semana.
          </p>
        </div>
      </div>
    </div>
  )
}
