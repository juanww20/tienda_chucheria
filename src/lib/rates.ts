import type { RateMode } from './types'

export interface Rates {
  binance: number // Bs per USD (paralelo)
  bcv: number // Bs per USD (oficial)
  euroBs: number // Bs per EUR (oficial)
}

const ENDPOINTS = {
  binance: 'https://ve.dolarapi.com/v1/dolares/paralelo',
  bcv: 'https://ve.dolarapi.com/v1/dolares/oficial',
  euro: 'https://ve.dolarapi.com/v1/euros/oficial',
}

async function fetchRate(url: string): Promise<number> {
  try {
    const res = await fetch(url, { next: { revalidate: 600 } })
    if (!res.ok) return 0
    const data = await res.json()
    return Number(data?.promedio) || 0
  } catch {
    return 0
  }
}

export async function getRates(): Promise<Rates> {
  const [binance, bcv, euroBs] = await Promise.all([
    fetchRate(ENDPOINTS.binance),
    fetchRate(ENDPOINTS.bcv),
    fetchRate(ENDPOINTS.euro),
  ])
  return { binance, bcv, euroBs }
}

export interface ConvertedPrice {
  amount: number
  currency: 'Bs' | '€'
  rate: number
  label: string // e.g. "Binance", "BCV", "Euro", "Tasa propia"
}

export const RATE_LABEL: Record<RateMode, string> = {
  binance: 'Binance',
  bcv: 'BCV',
  euro: 'Euro',
  custom: 'Tasa propia',
}

// Convert a USD price into the chosen representation.
export function convertPrice(
  usd: number,
  mode: RateMode,
  customRate: number | null,
  rates: Rates
): ConvertedPrice {
  switch (mode) {
    case 'bcv':
      return { amount: usd * rates.bcv, currency: 'Bs', rate: rates.bcv, label: 'BCV' }
    case 'euro': {
      const eur = rates.euroBs > 0 ? (usd * rates.bcv) / rates.euroBs : 0
      return { amount: eur, currency: '€', rate: rates.euroBs, label: 'Euro' }
    }
    case 'custom': {
      const r = customRate || 0
      return { amount: usd * r, currency: 'Bs', rate: r, label: 'Tasa propia' }
    }
    case 'binance':
    default:
      return { amount: usd * rates.binance, currency: 'Bs', rate: rates.binance, label: 'Binance' }
  }
}

export function formatConverted(c: ConvertedPrice): string {
  const n = c.amount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return c.currency === '€' ? `€${n}` : `Bs ${n}`
}

// Resolve which mode/customRate to use: product override falls back to company.
export function resolveRate(
  productMode: RateMode | null,
  productCustom: number | null,
  companyMode: RateMode,
  companyCustom: number | null
): { mode: RateMode; custom: number | null } {
  if (productMode) return { mode: productMode, custom: productCustom }
  return { mode: companyMode, custom: companyCustom }
}
