import { createClient } from 'npm:@supabase/supabase-js@2'

export function serviceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

export async function getOrderEmailPayload(orderId: string) {
  const s = serviceClient()
  const { data: order, error } = await s
    .from('orders')
    .select('id,user_id,total_toman,status,admin_note,profiles:user_id(full_name,email),order_items(product_name_snapshot)')
    .eq('id', orderId)
    .single()
  if (error) throw error
  const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles
  return {
    to: profile?.email || '',
    fullName: profile?.full_name || null,
    orderId: order.id,
    products: (order.order_items || []).map((x: any) => x.product_name_snapshot).filter(Boolean),
    amountToman: Number(order.total_toman || 0),
    note: order.admin_note || null,
  }
}
