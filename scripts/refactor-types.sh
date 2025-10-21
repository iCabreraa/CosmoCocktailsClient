#!/bin/bash

# =====================================================
# REFACTORIZADOR DE TIPOS SUPABASE
# Sprint 1.1.4 - Reemplazar 'as any' con tipos generados
# =====================================================

set -e

echo "🔧 Refactorizando código para usar tipos de Supabase..."

# Directorio base
BASE_DIR="/Users/devica/Work/CosmicCocktails/cosmo/cosmococktails-ecommerce/src"

# Función para reemplazar tipos en un archivo
refactor_file() {
    local file="$1"
    echo "📝 Procesando: $file"
    
    # Crear backup
    cp "$file" "$file.backup"
    
    # Reemplazos específicos por archivo
    case "$(basename "$file")" in
        "access-logger.ts")
            # Reemplazar (this.supabase as any) con tipos correctos
            sed -i '' 's/(this\.supabase as any)/(this.supabase)/g' "$file"
            ;;
        "user.repository.ts")
            # Reemplazar (this.supabase as any) con tipos correctos
            sed -i '' 's/(this\.supabase as any)/(this.supabase)/g' "$file"
            # Reemplazar (userData as any) con UserInsert
            sed -i '' 's/(userData as any)/(userData as UserInsert)/g' "$file"
            ;;
        "preferences/route.ts")
            # Reemplazar (supabase as any) con tipos correctos
            sed -i '' 's/(supabase as any)/(supabase)/g' "$file"
            ;;
        "signup/route.ts")
            # Reemplazar (supabase as any) con tipos correctos
            sed -i '' 's/(supabase as any)/(supabase)/g' "$file"
            # Reemplazar (role as any) con UserRole
            sed -i '' 's/(role as any)/(role as UserRole)/g' "$file"
            ;;
        "me/route.ts")
            # Reemplazar (user as any) con User
            sed -i '' 's/(user as any)/(user as User)/g' "$file"
            # Reemplazar (supabase as any) con tipos correctos
            sed -i '' 's/(supabase as any)/(supabase)/g' "$file"
            ;;
        "login/route.ts")
            # Reemplazar (user as any) con User
            sed -i '' 's/(user as any)/(user as User)/g' "$file"
            ;;
        "AddToCartButton.tsx")
            # Reemplazar (supabase as any) con tipos correctos
            sed -i '' 's/(supabase as any)/(supabase)/g' "$file"
            # Reemplazar (rawSizes as any\[\]) con CocktailSize[]
            sed -i '' 's/(rawSizes as any\[\])/(rawSizes as CocktailSize[])/g' "$file"
            # Reemplazar (sizeDetails as any) con Size[]
            sed -i '' 's/(sizeDetails as any)/(sizeDetails as Size[])/g' "$file"
            ;;
        "shop/page.tsx")
            # Reemplazar (cocktail: any) con Cocktail
            sed -i '' 's/(cocktail: any)/(cocktail: Cocktail)/g' "$file"
            # Reemplazar (supabase as any) con tipos correctos
            sed -i '' 's/(supabase as any)/(supabase)/g' "$file"
            ;;
        "audit.ts")
            # Reemplazar (this.supabase as any) con tipos correctos
            sed -i '' 's/(this\.supabase as any)/(this.supabase)/g' "$file"
            ;;
        "useClientData.ts")
            # Reemplazar (supabase as any) con tipos correctos
            sed -i '' 's/(supabase as any)/(supabase)/g' "$file"
            # Reemplazar (data as any) con ClientInsert
            sed -i '' 's/(data as any)/(data as ClientInsert)/g' "$file"
            ;;
        "create-order/route.ts")
            # Reemplazar (supabase as any) con tipos correctos
            sed -i '' 's/(supabase as any)/(supabase)/g' "$file"
            ;;
        "useProducts.ts")
            # Reemplazar (data as any\[\]) con tipos específicos
            sed -i '' 's/(data as any\[\])/(data as Cocktail[])/g' "$file"
            # Reemplazar (data as any) con tipos específicos
            sed -i '' 's/(data as any)/(data as Cocktail)/g' "$file"
            ;;
        "useInventory.ts")
            # Reemplazar (supabase as any) con tipos correctos
            sed -i '' 's/(supabase as any)/(supabase)/g' "$file"
            ;;
        "favorites/route.ts")
            # Reemplazar (supabase as any) con tipos correctos
            sed -i '' 's/(supabase as any)/(supabase)/g' "$file"
            ;;
        "users/route.ts")
            # Reemplazar (role as any) con UserRole
            sed -i '' 's/(role as any)/(role as UserRole)/g' "$file"
            # Reemplazar (status as any) con UserStatus
            sed -i '' 's/(status as any)/(status as UserStatus)/g' "$file"
            ;;
        "SortSelector.tsx")
            # Reemplazar (field as any) con string
            sed -i '' 's/(field as any)/(field as string)/g' "$file"
            # Reemplazar (direction as any) con string
            sed -i '' 's/(direction as any)/(direction as string)/g' "$file"
            ;;
        "CocktailFilters.tsx")
            # Reemplazar (alcoholLevel as any) con string
            sed -i '' 's/(alcoholLevel as any)/(alcoholLevel as string)/g' "$file"
            ;;
        "PerformanceDashboard.tsx")
            # Reemplazar (entry as any) con PerformanceEntry
            sed -i '' 's/(entry as any)/(entry as PerformanceEntry)/g' "$file"
            ;;
        "FavoriteButton.tsx")
            # Reemplazar (favoritesQuery.data as any\[\]) con UserFavorite[]
            sed -i '' 's/(favoritesQuery.data as any\[\])/(favoritesQuery.data as UserFavorite[])/g' "$file"
            ;;
    esac
    
    echo "✅ Refactorizado: $file"
}

# Archivos a refactorizar
FILES=(
    "$BASE_DIR/lib/security/access-logger.ts"
    "$BASE_DIR/lib/repositories/user.repository.ts"
    "$BASE_DIR/app/api/preferences/route.ts"
    "$BASE_DIR/app/api/signup/route.ts"
    "$BASE_DIR/app/api/me/route.ts"
    "$BASE_DIR/app/api/login/route.ts"
    "$BASE_DIR/components/cart/AddToCartButton.tsx"
    "$BASE_DIR/app/shop/page.tsx"
    "$BASE_DIR/lib/security/audit.ts"
    "$BASE_DIR/hooks/useClientData.ts"
    "$BASE_DIR/app/api/create-order/route.ts"
    "$BASE_DIR/hooks/queries/useProducts.ts"
    "$BASE_DIR/hooks/queries/useInventory.ts"
    "$BASE_DIR/app/api/favorites/route.ts"
    "$BASE_DIR/app/api/users/route.ts"
    "$BASE_DIR/components/filters/SortSelector.tsx"
    "$BASE_DIR/components/filters/CocktailFilters.tsx"
    "$BASE_DIR/components/performance/PerformanceDashboard.tsx"
    "$BASE_DIR/components/ui/FavoriteButton.tsx"
)

# Procesar cada archivo
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        refactor_file "$file"
    else
        echo "⚠️  Archivo no encontrado: $file"
    fi
done

echo "🎉 Refactorización completada!"
echo "📝 Próximo paso: Verificar que el build funciona correctamente"
