-- Restringe escrita em products e no Storage apenas a administradores.
-- Admins são cadastrados manualmente na tabela admin_users (ver docs/SETUP.md).

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.admin_users enable row level security;
-- Sem policies: ninguém lê/escreve admin_users pelo client. Só pelo SQL Editor.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- products
alter table public.products enable row level security;

drop policy if exists "Allow public read" on public.products;
drop policy if exists "Allow public insert" on public.products;
drop policy if exists "Allow authenticated insert" on public.products;
drop policy if exists "Allow authenticated update" on public.products;
drop policy if exists "Allow authenticated delete" on public.products;

create policy "products_select_public" on public.products
  for select using (true);
create policy "products_admin_insert" on public.products
  for insert with check (public.is_admin());
create policy "products_admin_update" on public.products
  for update using (public.is_admin()) with check (public.is_admin());
create policy "products_admin_delete" on public.products
  for delete using (public.is_admin());

-- Storage: bucket product-images
drop policy if exists "Allow authenticated uploads" on storage.objects;
drop policy if exists "Allow public read" on storage.objects;
drop policy if exists "Allow authenticated updates" on storage.objects;
drop policy if exists "Allow authenticated deletes" on storage.objects;

create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());
