require("dotenv").config();
const core = require("@actions/core");
const github = require("@actions/github");
const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");
const { generatePrompt } = require("../utils/prompt-builder");
const { detectApexClassType } = require("../utils/detect-type");
const { callOpenAI } = require("../utils/openai");
const {
  apexFolderPath,
  apexFolderProject,
  apexFolderApex,
} = require("../config");

// const git = simpleGit();
const git = simpleGit(path.resolve(apexFolderProject));

async function run() {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY; // owner/repo
  const prNumber = process.env.GITHUB_PR_NUMBER; // número de PR
  const octokit = github.getOctokit(token);
  const context = github.context;

  // const pr = context.payload.pull_request;
  // const owner = context.repo.owner;
  // const repo = context.repo.repo;

  if (!token || !repository || !prNumber) {
    throw new Error(
      "❗ GITHUB_TOKEN, GITHUB_REPOSITORY y GITHUB_PR_NUMBER deben estar definidos en el archivo .env"
    );
  }

  let owner, repo;
  if (process.env.GITHUB_REPOSITORY) {
    [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  } else {
    throw new Error(
      "Falta definir GITHUB_REPOSITORY en el archivo .env (owner/repo)"
    );
  }

  const changedFiles = await git.diff(["--name-only", "origin/main"]);
  const apexFiles = changedFiles
    .split("\n")
    .filter((f) => f.endsWith(".cls") || f.endsWith(".trigger"));

  if (apexFiles.length === 0) {
    console.log("✅ No se detectaron archivos Apex modificados.");
    return;
  }

  for (const file of apexFiles) {
    const diff = await git.diff(["origin/main", "--", file]);
    const filePath = path.resolve(file);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const classType = detectApexClassType(fileContent);

    const prompt = generatePrompt(diff, classType);
    const review = await callOpenAI(prompt);

    // 💬 Comentar en el Pull Request
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pr.number,
      body: `💡 **Revisión IA para \`${file}\`**\n\n${review}`,
    });

    console.log(`🧠 Comentario IA publicado para: ${file}`);
  }
}

run().catch((err) => core.setFailed(err.message));

// if (require.main === module) {
//   import("dotenv/config");
//   const diffs = await getChangedApexFiles(); // Función que extrae el diff
//   const results = await analyzeWithOpenAI(diffs); // Prompt IA
//   console.log("🧠 Revisión local de código Apex:\n");
//   results.forEach(({ fileName, comments }) => {
//     console.log(`📄 ${fileName}`);
//     console.log(comments);
//     console.log("\n---\n");
//   });
// }
