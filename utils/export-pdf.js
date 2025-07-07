const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");

function exportReviewToPdf({ repo, prNumber, fileName, reviewText }) {
  const doc = new PDFDocument();
  const outputDir = path.join("mutations", repo, `${prNumber}`);
  const outputPath = path.join(outputDir, `${fileName}.pdf`);
  console.log("🚀 ~ exportReviewToPdf ~ outputDir:", outputDir);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  doc.fontSize(16).text(`💡 Revisión IA`, { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`🗂 Repositorio: ${repo}`);
  doc.text(`🔢 PR: #${prNumber}`);
  doc.text(`📄 Archivo: ${fileName}`);
  doc.moveDown();
  doc.text(`🧠 Comentario IA:\n\n${reviewText}`, {
    width: 500,
    align: "left",
  });

  doc.end();
  console.log(`📄 PDF generado con exportReviewToPdf: ${outputPath}`);
}

module.exports = { exportReviewToPdf };
