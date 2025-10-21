# 🛡️ Rate Limiting Configuration Guide

## Configuración de Vercel KV

### Variables de Entorno Requeridas

Para que el sistema de rate limiting funcione correctamente, necesitas configurar las siguientes variables de entorno:

```bash
# Vercel KV Configuration
KV_REST_API_URL=https://your-kv-instance.vercel-storage.com
KV_REST_API_TOKEN=your-kv-token
KV_REST_API_READ_ONLY_TOKEN=your-readonly-token
```

### Pasos de Configuración

#### 1. Crear Base de Datos KV en Vercel

1. Ve a tu dashboard de Vercel
2. Selecciona tu proyecto `cosmococktails-ecommerce`
3. Ve a **Storage** > **Create Database** > **KV**
4. Elige un nombre para tu base de datos (ej: `cosmococktails-kv`)
5. Selecciona la región más cercana a tus usuarios

#### 2. Configurar Variables de Entorno

1. En el dashboard de Vercel, ve a **Settings** > **Environment Variables**
2. Agrega las siguientes variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN` (opcional)

#### 3. Configuración Local

Para desarrollo local, agrega las variables a tu archivo `.env.local`:

```bash
# .env.local
KV_REST_API_URL=https://your-kv-instance.vercel-storage.com
KV_REST_API_TOKEN=your-kv-token
```

### Verificación de Configuración

#### 1. Verificar Conexión

Ejecuta el servidor de desarrollo y revisa los logs:

```bash
npm run dev
```

Busca mensajes como:

- ✅ `Vercel KV connected successfully`
- 🚨 `KV connection error` (si hay problemas)

#### 2. Probar Rate Limiting

Puedes probar el rate limiting haciendo múltiples requests a cualquier endpoint de API:

```bash
# Ejemplo: Probar límite de login
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}'
  echo "Request $i completed"
done
```

### Configuración de Límites

Los límites están configurados en `src/lib/rate-limiting/types.ts`:

#### Endpoints Protegidos

- `/api/login`: 5 intentos / 15 minutos
- `/api/signup`: 3 intentos / hora
- `/api/create-payment-intent`: 10 intentos / hora
- `/api/create-order`: 10 intentos / hora
- `/api/favorites`: 100 requests / hora
- `/api/preferences`: 50 requests / hora

#### Tipos de Límites

1. **Global por IP**: Límite general por dirección IP
2. **Autenticado**: Límite para usuarios logueados
3. **No autenticado**: Límite para usuarios anónimos
4. **Por endpoint**: Límite específico por API

### Monitoreo y Debugging

#### Logs de Rate Limiting

El sistema genera logs detallados:

- ✅ Requests permitidos
- 🚫 Requests bloqueados
- 🧹 Limpieza de límites expirados

#### Headers de Respuesta

Cada respuesta incluye headers informativos:

- `X-RateLimit-Remaining`: Requests restantes
- `X-RateLimit-Reset`: Timestamp de reset
- `Retry-After`: Segundos hasta el próximo intento

#### Debugging en Desarrollo

En modo desarrollo, se incluyen headers adicionales:

- `X-RateLimit-Debug`: Información detallada de debugging

### Troubleshooting

#### Problemas Comunes

1. **Error de conexión a KV**
   - Verifica que las variables de entorno estén configuradas
   - Confirma que la base de datos KV existe en Vercel

2. **Rate limiting no funciona**
   - Verifica que el middleware esté configurado correctamente
   - Revisa los logs del servidor

3. **Límites demasiado estrictos**
   - Ajusta los valores en `RATE_LIMIT_CONFIGS`
   - Considera diferentes límites para desarrollo vs producción

#### Comandos de Debugging

```bash
# Verificar configuración de KV
npm run dev
# Revisar logs en la consola

# Probar límites específicos
curl -v http://localhost:3000/api/login
# Revisar headers de respuesta
```

### Seguridad

#### Mejores Prácticas

1. **Límites graduales**: Más estrictos para endpoints críticos
2. **Limpieza automática**: Límites expiran automáticamente
3. **Logging detallado**: Para monitoreo y debugging
4. **Headers informativos**: Para clientes y debugging

#### Consideraciones de Producción

1. **Monitoreo**: Revisa logs regularmente
2. **Ajustes**: Modifica límites según el uso real
3. **Alertas**: Configura alertas para límites excedidos
4. **Backup**: Vercel KV tiene backup automático

### Costos

#### Vercel KV Pricing

- **Free tier**: 30,000 requests/mes
- **Pro tier**: $0.20 por 100,000 requests adicionales
- **Enterprise**: Precios personalizados

#### Optimización de Costos

1. **Límites apropiados**: Evita límites demasiado bajos
2. **Limpieza automática**: Los límites expiran automáticamente
3. **Monitoreo**: Revisa uso regularmente

### Soporte

Si tienes problemas con la configuración:

1. Revisa los logs del servidor
2. Verifica la configuración de variables de entorno
3. Consulta la documentación de Vercel KV
4. Contacta al equipo de desarrollo

