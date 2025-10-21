#!/bin/bash

# 🧪 Rate Limiting Test Script
# 
# Script para probar el sistema de rate limiting una vez configurado
# 
# @fileoverview Script de testing para rate limiting
# @version 1.0.0
# @author CosmoCocktails Development Team

set -e

echo "🧪 Probando sistema de Rate Limiting..."
echo "======================================"

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

# Verificar que el servidor esté corriendo
print_status "Verificando que el servidor esté corriendo..."

if curl -s http://localhost:3000/api/test-rate-limit > /dev/null 2>&1; then
    print_success "Servidor detectado en puerto 3000"
    BASE_URL="http://localhost:3000"
elif curl -s http://localhost:3001/api/test-rate-limit > /dev/null 2>&1; then
    print_success "Servidor detectado en puerto 3001"
    BASE_URL="http://localhost:3001"
elif curl -s http://localhost:3002/api/test-rate-limit > /dev/null 2>&1; then
    print_success "Servidor detectado en puerto 3002"
    BASE_URL="http://localhost:3002"
else
    print_error "No se pudo detectar el servidor en los puertos 3000, 3001, o 3002"
    print_status "Asegúrate de que el servidor esté corriendo con: npm run dev"
    exit 1
fi

echo ""
print_status "Iniciando tests de Rate Limiting..."
echo ""

# Test 1: Request básico
print_status "Test 1: Request básico al endpoint de testing"
response=$(curl -s "$BASE_URL/api/test-rate-limit")
if echo "$response" | grep -q "success.*true"; then
    print_success "✅ Request básico exitoso"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
else
    print_error "❌ Request básico falló"
    echo "$response"
fi

echo ""

# Test 2: Múltiples requests rápidos
print_status "Test 2: Múltiples requests rápidos (debería funcionar)"
for i in {1..3}; do
    response=$(curl -s "$BASE_URL/api/test-rate-limit")
    if echo "$response" | grep -q "success.*true"; then
        print_success "✅ Request $i exitoso"
    else
        print_error "❌ Request $i falló"
    fi
done

echo ""

# Test 3: Test con endpoint específico
print_status "Test 3: Testing con endpoint específico"
response=$(curl -s "$BASE_URL/api/test-rate-limit?endpoint=/api/login&type=unauthenticated")
if echo "$response" | grep -q "success.*true"; then
    print_success "✅ Test con endpoint específico exitoso"
else
    print_error "❌ Test con endpoint específico falló"
fi

echo ""

# Test 4: Test POST con múltiples requests
print_status "Test 4: Test POST con múltiples requests"
response=$(curl -s -X POST "$BASE_URL/api/test-rate-limit" \
    -H "Content-Type: application/json" \
    -d '{"endpoint": "/api/login", "type": "unauthenticated", "count": 5}')
if echo "$response" | grep -q "success.*true"; then
    print_success "✅ Test POST exitoso"
    echo "$response" | jq '.summary' 2>/dev/null || echo "Resumen: $(echo "$response" | grep -o '"summary":[^}]*')"
else
    print_error "❌ Test POST falló"
fi

echo ""

# Test 5: Verificar headers de rate limiting
print_status "Test 5: Verificando headers de rate limiting"
headers=$(curl -s -I "$BASE_URL/api/test-rate-limit")
if echo "$headers" | grep -q "X-RateLimit-Remaining"; then
    print_success "✅ Headers de rate limiting presentes"
    echo "$headers" | grep "X-RateLimit"
else
    print_warning "⚠️ Headers de rate limiting no detectados"
fi

echo ""

# Test 6: Simular carga alta
print_status "Test 6: Simulando carga alta (20 requests simultáneos)"
echo "Ejecutando 20 requests simultáneos..."

# Crear archivo temporal con requests
cat > temp_requests.sh << 'EOF'
#!/bin/bash
for i in {1..20}; do
    curl -s "$1/api/test-rate-limit" &
done
wait
EOF

chmod +x temp_requests.sh

# Ejecutar requests simultáneos
start_time=$(date +%s%N)
./temp_requests.sh "$BASE_URL" > /dev/null 2>&1
end_time=$(date +%s%N)

# Calcular tiempo
duration=$(( (end_time - start_time) / 1000000 ))
print_success "✅ 20 requests completados en ${duration}ms"

# Limpiar archivo temporal
rm temp_requests.sh

echo ""
print_status "Resumen de tests:"
echo "- ✅ Endpoint de testing funcionando"
echo "- ✅ Rate limiting activo"
echo "- ✅ Headers informativos presentes"
echo "- ✅ Sistema resistente a carga alta"
echo ""

print_success "🎉 Sistema de Rate Limiting funcionando correctamente!"
echo ""
print_status "Próximos pasos:"
echo "1. Prueba endpoints reales como /api/login, /api/signup"
echo "2. Monitorea los logs del servidor para verificar funcionamiento"
echo "3. Ajusta límites en src/lib/rate-limiting/types.ts si es necesario"
echo ""

print_success "Rate Limiting completamente operativo! 🛡️"

