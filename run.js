#!/usr/bin/env node
const path = require("path");
const fs = require("fs-extra");
const { buildPromptFromApex } = require("./buildPrompt");
const { sendPromptToOpenAI } = require("./openaiClient");
const { parseMutationsFromText } = require("./mutationParser");
const { applyMutations } = require("./mutator");
const { runTestAgainstMutation } = require("./testRunner");
const { generateMutationReport } = require("./reportGenerator");
const { apexFolderPath } = require("./config");

async function testMutations(baseClass, testClass, generatedFiles) {
  console.log("\n🧪 Ejecutando tests para cada mutación...\n");
  const results = [];

  for (const file of generatedFiles) {
    const result = await runTestAgainstMutation(
      baseClass.replace(".cls", ""),
      testClass.replace(".cls", ""),
      file.file
    );

    const verdict = result.passed
      ? "✅ PASÓ (test débil)"
      : "❌ FALLÓ (test efectivo)";
    console.log(`🔍 Mutación: ${file.file} — ${verdict}`);

    results.push({
      ...file,
      passed: result.passed,
      rawOutput: result.raw,
    });
  }

  const reportPath = await generateMutationReport(baseClass, results);
  console.log(`\n📄 Reporte generado: ${reportPath}`);
}

async function runFullAgent(apexFile) {
  const baseName = apexFile.replace(".cls", "");
  const testFile = `${baseName}Test.cls`;

  console.log(`\n📘 Clase Apex: ${apexFile}`);
  console.log(`🔎 Clase Test: ${testFile}`);

  const prompt = await buildPromptFromApex(apexFile);
  console.log("Prompt generado para OpenAI:\n");
  console.log(prompt);
  console.log(`✉️ Enviando a OpenAI...\n`);
  const openaiResponse = await sendPromptToOpenAI(prompt);
  console.log("\n✅ Mutaciones sugeridas:\n");
  console.log(openaiResponse);
  const mutations = parseMutationsFromText(openaiResponse);
  console.log("\n🎯 Mutaciones extraídas:", mutations);

  if (!mutations.length) {
    console.warn("⚠️ No se pudieron extraer mutaciones de la respuesta.");
    return;
  }

  const originalPath = path.join(apexFolderPath, apexFile);
  const originalContent = await fs.readFile(originalPath, "utf8");
  const generatedFiles = await applyMutations(
    apexFile,
    originalContent,
    mutations
  );

  const testResults = [];
  console.log("\n✅ Archivos mutados generados:");
  for (const file of generatedFiles) {
    const result = await runTestAgainstMutation(
      baseName,
      baseName + "Test",
      file.file
    );
    testResults.push({ ...file, passed: result.passed, raw: result.raw });
  }

  // const reportPath = await generateMutationReport(apexFile, testResults);
  // console.log(`\n✅ Reporte final generado en: ${reportPath}`);
  await testMutations(apexFile, testFile, testResults);
}

// Manejar argumentos desde CLI
const [, , apexFile] = process.argv;

if (!apexFile) {
  console.error("❗ Uso: node run.js <nombreDeClase>.cls");
  process.exit(1);
}

runFullAgent(apexFile).catch((err) => {
  console.error("❌ Error inesperado:", err.message);
});
