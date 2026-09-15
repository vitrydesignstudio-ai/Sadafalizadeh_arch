import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/cors.ts'
import { getOrderEmailPayload } from '../_shared/order.ts'
import { sendPurchaseEmail } from '../_shared/email.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405)

  try {
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'AUTH_REQUIRED' }, 401)
    const body = await req.json().catch(() => ({}))
    const orderId = String(body.order_id || '')
    const action = String(body.action || '')
    const note = body.note ? String(body.note) : null
    if (!orderId || !['approve', 'reject'].includes(action)) return json({ error: 'INVALID_REQUEST' }, 400)

    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })
    const { data: userData } = await userClient.auth.getUser()
    if (!userData.user) return json({ error: 'AUTH_REQUIRED' }, 401)
    const { data: profile } = await userClient.from('profiles').select('role').eq('id', userData.user.id).single()
    if (profile?.role !== 'admin') return json({ error: 'ADMIN_REQUIRED' }, 403)

    const rpc = action === 'approve' ? 'admin_approve_order' : 'admin_reject_order'
    const { error } = await userClient.rpc(rpc, { p_order_id: orderId, p_admin_note: note })
    if (error) throw error

    try {
      const mail = await getOrderEmailPayload(orderId)
      await sendPurchaseEmail({
        ...mail,
        status: action === 'approve' ? 'paid' : 'rejected',
        note,
        siteUrl: Deno.env.get('SITE_URL') || '',
      })
    } catch (mailError) {
      console.error('Order email failed', mailError)
    }

    return json({ ok: true })
  } catch (error) {
    console.error(error)
    return json({ error: error?.message || String(error) }, 500)
  }
})
