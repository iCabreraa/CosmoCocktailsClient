#!/bin/bash

# 🧪 Vercel KV Verification Script
# 
# Script para verificar que Vercel KV está configurado correctamente
# 
# @fileoverview Script de verificación para Vercel KV
# @version 1.0.0
# @author CosmoCocktails Development Team

set -e

echo "🧪 Verificando configuración de Vercel KV..."
echo "=========================================="

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

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Verificar archivo .env.local
if [ ! -f ".env.local" ]; then
    print_warning "No se encontró .env.local"
    print_status "Creando archivo .env.local..."
    touch .env.local
    echo "# Vercel KV Configuration" >> .env.local
    echo "# KV_REST_API_URL=https://your-kv-instance.vercel-storage.com" >> .env.local
    echo "# KV_REST_API_TOKEN=your-kv-token" >> .env.local
    echo "# KV_REST_API_READ_ONLY_TOKEN=your-readonly-token" >> .env.local
    print_warning "Por favor, edita .env.local con tus variables de Vercel KV"
    exit 1
fi

# Verificar variables de entorno
print_status "Verificando variables de entorno..."

if grep -q "KV_REST_API_URL=" .env.local && ! grep -q "KV_REST_API_URL=https://your-kv-instance" .env.local; then
    print_success "KV_REST_API_URL configurada"
else
    print_error "KV_REST_API_URL no configurada o usando valor de ejemplo"
fi

if grep -q "KV_REST_API_TOKEN=" .env.local && ! grep -q "KV_REST_API_TOKEN=your-kv-token" .env.local; then
    print_success "KV_REST_API_TOKEN configurada"
else
    print_error "KV_REST_API_TOKEN no configurada o usando valor de ejemplo"
fi

# Verificar dependencias
print_status "Verificando dependencias..."

if npm list @vercel/kv > /dev/null 2>&1; then
    print_success "Dependencia @vercel/kv instalada"
else
    print_error "Dependencia @vercel/kv no encontrada"
    print_status "Instalando @vercel/kv..."
    npm install @vercel/kv
fi

# Verificar que el servidor puede iniciar
print_status "Verificando que el servidor puede iniciar..."

# Crear un script temporal para verificar
cat > temp_verify.js << 'EOF'
const { kv } = require('@vercel/kv');

async function verifyKV() {
    try {
        // Intentar una operación simple
        await kv.set('test-key', 'test-value', { ex: 10 });
        const value = await kv.get('test-key');
        
        if (value === 'test-value') {
            console.log('✅ Vercel KV conectado correctamente');
            await kv.del('test-key'); // Limpiar
            process.exit(0);
        } else {
            console.log('❌ Error en verificación de KV');
            process.exit(1);
        }
    } catch (error) {
        console.log('❌ Error conectando a Vercel KV:', error.message);
        process.exit(1);
    }
}

verifyKV();
EOF

# Ejecutar verificación
if node temp_verify.js; then
    print_success "Vercel KV está funcionando correctamente"
else
    print_error "Problema con la conexión a Vercel KV"
    print_status "Revisa tus variables de entorno en .env.local"
fi

# Limpiar archivo temporal
rm temp_verify.js

echo ""
print_status "Próximos pasos:"
echo "1. Ejecuta: npm run dev"
echo "2. Visita: http://localhost:3000/api/test-rate-limit"
echo "3. Revisa los logs del servidor para confirmar que Rate Limiting funciona"
echo ""

print_success "Verificación completada! 🛡️"

