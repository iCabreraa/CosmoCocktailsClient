-- Crear tabla de auditoría de seguridad
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'login', 
    'logout', 
    'failed_login', 
    'permission_denied', 
    'suspicious_activity'
  )),
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);

-- Habilitar RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para security_events
-- Solo admins pueden ver todos los eventos
CREATE POLICY "Admins can view all security events" ON public.security_events
  FOR SELECT USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Los usuarios pueden ver sus propios eventos
CREATE POLICY "Users can view own security events" ON public.security_events
  FOR SELECT USING (
    (auth.jwt() ->> 'sub')::uuid = user_id
  );

-- Solo el sistema puede insertar eventos (sin autenticación)
CREATE POLICY "System can insert security events" ON public.security_events
  FOR INSERT WITH CHECK (true);

-- Solo admins pueden actualizar eventos
CREATE POLICY "Admins can update security events" ON public.security_events
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Solo admins pueden eliminar eventos
CREATE POLICY "Admins can delete security events" ON public.security_events
  FOR DELETE USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

