#!/bin/bash

# Script para verificar la configuración de Vercel KV
# Verifica que las variables de entorno estén configuradas correctamente

echo "🔍 Verificando configuración de Vercel KV..."
echo "=============================================="

# Verificar si existe el archivo .env.local
if [ ! -f ".env.local" ]; then
    echo "❌ Archivo .env.local no encontrado"
    echo "   Crea el archivo .env.local y añade las variables de Vercel KV"
    exit 1
fi

echo "✅ Archivo .env.local encontrado"

# Verificar variables específicas
echo ""
echo "📋 Variables de entorno disponibles:"
echo "------------------------------------"

# Mostrar todas las variables que contienen KV
grep -E "^KV_" .env.local | while read line; do
    key=$(echo "$line" | cut -d'=' -f1)
    value=$(echo "$line" | cut -d'=' -f2-)
    
    # Enmascarar valores sensibles
    if [[ $value == *"http"* ]]; then
        masked_value="***URL***"
    elif [[ ${#value} -gt 10 ]]; then
        masked_value="***TOKEN***"
    else
        masked_value="$value"
    fi
    
    echo "  $key = $masked_value"
done

echo ""
echo "🎯 Variables requeridas para Rate Limiting:"
echo "--------------------------------------------"

# Verificar variables específicas (con prefijo duplicado de Vercel)
required_vars=("KV_KV_REST_API_URL" "KV_KV_REST_API_TOKEN")

all_found=true
for var in "${required_vars[@]}"; do
    if grep -q "^$var=" .env.local; then
        echo "  ✅ $var - Encontrada"
    else
        echo "  ❌ $var - No encontrada"
        all_found=false
    fi
done

echo ""
if [ "$all_found" = true ]; then
    echo "🎉 ¡Configuración completa! Rate limiting listo para usar."
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Reinicia el servidor de desarrollo: npm run dev"
    echo "   2. Prueba el rate limiting: curl http://localhost:3000/api/verify-kv-config"
    echo "   3. Prueba el rate limiting: npm run test:rate-limit"
else
    echo "⚠️  Configuración incompleta. Añade las variables faltantes."
    echo ""
    echo "📝 Para obtener las variables:"
    echo "   1. Ve a tu proyecto en Vercel Dashboard"
    echo "   2. Storage > upstash-kv-amber-flower"
    echo "   3. Copia las variables KV_KV_REST_API_URL y KV_KV_REST_API_TOKEN"
    echo "   4. Añádelas a tu archivo .env.local"
fi

echo ""
echo "🔧 Comandos útiles:"
echo "   npm run dev                           - Iniciar servidor de desarrollo"
echo "   curl http://localhost:3000/api/verify-kv-config - Verificar configuración via API"
echo "   ./scripts/verify-kv-config.sh         - Verificar configuración local"
