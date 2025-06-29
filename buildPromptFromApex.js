const fs = require("fs-extra");
const path = require("path");
const {
  apexFolderPath,
  basePromptPath,
  promptFolderPath,
} = require("./config");
const { detectApexClassType, getPromptTemplateFile } = require("./classUtils");

function findTestClass(apexFileName) {
  const baseName = path.basename(apexFileName, ".cls");
  const testName = `${baseName}Test.cls`;
  const testPath = path.join(apexFolderPath, testName); // en github repositorio privado como seria esta ruta?:
  // const testPathWithSubfolder = path.join(
  //   apexFolderPath,
  //   "test",
  //   testName
  // );
  return fs.existsSync(testPath) ? testPath : null;
}

async function buildPromptFromApex(apexFileName) {
  const apexPath = path.join(apexFolderPath, apexFileName);
  const testPath = findTestClass(apexFileName);
  if (!testPath) throw new Error(`❌ Test no encontrado para: ${apexFileName}`);

  const [apexCode, testCode] = await Promise.all([
    fs.readFile(apexPath, "utf8"),
    fs.readFile(testPath, "utf8"),
  ]);

  const classType = detectApexClassType(apexCode);
  const promptTemplateFile = getPromptTemplateFile(classType);
  const promptTemplatePath = path.join(promptFolderPath, promptTemplateFile);
  const basePrompt = await fs.readFile(promptTemplatePath, "utf8");

  return basePrompt
    .replace("===APEX_CLASS===", apexCode)
    .replace("===TEST_CLASS===", testCode);
}

module.exports = { buildPromptFromApex };
