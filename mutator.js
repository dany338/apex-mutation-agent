const fs = require("fs-extra");
const path = require("path");
const {
  apexFolderPath,
  backupFolderPath,
  mutationsFolderPath,
} = require("./config");

/**
 * Aplica mutaciones sobre una clase Apex.
 * @param {string} originalFileName - Ej: "DiscountCalculator.cls"
 * @param {string} originalContent - Contenido de la clase original
 * @param {Array<{original: string, mutated: string, description: string}>} mutations
 */
async function applyMutations(originalFileName, originalContent, mutations) {
  const baseName = path.basename(originalFileName, ".cls");

  // Backup original
  const backupPath = path.join(backupFolderPath, originalFileName);
  await fs.outputFile(backupPath, originalContent);

  const results = [];

  for (let i = 0; i < mutations.length; i++) {
    const { original, mutated, description, explanation } = mutations[i];
    const mutatedContent = originalContent.replace(
      original,
      `${mutated} // 📝 ${description} - 💥 ${explanation}`
    );

    const mutFileName = `${baseName}_mut${i + 1}.cls`;
    const mutPath = path.join(mutationsFolderPath, mutFileName);

    await fs.outputFile(mutPath, mutatedContent);

    results.push({
      file: mutFileName,
      description,
    });
  }

  return results;
}

module.exports = { applyMutations };
