export type Role = 'owner' | 'admin'

export type Plan = 'basic' | 'pro'
export type PaymentMethod = 'binance' | 'pagomovil' | 'transferencia'
export type PaymentStatus = 'pending' | 'validated' | 'rejected'

export interface Payment {
  id: string
  plan: Plan
  amount_usd: number
  amount_bs: number | null
  dolar_rate: number | null
  method: PaymentMethod
  reference: string | null
  proof_url: string | null
  buyer_name: string | null
  buyer_email: string | null
  buyer_phone: string | null
  status: PaymentStatus
  created_at: string
}

export interface Company {
  id: string
  name: string
  slug: string
  logo_url: string | null
  active: boolean
  created_at: string
}

export interface Profile {
  id: string
  email: string | null
  role: Role
  company_id: string | null
  created_at: string
}

export interface Product {
  id: string
  company_id: string
  name: string
  price: number
  stock: number
  emoji: string | null
  image_url: string | null
  created_at: string
}

export interface ComboItem {
  combo_id: string
  product_id: string
}

export interface Combo {
  id: string
  company_id: string
  name: string
  description: string | null
  price_offer: number
  original_price: number
  on_tv: boolean
  created_at: string
  combo_items?: { product_id: string }[]
  products?: Product[]
}

export interface Sale {
  id: string
  company_id: string
  product_id: string | null
  combo_id: string | null
  qty: number
  unit_price: number
  sold_at: string
}

export interface ProductWithVelocity extends Product {
  velocity: number
}

export interface ComboView {
  id: string
  name: string
  price_offer: number
  original_price: number
  on_tv: boolean
  productIds: string[]
  productNames: string[]
}

export interface AdminStats {
  ventasHoy: number
  ventasSemana: number
  combosVendidos: number
  efectoChuchu: number
  ventasRegulares: number
}

// Output of the inventory-rotation algorithm
export interface ComboSuggestion {
  fast: Product
  slow: Product
  originalPrice: number
  suggestedPrice: number
  discountPct: number
  reason: string
}
