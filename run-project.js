#!/usr/bin/env node

const path = require("path");
const fs = require("fs-extra");
const simpleGit = require("simple-git");
const { buildPromptFromApex } = require("./buildPrompt");
const { sendPromptToOpenAI } = require("./openaiClient");
const { parseMutationsFromText } = require("./mutationParser");
const { applyMutations } = require("./mutator");
const { runTestAgainstMutation } = require("./testRunner");
const { generateMutationReport } = require("./reportGenerator");
const {
  appendToMutationHistory,
  updateMutantMetrics,
} = require("./metricsLogger");

const APEX_CLASSES_DIR = path.resolve(
  "../DiscountCalculatorApp/force-app/main/default/classes"
);
const apexFolderPath = path.resolve("./apex");

const copyApexFileToLocal = async (fileName) => {
  const src = path.join(APEX_CLASSES_DIR, fileName);
  const dest = path.join(apexFolderPath, fileName);
  await fs.copy(src, dest);
};

async function getModifiedApexFiles(baseRef = "origin/main", headRef = "HEAD") {
  const git = simpleGit(path.resolve("../DiscountCalculatorApp"));
  // Asegúrate de tener el último fetch del repo remoto
  await git.fetch();
  // const result = await git.diff(["--name-only", "HEAD"]);
  // Detecta archivos .cls modificados entre origin/main y HEAD
  // const result = await git.diff(["--name-only", `${baseRef}`, `${headRef}`]);
  const result = await git.diff(["--name-only", "HEAD~1", "HEAD"]);
  return result
    .split("\n")
    .filter((f) => f.includes("classes/") && f.endsWith(".cls")) // Aca no incluir los archivos terminados en Test.cls como seria esto:
    .filter((f) => !f.endsWith("Test.cls")) // Excluir archivos de test
    .map((f) => path.basename(f));
}

async function runProject() {
  console.log(`🔍 Buscando clases modificadas en: ${APEX_CLASSES_DIR}\n`);
  const modifiedFiles = await getModifiedApexFiles();

  if (modifiedFiles.length === 0) {
    console.log("✅ No se detectaron clases modificadas.");
    return;
  }
  const metrics = [];
  for (const file of modifiedFiles) {
    const testFile = file.replace(".cls", "Test.cls");
    const exists = await fs.pathExists(path.join(APEX_CLASSES_DIR, testFile));

    if (!exists) {
      console.warn(`⚠️ No se encontró clase de test para ${file}, se omite.\n`);
      continue;
    }

    // Copiar ambos archivos al agente
    await copyApexFileToLocal(file);
    await copyApexFileToLocal(testFile);

    try {
      console.log(`🚀 Procesando: ${file}`);
      const prompt = await buildPromptFromApex(file);
      const openaiResponse = await sendPromptToOpenAI(prompt);
      const mutations = parseMutationsFromText(openaiResponse);
      const originalContent = await fs.readFile(
        path.join(apexFolderPath, file),
        "utf8"
      );
      const mutationFiles = await applyMutations(
        file,
        originalContent,
        mutations
      );

      const testResults = [];
      for (const m of mutationFiles) {
        const result = await runTestAgainstMutation(
          file.replace(".cls", ""),
          testFile.replace(".cls", ""),
          m.file
        );
        testResults.push({ ...m, passed: result.passed });
      }

      await generateMutationReport(file, testResults);
      console.log(`📄 Reporte listo para ${file}\n`);

      const passed = testResults.filter((r) => r.passed).length;
      const failed = testResults.length - passed;
      const now = new Date().toLocaleString();

      await appendToMutationHistory(now, file, passed, failed);

      metrics.push({
        fileName: file,
        passed,
        failed,
        date: now,
      });
    } catch (err) {
      console.error(`❌ Error al procesar ${file}:`, err.message);
    }
  }
  await updateMutantMetrics(metrics);
}

runProject();
