'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/owner', label: 'Empresas', icon: '🏪' },
  { href: '/owner/pagos', label: 'Pagos', icon: '💳' },
]

export default function OwnerNav() {
  const pathname = usePathname()
  return (
    <nav className="flex gap-2 md:flex-col">
      {LINKS.map((l) => {
        const active = pathname === l.href
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              active
                ? 'bg-[#8e44ad] text-white shadow-lg shadow-[#8e44ad]/30'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{l.icon}</span>
            <span>{l.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
