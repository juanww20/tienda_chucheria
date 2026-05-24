import type { Plan, PaymentMethod } from './types'

export interface PlanInfo {
  id: Plan
  name: string
  priceUsd: number
  tagline: string
  features: string[]
  comingSoon: boolean
}

export const PLANS: Record<Plan, PlanInfo> = {
  basic: {
    id: 'basic',
    name: 'Básico',
    priceUsd: 20,
    tagline: 'Tu menú digital, inventario y combos en la nube.',
    features: [
      'Menú digital para TV (pantalla por sucursal)',
      'Inventario con control de stock',
      'Combos ilimitados con precio oferta',
      'Sugerencias IA para mover inventario lento',
      'Reportes de ventas y efecto combos',
      'Co-branding Chuchu | tu marca',
    ],
    comingSoon: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro IA',
    priceUsd: 100,
    tagline: 'Todo lo de Básico + IA conversacional que vende por ti.',
    features: [
      'Todo lo del plan Básico',
      'IA conversacional que automatiza ventas',
      'Atiende y cierra pedidos 24/7',
      'Recomendaciones de combos en el chat',
      'Seguimiento automático de clientes',
    ],
    comingSoon: true,
  },
}

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  binance: 'Binance (USDT)',
  pagomovil: 'Pago Móvil',
  transferencia: 'Transferencia',
}

export const ACCOUNTS = {
  binance: {
    email: 'juan.vargasr432@gmail.com',
    note: 'Pago 100% en USD / USDT.',
  },
  pagomovil: {
    phone: '0412-4507593',
    bank: 'Mercantil',
    ci: 'V-30.448.315',
  },
  transferencia: {
    bank: 'Mercantil, C.A — Banco Universal',
    rif: 'RIF J-00002961-0',
    holder: 'Juan Vargas',
    accountType: 'Cuenta Corriente',
    account: '01050121181121109675',
    ci: 'V-30.448.315',
  },
} as const
