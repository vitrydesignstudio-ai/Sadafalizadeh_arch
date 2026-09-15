import { corsHeaders, json } from '../_shared/cors.ts'
import { getOrderEmailPayload, serviceClient } from '../_shared/order.ts'
import { sendPurchaseEmail } from '../_shared/email.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405)

  try {
    const body = await req.json().catch(() => ({}))
    const authority = String(body.authority || body.Authority || '')
    const status = String(body.status || body.Status || '')
    if (!authority) return json({ error: 'AUTHORITY_REQUIRED' }, 400)

    const service = serviceClient()
    const { data: attempt, error: lookupError } = await service
      .from('payment_attempts')
      .select('*')
      .eq('authority', authority)
      .maybeSingle()
    if (lookupError) throw lookupError
    if (!attempt) return json({ error: 'PAYMENT_ATTEMPT_NOT_FOUND' }, 404)

    if (attempt.status === 'verified') {
      return json({ ok: true, already_verified: true, order_id: attempt.order_id, ref_id: attempt.ref_id })
    }

    if (status && status.toUpperCase() !== 'OK') {
      await service.from('payment_attempts').update({ status: 'cancelled', raw_response: { callback_status: status } }).eq('id', attempt.id)
      return json({ ok: false, cancelled: true, order_id: attempt.order_id }, 200)
    }

    const merchantId = Deno.env.get('ZARINPAL_MERCHANT_ID') || ''
    if (!merchantId) return json({ error: 'GATEWAY_NOT_CONFIGURED' }, 503)

    const response = await fetch('https://api.zarinpal.com/pg/v4/payment/verify.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: attempt.amount_gateway,
        authority,
      }),
    })
    const payload = await response.json().catch(() => ({}))
    const code = Number(payload?.data?.code)
    const verified = code === 100 || code === 101

    if (!response.ok || !verified) {
      await service.from('payment_attempts').update({ status: 'failed', raw_response: payload }).eq('id', attempt.id)
      return json({ ok: false, error: 'PAYMENT_NOT_VERIFIED', details: payload }, 400)
    }

    const refId = String(payload?.data?.ref_id || '')
    const { error: completeError } = await service.rpc('service_complete_gateway_order', {
      p_order_id: attempt.order_id,
      p_ref_id: refId,
      p_authority: authority,
    })
    if (completeError) throw completeError

    await service.from('payment_attempts').update({
      status: 'verified',
      ref_id: refId,
      raw_response: payload,
      verified_at: new Date().toISOString(),
    }).eq('id', attempt.id)

    try {
      const mail = await getOrderEmailPayload(attempt.order_id)
      await sendPurchaseEmail({
        ...mail,
        status: 'paid',
        siteUrl: Deno.env.get('SITE_URL') || '',
      })
    } catch (mailError) {
      console.error('Purchase email failed', mailError)
    }

    return json({ ok: true, order_id: attempt.order_id, ref_id: refId })
  } catch (error) {
    console.error(error)
    return json({ error: error?.message || String(error) }, 500)
  }
})
