import 'server-only'

interface PaymentNotice {
  bytes: ArrayBuffer
  filename: string
  mimeType: string
  caption: string
}

export async function sendPaymentTelegram(notice: PaymentNotice): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return false

  try {
    const form = new FormData()
    form.append('chat_id', chatId)
    form.append('caption', notice.caption)
    form.append('parse_mode', 'HTML')
    form.append(
      'photo',
      new Blob([notice.bytes], { type: notice.mimeType }),
      notice.filename
    )

    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      body: form,
    })
    return res.ok
  } catch {
    return false
  }
}
