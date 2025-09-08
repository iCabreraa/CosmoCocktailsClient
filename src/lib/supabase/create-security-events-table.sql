-- Crear tabla de eventos de seguridad
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);

-- RLS para la tabla de eventos de seguridad
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Política: Solo los usuarios pueden ver sus propios eventos
CREATE POLICY "Users can view their own security events" ON security_events
  FOR SELECT USING (auth.uid() = user_id);

-- Política: Solo los admins pueden ver todos los eventos
CREATE POLICY "Admins can view all security events" ON security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Solo el sistema puede insertar eventos (usando service role)
CREATE POLICY "System can insert security events" ON security_events
  FOR INSERT WITH CHECK (true);

-- Función para limpiar eventos antiguos (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void AS $$
BEGIN
  -- Eliminar eventos más antiguos de 90 días
  DELETE FROM security_events 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE security_events IS 'Registro de eventos de seguridad del sistema';
COMMENT ON COLUMN security_events.event_type IS 'Tipo de evento de seguridad';
COMMENT ON COLUMN security_events.description IS 'Descripción legible del evento';
COMMENT ON COLUMN security_events.metadata IS 'Datos adicionales del evento en formato JSON';
COMMENT ON COLUMN security_events.ip_address IS 'Dirección IP del usuario (si está disponible)';
COMMENT ON COLUMN security_events.user_agent IS 'User agent del navegador del usuario';
