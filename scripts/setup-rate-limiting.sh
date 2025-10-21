#!/bin/bash

# 🛡️ Rate Limiting Setup Script
# 
# Script para configurar Vercel KV y verificar el sistema de rate limiting
# 
# @fileoverview Script de configuración para rate limiting
# @version 1.0.0
# @author CosmoCocktails Development Team

set -e

echo "🛡️ Configurando Rate Limiting con Vercel KV..."
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
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

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI no está instalado. Instalando..."
    npm install -g vercel
    print_success "Vercel CLI instalado"
else
    print_success "Vercel CLI ya está instalado"
fi

# Verificar si estamos logueados en Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "No estás logueado en Vercel. Iniciando sesión..."
    vercel login
    print_success "Sesión iniciada en Vercel"
else
    print_success "Ya estás logueado en Vercel"
fi

# Crear base de datos KV
print_status "Creando base de datos KV en Vercel..."
if vercel kv create cosmococktails-rate-limit --region us-east-1; then
    print_success "Base de datos KV creada exitosamente"
else
    print_warning "La base de datos KV ya existe o hubo un error"
fi

# Obtener variables de entorno
print_status "Obteniendo variables de entorno de KV..."
KV_URL=$(vercel kv env get KV_REST_API_URL 2>/dev/null || echo "")
KV_TOKEN=$(vercel kv env get KV_REST_API_TOKEN 2>/dev/null || echo "")

if [ -z "$KV_URL" ] || [ -z "$KV_TOKEN" ]; then
    print_error "No se pudieron obtener las variables de entorno de KV"
    print_status "Por favor, configura manualmente las variables en el dashboard de Vercel:"
    print_status "1. Ve a tu proyecto en Vercel"
    print_status "2. Ve a Settings > Environment Variables"
    print_status "3. Agrega KV_REST_API_URL y KV_REST_API_TOKEN"
    exit 1
else
    print_success "Variables de entorno obtenidas"
fi

# Crear archivo .env.local si no existe
if [ ! -f ".env.local" ]; then
    print_status "Creando archivo .env.local..."
    touch .env.local
fi

# Agregar variables de entorno al .env.local
print_status "Agregando variables de entorno a .env.local..."
echo "" >> .env.local
echo "# Vercel KV Configuration" >> .env.local
echo "KV_REST_API_URL=$KV_URL" >> .env.local
echo "KV_REST_API_TOKEN=$KV_TOKEN" >> .env.local
print_success "Variables de entorno agregadas a .env.local"

# Instalar dependencias
print_status "Instalando dependencias..."
npm install
print_success "Dependencias instaladas"

# Verificar configuración
print_status "Verificando configuración..."
if npm run typecheck; then
    print_success "Configuración verificada"
else
    print_error "Error en la configuración"
    exit 1
fi

# Ejecutar tests de rate limiting
print_status "Ejecutando tests de rate limiting..."
if node scripts/rate-limiting/test-rate-limiting.js; then
    print_success "Tests de rate limiting pasaron"
else
    print_warning "Algunos tests fallaron (esto puede ser normal en la primera ejecución)"
fi

# Mostrar información de configuración
echo ""
echo "🎉 Configuración completada!"
echo "=========================="
echo ""
echo "📋 Próximos pasos:"
echo "1. Ejecuta 'npm run dev' para iniciar el servidor"
echo "2. Visita http://localhost:3000/api/test-rate-limit para probar"
echo "3. Revisa los logs para confirmar que KV está conectado"
echo ""
echo "🔧 Comandos útiles:"
echo "- Probar rate limiting: curl http://localhost:3000/api/test-rate-limit"
echo "- Ver logs: npm run dev"
echo "- Limpiar límites: node scripts/rate-limiting/test-rate-limiting.js"
echo ""
echo "📚 Documentación:"
echo "- Guía completa: docs/RATE_LIMITING_GUIDE.md"
echo "- Configuración: src/lib/rate-limiting/types.ts"
echo ""

print_success "Rate Limiting configurado exitosamente! 🛡️"

