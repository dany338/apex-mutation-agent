const fs = require("fs-extra");
const path = require("path");

const jsonPath = path.join("mutations", "mutant-metrics.json");
const htmlPath = path.join("mutations", "report.html");
const csvPath = path.join("mutations", "report.csv");

async function exportMetrics() {
  const data = await fs.readJson(jsonPath);

  // HTML
  const htmlRows = data
    .map(
      (d) => `
      <tr>
        <td>${d.file}</td>
        <td>${d.date}</td>
        <td>${d.mutations}</td>
        <td>${d.passed}</td>
        <td>${d.failed}</td>
        <td>${d.effectiveness}%</td>
      </tr>`
    )
    .join("\n");

  const htmlContent = `
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Mutant Metrics Report</title>
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 8px; border: 1px solid #ccc; text-align: center; }
        th { background-color: #f5f5f5; }
      </style>
    </head>
    <body>
      <h2>📊 Mutant Metrics Report</h2>
      <table>
        <tr>
          <th>Clase</th><th>Fecha</th><th>Mutaciones</th><th>Pasaron ✅</th><th>Fallaron ❌</th><th>% Efectividad</th>
        </tr>
        ${htmlRows}
      </table>
    </body>
    </html>
  `;

  await fs.outputFile(htmlPath, htmlContent);

  // CSV
  const csvRows = [
    "Clase,Fecha,Mutaciones,Pasaron,Fallaron,Efectividad (%)",
    ...data.map(
      (d) =>
        `${d.file},${d.date},${d.mutations},${d.passed},${d.failed},${d.effectiveness}`
    ),
  ];

  await fs.outputFile(csvPath, csvRows.join("\n"));

  console.log("✅ Reportes generados:");
  console.log(`- HTML: ${htmlPath}`);
  console.log(`- CSV:  ${csvPath}`);
}

// exportMetrics();
module.exports = {
  exportMetrics,
};
