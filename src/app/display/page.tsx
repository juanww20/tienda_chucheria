import Image from 'next/image'

export default function DisplayIndex() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-primary p-8 text-center">
      <div className="relative h-24 w-24">
        <Image src="/Logo/Chuchu_logo.png" alt="Chuchu" fill sizes="96px" className="animate-chuchu object-contain" priority />
      </div>
      <h1 className="titulo-combo text-5xl">Chuchu Smart Menu</h1>
      <p className="max-w-md text-lg text-white/80">
        Esta es la pantalla genérica. Cada empresa tiene su propia URL de TV:
      </p>
      <code className="rounded-lg bg-white/10 px-4 py-2 text-cuaternary">/display/&lt;empresa&gt;</code>
      <p className="text-sm text-white/50">
        Obtén tu enlace exacto en el panel de administración &rarr; Ajustes.
      </p>
    </div>
  )
}
