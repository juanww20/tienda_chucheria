import { notFound } from 'next/navigation'
import { getDolarParalelo } from '@/lib/dolar'
import { PLANS } from '@/lib/plans'
import type { Plan } from '@/lib/types'
import Checkout from './Checkout'

export const dynamic = 'force-dynamic'

export default async function PagarPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { plan } = await searchParams
  const selected = (plan === 'pro' ? 'pro' : 'basic') as Plan
  if (!PLANS[selected] || PLANS[selected].comingSoon) {
    // Pro is not purchasable yet
    if (selected === 'pro') notFound()
  }

  const rate = await getDolarParalelo()
  return <Checkout plan={selected} rate={rate} />
}
