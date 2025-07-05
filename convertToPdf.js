const markdownpdf = require("markdown-pdf");
const fs = require("fs-extra");
const path = require("path");

const mutationsDir = path.join(__dirname, "mutations");

async function convertLatestMarkdownToPDF() {
  const files = await fs.readdir(mutationsDir);
  const latestMd = files
    .filter((f) => f.endsWith("_mutation_report.md"))
    .sort(
      (a, b) =>
        fs.statSync(path.join(mutationsDir, b)).mtimeMs -
        fs.statSync(path.join(mutationsDir, a)).mtimeMs
    )[0];

  if (!latestMd) {
    console.error("❌ No se encontró ningún archivo de reporte Markdown.");
    return;
  }

  const inputPath = path.join(mutationsDir, latestMd);
  const outputPath = path.join(mutationsDir, latestMd.replace(".md", ".pdf"));

  markdownpdf()
    .from(inputPath)
    .to(outputPath, () => {
      console.log(`📄 Reporte PDF generado: ${outputPath}`);
    });
}

// convertLatestMarkdownToPDF();

module.exports = {
  convertLatestMarkdownToPDF,
};
