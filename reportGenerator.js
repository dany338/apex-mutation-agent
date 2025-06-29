const fs = require("fs-extra");
const path = require("path");

async function generateMutationReport(className, mutationResults) {
  const baseName = className.replace(".cls", "");
  const reportPath = path.join("mutations", `${baseName}_mutation_report.md`);

  const lines = [];
  lines.push(`# 🧬 Reporte de Mutaciones - ${baseName}`);
  lines.push("");
  lines.push(`Fecha: ${new Date().toLocaleString()}`);
  lines.push("");
  lines.push(
    "| # | Archivo Mutado | Descripción | Resultado del Test | Recomendación |"
  );
  lines.push(
    "|---|----------------|-------------|---------------------|---------------|"
  );

  mutationResults.forEach((res, index) => {
    const passed = res.passed;
    const outcome = passed ? "✅ Pasó" : "❌ Falló";
    const advice = passed
      ? "🔴 Test débil, mejorar cobertura"
      : "🟢 Test válido";

    lines.push(
      `| ${index + 1} | ${res.file} | ${
        res.description
      } | ${outcome} | ${advice} |`
    );
  });

  await fs.outputFile(reportPath, lines.join("\n"));
  return reportPath;
}

module.exports = { generateMutationReport };
