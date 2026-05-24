// Venezuelan parallel USD rate (Bs per USD). Cached 10 min.
export async function getDolarParalelo(): Promise<number> {
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/paralelo', {
      next: { revalidate: 600 },
    })
    if (!res.ok) return 0
    const data = await res.json()
    return Number(data?.promedio) || 0
  } catch {
    return 0
  }
}

export function usdToBs(usd: number, rate: number): number {
  return Math.round(usd * rate * 100) / 100
}
