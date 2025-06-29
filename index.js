const axios = require("axios");
const { apexFolderPath, openaiModel, openaiApiKey } = require("./config");
const { buildPromptFromApex } = require("./buildPrompt");
const { sendPromptToOpenAI } = require("./openaiClient");
const { parseMutationsFromText } = require("./mutationParser");
const { applyMutations } = require("./mutator");
const fs = require("fs-extra");
const path = require("path");
const { runTestAgainstMutation } = require("./testRunner");
const { generateMutationReport } = require("./reportGenerator");

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

async function testOpenAI() {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: openaiModel,
        messages: [{ role: "user", content: "Hola, ¿puedes responderme?" }],
        temperature: 0.3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    console.log(
      "Respuesta de OpenAI:",
      response.data.choices[0].message.content
    );
  } catch (error) {
    console.error("Error al conectarse a OpenAI:", error.message);
  }
}

async function main() {
  const apexFile = "DiscountCalculator.cls";

  const prompt = await buildPromptFromApex(apexFile);
  console.log("Prompt generado para OpenAI:\n");
  console.log(prompt);
  console.log(`✉️ Enviando a OpenAI...\n`);
  const response = await sendPromptToOpenAI(prompt);
  console.log("\n✅ Mutaciones sugeridas:\n");
  console.log(response);
  const mutations = parseMutationsFromText(response);
  console.log("\n🎯 Mutaciones extraídas:", mutations);

  const originalContent = await fs.readFile(
    path.join(apexFolderPath, apexFile),
    "utf8"
  );
  const generatedFiles = await applyMutations(
    apexFile,
    originalContent,
    mutations
  );

  console.log("\n✅ Archivos mutados generados:");
  for (const file of generatedFiles) {
    console.log(`- ${file.file}: ${file.description}`);
  }

  await testMutations(apexFile, "DiscountCalculatorTest.cls", generatedFiles);
}

main();

// testOpenAI();
