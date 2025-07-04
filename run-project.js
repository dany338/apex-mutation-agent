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
const {
  apexFolderPath,
  apexFolderProject,
  apexFolderApex,
} = require("./config");

// const apexFolderPath = path.resolve("./apex");

function isTriggerFile(filePath) {
  return filePath.endsWith(".trigger");
}

const copyApexFileToLocal = async (fileName) => {
  const src = path.join(apexFolderPath, fileName);
  const dest = path.join(apexFolderApex, fileName);
  await fs.copy(src, dest);
};

async function getModifiedApexFiles(baseRef = "origin/main", headRef = "HEAD") {
  const git = simpleGit(path.resolve(apexFolderProject));
  // Asegúrate de tener el último fetch del repo remoto
  await git.fetch();
  // const result = await git.diff(["--name-only", "HEAD"]);
  // Detecta archivos .cls modificados entre origin/main y HEAD
  // const result = await git.diff(["--name-only", `${baseRef}`, `${headRef}`]);
  const result = await git.diff(["--name-only", "HEAD~1", "HEAD"]);
  return result
    .split("\n")
    .filter(
      (f) =>
        f.includes("triggers/") && f.includes("classes/") && f.endsWith(".cls")
    ) // Aca no incluir los archivos terminados en Test.cls como seria esto:
    .filter((f) => !f.endsWith("Test.cls")) // Excluir archivos de test
    .map((f) => path.basename(f));
}

async function runProject() {
  console.log(`🔍 Buscando clases modificadas en: ${apexFolderPath}\n`);
  const modifiedFiles = await getModifiedApexFiles();

  if (modifiedFiles.length === 0) {
    console.log("✅ No se detectaron clases modificadas.");
    return;
  }
  const metrics = [];
  for (const file of modifiedFiles) {
    const baseName = file.replace(/\.(cls|trigger)/, "");
    const testFile = file.replace(".cls", "Test.cls");
    const isTrigger = isTriggerFile(file);
    const apexFolder = isTrigger ? "triggers" : "classes";
    const exists = await fs.pathExists(
      path.join(`${apexFolderPath}/${apexFolder}`, testFile)
    );

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
          baseName,
          baseName + "Test",
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
