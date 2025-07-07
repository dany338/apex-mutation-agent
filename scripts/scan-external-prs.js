require("dotenv").config();
const { Octokit } = require("@octokit/rest");
const simpleGit = require("simple-git");
const fs = require("fs-extra");
const path = require("path");
const { generatePrompt } = require("../utils/prompt-builder");
const { detectApexClassType } = require("../utils/detect-type");
const { callOpenAI } = require("../utils/openai");
const { generatePDF } = require("../utils/pdf-generator");

const owner = process.env.OWNER;
const TOKEN_GITHUB = process.env.TOKEN_GITHUB;
const TARGET_REPOS = process.env.TARGET_REPOS?.split(",") || [];

if (!TOKEN_GITHUB || !owner || TARGET_REPOS.length === 0) {
  throw new Error(
    "❗ Asegúrate de definir TOKEN_GITHUB, OWNER y TARGET_REPOS en .env"
  );
}

const octokit = new Octokit({ auth: TOKEN_GITHUB });

async function getOpenPRs(repo) {
  const { data: prs } = await octokit.pulls.list({
    owner,
    repo,
    state: "open",
    per_page: 10,
  });
  return prs;
}

async function scanRepositoryPRs(repo) {
  console.log(`\n📦 Analizando PRs en ${repo}`);
  const prs = await getOpenPRs(repo);
  const results = [];

  for (const pr of prs) {
    const prNumber = pr.number;
    const branch = pr.head.ref;
    const tempDir = path.join("external-temp", repo);

    try {
      // Clonar repo y cambiar de rama
      await fs.remove(tempDir); // Limpieza previa
      const git = simpleGit();
      await git.clone(`https://github.com/${owner}/${repo}.git`, tempDir);
      await git.cwd(tempDir);
      await git.checkout(branch);

      // Obtener archivos modificados en el PR
      const diffOutput = await git.diff(["--name-only", `origin/main`, branch]);
      const changedFiles = diffOutput
        .split("\n")
        .filter((f) => f.endsWith(".cls") || f.endsWith(".trigger"));

      if (changedFiles.length === 0) {
        console.log(`✅ PR #${prNumber} no modifica archivos Apex.`);
        continue;
      }

      for (const file of changedFiles) {
        const filePath = path.join(tempDir, file);
        const content = await fs.readFile(filePath, "utf8");
        const classType = detectApexClassType(content);
        const diff = await git.diff(["origin/main", "--", file]);

        const prompt = generatePrompt(diff, classType);
        const review = await callOpenAI(prompt);

        // Publicar comentario en el PR
        await octokit.issues.createComment({
          owner,
          repo,
          issue_number: prNumber,
          body: `💡 **AI Review for \`${file}\`**\n\n${review}`,
        });

        // Generar PDF
        await fs.ensureDir("mutations"); // Asegurarse de que la carpeta exista
        const pdfPath = path.join(
          "mutations",
          `${repo}#${file.replace(/\//g, "_")}.pdf`
        );
        await generatePDF(file, diff, review, pdfPath);
        console.log(`📄 PDF guardado en ${pdfPath}`);
      }
    } catch (err) {
      console.error(`❌ Error procesando PRs de ${repo}:`, err.message);
    } finally {
      try {
        await fs.remove(tempDir);
        console.log(`🧹 Carpeta eliminada: ${tempDir}`);
      } catch (cleanupErr) {
        console.error(`⚠️ Error al limpiar ${tempDir}:`, cleanupErr.message);
      }
    }
  }
}

(async () => {
  for (const repo of TARGET_REPOS) {
    await scanRepositoryPRs(repo);
  }
})();
