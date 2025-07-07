require("dotenv").config();
const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");

const { generatePrompt } = require("../utils/prompt-builder");
const { detectApexClassType } = require("../utils/detect-type");
const { callOpenAI } = require("../utils/openai");

const { apexFolderPath, apexFolderProject } = require("../config");

const git = simpleGit(path.resolve(apexFolderProject));

async function runLocalReview() {
  console.log("🔍 Buscando cambios locales en Apex...\n");

  const changedFiles = await git.diff(["--name-only", "origin/main"]);
  const apexFiles = changedFiles
    .split("\n")
    .filter((f) => f.endsWith(".cls") || f.endsWith(".trigger"));

  if (!apexFiles.length) {
    console.log("✅ No hay archivos .cls o .trigger modificados.");
    return;
  }

  for (const file of apexFiles) {
    console.log("🚀 ~ runLocalReview ~ file:", file);
    // file : extract trigger or class name from the file path
    const baseName = path.basename(file);

    const diff = await git.diff(["origin/main", "--", file]);
    const isTigger = baseName.endsWith("Trigger.cls"); //
    const filePathUrlRelativo = isTigger
      ? path.join("triggers", baseName)
      : path.join("classes", baseName);
    const filePathUrl = path.resolve(apexFolderPath, filePathUrlRelativo);
    console.log("🚀 ~ runLocalReview ~ filePathUrl:", filePathUrl);
    const filePath = path.resolve(filePathUrl);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const classType = detectApexClassType(fileContent);
    console.log("🚀 ~ runLocalReview ~ classType:", classType);

    const prompt = generatePrompt(diff, classType);
    console.log("Prompt generado para OpenAI:\n");
    console.log(prompt);
    console.log(`✉️ Enviando a OpenAI...\n`);
    const review = await callOpenAI(prompt);

    console.log(`\n🧠 Revisión IA para: ${file}`);
    console.log("─────────────────────────────────────");
    console.log(review);
    console.log("─────────────────────────────────────\n");
  }
}

runLocalReview().catch((err) => {
  console.error("❌ Error:", err.message);
});
