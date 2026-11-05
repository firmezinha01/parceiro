-- ========================================================
-- SCHEMA PARCEIRO MOTORISTA - SUPABASE
-- Projeto: efvchaahbshqjlmlrzta
-- ========================================================

-- 1. TABELA DE MOTORISTAS / PERFIS
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Carlos Alberto Silva',
  phone text default '(11) 98452-9011',
  avatar_url text default 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  rating numeric(3,2) default 4.97,
  total_trips int default 1842,
  acceptance_rate numeric(5,2) default 98.00,
  vehicle_type text default 'fiorino',
  vehicle_model text default 'Fiat Fiorino 1.4 EVO',
  vehicle_plate text default 'BRA-2E19',
  pix_key text default 'carlos.silva.entregas@gmail.com',
  is_online boolean default true,
  wallet_balance numeric(10,2) default 348.50,
  today_earnings numeric(10,2) default 186.20,
  week_earnings numeric(10,2) default 1420.00,
  current_lat numeric(10,6) default -23.561500,
  current_lng numeric(10,6) default -46.655900,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. TABELA DE PEDIDOS DE ENTREGA (ORDERS)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  vehicle_type text not null default 'moto',
  price numeric(10,2) not null default 25.00,
  distance_pickup_km numeric(5,2) default 1.5,
  total_distance_km numeric(5,2) default 7.0,
  estimated_minutes int default 25,
  cargo_type text default 'Encomendas e Volumes',
  cargo_weight_kg numeric(8,2) default 5.0,
  client_notes text,
  payment_method text default 'app',
  status text not null default 'available', -- 'available', 'to_pickup', 'at_pickup', 'in_transit', 'at_delivery', 'completed', 'cancelled'
  
  -- Ponto A (Coleta)
  pickup_address text not null,
  pickup_neighborhood text,
  pickup_city text default 'São Paulo - SP',
  pickup_lat numeric(10,6) default -23.561500,
  pickup_lng numeric(10,6) default -46.655900,
  pickup_contact_name text,
  pickup_contact_phone text,
  pickup_instructions text,

  -- Ponto B (Entrega)
  delivery_address text not null,
  delivery_neighborhood text,
  delivery_city text default 'São Paulo - SP',
  delivery_lat numeric(10,6) default -23.555200,
  delivery_lng numeric(10,6) default -46.662100,
  delivery_contact_name text,
  delivery_contact_phone text,
  delivery_instructions text,

  driver_id uuid references public.drivers(id) on delete set null,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- 3. TABELA DE TRANSAÇÕES DA CARTEIRA
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references public.drivers(id) on delete cascade,
  type text not null, -- 'trip_earning', 'withdrawal', 'bonus'
  title text not null,
  subtitle text,
  amount numeric(10,2) not null,
  order_code text,
  created_at timestamptz default now()
);

-- HABILITAR RLS (Row Level Security)
alter table public.drivers enable row level security;
alter table public.orders enable row level security;
alter table public.wallet_transactions enable row level security;

-- POLÍTICAS DE ACESSO (Permitir leitura e escrita para o app)
create policy "Acesso publico drivers" on public.drivers for all using (true) with check (true);
create policy "Acesso publico orders" on public.orders for all using (true) with check (true);
create policy "Acesso publico transactions" on public.wallet_transactions for all using (true) with check (true);

-- HABILITAR REALTIME (Atualização instantânea no celular e desktop)
alter publication supabase_realtime add table public.drivers;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.wallet_transactions;

-- INSERIR MOTORISTA PADRÃO
insert into public.drivers (
  id, name, phone, vehicle_type, vehicle_model, vehicle_plate, pix_key, is_online, wallet_balance, today_earnings, week_earnings
) values (
  'a0000000-0000-0000-0000-000000000001',
  'Carlos Alberto Silva',
  '(11) 98452-9011',
  'fiorino',
  'Fiat Fiorino 1.4 EVO',
  'BRA-2E19',
  'carlos.silva.entregas@gmail.com',
  true,
  348.50,
  186.20,
  1420.00
) on conflict (id) do nothing;

-- INSERIR PEDIDOS DE EXEMPLO
insert into public.orders (
  code, vehicle_type, price, distance_pickup_km, total_distance_km, estimated_minutes,
  cargo_type, cargo_weight_kg, client_notes, status,
  pickup_address, pickup_neighborhood, pickup_contact_name, pickup_contact_phone,
  delivery_address, delivery_neighborhood, delivery_contact_name, delivery_contact_phone
) values 
(
  'PRC-8921', 'fiorino', 48.90, 1.4, 7.8, 24,
  'Caixas de E-commerce (12 volumes)', 45.0, 'Carga frágil, favor não tombar.', 'available',
  'Av. Paulista, 1578', 'Bela Vista', 'Mariana Santos', '(11) 97123-4567',
  'Rua Augusta, 2400', 'Cerqueira César', 'Juliana Paes', '(11) 98844-3322'
),
(
  'PRC-8922', 'moto', 26.50, 0.8, 4.2, 15,
  'Documentos e Contratos Jurídicos', 1.0, 'Entregar envelope lacrado em mãos.', 'available',
  'Rua Funchal, 418', 'Vila Olímpia', 'Advocacia Pinheiro', '(11) 99182-3400',
  'Av. Brig. Faria Lima, 3477', 'Itaim Bibi', 'Cartório Silva', '(11) 99876-1122'
),
(
  'PRC-8923', 'van', 94.00, 2.9, 18.2, 42,
  'Peças Automotivas e Acessórios', 120.0, 'Ajudante no local para descarregar.', 'available',
  'Av. do Estado, 5500', 'Cambuci', 'Distribuidora AutoMax', '(11) 98777-6655',
  'Av. Giovanni Gronchi, 3800', 'Morumbi', 'Oficina do Alemão', '(11) 97654-3210'
) on conflict (code) do nothing;
