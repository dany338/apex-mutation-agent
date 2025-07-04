const simpleGit = require("simple-git");
const path = require("path");

async function getChangedApexClasses(apexProjectPath) {
  const git = simpleGit(apexProjectPath);
  const result = await git.diff(["--name-only", "HEAD"]);
  const files = result
    .split("\n")
    .filter((f) => f.includes("classes/") && f.endsWith(".cls"))
    .map((f) => path.basename(f));
  return [...new Set(files)];
}

function detectApexClassType(content) {
  if (/implements\s+Schedulable/.test(content)) return "schedulable";
  if (/implements\s+Database\.Batchable/.test(content)) return "batch";
  if (/trigger\s+/.test(content)) return "trigger";
  if (/extends\s+\w*Controller/.test(content) || /with sharing/.test(content))
    return "controller";
  return "default";
}

function getPromptTemplateFile(classType) {
  const map = {
    batch: "prompt-batch.txt",
    trigger: "prompt-trigger-es.txt",
    controller: "prompt-controller.txt",
    schedulable: "prompt-schedulable.txt",
    default: "basePromptEn.txt", // basePromptEn.txt
  };
  return map[classType] || map.default;
}

module.exports = {
  detectApexClassType,
  getPromptTemplateFile,
};
