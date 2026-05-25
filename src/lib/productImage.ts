import 'server-only'

// Map a product name to a useful image search keyword.
function keywordFor(name: string): string {
  const n = name.toLowerCase()
  const map: [RegExp, string][] = [
    [/chocolate|savoy|toronto|samba|carr|crunch|galak|bon|cri|pirucream|pepito|susy/, 'chocolate,candy'],
    [/galleta|oreo|bilo|cookie/, 'cookies'],
    [/coco/, 'coconut,sweet'],
    [/pirul|chupa|paleta|lollipop/, 'lollipop,candy'],
    [/gomita|trululu|frunas|chicle|gummy/, 'gummy,candy'],
    [/dorito|papas|chips|platanit|cotufa|cheese tris|cheez/, 'chips,snack'],
    [/man[ií]|nuts/, 'peanuts,snack'],
    [/refresco|toddy|malt[ií]n|malta|jugo|soda|drink/, 'soda,drink'],
    [/agua|water/, 'water,bottle'],
    [/caf[eé]|coffee/, 'coffee'],
    [/tequeñ|empanada|cachito|pastelito|helado|cono/, 'food,snack'],
    [/halls|menta|mint/, 'mints,candy'],
    [/cereal|barra/, 'cereal,bar'],
  ]
  for (const [re, kw] of map) if (re.test(n)) return kw
  return 'candy,sweets,snack'
}

export interface FetchedImage {
  bytes: ArrayBuffer
  contentType: string
}

// Best-effort fetch of a themed real photo (LoremFlickr). Returns null on failure.
export async function fetchProductImage(
  name: string,
  seed?: number
): Promise<FetchedImage | null> {
  const kw = keywordFor(name)
  const lock = seed ?? Math.floor(Math.random() * 100000)
  const url = `https://loremflickr.com/512/512/${encodeURIComponent(kw)}?lock=${lock}`
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 12000)
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'follow' })
    clearTimeout(timer)
    if (!res.ok) return null
    const ct = res.headers.get('content-type') || 'image/jpeg'
    if (!ct.startsWith('image/')) return null
    const bytes = await res.arrayBuffer()
    if (bytes.byteLength < 800) return null
    return { bytes, contentType: ct }
  } catch {
    return null
  }
}
