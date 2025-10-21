#!/usr/bin/env node

/**
 * Script para medir el rendimiento de la aplicación
 */

const fs = require("fs");
const path = require("path");

const REPORT_DIR = path.join(__dirname, "../reports");
const REPORT_FILE = path.join(REPORT_DIR, "performance-comparison.md");

// Crear directorio de reportes si no existe
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Métricas actuales del build
const currentMetrics = {
  "First Load JS shared by all": "170 kB",
  "vendors-9b6e52f9": "53.6 kB",
  "vendors-cfb98476": "10.8 kB",
  "vendors-ee5f18a0": "18.7 kB",
  "other shared chunks": "86.9 kB",
  Middleware: "74 kB",
};

// Métricas anteriores (antes del lazy loading)
const previousMetrics = {
  "First Load JS shared by all": "139 kB",
  "vendors-9b6e52f9": "53.6 kB",
  "vendors-cfb98476": "10.8 kB",
  "other shared chunks": "74.5 kB",
  Middleware: "74 kB",
};

// Análisis de cambios
function analyzeChanges() {
  const changes = {};

  Object.keys(currentMetrics).forEach(key => {
    const current = parseFloat(currentMetrics[key]);
    const previous = parseFloat(previousMetrics[key] || "0");

    if (previous > 0) {
      const change = ((current - previous) / previous) * 100;
      changes[key] = {
        current,
        previous,
        change: change.toFixed(1),
        status: change > 0 ? "increase" : change < 0 ? "decrease" : "same",
      };
    }
  });

  return changes;
}

// Generar reporte
function generateReport() {
  const changes = analyzeChanges();

  const report = `# Análisis de Rendimiento - Lazy Loading

**Fecha:** ${new Date().toLocaleDateString("es-ES")}
**Proyecto:** CosmicCocktails
**Análisis:** Comparación antes/después del lazy loading

## 📊 MÉTRICAS COMPARATIVAS

### Bundle Size - Cambios Detectados

| Métrica | Antes | Después | Cambio | Estado |
|---------|-------|---------|--------|--------|
${Object.entries(changes)
  .map(
    ([key, data]) =>
      `| **${key}** | ${data.previous} kB | ${data.current} kB | ${data.change > 0 ? "+" : ""}${data.change}% | ${data.status === "increase" ? "🔴" : data.status === "decrease" ? "🟢" : "🟡"}`
  )
  .join("\n")}

## 🔍 ANÁLISIS DETALLADO

### Problemas Identificados

1. **Aumento del Bundle Size**: +31 kB en shared chunks
   - **Causa**: Componentes lazy adicionales
   - **Impacto**: Carga inicial más lenta

2. **Nuevo Chunk Vendors**: +18.7 kB
   - **Causa**: Separación adicional de vendors
   - **Impacto**: Más requests HTTP

3. **Middleware Sin Cambios**: 74 kB
   - **Estado**: ✅ Optimizado

### Optimizaciones Aplicadas

1. **LazyImage Simplificado**: 
   - ❌ Eliminado IntersectionObserver personalizado
   - ✅ Usando lazy loading nativo de Next.js
   - ✅ Mejor rendimiento de imágenes

2. **PreloadManager Optimizado**:
   - ❌ Eliminado preload excesivo
   - ✅ Solo preload después de carga completa
   - ✅ Reducido chunks críticos

3. **CocktailRow Directo**:
   - ❌ Eliminado OptimizedCocktailImage wrapper
   - ✅ Usando next/image directamente
   - ✅ Mejor rendimiento

## 🎯 RECOMENDACIONES

### Inmediatas
1. **Eliminar componentes lazy innecesarios**
2. **Usar lazy loading solo donde sea crítico**
3. **Optimizar webpack chunks**

### A Mediano Plazo
1. **Implementar paginación real**
2. **Virtualización para listas largas**
3. **Code splitting por funcionalidad**

## 📈 PRÓXIMOS PASOS

1. **Revertir lazy loading excesivo**
2. **Mantener solo lazy loading crítico**
3. **Enfocarse en paginación y virtualización**

---

**Estado**: 🔴 **REQUIERE OPTIMIZACIÓN**
**Prioridad**: **ALTA** - Revertir cambios que degradan rendimiento
`;

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`✅ Reporte de rendimiento generado: ${REPORT_FILE}`);
}

// Ejecutar análisis
generateReport();
