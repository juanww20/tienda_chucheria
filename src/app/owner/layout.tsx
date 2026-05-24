import type { Metadata } from 'next'
import Image from 'next/image'
import { logout } from '@/app/login/actions'
import OwnerNav from './OwnerNav'

export const metadata: Metadata = {
  title: 'Chuchu · Owner',
  description: 'Consola del propietario',
}

export default function OwnerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[#f4f1f8] text-gray-800">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white/90 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9">
            <Image src="/Logo/Chuchu_logo.png" alt="Chuchu" fill sizes="36px" className="object-contain" />
          </div>
          <div>
            <p className="text-lg font-black uppercase leading-none tracking-tighter text-[#8e44ad]">
              Chuchu <span className="text-[#d81b60]">Owner</span>
            </p>
            <p className="text-[11px] font-medium text-gray-400">Consola del propietario</p>
          </div>
        </div>
        <form action={logout}>
          <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100">
            Salir
          </button>
        </form>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 md:flex-row">
        <aside className="md:w-56 md:shrink-0">
          <div className="md:sticky md:top-20">
            <OwnerNav />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
