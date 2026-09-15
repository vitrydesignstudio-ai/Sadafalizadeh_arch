-- SadafAlizadeh_arch v0.5
-- Commerce gateway attempts, license keys, stronger order flows.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'zarinpal',
  authority text not null unique,
  amount_toman bigint not null,
  amount_gateway bigint not null,
  status text not null default 'requested' check (status in ('requested','verified','failed','cancelled')),
  ref_id text,
  raw_response jsonb,
  created_at timestamptz not null default timezone('utc',now()),
  verified_at timestamptz
);

create index if not exists payment_attempts_order_idx on public.payment_attempts(order_id);

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  entitlement_id uuid references public.entitlements(id) on delete set null,
  license_key text not null unique,
  status text not null default 'active' check (status in ('active','revoked')),
  seats integer not null default 1 check (seats > 0),
  activations integer not null default 0 check (activations >= 0),
  created_at timestamptz not null default timezone('utc',now()),
  revoked_at timestamptz,
  unique(user_id, product_id)
);

alter table public.payment_attempts enable row level security;
alter table public.licenses enable row level security;

revoke all on public.payment_attempts from anon, authenticated;
grant select on public.payment_attempts to authenticated;
create policy payment_attempts_select_own_or_admin on public.payment_attempts
for select to authenticated
using (
  public.is_admin() or exists (
    select 1 from public.orders o
    where o.id=payment_attempts.order_id and o.user_id=(select auth.uid())
  )
);

revoke all on public.licenses from anon, authenticated;
grant select on public.licenses to authenticated;
create policy licenses_select_own_or_admin on public.licenses
for select to authenticated
using (user_id=(select auth.uid()) or public.is_admin());

create or replace function public.make_license_key()
returns text
language sql
volatile
security definer
set search_path=''
as $$
  select 'SA-' || upper(substr(encode(extensions.gen_random_bytes(16),'hex'),1,4)) || '-' ||
         upper(substr(encode(extensions.gen_random_bytes(16),'hex'),1,4)) || '-' ||
         upper(substr(encode(extensions.gen_random_bytes(16),'hex'),1,4)) || '-' ||
         upper(substr(encode(extensions.gen_random_bytes(16),'hex'),1,4));
$$;
revoke all on function public.make_license_key() from public, anon, authenticated;

create or replace function public.ensure_license_for_entitlement()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  v_requires boolean;
begin
  if new.active is not true then return new; end if;
  select p.requires_license into v_requires from public.products p where p.id=new.product_id;
  if coalesce(v_requires,false) then
    insert into public.licenses(user_id,product_id,entitlement_id,license_key,status)
    values(new.user_id,new.product_id,new.id,public.make_license_key(),'active')
    on conflict(user_id,product_id) do update
      set entitlement_id=excluded.entitlement_id,
          status='active',
          revoked_at=null;
  end if;
  return new;
end;
$$;

drop trigger if exists entitlement_license_trigger on public.entitlements;
create trigger entitlement_license_trigger
after insert or update of active on public.entitlements
for each row execute function public.ensure_license_for_entitlement();

create or replace function public.list_my_licenses()
returns table(
  license_id uuid,
  product_id uuid,
  product_name text,
  software_category text,
  license_key text,
  status text,
  seats integer,
  activations integer,
  created_at timestamptz
)
language sql
stable
security definer
set search_path=''
as $$
  select l.id,p.id,p.name,p.software_category,l.license_key,l.status,l.seats,l.activations,l.created_at
  from public.licenses l
  join public.products p on p.id=l.product_id
  where l.user_id=(select auth.uid())
  order by l.created_at desc;
$$;
grant execute on function public.list_my_licenses() to authenticated;

create or replace function public.admin_issue_license(p_user_id uuid,p_product_id uuid)
returns text
language plpgsql
security definer
set search_path=''
as $$
declare
  v_ent uuid;
  v_key text;
begin
  if not public.is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  select e.id into v_ent from public.entitlements e
  where e.user_id=p_user_id and e.product_id=p_product_id and e.active
  limit 1;
  if v_ent is null then raise exception 'ENTITLEMENT_REQUIRED'; end if;
  insert into public.licenses(user_id,product_id,entitlement_id,license_key,status)
  values(p_user_id,p_product_id,v_ent,public.make_license_key(),'active')
  on conflict(user_id,product_id) do update set status='active',revoked_at=null
  returning license_key into v_key;
  return v_key;
end;
$$;
grant execute on function public.admin_issue_license(uuid,uuid) to authenticated;

create or replace function public.admin_revoke_license(p_license_id uuid)
returns void
language plpgsql
security definer
set search_path=''
as $$
begin
  if not public.is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  update public.licenses set status='revoked',revoked_at=timezone('utc',now()) where id=p_license_id;
end;
$$;
grant execute on function public.admin_revoke_license(uuid) to authenticated;

-- Prevent a card-to-card order from accidentally reusing a gateway pending order.
create or replace function public.create_card_order(p_product_id uuid)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid := auth.uid();
  v_product public.products%rowtype;
  v_order uuid;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_product from public.products p where p.id=p_product_id and p.status in ('published','beta');
  if not found then raise exception 'PRODUCT_NOT_AVAILABLE'; end if;
  if v_product.is_free or v_product.price_toman <= 0 then raise exception 'USE_FREE_CLAIM'; end if;
  if exists(select 1 from public.entitlements e where e.user_id=v_uid and e.product_id=p_product_id and e.active) then raise exception 'ALREADY_OWNED'; end if;

  select o.id into v_order
  from public.orders o join public.order_items oi on oi.order_id=o.id
  where o.user_id=v_uid and o.status='pending' and o.payment_method='card_to_card' and oi.product_id=p_product_id
  order by o.created_at desc limit 1;
  if v_order is not null then return v_order; end if;

  insert into public.orders(user_id,status,payment_method,subtotal_toman,total_toman)
  values(v_uid,'pending','card_to_card',v_product.price_toman,v_product.price_toman)
  returning id into v_order;
  insert into public.order_items(order_id,product_id,product_name_snapshot,unit_price_toman,product_version)
  values(v_order,p_product_id,v_product.name,v_product.price_toman,v_product.current_version);
  return v_order;
end;
$$;
grant execute on function public.create_card_order(uuid) to authenticated;

create or replace function public.create_gateway_order(p_product_id uuid)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid := auth.uid();
  v_product public.products%rowtype;
  v_order uuid;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_product from public.products p where p.id=p_product_id and p.status in ('published','beta');
  if not found then raise exception 'PRODUCT_NOT_AVAILABLE'; end if;
  if v_product.is_free or v_product.price_toman <= 0 then raise exception 'USE_FREE_CLAIM'; end if;
  if exists(select 1 from public.entitlements e where e.user_id=v_uid and e.product_id=p_product_id and e.active) then raise exception 'ALREADY_OWNED'; end if;

  select o.id into v_order
  from public.orders o join public.order_items oi on oi.order_id=o.id
  where o.user_id=v_uid and o.status='pending' and o.payment_method='gateway' and oi.product_id=p_product_id
  order by o.created_at desc limit 1;
  if v_order is not null then return v_order; end if;

  insert into public.orders(user_id,status,payment_method,subtotal_toman,total_toman)
  values(v_uid,'pending','gateway',v_product.price_toman,v_product.price_toman)
  returning id into v_order;
  insert into public.order_items(order_id,product_id,product_name_snapshot,unit_price_toman,product_version)
  values(v_order,p_product_id,v_product.name,v_product.price_toman,v_product.current_version);
  return v_order;
end;
$$;
grant execute on function public.create_gateway_order(uuid) to authenticated;

-- Only service_role may mark an online payment complete.
create or replace function public.service_complete_gateway_order(
  p_order_id uuid,
  p_ref_id text,
  p_authority text
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare r record;
begin
  if coalesce(auth.role(),'') <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
  if exists(select 1 from public.orders where id=p_order_id and status='paid') then return; end if;
  update public.orders
  set status='paid',paid_at=timezone('utc',now()),transaction_reference=p_ref_id
  where id=p_order_id and status='pending' and payment_method='gateway';
  if not found then raise exception 'ORDER_NOT_PENDING'; end if;

  for r in select o.user_id,oi.product_id from public.orders o join public.order_items oi on oi.order_id=o.id where o.id=p_order_id
  loop
    insert into public.entitlements(user_id,product_id,order_id,source,active)
    values(r.user_id,r.product_id,p_order_id,'purchase',true)
    on conflict(user_id,product_id) do update set active=true,order_id=excluded.order_id,source='purchase';
  end loop;
end;
$$;
revoke all on function public.service_complete_gateway_order(uuid,text,text) from public, anon, authenticated;
grant execute on function public.service_complete_gateway_order(uuid,text,text) to service_role;

-- If a product is switched to requires_license later, this admin helper backfills active owners.
create or replace function public.admin_backfill_product_licenses(p_product_id uuid)
returns integer
language plpgsql
security definer
set search_path=''
as $$
declare r record; v_count integer := 0;
begin
  if not public.is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  for r in select e.id,e.user_id from public.entitlements e where e.product_id=p_product_id and e.active
  loop
    insert into public.licenses(user_id,product_id,entitlement_id,license_key,status)
    values(r.user_id,p_product_id,r.id,public.make_license_key(),'active')
    on conflict(user_id,product_id) do nothing;
    if found then v_count:=v_count+1; end if;
  end loop;
  return v_count;
end;
$$;
grant execute on function public.admin_backfill_product_licenses(uuid) to authenticated;
