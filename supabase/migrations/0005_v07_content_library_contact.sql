-- v0.7: extend the existing CMS without replacing prior commerce/auth/admin structures.

alter table public.projects add column if not exists scope text;
alter table public.projects add column if not exists role text;
alter table public.projects add column if not exists video_url text;
alter table public.projects add column if not exists software text;

alter table public.lessons add column if not exists software text;
alter table public.lessons add column if not exists content_type text not null default 'tutorial';

alter table public.products add column if not exists file_type text;
alter table public.products add column if not exists file_size text;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new','in_review','replied','closed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
alter table public.contact_messages enable row level security;
drop policy if exists "contact_insert_public" on public.contact_messages;
create policy "contact_insert_public" on public.contact_messages for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
drop policy if exists "contact_select_own" on public.contact_messages;
create policy "contact_select_own" on public.contact_messages for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "contact_admin_update" on public.contact_messages;
create policy "contact_admin_update" on public.contact_messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop trigger if exists set_contact_messages_updated_at on public.contact_messages;
create trigger set_contact_messages_updated_at
before update on public.contact_messages
for each row execute function public.set_updated_at();

create table if not exists public.saved_resources (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, product_id)
);
alter table public.saved_resources enable row level security;
drop policy if exists "saved_resources_own" on public.saved_resources;
create policy "saved_resources_own" on public.saved_resources for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace view public.content_library with (security_invoker = true) as
select p.id, 'project'::text as source_type, p.slug, p.title_fa, p.title_en,
       p.software, p.type as category, 'project'::text as content_type, false as is_free,
       p.status, p.cover_image_url, p.created_at
from public.projects p
union all
select l.id, 'lesson'::text, l.slug, l.title_fa, l.title_en,
       coalesce(l.software, l.category) as software, 'Tutorials'::text as category, l.content_type,
       true as is_free, l.status, l.cover_image_url, l.created_at
from public.lessons l
union all
select pr.id, 'product'::text, pr.slug, pr.name, pr.name,
       pr.software_category, coalesce(pr.subcategory, pr.product_type), pr.product_type,
       pr.is_free, pr.status, pr.cover_image_url, pr.created_at
from public.products pr;

grant select on public.content_library to anon, authenticated;
create index if not exists idx_projects_software on public.projects(software);
create index if not exists idx_lessons_software on public.lessons(software);
create index if not exists idx_products_taxonomy on public.products(software_category, subcategory, product_type, is_free);

-- Remove only the known legacy demo tutorial rows; unpublished real content is untouched.
delete from public.lessons where id in (
  '20000000-0000-0000-0000-000000000001'::uuid,
  '20000000-0000-0000-0000-000000000002'::uuid
);
