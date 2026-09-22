-- ==============================================================================
-- SCHEMA OFICIAL SUPABASE — CORREIOS PARCEIROS (TEMPO REAL & POSTGRESQL)
-- ==============================================================================

-- 1. TABELA DE PEDIDOS E ENTREGAS (ORDERS)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  tracking_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  sender JSONB NOT NULL,
  recipient JSONB NOT NULL,
  modal TEXT NOT NULL,
  package_description TEXT,
  weight_kg NUMERIC DEFAULT 1.0,
  dimensions JSONB,
  pickup_method TEXT DEFAULT 'doorstep',
  dropoff_point_id TEXT,
  is_urgent BOOLEAN DEFAULT FALSE,
  has_insurance BOOLEAN DEFAULT FALSE,
  declared_value NUMERIC DEFAULT 0,
  price JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'paid',
  pix_qr_code_payload TEXT,
  courier_id TEXT,
  courier_name TEXT,
  courier_phone TEXT,
  scan_history JSONB DEFAULT '[]'::jsonb,
  final_delivery_signature TEXT,
  final_delivery_photo TEXT,
  delivered_at TIMESTAMPTZ
);

-- 2. TABELA DE ENTREGADORES PARCEIROS (COURIERS)
CREATE TABLE IF NOT EXISTS public.couriers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  email TEXT,
  password TEXT DEFAULT '1234',
  cnh TEXT NOT NULL,
  modal TEXT NOT NULL DEFAULT 'moto',
  vehicle_plate TEXT NOT NULL,
  vehicle_model TEXT,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  rating NUMERIC DEFAULT 5.0,
  total_deliveries INTEGER DEFAULT 0,
  balance_available NUMERIC DEFAULT 0,
  balance_pending NUMERIC DEFAULT 0,
  pix_key TEXT,
  is_online BOOLEAN DEFAULT TRUE,
  is_blocked BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  verification_status TEXT DEFAULT 'verified',
  document_photo TEXT,
  selfie_photo TEXT
);

-- 3. TABELA DE CLIENTES (CLIENTS)
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  default_address JSONB,
  verification_status TEXT DEFAULT 'verified',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. TABELA DE PONTOS DE COLETA / DROP-OFF (DROPOFF_POINTS)
CREATE TABLE IF NOT EXISTS public.dropoff_points (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  business_name TEXT,
  cnpj TEXT,
  category TEXT,
  owner_name TEXT NOT NULL,
  owner_document TEXT,
  address JSONB NOT NULL,
  phone TEXT,
  opening_hours TEXT,
  package_count INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  pix_key TEXT,
  verification_status TEXT DEFAULT 'verified'
);

-- ==============================================================================
-- SEGURANÇA (ROW LEVEL SECURITY)
-- ==============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon leitura orders" ON public.orders;
CREATE POLICY "Anon leitura orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon insercao orders" ON public.orders;
CREATE POLICY "Anon insercao orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anon atualizacao orders" ON public.orders;
CREATE POLICY "Anon atualizacao orders" ON public.orders FOR UPDATE USING (true);

ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon leitura couriers" ON public.couriers;
CREATE POLICY "Anon leitura couriers" ON public.couriers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon insercao couriers" ON public.couriers;
CREATE POLICY "Anon insercao couriers" ON public.couriers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anon atualizacao couriers" ON public.couriers;
CREATE POLICY "Anon atualizacao couriers" ON public.couriers FOR UPDATE USING (true);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon leitura clients" ON public.clients;
CREATE POLICY "Anon leitura clients" ON public.clients FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon insercao clients" ON public.clients;
CREATE POLICY "Anon insercao clients" ON public.clients FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anon atualizacao clients" ON public.clients;
CREATE POLICY "Anon atualizacao clients" ON public.clients FOR UPDATE USING (true);

ALTER TABLE public.dropoff_points ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon leitura dropoff_points" ON public.dropoff_points;
CREATE POLICY "Anon leitura dropoff_points" ON public.dropoff_points FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon insercao dropoff_points" ON public.dropoff_points;
CREATE POLICY "Anon insercao dropoff_points" ON public.dropoff_points FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anon atualizacao dropoff_points" ON public.dropoff_points;
CREATE POLICY "Anon atualizacao dropoff_points" ON public.dropoff_points FOR UPDATE USING (true);

-- ==============================================================================
-- HABILITAR SUPABASE REALTIME
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'couriers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.couriers;
  END IF;
END $$;

-- ==============================================================================
-- CARGA INICIAL DE DEMONSTRAÇÃO
-- ==============================================================================
INSERT INTO public.couriers (
  id, name, document, email, password, cnh, modal, vehicle_plate, vehicle_model,
  phone, avatar_url, rating, total_deliveries, balance_available, balance_pending,
  pix_key, is_online, is_blocked, verification_status
) VALUES 
(
  'courier_moto_01', 'Marcos Silva', '382.910.482-10', 'marcos.moto@entregas.com',
  '1234', '05928194021', 'moto', 'BRA-2E19', 'Honda CG 160 Cargo',
  '(11) 98765-4321', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  4.9, 32, 145.50, 0, 'marcos.moto@entregas.com', TRUE, FALSE, 'verified'
),
(
  'courier_carro_02', 'Carlos Souza', '291.849.192-34', 'carlos.utilitarios@entregas.com',
  '1234', '04829103948', 'car', 'CAR-4F90', 'Fiat Fiorino 1.4 EVO',
  '(11) 97654-3210', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  5.0, 19, 210.00, 0, '291.849.192-34', TRUE, FALSE, 'verified'
)
ON CONFLICT (id) DO NOTHING;



-- -- ==============================================================================
-- -- SCHEMA OFICIAL SUPABASE — CORREIOS PARCEIROS (TEMPO REAL & POSTGRESQL)
-- -- Execute este script no "SQL Editor" do seu painel Supabase (https://supabase.com)
-- -- ==============================================================================

-- -- 1. TABELA DE PEDIDOS E ENTREGAS (ORDERS)
-- CREATE TABLE IF NOT EXISTS public.orders (
--   id TEXT PRIMARY KEY,
--   tracking_code TEXT UNIQUE NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
--   status TEXT NOT NULL DEFAULT 'created',
--   sender JSONB NOT NULL,
--   recipient JSONB NOT NULL,
--   modal TEXT NOT NULL,
--   package_description TEXT,
--   weight_kg NUMERIC DEFAULT 1.0,
--   dimensions JSONB,
--   pickup_method TEXT DEFAULT 'doorstep',
--   dropoff_point_id TEXT,
--   is_urgent BOOLEAN DEFAULT FALSE,
--   has_insurance BOOLEAN DEFAULT FALSE,
--   declared_value NUMERIC DEFAULT 0,
--   price JSONB NOT NULL,
--   payment_method TEXT NOT NULL,
--   payment_status TEXT DEFAULT 'paid',
--   pix_qr_code_payload TEXT,
--   courier_id TEXT,
--   courier_name TEXT,
--   courier_phone TEXT,
--   scan_history JSONB DEFAULT '[]'::jsonb,
--   final_delivery_signature TEXT,
--   final_delivery_photo TEXT,
--   delivered_at TIMESTAMPTZ
-- );

-- -- 2. TABELA DE ENTREGADORES PARCEIROS (COURIERS)
-- CREATE TABLE IF NOT EXISTS public.couriers (
--   id TEXT PRIMARY KEY,
--   name TEXT NOT NULL,
--   document TEXT NOT NULL,
--   email TEXT,
--   password TEXT DEFAULT '1234',
--   cnh TEXT NOT NULL,
--   modal TEXT NOT NULL DEFAULT 'moto',
--   vehicle_plate TEXT NOT NULL,
--   vehicle_model TEXT,
--   phone TEXT NOT NULL,
--   avatar_url TEXT,
--   rating NUMERIC DEFAULT 5.0,
--   total_deliveries INTEGER DEFAULT 0,
--   balance_available NUMERIC DEFAULT 0,
--   balance_pending NUMERIC DEFAULT 0,
--   pix_key TEXT,
--   is_online BOOLEAN DEFAULT TRUE,
--   is_blocked BOOLEAN DEFAULT FALSE,
--   registered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
--   verification_status TEXT DEFAULT 'verified',
--   document_photo TEXT,
--   selfie_photo TEXT
-- );

-- -- 3. TABELA DE CLIENTES (CLIENTS)
-- CREATE TABLE IF NOT EXISTS public.clients (
--   id TEXT PRIMARY KEY,
--   name TEXT NOT NULL,
--   document TEXT NOT NULL,
--   email TEXT NOT NULL,
--   phone TEXT,
--   default_address JSONB,
--   verification_status TEXT DEFAULT 'verified',
--   created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
-- );

-- -- 4. TABELA DE PONTOS DE COLETA / DROP-OFF (DROPOFF_POINTS)
-- CREATE TABLE IF NOT EXISTS public.dropoff_points (
--   id TEXT PRIMARY KEY,
--   name TEXT NOT NULL,
--   business_name TEXT,
--   cnpj TEXT,
--   category TEXT,
--   owner_name TEXT NOT NULL,
--   owner_document TEXT,
--   address JSONB NOT NULL,
--   phone TEXT,
--   opening_hours TEXT,
--   package_count INTEGER DEFAULT 0,
--   total_earnings NUMERIC DEFAULT 0,
--   pix_key TEXT,
--   verification_status TEXT DEFAULT 'verified'
-- );

-- -- ==============================================================================
-- -- SEGURANÇA (ROW LEVEL SECURITY) — HABILITANDO ACESSO PÚBLICO ANON PARA PROTÓTIPO
-- -- ==============================================================================
-- ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Anon leitura orders" ON public.orders;
-- CREATE POLICY "Anon leitura orders" ON public.orders FOR SELECT USING (true);
-- DROP POLICY IF EXISTS "Anon insercao orders" ON public.orders;
-- CREATE POLICY "Anon insercao orders" ON public.orders FOR INSERT WITH CHECK (true);
-- DROP POLICY IF EXISTS "Anon atualizacao orders" ON public.orders;
-- CREATE POLICY "Anon atualizacao orders" ON public.orders FOR UPDATE USING (true);

-- ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Anon leitura couriers" ON public.couriers;
-- CREATE POLICY "Anon leitura couriers" ON public.couriers FOR SELECT USING (true);
-- DROP POLICY IF EXISTS "Anon insercao couriers" ON public.couriers;
-- CREATE POLICY "Anon insercao couriers" ON public.couriers FOR INSERT WITH CHECK (true);
-- DROP POLICY IF EXISTS "Anon atualizacao couriers" ON public.couriers;
-- CREATE POLICY "Anon atualizacao couriers" ON public.couriers FOR UPDATE USING (true);

-- ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Anon leitura clients" ON public.clients;
-- CREATE POLICY "Anon leitura clients" ON public.clients FOR SELECT USING (true);
-- DROP POLICY IF EXISTS "Anon insercao clients" ON public.clients;
-- CREATE POLICY "Anon insercao clients" ON public.clients FOR INSERT WITH CHECK (true);
-- DROP POLICY IF EXISTS "Anon atualizacao clients" ON public.clients;
-- CREATE POLICY "Anon atualizacao clients" ON public.clients FOR UPDATE USING (true);

-- ALTER TABLE public.dropoff_points ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Anon leitura dropoff_points" ON public.dropoff_points;
-- CREATE POLICY "Anon leitura dropoff_points" ON public.dropoff_points FOR SELECT USING (true);
-- DROP POLICY IF EXISTS "Anon insercao dropoff_points" ON public.dropoff_points;
-- CREATE POLICY "Anon insercao dropoff_points" ON public.dropoff_points FOR INSERT WITH CHECK (true);
-- DROP POLICY IF EXISTS "Anon atualizacao dropoff_points" ON public.dropoff_points FOR UPDATE USING (true);

-- -- ==============================================================================
-- -- HABILITAR SUPABASE REALTIME (WEBSOCKETS PARA TRANSMISSÃO INSTANTÂNEA)
-- -- ==============================================================================
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_publication_tables 
--     WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
--   ) THEN
--     ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
--   END IF;

--   IF NOT EXISTS (
--     SELECT 1 FROM pg_publication_tables 
--     WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'couriers'
--   ) THEN
--     ALTER PUBLICATION supabase_realtime ADD TABLE public.couriers;
--   END IF;
-- END $$;

-- -- ==============================================================================
-- -- CARGA INICIAL DE DEMONSTRAÇÃO (SEED COURIERS)
-- -- ==============================================================================
-- INSERT INTO public.couriers (
--   id, name, document, email, password, cnh, modal, vehicle_plate, vehicle_model,
--   phone, avatar_url, rating, total_deliveries, balance_available, balance_pending,
--   pix_key, is_online, is_blocked, verification_status
-- ) VALUES 
-- (
--   'courier_moto_01', 'Marcos Silva', '382.910.482-10', 'marcos.moto@entregas.com',
--   '1234', '05928194021', 'moto', 'BRA-2E19', 'Honda CG 160 Cargo',
--   '(11) 98765-4321', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
--   4.9, 32, 145.50, 0, 'marcos.moto@entregas.com', TRUE, FALSE, 'verified'
-- ),
-- (
--   'courier_carro_02', 'Carlos Souza', '291.849.192-34', 'carlos.utilitarios@entregas.com',
--   '1234', '04829103948', 'car', 'CAR-4F90', 'Fiat Fiorino 1.4 EVO',
--   '(11) 97654-3210', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
--   5.0, 19, 210.00, 0, '291.849.192-34', TRUE, FALSE, 'verified'
-- )
-- ON CONFLICT (id) DO NOTHING;
