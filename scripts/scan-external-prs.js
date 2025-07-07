require("dotenv").config();
const { Octokit } = require("@octokit/rest");
const simpleGit = require("simple-git");
const fs = require("fs-extra");
const path = require("path");
const { generatePrompt } = require("../utils/prompt-builder");
const { detectApexClassType } = require("../utils/detect-type");
const { callOpenAI } = require("../utils/openai");
const { generatePDFReport } = require("../utils/pdfGenerator");
const { exportReviewToPdf } = require("../utils/export-pdf");

const owner = process.env.OWNER;
console.log("🚀 ~ owner:", owner);
const TOKEN_GITHUB = process.env.TOKEN_GITHUB;
console.log("🚀 ~ TOKEN_GITHUB:", TOKEN_GITHUB);
const TARGET_REPOS = process.env.TARGET_REPOS?.split(",") || [];
console.log("🚀 ~ TARGET_REPOS:", TARGET_REPOS);

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

  if (prs.length === 0) {
    console.log(`🔍 No se encontraron PRs abiertos en ${repo}.`);
    return;
  }

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
      // const diffOutput = await git.diff(["--name-only", `origin/main`, branch]);
      const diffOutput = await git.diff([
        "--diff-filter=ACMRT", // A: Added, C: Copied, M: Modified, R: Renamed, T: Type changed
        "--name-status",
        `origin/main`,
        branch,
      ]);

      console.log(`🔍 Archivos modificados en PR #${prNumber}:`);
      // const changedFiles = diffOutput
      //   .split("\n")
      //   .filter((f) => f.endsWith(".cls") || f.endsWith(".trigger"));
      const changedFiles = diffOutput
        .split("\n")
        .map((line) => line.trim().split(/\s+/)) // Ej: ["M", "force-app/main/default/classes/..."]
        .filter(
          ([status, file]) =>
            (status === "A" || status === "M") &&
            (file.endsWith(".cls") || file.endsWith(".trigger"))
        )
        .map(([_, file]) => file); // Solo necesitas el nombre del archivo

      if (changedFiles.length === 0) {
        console.log(`✅ PR #${prNumber} no modifica archivos Apex.`);
        continue;
      }

      console.log(`🔍 Archivos changedFiles en PR #${changedFiles}:`);

      for (const file of changedFiles) {
        console.log(`🔍 Revisando archivo: ${file}`);
        const filePath = path.join(tempDir, file);
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️ Archivo eliminado o no encontrado: ${filePath}`);
          console.warn(`⚠️ Archivo eliminado o no encontrado: ${filePath}`);
          continue; // Saltar este archivo
        }
        const content = await fs.readFile(filePath, "utf8");
        const classType = detectApexClassType(content);
        console.log(`🔍 Tipo de clase detectado: ${classType}`);
        const diff = await git.diff(["origin/main", "--", file]);

        const prompt = generatePrompt(diff, classType);
        console.log("🚀 ~ scanRepositoryPRs ~ prompt:", prompt);
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
        console.log(`📄 Generando PDF para ${file}...`);
        const pdfPath = path.join(
          "mutations",
          `${repo}#${file.replace(/\//g, "_")}.pdf`
        );
        // await generatePDFReport({
        //   repo,
        //   prNumber,
        //   fileName: `${repo}#${file}`,
        //   reviewText: review,
        // });
        // Alternativamente, si quieres usar la función exportReviewToPdf
        const sanitizedFileName = `${repo}#${file.replace(/\//g, "_")}`;
        console.log(`📄 Generando PDF con nombre limpio: ${sanitizedFileName}`);

        await exportReviewToPdf({
          repo,
          prNumber,
          fileName: sanitizedFileName,
          reviewText: review,
        });
        console.log(`📄 PDF guardado como mutations/${sanitizedFileName}.pdf`);
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
