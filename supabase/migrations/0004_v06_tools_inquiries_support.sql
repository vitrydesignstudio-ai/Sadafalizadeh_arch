-- SadafAlizadeh_arch v0.6 — Digital Tools + Project Inquiry + Support

-- Remove the early demo projects. Portfolio content will be added from Admin CMS.
delete from public.projects where id in (
  '10000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000002'::uuid,
  '10000000-0000-0000-0000-000000000003'::uuid
);

-- Richer taxonomy for Digital Tools.
alter table public.products add column if not exists subcategory text;
alter table public.products drop constraint if exists products_product_type_check;
alter table public.products add constraint products_product_type_check
check (product_type in (
  'script','plugin','preset','template','course_asset','block','ctb','brush','action','psd',
  'material','model','scene','asset','prompt','other'
));
create index if not exists products_software_subcategory_idx on public.products(software_category, subcategory);

create table if not exists public.project_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text not null,
  mobile text,
  company text,
  project_type text,
  project_location text,
  area text,
  budget text,
  timeline text,
  message text not null,
  status text not null default 'new' check (status in ('new','in_review','contacted','closed')),
  admin_note text,
  created_at timestamptz not null default timezone('utc',now()),
  updated_at timestamptz not null default timezone('utc',now())
);

drop trigger if exists project_inquiries_updated_at on public.project_inquiries;
create trigger project_inquiries_updated_at before update on public.project_inquiries
for each row execute function public.set_updated_at();

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text not null,
  category text not null default 'general',
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  admin_reply text,
  created_at timestamptz not null default timezone('utc',now()),
  updated_at timestamptz not null default timezone('utc',now())
);

drop trigger if exists support_tickets_updated_at on public.support_tickets;
create trigger support_tickets_updated_at before update on public.support_tickets
for each row execute function public.set_updated_at();

alter table public.project_inquiries enable row level security;
alter table public.support_tickets enable row level security;

revoke all on public.project_inquiries from anon, authenticated;
grant insert on public.project_inquiries to anon, authenticated;
grant select, update, delete on public.project_inquiries to authenticated;

create policy project_inquiries_public_insert on public.project_inquiries
for insert to anon, authenticated
with check (
  length(trim(full_name)) between 2 and 120 and
  length(trim(email)) between 5 and 200 and
  length(trim(message)) between 3 and 5000 and
  (user_id is null or user_id=(select auth.uid()))
);
create policy project_inquiries_own_or_admin_select on public.project_inquiries
for select to authenticated
using (user_id=(select auth.uid()) or public.is_admin());
create policy project_inquiries_admin_update on public.project_inquiries
for update to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy project_inquiries_admin_delete on public.project_inquiries
for delete to authenticated using (public.is_admin());

revoke all on public.support_tickets from anon, authenticated;
grant insert on public.support_tickets to anon, authenticated;
grant select, update, delete on public.support_tickets to authenticated;

create policy support_tickets_public_insert on public.support_tickets
for insert to anon, authenticated
with check (
  length(trim(full_name)) between 2 and 120 and
  length(trim(email)) between 5 and 200 and
  length(trim(subject)) between 2 and 220 and
  length(trim(message)) between 3 and 5000 and
  (user_id is null or user_id=(select auth.uid()))
);
create policy support_tickets_own_or_admin_select on public.support_tickets
for select to authenticated
using (user_id=(select auth.uid()) or public.is_admin());
create policy support_tickets_admin_update on public.support_tickets
for update to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy support_tickets_admin_delete on public.support_tickets
for delete to authenticated using (public.is_admin());
