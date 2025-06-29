const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const {
  apexFolderPath,
  mutationsFolderPath,
  backupFolderPath,
} = require("./config");

async function runTestAgainstMutation(
  baseClassName,
  testClassName,
  mutationFileName
) {
  const mutationPath = path.join(mutationsFolderPath, mutationFileName);
  const originalPath = path.join(backupFolderPath, `${baseClassName}.cls`);
  const classMetaFile = `${baseClassName}.cls-meta.xml`;

  try {
    // Sobrescribir clase original con la mutada
    const mutationCode = await fs.readFile(mutationPath, "utf8");
    await fs.outputFile(
      path.join(apexFolderPath, `${baseClassName}.cls`),
      mutationCode
    );

    // Re-deploy a Salesforce
    // execSync(
    //   `sfdx force:source:deploy -p "${apexFolderPath}" --sourcepath "${baseClassName}.cls" --json --loglevel fatal`,
    //   { stdio: "inherit" }
    // );
    execSync(`sf project deploy start --source-dir ${apexFolderPath}/${baseClassName}.cls`, { stdio: "ignore" });

    // Ejecutar test
    const output = execSync(
      `sf apex test run --class-names ${testClassName} --result-format human --output-dir ./testResults --wait 10`
    ).toString();

    const passed = output.includes("Pass") && !output.includes("Fail");
    return { mutation: mutationFileName, passed, raw: output };
  } catch (err) {
    return { mutation: mutationFileName, passed: false, raw: err.message };
  } finally {
    try {
      const originalCode = await fs.readFile(originalPath, "utf8");
      await fs.outputFile(
        path.join(apexFolderPath, `${baseClassName}.cls`),
        originalCode
      );
      execSync(`sf project deploy start --source-dir ${apexFolderPath}/${baseClassName}.cls`, { stdio: "ignore" });
    } catch (restoreErr) {
      console.error("❌ Error restaurando clase original:", restoreErr.message);
    }
  }
}

module.exports = { runTestAgainstMutation };
