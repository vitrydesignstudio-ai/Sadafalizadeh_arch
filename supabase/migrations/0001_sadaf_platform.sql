-- SadafAlizadeh_arch v0.4 — Supabase schema
-- Run once in Supabase SQL Editor on a new project.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  mobile text,
  avatar_url text,
  locale text not null default 'fa' check (locale in ('fa','en')),
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index profiles_email_ci_unique on public.profiles (lower(email)) where email is not null;
create unique index profiles_mobile_unique on public.profiles (mobile) where mobile is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, mobile, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, nullif(new.raw_user_meta_data ->> 'contact_email','')),
    coalesce(new.phone, nullif(new.raw_user_meta_data ->> 'mobile','')),
    coalesce(nullif(new.raw_user_meta_data ->> 'locale',''), 'fa')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_fa text not null,
  title_en text,
  type text not null default 'Architecture',
  type_fa text,
  location_fa text,
  location_en text,
  year text,
  area text,
  meta_fa text,
  meta_en text,
  description_fa text,
  description_en text,
  cover_image_url text,
  gallery jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  sort_order integer not null default 100,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_fa text not null,
  title_en text,
  subtitle_fa text,
  subtitle_en text,
  category text not null default 'Architecture',
  duration text,
  cover_image_url text,
  body_fa text,
  body_en text,
  external_url text,
  sort_order integer not null default 100,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create trigger lessons_updated_at before update on public.lessons for each row execute function public.set_updated_at();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  software_category text not null default 'Other',
  product_type text not null default 'script' check (product_type in ('script','plugin','preset','template','course_asset','other')),
  description_fa text,
  description_en text,
  features_fa jsonb not null default '[]'::jsonb,
  features_en jsonb not null default '[]'::jsonb,
  cover_image_url text,
  is_free boolean not null default false,
  price_toman bigint not null default 0 check (price_toman >= 0),
  status text not null default 'draft' check (status in ('draft','published','beta','coming_soon','archived')),
  current_version text,
  requires_license boolean not null default false,
  sort_order integer not null default 100,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();

create table public.product_versions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  version text not null,
  file_path text not null,
  changelog_fa text,
  changelog_en text,
  is_current boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  unique (product_id, version)
);
create unique index product_versions_one_current on public.product_versions(product_id) where is_current;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','paid','rejected','cancelled','refunded')),
  payment_method text not null check (payment_method in ('card_to_card','gateway','free','admin_grant')),
  subtotal_toman bigint not null default 0,
  total_toman bigint not null default 0,
  transaction_reference text,
  receipt_path text,
  user_note text,
  admin_note text,
  paid_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name_snapshot text not null default '',
  unit_price_toman bigint not null default 0,
  product_version text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (order_id, product_id)
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  source text not null check (source in ('purchase','free','admin_grant')),
  active boolean not null default true,
  updates_until timestamptz,
  granted_at timestamptz not null default timezone('utc', now()),
  unique (user_id, product_id)
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  public_read boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Public-safe settings only. Never store API secrets here.
insert into public.site_settings(key,value,public_read) values
  ('bank_card', '{"number":"","owner":"صدف علیزاده"}'::jsonb, true),
  ('contact', '{"instagram":"sadafalizadeh_arch","email":""}'::jsonb, true)
on conflict (key) do nothing;

-- ---------- Privileges + RLS ----------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.lessons enable row level security;
alter table public.products enable row level security;
alter table public.product_versions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.entitlements enable row level security;
alter table public.site_settings enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name,email,mobile,avatar_url,locale) on public.profiles to authenticated;

create policy profiles_select_self_or_admin on public.profiles
for select to authenticated
using ((select auth.uid()) = id or public.is_admin());
create policy profiles_update_self on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke all on public.projects from anon, authenticated;
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
create policy projects_public_read on public.projects
for select to anon, authenticated
using (status = 'published' or public.is_admin());
create policy projects_admin_insert on public.projects for insert to authenticated with check (public.is_admin());
create policy projects_admin_update on public.projects for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy projects_admin_delete on public.projects for delete to authenticated using (public.is_admin());

revoke all on public.lessons from anon, authenticated;
grant select on public.lessons to anon, authenticated;
grant insert, update, delete on public.lessons to authenticated;
create policy lessons_public_read on public.lessons for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy lessons_admin_insert on public.lessons for insert to authenticated with check (public.is_admin());
create policy lessons_admin_update on public.lessons for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy lessons_admin_delete on public.lessons for delete to authenticated using (public.is_admin());

revoke all on public.products from anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
create policy products_public_read on public.products for select to anon, authenticated using (status in ('published','beta','coming_soon') or public.is_admin());
create policy products_admin_insert on public.products for insert to authenticated with check (public.is_admin());
create policy products_admin_update on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy products_admin_delete on public.products for delete to authenticated using (public.is_admin());

revoke all on public.product_versions from anon, authenticated;
grant select, insert, update, delete on public.product_versions to authenticated;
create policy product_versions_entitled_or_admin_select on public.product_versions
for select to authenticated
using (
  public.is_admin() or exists (
    select 1 from public.entitlements e
    where e.user_id=(select auth.uid()) and e.product_id=product_versions.product_id and e.active
  )
);
create policy product_versions_admin_insert on public.product_versions for insert to authenticated with check (public.is_admin());
create policy product_versions_admin_update on public.product_versions for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy product_versions_admin_delete on public.product_versions for delete to authenticated using (public.is_admin());

revoke all on public.orders from anon, authenticated;
grant select on public.orders to authenticated;
grant update (transaction_reference,receipt_path,user_note) on public.orders to authenticated;
create policy orders_select_own_or_admin on public.orders for select to authenticated using (user_id=(select auth.uid()) or public.is_admin());
create policy orders_user_update_pending on public.orders for update to authenticated
using (user_id=(select auth.uid()) and status='pending')
with check (user_id=(select auth.uid()) and status='pending');

revoke all on public.order_items from anon, authenticated;
grant select on public.order_items to authenticated;
create policy order_items_select_own_or_admin on public.order_items for select to authenticated
using (
  public.is_admin() or exists (
    select 1 from public.orders o where o.id=order_items.order_id and o.user_id=(select auth.uid())
  )
);

revoke all on public.entitlements from anon, authenticated;
grant select on public.entitlements to authenticated;
create policy entitlements_select_own_or_admin on public.entitlements for select to authenticated using (user_id=(select auth.uid()) or public.is_admin());

revoke all on public.site_settings from anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
create policy settings_public_read on public.site_settings for select to anon, authenticated using (public_read or public.is_admin());
create policy settings_admin_insert on public.site_settings for insert to authenticated with check (public.is_admin());
create policy settings_admin_update on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy settings_admin_delete on public.site_settings for delete to authenticated using (public.is_admin());

-- ---------- Transaction-safe RPCs ----------
create or replace function public.claim_free_product(p_product_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_ent uuid;
  v_product public.products%rowtype;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_product from public.products p where p.id=p_product_id and p.status in ('published','beta');
  if not found then raise exception 'PRODUCT_NOT_AVAILABLE'; end if;
  if not v_product.is_free then raise exception 'PRODUCT_NOT_FREE'; end if;

  insert into public.entitlements(user_id,product_id,source,active)
  values(v_uid,p_product_id,'free',true)
  on conflict(user_id,product_id) do update set active=true
  returning id into v_ent;
  return v_ent;
end;
$$;
grant execute on function public.claim_free_product(uuid) to authenticated;

create or replace function public.create_card_order(p_product_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
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
  if exists(select 1 from public.entitlements e where e.user_id=v_uid and e.product_id=p_product_id and e.active) then
    raise exception 'ALREADY_OWNED';
  end if;

  select o.id into v_order
  from public.orders o join public.order_items oi on oi.order_id=o.id
  where o.user_id=v_uid and o.status='pending' and oi.product_id=p_product_id
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

create or replace function public.admin_approve_order(p_order_id uuid, p_admin_note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare r record;
begin
  if not public.is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  update public.orders
  set status='paid', paid_at=timezone('utc',now()), approved_by=auth.uid(), admin_note=p_admin_note
  where id=p_order_id and status='pending';
  if not found then raise exception 'ORDER_NOT_PENDING'; end if;

  for r in select o.user_id, oi.product_id from public.orders o join public.order_items oi on oi.order_id=o.id where o.id=p_order_id
  loop
    insert into public.entitlements(user_id,product_id,order_id,source,active)
    values(r.user_id,r.product_id,p_order_id,'purchase',true)
    on conflict(user_id,product_id) do update set active=true, order_id=excluded.order_id, source='purchase';
  end loop;
end;
$$;
grant execute on function public.admin_approve_order(uuid,text) to authenticated;

create or replace function public.admin_reject_order(p_order_id uuid, p_admin_note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  update public.orders set status='rejected', approved_by=auth.uid(), admin_note=p_admin_note
  where id=p_order_id and status='pending';
  if not found then raise exception 'ORDER_NOT_PENDING'; end if;
end;
$$;
grant execute on function public.admin_reject_order(uuid,text) to authenticated;

create or replace function public.admin_grant_product(p_user_id uuid, p_product_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_ent uuid;
begin
  if not public.is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  insert into public.entitlements(user_id,product_id,source,active)
  values(p_user_id,p_product_id,'admin_grant',true)
  on conflict(user_id,product_id) do update set active=true, source='admin_grant'
  returning id into v_ent;
  return v_ent;
end;
$$;
grant execute on function public.admin_grant_product(uuid,uuid) to authenticated;

create or replace function public.admin_register_product_version(
  p_product_id uuid,
  p_version text,
  p_file_path text,
  p_changelog_fa text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_id uuid;
begin
  if not public.is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  if nullif(trim(p_version),'') is null or nullif(trim(p_file_path),'') is null then raise exception 'VERSION_AND_FILE_REQUIRED'; end if;
  update public.product_versions set is_current=false where product_id=p_product_id and is_current=true;
  insert into public.product_versions(product_id,version,file_path,changelog_fa,is_current)
  values(p_product_id,trim(p_version),p_file_path,p_changelog_fa,true)
  on conflict(product_id,version) do update
    set file_path=excluded.file_path, changelog_fa=excluded.changelog_fa, is_current=true
  returning id into v_id;
  update public.products set current_version=trim(p_version) where id=p_product_id;
  return v_id;
end;
$$;
grant execute on function public.admin_register_product_version(uuid,text,text,text) to authenticated;

create or replace function public.list_my_downloads()
returns table(
  entitlement_id uuid,
  product_id uuid,
  product_name text,
  slug text,
  software_category text,
  current_version text,
  version_id uuid,
  file_path text,
  changelog_fa text,
  granted_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, p.id, p.name, p.slug, p.software_category, p.current_version,
         pv.id, pv.file_path, pv.changelog_fa, e.granted_at
  from public.entitlements e
  join public.products p on p.id=e.product_id
  left join public.product_versions pv on pv.product_id=p.id and pv.is_current
  where e.user_id=(select auth.uid()) and e.active
  order by e.granted_at desc;
$$;
grant execute on function public.list_my_downloads() to authenticated;

-- ---------- Storage ----------
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values
  ('site-media','site-media',true,52428800,null),
  ('product-files','product-files',false,524288000,null),
  ('payment-receipts','payment-receipts',false,20971520,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do nothing;

create policy site_media_public_read on storage.objects
for select to anon,authenticated
using (bucket_id='site-media');
create policy site_media_admin_insert on storage.objects
for insert to authenticated
with check (bucket_id='site-media' and public.is_admin());
create policy site_media_admin_update on storage.objects
for update to authenticated
using (bucket_id='site-media' and public.is_admin())
with check (bucket_id='site-media' and public.is_admin());
create policy site_media_admin_delete on storage.objects
for delete to authenticated
using (bucket_id='site-media' and public.is_admin());

create policy product_files_entitled_read on storage.objects
for select to authenticated
using (
  bucket_id='product-files' and (
    public.is_admin() or exists (
      select 1 from public.entitlements e
      where e.user_id=(select auth.uid()) and e.active
        and e.product_id::text = (storage.foldername(name))[1]
    )
  )
);
create policy product_files_admin_insert on storage.objects
for insert to authenticated
with check (bucket_id='product-files' and public.is_admin());
create policy product_files_admin_update on storage.objects
for update to authenticated
using (bucket_id='product-files' and public.is_admin())
with check (bucket_id='product-files' and public.is_admin());
create policy product_files_admin_delete on storage.objects
for delete to authenticated
using (bucket_id='product-files' and public.is_admin());

create policy receipts_user_insert on storage.objects
for insert to authenticated
with check (
  bucket_id='payment-receipts' and (storage.foldername(name))[1]=(select auth.uid())::text
);
create policy receipts_owner_or_admin_read on storage.objects
for select to authenticated
using (
  bucket_id='payment-receipts' and (
    (storage.foldername(name))[1]=(select auth.uid())::text or public.is_admin()
  )
);
create policy receipts_owner_delete_pending on storage.objects
for delete to authenticated
using (bucket_id='payment-receipts' and (storage.foldername(name))[1]=(select auth.uid())::text);

-- ---------- Initial content ----------
insert into public.projects(id,slug,title_fa,title_en,type,type_fa,location_fa,location_en,year,area,meta_fa,meta_en,description_fa,description_en,featured,sort_order,status)
values
('10000000-0000-0000-0000-000000000001','gilana-plaza','گیلانا پلازا','GILANA PLAZA','Architecture','معماری','رشت، گیلان','Rasht, Gilan','2026','7200 m²','تجاری · توریستی · گردشگری','Commercial · Tourism · Recreation','پروژه‌ای تجاری، توریستی و گردشگری با سازمان‌دهی چندلایه‌ی سایت و هویت معماری مشخص.','A mixed-use commercial, tourism and recreational project with layered site organization.',true,10,'published'),
('10000000-0000-0000-0000-000000000002','hamkhaneh','هم‌خانه','HAMKHANEH','Residential','مسکونی','چالوس، مازندران','Chalus, Mazandaran','2026','105 m²','مسکونی','Residential','خانه‌ای برای زندگی مشترک دو دوست با دو سلیقه‌ی فرمی متفاوت؛ منحنی و خطی.','A shared home shaped around two different formal preferences: curved and linear.',true,20,'published'),
('10000000-0000-0000-0000-000000000003','casa-luza','کازا لوزا','CASA LUZA','Residential','مسکونی','ماربیا، اسپانیا','Marbella, Spain','2026','290 m²','ویلا','Villa','پروژه‌ای مسکونی معاصر با تمرکز بر نور طبیعی و حال‌وهوای آرام مدیترانه‌ای.','A contemporary residential project focused on natural light and calm Mediterranean atmosphere.',true,30,'published')
on conflict(id) do nothing;

insert into public.lessons(id,slug,title_fa,title_en,subtitle_fa,subtitle_en,category,duration,sort_order,status)
values
('20000000-0000-0000-0000-000000000001','autocad-batch-plot','Batch Plot در AutoCAD','Batch Plot in AutoCAD','منطق فایل‌های تولیدی با ده‌ها شیت','How to think about multi-sheet production files','AutoCAD','12 min',10,'published'),
('20000000-0000-0000-0000-000000000002','ctb-dna','DNA فایل CTB و سلسله‌مراتب Lineweight','CTB DNA & Lineweight Hierarchy','ساخت سیستم خوانا برای نقشه‌های سیاه‌وسفید','Build a readable black-and-white drawing system','Standards','18 min',20,'published')
on conflict(id) do nothing;

insert into public.products(id,slug,name,software_category,product_type,description_fa,description_en,features_fa,features_en,is_free,price_toman,status,current_version,sort_order)
values
('30000000-0000-0000-0000-000000000001','sheet-by-sadaf','SHEET by SADAF','AutoCAD','script','پلات گروهی هوشمند برای فایل‌های سنگین اتوکد؛ تشخیص شیت، CTB متناسب با مقیاس و خروجی PDF.','Smart batch plotting for large AutoCAD files with sheet detection, scale-aware CTB and PDF publishing.','["تشخیص شیت‌های Model Space","پشتیبانی از Layout","پروفایل CTB بر اساس مقیاس","PDF جداگانه یا چندصفحه‌ای"]'::jsonb,'["Model Space sheet detection","Layout support","Scale-aware CTB profiles","Separate or multi-page PDF"]'::jsonb,false,0,'draft','0.1.3',10)
on conflict(id) do nothing;

-- AFTER YOU CREATE YOUR OWN ACCOUNT, promote it once with:
-- update public.profiles set role='admin' where email='YOUR_EMAIL@example.com';
