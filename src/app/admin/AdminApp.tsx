'use client'

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import VentasCombos from './components/VentasCombos'
import Inventario from './components/Inventario'
import Sugerencias from './components/Sugerencias'
import Reportes from './components/Reportes'
import Ajustes from './components/Ajustes'
import type {
  AdminStats,
  Category,
  Company,
  ComboSuggestion,
  ComboView,
  ProductWithVelocity,
} from '@/lib/types'
import type { Rates } from '@/lib/rates'

gsap.registerPlugin(useGSAP)

export type Tab = 'ventas' | 'inventario' | 'sugerencias' | 'reportes' | 'ajustes'

interface Props {
  company: Company
  products: ProductWithVelocity[]
  combos: ComboView[]
  categories: Category[]
  suggestions: ComboSuggestion[]
  rates: Rates
  stats: AdminStats
}

export default function AdminApp({
  company,
  products,
  combos,
  categories,
  suggestions,
  rates,
  stats,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('ventas')
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        '.tab-content',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      )
    },
    { scope: contentRef, dependencies: [activeTab] }
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'ventas':
        return <VentasCombos products={products} combos={combos} />
      case 'inventario':
        return (
          <Inventario
            products={products}
            company={company}
            rates={rates}
            categories={categories}
          />
        )
      case 'sugerencias':
        return <Sugerencias suggestions={suggestions} />
      case 'reportes':
        return <Reportes stats={stats} suggestions={suggestions.length} />
      case 'ajustes':
        return <Ajustes company={company} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        company={company}
        suggestionCount={suggestions.length}
      />

      <div className="md:ml-[280px]">
        <div ref={contentRef} className="p-4 pb-28 md:p-6 md:pb-6">
          <div className="tab-content">{renderContent()}</div>
        </div>
      </div>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        suggestionCount={suggestions.length}
      />
    </div>
  )
}
