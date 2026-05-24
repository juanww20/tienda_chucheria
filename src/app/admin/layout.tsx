import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chuchu · Panel',
  description: 'Gestión de ventas y combos para tu negocio',
}

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-[#f8f9fa] text-gray-800">{children}</div>
}
