-- Pedidos pagos pelo site (Mercado Pago) e zonas de entrega com taxa fixa por bairro.
-- Depende de public.is_admin(), criada em 001_admin_rls.sql.

-- Zonas de entrega ---------------------------------------------------------
create table if not exists public.delivery_zones (
  id bigint generated always as identity primary key,
  neighborhood text not null unique,
  fee numeric(10, 2) not null check (fee >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.delivery_zones enable row level security;

drop policy if exists "delivery_zones_public_read" on public.delivery_zones;
drop policy if exists "delivery_zones_admin_write" on public.delivery_zones;

create policy "delivery_zones_public_read" on public.delivery_zones
  for select using (active or public.is_admin());
create policy "delivery_zones_admin_write" on public.delivery_zones
  for all using (public.is_admin()) with check (public.is_admin());

-- Pedidos ------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'rejected', 'cancelled', 'expired')),
  payment_method text not null check (payment_method in ('pix', 'card')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_type text not null check (delivery_type in ('pickup', 'delivery')),
  neighborhood text,
  address text,
  delivery_fee numeric(10, 2) not null default 0,
  items jsonb not null,
  subtotal numeric(10, 2) not null,
  total numeric(10, 2) not null,
  mp_payment_id text unique,
  mp_status text,
  mp_status_detail text,
  paid_at timestamptz
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Clientes não leem nem gravam direto: quem cria e atualiza pedidos é o servidor,
-- com a chave secreta. O admin só lê e pode atualizar pelo painel.
drop policy if exists "orders_admin_select" on public.orders;
drop policy if exists "orders_admin_update" on public.orders;

create policy "orders_admin_select" on public.orders
  for select using (public.is_admin());
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();
