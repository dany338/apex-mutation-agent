#!/usr/bin/env node

const simpleGit = require("simple-git");
const fs = require("fs-extra");
const path = require("path");
const { sendPromptToOpenAI } = require("./openaiClient");
const { apexFolderPath, basePromptPath } = require("./config");

const git = simpleGit();

async function getModifiedApexClasses() {
  try {
    // Intenta HEAD~1 normalmente
    const diff = await git.diff(["--name-only", "HEAD~1", "HEAD"]);
    return diff
      .split("\n")
      .filter((f) => f.endsWith(".cls"))
      .filter((f) => !f.endsWith("Test.cls"))
      .map((f) => f.trim());
  } catch (err) {
    // Fallback simple
    console.warn("⚠️ HEAD~1 no disponible, usando diff simple...");
    const fallback = await git.diff(["--name-only"]);
    return fallback
      .split("\n")
      .filter((f) => f.endsWith(".cls"))
      .filter((f) => !f.endsWith("Test.cls"))
      .map((f) => f.trim());
  }
}

async function buildPromptForFile(filePath) {
  const promptTemplate = await fs.readFile(basePromptPath, "utf8");
  const fullPath = path.join(apexFolderPath, filePath);
  const code = await fs.readFile(fullPath, "utf8");

  return promptTemplate
    .replace("===APEX_CLASS===", code)
    .replace("===TEST_CLASS===", "// No test class used in this analysis")
    .replace("===TOTAL_LINES===", code.split("\n").length);
}

async function runAnalysis() {
  const files = await getModifiedApexClasses();

  if (!files.length) {
    console.log("✅ No hay clases Apex modificadas.");
    return;
  }

  for (const file of files) {
    console.log(`\n📘 Analizando clase modificada: ${file}`);
    const prompt = await buildPromptForFile(file);
    const result = await sendPromptToOpenAI(prompt);
    console.log(`🧠 Sugerencias IA:\n${result}`);
    console.log("========================================\n");
  }
}

runAnalysis().catch((err) => {
  console.error("❌ Error en el análisis:", err.message);
});
