# 📁 Scripts de CosmoCocktails

## 🎯 **Scripts Activos (Sprint 1.1)**

### **📂 01-sprint-1.1/ - Sistema de Roles y Autenticación**

- `install-role-sync.sql` - **PRINCIPAL** - Instala todo el sistema de sincronización de roles
- `test-role-sync.sql` - Tests de integración para verificar sincronización
- `consolidate-users-table-final.sql` - **PRINCIPAL** - Consolida tablas de usuarios (users_new → users)
- `verify-users-consolidation.sql` - Verifica que la consolidación fue exitosa

---

## 🗂️ **Scripts por Categoría**

### **📂 02-database/ - Base de Datos**

- `add-stock-column.sql` - Añade columna de stock
- `check-database-structure.js` - Verifica estructura de BD
- `fix-database-schema.sql` - Corrige esquema de BD
- `fix-orders-foreign-key.sql` - Corrige claves foráneas de pedidos

### **📂 03-users/ - Usuarios**

- `create-test-users.sql` - Crea usuarios de prueba
- `create-user-favorites-final.sql` - Crea tabla de favoritos
- `create-user-favorites.sql` - Crea tabla de favoritos (versión anterior)
- `create-user-preferences.sql` - Crea tabla de preferencias

### **📂 04-products/ - Productos**

- `get-real-cocktails.js` - Obtiene cócteles reales
- `insert-cocktail-prices.sql` - Inserta precios de cócteles
- `insert-prices-real.js` - Inserta precios reales
- `insert-prices-supabase.sql` - Inserta precios en Supabase
- `insert-prices.js` - Inserta precios (versión genérica)

### **📂 05-inventory/ - Inventario**

- `initialize-stock.js` - Inicializa stock
- `force-update-stock.js` - Fuerza actualización de stock
- `update-stock-service-role.js` - Actualiza stock con service role

### **📂 06-orders/ - Pedidos**

- `check-orders-table.sql` - Verifica tabla de pedidos
- `fix-orders-table.js` - Corrige tabla de pedidos (JS)
- `fix-orders-table.sql` - Corrige tabla de pedidos (SQL)
- `test-orders-insert.js` - Test de inserción de pedidos

### **📂 07-performance/ - Performance**

- `analyze-lazy-loading.js` - Analiza lazy loading
- `measure-performance.js` - Mide rendimiento
- `performance-analysis.js` - Análisis de rendimiento

### **📂 08-testing/ - Testing**

- `test-autofill-logged-user.js` - Test de autocompletado
- `test-client-autofill.js` - Test de autocompletado cliente
- `check-cocktails.js` - Verifica cócteles
- `check-user-preferences.sql` - Verifica preferencias

### **📂 09-deprecated/ - Scripts Obsoletos**

- `fix-database-ids.js` - Script obsoleto para corregir IDs

---

## 🚀 **Instrucciones de Uso**

### **Para Sprint 1.1 (Sistema de Roles)**

```bash
# Ejecutar en Supabase SQL Editor
\i scripts/01-sprint-1.1/install-role-sync.sql
\i scripts/01-sprint-1.1/consolidate-users-table-final.sql
\i scripts/01-sprint-1.1/verify-users-consolidation.sql
```

### **Para Desarrollo**

- Usar scripts de la carpeta correspondiente según necesidad
- Los scripts de testing están en `08-testing/`
- Los scripts de performance están en `07-performance/`

---

## 📝 **Notas**

- Los scripts en `01-sprint-1.1/` son los únicos necesarios para el Sprint 1.1
- Los scripts obsoletos están en `09-deprecated/` para referencia histórica
- Siempre hacer backup antes de ejecutar scripts de migración
- La estructura está organizada por funcionalidad para facilitar el mantenimiento
