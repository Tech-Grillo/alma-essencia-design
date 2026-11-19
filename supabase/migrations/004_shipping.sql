-- Frete por transportadora (Melhor Envio).
-- Rode no SQL Editor do Supabase ANTES de publicar o código que usa estas colunas.

-- Produtos: tipo de envio, peso e medidas da embalagem.
-- Formato: {"mode": "any" | "ground" | "local", "weightGrams": 400, "widthCm": 12, "heightCm": 12, "lengthCm": 12}
alter table public.products add column if not exists shipping jsonb;

-- Pedidos: dados do envio escolhido pelo cliente.
alter table public.orders add column if not exists postal_code text;
alter table public.orders add column if not exists shipping_carrier text;
alter table public.orders add column if not exists shipping_service text;
alter table public.orders add column if not exists shipping_days integer;

-- Novo tipo de entrega: 'shipping' (transportadora), além de retirada e entrega local.
alter table public.orders drop constraint if exists orders_delivery_type_check;
alter table public.orders add constraint orders_delivery_type_check
  check (delivery_type in ('pickup', 'delivery', 'shipping'));
