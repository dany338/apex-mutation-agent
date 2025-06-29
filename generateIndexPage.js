const fs = require("fs-extra");
const path = require("path");

const reportsDir = path.join(__dirname, "mutations");
const indexPath = path.join(reportsDir, "index.html");
const metricsPath = path.join(reportsDir, "mutant-metrics.json");

async function generateIndexPage() {
  const files = await fs.readdir(reportsDir);
  const htmlReports = files.filter(
    (f) => f.endsWith("_mutation_report.html") || f === "report.html"
  );

  const metrics = await fs.readJson(metricsPath);

  const reportLinks = htmlReports
    .sort(
      (a, b) =>
        fs.statSync(path.join(reportsDir, b)).mtimeMs -
        fs.statSync(path.join(reportsDir, a)).mtimeMs
    )
    .map((f) => {
      const date = new Date(
        fs.statSync(path.join(reportsDir, f)).mtime
      ).toLocaleString();
      return `<li><a href="${f}" target="_blank">${f}</a> <small>(${date})</small></li>`;
    })
    .join("\n");

  const classLabels = metrics.map((m) => m.file.replace(".cls", ""));
  const effectiveness = metrics.map((m) => m.effectiveness);
  const totalPassed = metrics.reduce((sum, m) => sum + m.passed, 0);
  const totalFailed = metrics.reduce((sum, m) => sum + m.failed, 0);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>📊 Reportes de Mutaciones</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: sans-serif; padding: 2rem; background: #f9f9f9; }
    h1 { font-size: 1.8rem; }
    ul { line-height: 1.8; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    canvas { max-width: 800px; margin: 2rem auto; display: block; }
  </style>
</head>
<body>
  <h1>📊 Reportes disponibles</h1>
  <ul>${reportLinks}</ul>

  <h2>📈 Efectividad por clase</h2>
  <canvas id="barChart"></canvas>

  <h2>🥧 Distribución global de pruebas</h2>
  <canvas id="pieChart"></canvas>

  <script>
    const barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(classLabels)},
        datasets: [{
          label: '% Efectividad',
          data: ${JSON.stringify(effectiveness)},
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: ['✅ Pasaron', '❌ Fallaron'],
        datasets: [{
          data: [${totalPassed}, ${totalFailed}],
          backgroundColor: ['#4caf50', '#f44336']
        }]
      },
      options: { responsive: true }
    });
  </script>
</body>
</html>
`;

  await fs.writeFile(indexPath, html);
  console.log(`✅ index.html con gráficas generado en: ${indexPath}`);
}

generateIndexPage();
