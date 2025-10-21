#!/bin/bash

# Script de Verificación Final de Rate Limiting
# Verifica que todo el sistema esté funcionando correctamente

echo "🔍 Verificación Final del Sistema de Rate Limiting"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar estado
show_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

echo ""
echo "📋 Verificando configuración..."

# 1. Verificar variables de entorno
echo ""
echo "🔧 Variables de entorno:"
if [ -f ".env.local" ]; then
    show_status 0 "Archivo .env.local encontrado"
    
    if grep -q "KV_REST_API_URL" .env.local; then
        show_status 0 "KV_REST_API_URL configurada"
    else
        show_status 1 "KV_REST_API_URL no encontrada"
    fi
    
    if grep -q "KV_REST_API_TOKEN" .env.local; then
        show_status 0 "KV_REST_API_TOKEN configurado"
    else
        show_status 1 "KV_REST_API_TOKEN no encontrado"
    fi
else
    show_status 1 "Archivo .env.local no encontrado"
fi

# 2. Verificar servidor
echo ""
echo "🌐 Servidor de desarrollo:"
if curl -s http://localhost:3000/api/verify-kv-config > /dev/null 2>&1; then
    show_status 0 "Servidor ejecutándose en puerto 3000"
else
    show_status 1 "Servidor no accesible en puerto 3000"
fi

# 3. Verificar configuración KV
echo ""
echo "🗄️ Configuración Vercel KV:"
kv_response=$(curl -s http://localhost:3000/api/verify-kv-config 2>/dev/null)
if echo "$kv_response" | grep -q "success"; then
    show_status 0 "Vercel KV configurado correctamente"
else
    show_status 1 "Vercel KV no configurado"
fi

# 4. Verificar rate limiting básico
echo ""
echo "🛡️ Rate Limiting básico:"
rate_response=$(curl -s http://localhost:3000/api/test-rate-limit 2>/dev/null)
if echo "$rate_response" | grep -q "allowed.*true"; then
    show_status 0 "Rate limiting funcionando"
else
    show_status 1 "Rate limiting no funcionando"
fi

# 5. Verificar middleware
echo ""
echo "🔒 Middleware de seguridad:"
middleware_response=$(curl -s -I http://localhost:3000/ 2>/dev/null)
if echo "$middleware_response" | grep -qi "x-frame-options"; then
    show_status 0 "Headers de seguridad activos"
else
    show_status 1 "Headers de seguridad no encontrados"
fi

# 6. Verificar scripts de testing
echo ""
echo "🧪 Scripts de testing:"
if [ -f "scripts/test-rate-limiting-endpoints.js" ]; then
    show_status 0 "Script de testing GET encontrado"
else
    show_status 1 "Script de testing GET no encontrado"
fi

if [ -f "scripts/test-rate-limiting-post.js" ]; then
    show_status 0 "Script de testing POST encontrado"
else
    show_status 1 "Script de testing POST no encontrado"
fi

# 7. Resumen final
echo ""
echo "📊 RESUMEN FINAL:"
echo "================="

# Contar verificaciones exitosas
total_checks=0
passed_checks=0

# Variables de entorno
if [ -f ".env.local" ] && grep -q "KV_REST_API_URL" .env.local && grep -q "KV_REST_API_TOKEN" .env.local; then
    ((passed_checks++))
fi
((total_checks++))

# Servidor
if curl -s http://localhost:3000/api/verify-kv-config > /dev/null 2>&1; then
    ((passed_checks++))
fi
((total_checks++))

# KV Config
if curl -s http://localhost:3000/api/verify-kv-config | grep -q "success"; then
    ((passed_checks++))
fi
((total_checks++))

# Rate Limiting
if curl -s http://localhost:3000/api/test-rate-limit | grep -q "allowed.*true"; then
    ((passed_checks++))
fi
((total_checks++))

# Middleware
if curl -s -I http://localhost:3000/ | grep -qi "x-frame-options"; then
    ((passed_checks++))
fi
((total_checks++))

# Scripts
if [ -f "scripts/test-rate-limiting-endpoints.js" ] && [ -f "scripts/test-rate-limiting-post.js" ]; then
    ((passed_checks++))
fi
((total_checks++))

echo ""
echo -e "${BLUE}Verificaciones completadas: $passed_checks/$total_checks${NC}"

if [ $passed_checks -eq $total_checks ]; then
    echo -e "${GREEN}🎉 ¡SISTEMA COMPLETAMENTE OPERATIVO!${NC}"
    echo ""
    echo "📝 Próximos pasos recomendados:"
    echo "   1. Probar en producción"
    echo "   2. Monitorear logs de rate limiting"
    echo "   3. Ajustar límites según uso real"
    echo "   4. Documentar configuración"
else
    echo -e "${YELLOW}⚠️ Sistema parcialmente operativo${NC}"
    echo ""
    echo "🔧 Acciones recomendadas:"
    echo "   1. Revisar verificaciones fallidas"
    echo "   2. Reiniciar servidor si es necesario"
    echo "   3. Verificar configuración de variables"
fi

echo ""
echo "🔧 Comandos útiles:"
echo "   npm run dev                                    - Iniciar servidor"
echo "   ./scripts/verify-kv-config.sh                  - Verificar KV"
echo "   node scripts/test-rate-limiting-endpoints.js   - Test GET"
echo "   node scripts/test-rate-limiting-post.js       - Test POST"
echo "   curl http://localhost:3000/api/verify-kv-config - Verificar via API"
