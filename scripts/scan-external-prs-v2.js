require("dotenv").config();
const { Octokit } = require("@octokit/rest");
const execSync = require("child_process").execSync;
const fs = require("fs");
const path = require("path");
const { exportReviewToPdf } = require("../utils/export-pdf");
const { callOpenAI } = require("../utils/openai");
const { detectApexClassType } = require("../utils/detect-type");
const { generatePrompt } = require("../utils/prompt-builder");

const token = process.env.TOKEN_GITHUB;
const reposEnv = process.env.TARGET_REPOS;

if (!token || !reposEnv) {
  console.error("❌ GITHUB_TOKEN y TARGET_REPOS deben estar definidos.");
  process.exit(1);
}

const octokit = new Octokit({ auth: token });

const reposToAnalyze = reposEnv.split(",").map((r) => r.trim());

async function scanPRs() {
  for (const repoFullName of reposToAnalyze) {
    const [owner, repo] = repoFullName.split("/");
    console.log(`\n🔍 Escaneando PRs abiertos en: ${repoFullName}`);

    const { data: pullRequests } = await octokit.pulls.list({
      owner,
      repo,
      state: "open", // Solo PRs abiertos o "all" para todos los estados o "closed" para PRs cerrados
      per_page: 100, // Máximo 100 PRs por solicitud
      sort: "created", // Ordenar por fecha de creación
      direction: "desc", // Más recientes primero
      base: "main", // Cambia esto si tu rama principal es diferente
      // Puedes agregar más filtros si es necesario
      // por ejemplo, para filtrar por etiquetas o autores específicos
      // head: "feature-branch" // Si quieres filtrar por una rama específica
    });

    for (const pr of pullRequests) {
      console.log(`➡️ PR #${pr.number}: ${pr.title}`);

      const tempDir = path.resolve("tmp", `${repo}-${pr.number}`);
      const cloneUrl = `https://github.com/${repoFullName}.git`;

      try {
        if (fs.existsSync(tempDir))
          fs.rmSync(tempDir, { recursive: true, force: true });
        execSync(
          `git clone --depth=1 --branch=${pr.head.ref} ${cloneUrl} ${tempDir}`,
          { stdio: "inherit" }
        );

        const apexFiles = findApexFiles(tempDir);
        if (apexFiles.length === 0) {
          console.log("✅ No hay archivos .cls o .trigger modificados.");
          continue;
        }

        for (const filePath of apexFiles) {
          const content = fs.readFileSync(filePath, "utf8");
          const classType = detectApexClassType(content);
          const prompt = generatePrompt(content, classType);
          const response = await callOpenAI(prompt);

          console.log(`🧠 IA para ${path.basename(filePath)}:\n`);
          console.log(response);
          console.log("------------\n");

          // Aquí podrías publicar comentario en el PR con octokit.rest.issues.createComment(...)
          // o usar octokit.rest.pulls.createReview(...) para una revisión más formal:
          // Publicar comentario en el PR
          // Puedes personalizar el cuerpo del comentario según tus necesidades
          // Aquí podrías usar el método createReview si quieres una revisión formal
          // octokit.rest.pulls.createReview({
          //   owner,
          //   repo,
          //   pull_number: pr.number,
          //   body: `💡 **Revisión IA para \`${path.basename(filePath)}\`**\n\n${response}`
          // });,

          // Ejemplo de comentario:
          await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: pr.number,
            body: `💡 **Revisión IA para \`${path.basename(
              filePath
            )}\`**\n\n${response}`,
          });
          console.log(`✅ Revisión publicada en PR #${pr.number}`);

          // o generar un PDF con exportReviewToPdf si lo necesitas
          exportReviewToPdf({
            repo: repoFullName,
            prNumber: pr.number,
            fileName: path.basename(filePath, path.extname(filePath)),
            reviewText: response,
          });

          console.log(
            `📄 Revisión IA guardada para ${path.basename(filePath)}`
          );
        }
      } catch (err) {
        console.error(
          `❌ Error al procesar PR #${pr.number} de ${repoFullName}:`,
          err.message
        );
      } finally {
        // 🧹 Limpiar carpeta temporal
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
          console.log(`🧼 Carpeta eliminada: ${tempDir}`);
        }
      }
    }
  }
}

function findApexFiles(root) {
  const result = [];
  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith(".cls") || file.endsWith(".trigger")) {
        result.push(fullPath);
      }
    }
  }
  walk(root);
  return result;
}

scanPRs().catch((err) => {
  console.error("❌ Error general:", err.message);
  process.exit(1);
});
