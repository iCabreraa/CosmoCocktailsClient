-- RLS policies for user-owned data tables
-- Execute in Supabase SQL Editor

-- user_addresses
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Remove legacy permissive policies if present
DROP POLICY IF EXISTS "addresses_allow_all" ON public.user_addresses;

DROP POLICY IF EXISTS "Users can view own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.user_addresses;

CREATE POLICY "Users can view own addresses" ON public.user_addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON public.user_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON public.user_addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON public.user_addresses
  FOR DELETE USING (auth.uid() = user_id);

-- clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Remove legacy permissive policies if present
DROP POLICY IF EXISTS "clients_insert" ON public.clients;
DROP POLICY IF EXISTS "clients_select_own" ON public.clients;
DROP POLICY IF EXISTS "clients_update" ON public.clients;

DROP POLICY IF EXISTS "Users can view own client profile" ON public.clients;
DROP POLICY IF EXISTS "Users can insert own client profile" ON public.clients;
DROP POLICY IF EXISTS "Users can update own client profile" ON public.clients;
DROP POLICY IF EXISTS "Users can delete own client profile" ON public.clients;

CREATE POLICY "Users can view own client profile" ON public.clients
  FOR SELECT USING (
    auth.uid() = user_id
    OR ((auth.jwt() ->> 'user_metadata')::json ->> 'role') = 'admin'
  );

CREATE POLICY "Users can insert own client profile" ON public.clients
  FOR INSERT WITH CHECK (
    (auth.uid() = user_id)
    OR (
      auth.role() = 'anon'
      AND is_guest = true
      AND user_id IS NULL
    )
  );

CREATE POLICY "Users can update own client profile" ON public.clients
  FOR UPDATE USING (
    auth.uid() = user_id
    OR ((auth.jwt() ->> 'user_metadata')::json ->> 'role') = 'admin'
  );

CREATE POLICY "Users can delete own client profile" ON public.clients
  FOR DELETE USING (
    auth.uid() = user_id
    OR ((auth.jwt() ->> 'user_metadata')::json ->> 'role') = 'admin'
  );

-- user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Remove legacy permissive policies if present
DROP POLICY IF EXISTS "preferences_allow_all" ON public.user_preferences;
