import { getDolarParalelo } from '@/lib/dolar'
import Landing from './Landing'

export const revalidate = 600

export default async function Home() {
  const rate = await getDolarParalelo()
  return <Landing rate={rate} />
}
