export type PurchaseEmailPayload = {
  to: string
  fullName?: string | null
  orderId: string
  products: string[]
  amountToman: number
  status: 'paid' | 'rejected'
  note?: string | null
  siteUrl: string
}

const faMoney = (n: number) => new Intl.NumberFormat('fa-IR').format(n) + ' تومان'

export async function sendPurchaseEmail(payload: PurchaseEmailPayload) {
  const apiKey = Deno.env.get('RESEND_API_KEY') || ''
  const from = Deno.env.get('EMAIL_FROM') || ''
  if (!apiKey || !from || !payload.to) return { skipped: true }

  const paid = payload.status === 'paid'
  const title = paid ? 'خرید شما تأیید شد' : 'وضعیت سفارش شما به‌روزرسانی شد'
  const action = paid
    ? `<a href="${payload.siteUrl}" style="display:inline-block;padding:12px 18px;background:#1769ff;color:#fff;text-decoration:none;border-radius:8px">ورود به حساب و دانلود</a>`
    : ''
  const note = payload.note ? `<p style="color:#555">یادداشت: ${escapeHtml(payload.note)}</p>` : ''

  const html = `<!doctype html><html dir="rtl" lang="fa"><body style="margin:0;background:#f6f7f9;font-family:Tahoma,Arial,sans-serif;color:#15171a"><div style="max-width:620px;margin:0 auto;padding:32px 16px"><div style="background:white;border:1px solid #e7e9ed;border-radius:14px;padding:28px"><div style="font-size:12px;letter-spacing:2px;color:#1769ff;margin-bottom:12px">SADAF ALIZADEH / TOOLS</div><h2 style="margin:0 0 16px">${title}</h2><p>${escapeHtml(payload.fullName || 'کاربر عزیز')}،</p><p>${paid ? 'پرداخت شما تأیید شد و محصول داخل بخش «دانلودهای من» حساب کاربری‌تان فعال شده است.' : 'سفارش شما بررسی شد. برای جزئیات بیشتر وارد حساب کاربری شوید.'}</p><div style="background:#f8f9fb;border-radius:10px;padding:16px;margin:18px 0"><div>شماره سفارش: <b dir="ltr">${escapeHtml(payload.orderId)}</b></div><div style="margin-top:8px">محصول: <b>${payload.products.map(escapeHtml).join('، ')}</b></div><div style="margin-top:8px">مبلغ: <b>${faMoney(payload.amountToman)}</b></div></div>${note}${action}<p style="font-size:12px;color:#7a7f87;margin-top:24px">فایل اصلی به ایمیل ضمیمه نمی‌شود؛ همیشه آخرین نسخه را از حساب خود دانلود کنید.</p></div></div></body></html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from, to: [payload.to], subject: title, html }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`EMAIL_FAILED: ${JSON.stringify(data)}`)
  return data
}

function escapeHtml(value: string) {
  return String(value ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] || m))
}
