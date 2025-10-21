#!/bin/bash

# =====================================================
# GENERADOR DE TIPOS DE SUPABASE
# Sprint 1.1.4 - Generar tipos de TypeScript desde Supabase
# =====================================================

set -e

echo "🔧 Generando tipos de Supabase..."

# Verificar que Supabase CLI está instalado
if ! command -v npx supabase &> /dev/null; then
    echo "❌ Supabase CLI no encontrado. Instalando..."
    npm install --save-dev supabase
fi

# Extraer project ID de la URL de Supabase
SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-"https://qpztyzhosqbmzptazlnx.supabase.co"}
PROJECT_ID=$(echo $SUPABASE_URL | sed 's/.*\/\/\([^.]*\)\..*/\1/')

echo "📡 Conectando a proyecto Supabase: $PROJECT_ID"

# Generar tipos de TypeScript
echo "⚡ Generando tipos desde la base de datos..."
npx supabase gen types typescript --project-id "$PROJECT_ID" > src/types/supabase.ts

# Verificar que el archivo se generó correctamente
if [ -f "src/types/supabase.ts" ]; then
    echo "✅ Tipos generados exitosamente en src/types/supabase.ts"
    
    # Mostrar estadísticas del archivo generado
    LINES=$(wc -l < src/types/supabase.ts)
    echo "📊 Líneas generadas: $LINES"
    
    # Verificar que contiene las tablas principales
    if grep -q "users" src/types/supabase.ts; then
        echo "✅ Tabla 'users' encontrada en tipos"
    else
        echo "⚠️  Tabla 'users' no encontrada en tipos"
    fi
    
    if grep -q "cocktails" src/types/supabase.ts; then
        echo "✅ Tabla 'cocktails' encontrada en tipos"
    else
        echo "⚠️  Tabla 'cocktails' no encontrada en tipos"
    fi
    
    if grep -q "orders" src/types/supabase.ts; then
        echo "✅ Tabla 'orders' encontrada en tipos"
    else
        echo "⚠️  Tabla 'orders' no encontrada en tipos"
    fi
    
else
    echo "❌ Error: No se pudo generar el archivo de tipos"
    exit 1
fi

echo "🎉 Generación de tipos completada!"
echo "📝 Próximo paso: Refactorizar código para usar tipos generados"
