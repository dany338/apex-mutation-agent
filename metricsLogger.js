const fs = require("fs-extra");
const path = require("path");

const historyPath = path.join("mutations", "mutation-history.md");
const metricsPath = path.join("mutations", "mutant-metrics.md");
const jsonPath = path.join("mutations", "mutant-metrics.json");

async function appendToMutationHistory(date, fileName, passed, failed) {
  const line = `- [${date}] ${fileName} → ${
    passed + failed
  } mutaciones → ${passed} pasaron ✅, ${failed} fallaron ❌\n`;
  await fs.appendFile(historyPath, line);
}

async function updateMutantMetrics(allResults) {
  const lines = [
    "# 📊 Métricas de Mutaciones\n",
    "| Clase | Mutaciones | Pasaron ✅ | Fallaron ❌ | % Efectividad |",
    "|-------|------------|-----------|-------------|----------------|",
  ];

  const jsonData = [];

  allResults.forEach(({ fileName, passed, failed, date }) => {
    const total = passed + failed;
    const effectiveness = total === 0 ? 0 : Math.round((failed / total) * 100);
    lines.push(
      `| ${fileName} | ${total} | ${passed} | ${failed} | ${effectiveness}% |`
    );

    jsonData.push({
      file: fileName,
      date,
      mutations: total,
      passed,
      failed,
      effectiveness,
    });
  });

  await fs.writeFile(metricsPath, lines.join("\n"));
  await fs.writeJson(jsonPath, jsonData, { spaces: 2 });
}

module.exports = {
  appendToMutationHistory,
  updateMutantMetrics,
};
