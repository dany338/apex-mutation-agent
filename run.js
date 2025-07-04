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

function isTriggerFile(filePath) {
  return filePath.endsWith(".trigger");
}

function getTestClassPath(apexFilePath) {
  const baseName = path.basename(apexFilePath).replace(/\.(cls|trigger)/, "");
  const testClassName = `${baseName}Test.cls`;
  const testClassPath = path.join(apexFolderPath, "classes", testClassName);
  return fs.existsSync(testClassPath) ? testClassName : null;
}

async function testMutations(baseClass, testClass, generatedFiles) {
  console.log("\n🧪 Running tests for each mutation...\n");
  const results = [];

  for (const file of generatedFiles) {
    const result = await runTestAgainstMutation(
      baseClass.replace(/\.(cls|trigger)/, ""),
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
  const baseName = apexFile.replace(/\.(cls|trigger)/, "");
  const isTrigger = isTriggerFile(apexFile);
  const testClassName = getTestClassPath(apexFile);
  const testFile = testClassName.replace(".cls", "");

  if (!testClassName) {
    console.error(`❗ Clase de test no encontrada para: ${apexFile}`);
    process.exit(1);
  }

  console.log(`\n📘 Archivo Apex: ${apexFile}`);
  console.log(`🔎 Clase Test encontrada: ${testClassName}`);

  const prompt = await buildPromptFromApex(apexFile);
  console.log("📤 Prompt generado para OpenAI:\n");
  console.log(prompt);
  console.log("\n========================================\n");

  console.log(`✉️ Enviando a OpenAI...\n`);
  const openaiResponse = await sendPromptToOpenAI(prompt);
  console.log("\n✅ Mutaciones sugeridas:\n");
  console.log(openaiResponse);
  console.log("\n========================================\n");

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
  console.log("\n✅ Generated mutated files:"); // toInglesh: "✅ Archivos mutados generados:"
  for (const file of generatedFiles) {
    const result = await runTestAgainstMutation(
      baseName,
      baseName + "Test",
      file.file
    );
    testResults.push({ ...file, passed: result.passed, raw: result.raw });
  }
  console.table(testResults);
  // const reportPath = await generateMutationReport(apexFile, testResults);
  // console.log(`\n✅ Reporte final generado en: ${reportPath}`);
  await testMutations(apexFile, testFile, testResults);
}

// Manejar argumentos desde CLI
const [, , apexFileArg] = process.argv;

if (!apexFileArg) {
  console.error("❗ Uso: node run.js <nombreDeClase>.cls");
  process.exit(1);
}

runFullAgent(apexFileArg).catch((err) => {
  console.error("❌ Error inesperado:", err.message);
});
