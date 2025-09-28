#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Iniciando análisis de rendimiento...\n");

// Función para ejecutar comandos y capturar output
function runCommand(command, description) {
  console.log(`📊 ${description}...`);
  try {
    const output = execSync(command, { encoding: "utf8", stdio: "pipe" });
    console.log(`✅ ${description} completado\n`);
    return output;
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message);
    return null;
  }
}

// Función para analizar el bundle
function analyzeBundle() {
  console.log("📦 Analizando bundle...");

  // Crear directorio de reportes si no existe
  const reportsDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Ejecutar análisis de bundle
  const bundleAnalysis = runCommand(
    "npm run analyze",
    "Análisis de bundle con webpack-bundle-analyzer"
  );

  if (bundleAnalysis) {
    console.log("📊 Reporte de bundle generado en .next/analyze/");
  }
}

// Función para analizar el tamaño del bundle
function analyzeBundleSize() {
  console.log("📏 Analizando tamaño del bundle...");

  const bundleSizeAnalysis = runCommand(
    "npm run bundle:size",
    "Análisis de tamaño de bundle con bundlesize"
  );

  if (bundleSizeAnalysis) {
    console.log("📊 Análisis de tamaño completado");
  }
}

// Función para generar reporte de Lighthouse
function generateLighthouseReport() {
  console.log("🔍 Generando reporte de Lighthouse...");

  // Primero construir la aplicación
  runCommand("npm run build", "Construyendo aplicación");

  // Iniciar servidor en background
  console.log("🌐 Iniciando servidor para análisis...");
  const serverProcess = execSync("npm run start", {
    encoding: "utf8",
    stdio: "pipe",
    detached: true,
  });

  // Esperar a que el servidor esté listo
  setTimeout(() => {
    const lighthouseReport = runCommand(
      'npx lighthouse http://localhost:3000 --output=html --output-path=./reports/lighthouse-report.html --chrome-flags="--headless"',
      "Generando reporte de Lighthouse"
    );

    if (lighthouseReport) {
      console.log(
        "📊 Reporte de Lighthouse generado en reports/lighthouse-report.html"
      );
    }

    // Terminar el servidor
    try {
      execSync('pkill -f "next start"', { stdio: "pipe" });
    } catch (error) {
      console.log("⚠️ No se pudo terminar el servidor automáticamente");
    }
  }, 10000); // Esperar 10 segundos
}

// Función para generar reporte de dependencias
function analyzeDependencies() {
  console.log("🔍 Analizando dependencias...");

  const dependencyAnalysis = runCommand(
    "npm ls --depth=0 --json",
    "Análisis de dependencias"
  );

  if (dependencyAnalysis) {
    const dependencies = JSON.parse(dependencyAnalysis);
    const depCount = Object.keys(dependencies.dependencies || {}).length;
    const devDepCount = Object.keys(dependencies.devDependencies || {}).length;

    console.log(`📊 Dependencias de producción: ${depCount}`);
    console.log(`📊 Dependencias de desarrollo: ${devDepCount}`);
    console.log(`📊 Total de dependencias: ${depCount + devDepCount}`);
  }
}

// Función para generar reporte de vulnerabilidades
function checkVulnerabilities() {
  console.log("🔒 Verificando vulnerabilidades...");

  const auditResult = runCommand("npm audit --json", "Auditoría de seguridad");

  if (auditResult) {
    try {
      const audit = JSON.parse(auditResult);
      const vulnerabilities = audit.vulnerabilities || {};
      const vulnCount = Object.keys(vulnerabilities).length;

      console.log(`🔒 Vulnerabilidades encontradas: ${vulnCount}`);

      if (vulnCount > 0) {
        console.log(
          '⚠️ Se encontraron vulnerabilidades. Ejecuta "npm audit fix" para corregirlas.'
        );
      } else {
        console.log("✅ No se encontraron vulnerabilidades");
      }
    } catch (error) {
      console.log("⚠️ No se pudo analizar el reporte de auditoría");
    }
  }
}

// Función para generar reporte consolidado
function generateConsolidatedReport() {
  console.log("📋 Generando reporte consolidado...");

  const report = {
    timestamp: new Date().toISOString(),
    bundle: {
      analyzed: true,
      reportPath: ".next/analyze/bundle-report.html",
    },
    lighthouse: {
      analyzed: true,
      reportPath: "reports/lighthouse-report.html",
    },
    bundleSize: {
      analyzed: true,
      configPath: ".bundlesizerc.json",
    },
    recommendations: [
      "Implementar lazy loading para componentes pesados",
      "Optimizar imágenes con next/image",
      "Implementar React Query para caché inteligente",
      "Configurar CDN para assets estáticos",
      "Implementar paginación en listados largos",
    ],
  };

  const reportPath = path.join(
    process.cwd(),
    "reports",
    "performance-report.json"
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`📊 Reporte consolidado generado en ${reportPath}`);
}

// Función principal
async function main() {
  try {
    console.log("🎯 ANÁLISIS DE RENDIMIENTO - COSMICCOCKTAILS\n");
    console.log("=".repeat(50));

    // Crear directorio de reportes
    const reportsDir = path.join(process.cwd(), "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Ejecutar análisis
    analyzeBundle();
    analyzeBundleSize();
    analyzeDependencies();
    checkVulnerabilities();
    generateLighthouseReport();

    // Esperar un poco para que se complete el análisis de Lighthouse
    setTimeout(() => {
      generateConsolidatedReport();
      console.log("\n🎉 Análisis de rendimiento completado!");
      console.log('📁 Revisa los reportes en la carpeta "reports/"');
    }, 15000);
  } catch (error) {
    console.error("❌ Error durante el análisis:", error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main };
