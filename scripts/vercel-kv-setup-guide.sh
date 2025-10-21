#!/bin/bash

# 🛡️ Vercel KV Setup Helper Script
# 
# Script para ayudar con la configuración de Vercel KV
# 
# @fileoverview Script de ayuda para configuración de Vercel KV
# @version 1.0.0
# @author CosmoCocktails Development Team

set -e

echo "🛡️ Configurando Vercel KV para Rate Limiting..."
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo ""
echo "📋 PASOS PARA CONFIGURAR VERCEL KV:"
echo "===================================="
echo ""
echo "1. 🌐 Ve al Dashboard de Vercel:"
echo "   https://vercel.com/dashboard"
echo ""
echo "2. 📁 Selecciona tu proyecto:"
echo "   - Busca 'cosmococktails-ecommerce'"
echo "   - Haz clic en él"
echo ""
echo "3. 🗄️ Crear Base de Datos KV:"
echo "   - En el menú lateral, busca 'Storage' o 'Databases'"
echo "   - Haz clic en 'Create Database'"
echo "   - Selecciona 'KV' (Key-Value)"
echo "   - Nombre: cosmococktails-rate-limit"
echo "   - Región: us-east-1 (o la más cercana)"
echo ""
echo "4. 🔑 Obtener Variables de Entorno:"
echo "   - Ve a la pestaña 'Settings'"
echo "   - Busca 'Environment Variables'"
echo "   - Deberías ver automáticamente:"
echo "     • KV_REST_API_URL"
echo "     • KV_REST_API_TOKEN"
echo "     • KV_REST_API_READ_ONLY_TOKEN (opcional)"
echo ""
echo "5. 📝 Configurar Variables Locales:"
echo "   - Crea un archivo .env.local en la raíz del proyecto"
echo "   - Agrega las variables obtenidas:"
echo ""
echo "     KV_REST_API_URL=https://your-kv-instance.vercel-storage.com"
echo "     KV_REST_API_TOKEN=your-kv-token"
echo "     KV_REST_API_READ_ONLY_TOKEN=your-readonly-token"
echo ""
echo "6. 🧪 Probar la Configuración:"
echo "   - Ejecuta: npm run dev"
echo "   - Visita: http://localhost:3000/api/test-rate-limit"
echo "   - Revisa los logs para confirmar conexión"
echo ""

print_warning "IMPORTANTE:"
echo "- Las variables de entorno son sensibles"
echo "- No las compartas públicamente"
echo "- Guárdalas en .env.local (que está en .gitignore)"
echo ""

print_success "Una vez configurado, tu sistema de Rate Limiting estará completamente operativo! 🛡️"

