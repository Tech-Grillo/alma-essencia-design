-- Avaliações de produtos feitas por quem comprou e pagou pelo site.
-- Depende de public.orders (002_orders.sql) e public.is_admin() (001_admin_rls.sql).

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_slug text not null,
  order_id uuid not null references public.orders (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 600),
  author_name text not null,
  visible boolean not null default true,
  unique (order_id, product_slug) -- uma avaliação por produto em cada pedido
);

create index if not exists product_reviews_slug_idx
  on public.product_reviews (product_slug, created_at desc);

alter table public.product_reviews enable row level security;

-- Qualquer visitante lê as avaliações visíveis. Gravar, só o servidor (chave secreta).
-- O admin pode ocultar/mostrar e apagar pelo painel.
drop policy if exists "product_reviews_public_read" on public.product_reviews;
drop policy if exists "product_reviews_admin_update" on public.product_reviews;
drop policy if exists "product_reviews_admin_delete" on public.product_reviews;

create policy "product_reviews_public_read" on public.product_reviews
  for select using (visible or public.is_admin());
create policy "product_reviews_admin_update" on public.product_reviews
  for update using (public.is_admin()) with check (public.is_admin());
create policy "product_reviews_admin_delete" on public.product_reviews
  for delete using (public.is_admin());
