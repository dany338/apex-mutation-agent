const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

/**
 * Genera un PDF con la revisión IA
 * @param {string} fileName - Nombre del archivo Apex
 * @param {string} reviewText - Comentario generado por IA
 */
function generatePDFReport({ repo, prNumber, fileName, reviewText }) {
  const doc = new PDFDocument();
  const date = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = fileName.replace(/\.(cls|trigger)/, "");

  const outputPath = path.join("mutations", `${baseName}-review-${date}.pdf`);
  const stream = fs.createWriteStream(outputPath);

  doc.pipe(stream);
  doc.fontSize(16).text(`AI Review for ${fileName}`, { underline: true });
  doc.moveDown().fontSize(12).text(reviewText);
  doc.end();

  console.log(`📄 PDF generado con generatePDFReport: ${outputPath}`);
}

module.exports = { generatePDFReport };
