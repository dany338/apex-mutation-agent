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
const { exportMetrics } = require("./exportMetrics");
const { generateIndexPage } = require("./generateIndexPage");
const { convertLatestMarkdownToPDF } = require("./convertToPdf");
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
  const isTrigger = isTriggerFile(fileName);
  const apexFolder = isTrigger ? "triggers" : "classes";
  const src = path.join(apexFolderPath, apexFolder, fileName);
  const dest = path.join(apexFolderApex, fileName);
  await fs.copy(src, dest);
};

const copyApexFileTestToLocal = async (fileName) => {
  const baseName = fileName.replace(/\.(cls|trigger)/, "");
  const testFile = `${baseName}.cls`;
  const src = path.join(apexFolderPath, "classes", testFile);
  const dest = path.join(apexFolderApex, testFile);
  await fs.copy(src, dest);
};

async function getModifiedApexFiles(baseRef = "origin/main", headRef = "HEAD") {
  const git = simpleGit(path.resolve(apexFolderProject));
  // Asegúrate de tener el último fetch del repo remoto
  await git.fetch();
  // const result = await git.diff(["--name-only", "HEAD"]);
  // Detecta archivos .cls modificados entre origin/main y HEAD
  // const result = await git.diff(["--name-only", `${baseRef}`, `${headRef}`]);
  // const result = await git.diff(["--name-only", "HEAD~1", "HEAD"]);

  let result;
  try {
    result = await git.diff(["--name-only", "HEAD~1", "HEAD"]);
  } catch (error) {
    console.warn("⚠️ HEAD~1 no disponible, usando fallback a diff simple.");
    result = await git.diff(["--name-only"]);
  }

  console.log("🚀 ~ getModifiedApexFiles ~ result:");
  console.table(result.split("\n"));
  return result
    .split("\n")
    .filter((f) => {
      const isApexClass = f.includes("classes/") && f.endsWith(".cls");
      const isTrigger = f.includes("triggers/") && f.endsWith(".trigger");
      const isTestFile = f.endsWith("Test.cls");
      return (isApexClass || isTrigger) && !isTestFile;
    })
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
    console.log("🚀 ~ runProject ~ file:", file);
    const baseName = file.replace(/\.(cls|trigger)/, "");
    const testFile = file.replace(/\.(cls|trigger)/, "Test.cls");
    console.log("🚀 ~ runProject ~ testFile:", testFile);
    const isTrigger = isTriggerFile(file);
    const apexFolder = isTrigger ? "triggers" : "classes";
    console.log("🚀 ~ runProject ~ apexFolder:", apexFolder);
    const exists = await fs.pathExists(
      path.join(apexFolderPath, "classes", testFile)
    );

    if (!exists) {
      console.warn(`⚠️ No se encontró clase de test para ${file}, se omite.\n`);
      continue;
    }

    // Copiar ambos archivos al agente
    await copyApexFileToLocal(file);
    await copyApexFileTestToLocal(testFile);

    try {
      console.log(`🚀 Procesando: ${file}`);
      const prompt = await buildPromptFromApex(file);
      console.log("📤 Prompt generado para OpenAI:\n");
      console.log(prompt);
      console.log("\n========================================\n");

      console.log(`✉️ Enviando a OpenAI...\n`);
      const openaiResponse = await sendPromptToOpenAI(prompt);
      console.log("\n✅ Mutaciones sugeridas:\n");
      console.log(openaiResponse);
      console.log("\n========================================\n");

      console.log("🎯 Extrayendo mutaciones...");
      const mutations = parseMutationsFromText(openaiResponse);
      console.log("\n🎯 Mutaciones extraídas:", mutations);

      if (!mutations.length) {
        console.warn("⚠️ No se pudieron extraer mutaciones de la respuesta.");
        continue;
      }

      const originalContent = await fs.readFile(
        path.join(apexFolderPath, apexFolder, file),
        "utf8"
      );
      const mutationFiles = await applyMutations(
        file,
        originalContent,
        mutations
      );

      const testResults = [];
      console.log("\n✅ Generated mutated files:"); // Archivos mutados generados:
      for (const m of mutationFiles) {
        const result = await runTestAgainstMutation(
          baseName,
          baseName + "Test",
          m.file
        );
        testResults.push({ ...m, passed: result.passed });

        console.log(
          `- ${m.file} ${result.passed ? "✅" : "❌"} - ${m.description}`
        );
      }

      await generateMutationReport(file, testResults);
      console.log(`📄 Reporte listo para ${file}\n`);

      const passed = testResults.filter((r) => r.passed).length;
      const failed = testResults.length - passed;
      const now = new Date().toLocaleString();

      console.log(`📊 Resultados para ${file}:`);
      await appendToMutationHistory(now, file, passed, failed);
      console.log(
        `- Total mutaciones: ${testResults.length}, Pasaron: ${passed}, Fallaron: ${failed}`
      );

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
  await exportMetrics();
  console.log("📊 Gráficas generadas en index.html");
  await generateIndexPage();
  console.log("📄 Reportes PDF generados.");
  await convertLatestMarkdownToPDF();
  console.log("✅ Proceso completado.");
}

runProject();
