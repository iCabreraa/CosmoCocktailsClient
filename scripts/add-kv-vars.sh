#!/bin/bash

# Script para añadir las variables de Vercel KV al .env.local
# Basado en los valores reales del dashboard de Vercel

echo "🔧 Añadiendo variables de Vercel KV al .env.local..."
echo "=================================================="

# Verificar si el archivo .env.local existe
if [ ! -f ".env.local" ]; then
    echo "❌ Archivo .env.local no encontrado"
    exit 1
fi

# Verificar si las variables ya existen
if grep -q "KV_KV_REST_API_URL" .env.local; then
    echo "⚠️  Las variables de Vercel KV ya existen en .env.local"
    echo "   ¿Quieres sobrescribirlas? (y/n)"
    read -r response
    if [[ "$response" != "y" ]]; then
        echo "❌ Operación cancelada"
        exit 0
    fi
    # Eliminar variables existentes
    sed -i '' '/^KV_KV_REST_API_URL/d' .env.local
    sed -i '' '/^KV_KV_REST_API_TOKEN/d' .env.local
fi

# Añadir las variables al final del archivo
echo "" >> .env.local
echo "# Vercel KV Configuration" >> .env.local
echo "KV_KV_REST_API_URL=\"https://smashing-hag\"" >> .env.local
echo "KV_KV_REST_API_TOKEN=\"AUelAAIncDI3YmU30W\"" >> .env.local

echo "✅ Variables añadidas correctamente"
echo ""
echo "📋 Variables añadidas:"
echo "  KV_KV_REST_API_URL=\"https://smashing-hag\""
echo "  KV_KV_REST_API_TOKEN=\"AUelAAIncDI3YmU30W\""
echo ""
echo "🚀 Próximos pasos:"
echo "  1. Reinicia el servidor: npm run dev"
echo "  2. Verifica la configuración: ./scripts/verify-kv-config.sh"
echo "  3. Prueba el endpoint: curl http://localhost:3000/api/verify-kv-config"

