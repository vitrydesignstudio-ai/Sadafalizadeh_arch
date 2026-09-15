import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/cors.ts'
import { serviceClient } from '../_shared/order.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405)

  try {
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'AUTH_REQUIRED' }, 401)

    const body = await req.json().catch(() => ({}))
    const productId = String(body.product_id || '')
    if (!productId) return json({ error: 'PRODUCT_REQUIRED' }, 400)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })

    const { data: authData, error: authError } = await userClient.auth.getUser()
    if (authError || !authData.user) return json({ error: 'AUTH_REQUIRED' }, 401)

    const { data: orderId, error: orderError } = await userClient.rpc('create_gateway_order', { p_product_id: productId })
    if (orderError) throw orderError

    const service = serviceClient()
    const { data: order, error: readError } = await service
      .from('orders')
      .select('id,total_toman,user_id,order_items(product_name_snapshot),profiles:user_id(email,mobile)')
      .eq('id', orderId)
      .single()
    if (readError) throw readError
    if (order.user_id !== authData.user.id) return json({ error: 'FORBIDDEN' }, 403)

    const merchantId = Deno.env.get('ZARINPAL_MERCHANT_ID') || ''
    if (!merchantId) return json({ error: 'GATEWAY_NOT_CONFIGURED' }, 503)

    const siteUrl = (Deno.env.get('SITE_URL') || '').replace(/\/$/, '')
    if (!siteUrl) return json({ error: 'SITE_URL_NOT_CONFIGURED' }, 503)

    const multiplier = Number(Deno.env.get('ZARINPAL_AMOUNT_MULTIPLIER') || '10')
    const gatewayAmount = Math.round(Number(order.total_toman || 0) * multiplier)
    const callbackUrl = `${siteUrl}/?payment_callback=1&provider=zarinpal`
    const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles
    const description = `Sadaf Tools - Order ${order.id}`

    const response = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: gatewayAmount,
        callback_url: callbackUrl,
        description,
        metadata: {
          email: profile?.email || undefined,
          mobile: profile?.mobile || undefined,
        },
      }),
    })
    const payload = await response.json().catch(() => ({}))
    const authority = payload?.data?.authority
    const code = payload?.data?.code
    if (!response.ok || code !== 100 || !authority) {
      return json({ error: 'GATEWAY_REQUEST_FAILED', details: payload }, 502)
    }

    const { error: attemptError } = await service.from('payment_attempts').insert({
      order_id: order.id,
      provider: 'zarinpal',
      authority,
      amount_toman: Number(order.total_toman || 0),
      amount_gateway: gatewayAmount,
      status: 'requested',
      raw_response: payload,
    })
    if (attemptError) throw attemptError

    return json({
      order_id: order.id,
      authority,
      redirect_url: `https://www.zarinpal.com/pg/StartPay/${authority}`,
    })
  } catch (error) {
    console.error(error)
    return json({ error: error?.message || String(error) }, 500)
  }
})
