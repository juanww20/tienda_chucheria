import 'server-only'

// Small, fast vision model — validates an uploaded image is a payment proof.
const MODEL = 'gemini-2.0-flash'

export async function isPaymentProof(
  base64: string,
  mimeType: string
): Promise<{ ok: boolean; reason: string }> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return { ok: true, reason: 'sin-validacion' } // fail open if unconfigured

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`

  const prompt =
    'Eres un validador estricto de comprobantes de pago (Binance, pago móvil, ' +
    'transferencia bancaria, capturas de banca en línea). Analiza la imagen y ' +
    'responde SOLO un JSON válido, sin texto extra, con la forma ' +
    '{"is_payment": boolean, "reason": "string corto"}. ' +
    'is_payment=true solo si claramente es un comprobante/recibo/captura de un pago o transferencia. ' +
    'Si es un selfie, meme, paisaje, captura no relacionada o ilegible, is_payment=false.'

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64 } },
            ],
          },
        ],
        generationConfig: { temperature: 0, responseMimeType: 'application/json' },
      }),
    })

    if (!res.ok) return { ok: true, reason: 'validador-no-disponible' } // fail open
    const data = await res.json()
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{"is_payment":true}'
    const parsed = JSON.parse(text)
    return {
      ok: parsed.is_payment === true,
      reason: String(parsed.reason ?? ''),
    }
  } catch {
    return { ok: true, reason: 'error-validador' } // fail open on network error
  }
}
