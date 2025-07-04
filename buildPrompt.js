const fs = require("fs-extra");
const path = require("path");
const { apexFolderPath, basePromptPath } = require("./config");

/**
 * Cuenta cuántas líneas tiene el bloque de clase Apex.
 * @param {string} apexCode - El código fuente de la clase Apex como string.
 * @returns {number} - Número de líneas dentro del bloque Clase Apex.
 */
function contarLineasClaseApex(apexCode) {
  const lineas = apexCode.split("\n");

  // Opcional: eliminar líneas vacías si no quieres contarlas
  // const lineasFiltradas = lineas.filter(line => line.trim() !== '');

  return lineas.length;
}

/**
 * Encuentra automáticamente el archivo test correspondiente.
 * Ej: DiscountCalculator.cls => DiscountCalculatorTest.cls
 */
function findTestClass(apexFileName) {
  const baseName = path.basename(apexFileName, ".cls");
  const testName = `${baseName}Test.cls`;
  const testPath = path.join(apexFolderPath, testName);
  return fs.existsSync(testPath) ? testPath : null;
}

function getTestClassPath(apexFilePath) {
  const baseName = path.basename(apexFilePath).replace(/\.(cls|trigger)/, "");
  const testClassName = `${baseName}Test.cls`;
  // Obtener el path relativo del trigger y cambiarlo a 'classes'
  const classDir = apexFilePath.includes("trigger")
    ? path.join(apexFolderPath, "classes", testClassName)
    : path.join(
        apexFolderPath,
        apexFilePath.replace(path.basename(apexFilePath), testClassName)
      );

  return fs.existsSync(classDir) ? classDir : null;
}

async function buildPromptFromApex(apexFileName) {
  const apexPath = path.join(apexFolderPath, apexFileName);
  const testPath = getTestClassPath(apexFileName);

  if (!testPath) {
    throw new Error(`No se encontró el archivo test para: ${apexFileName}`);
  }

  const [basePrompt, apexCode, testCode] = await Promise.all([
    fs.readFile(basePromptPath, "utf8"),
    fs.readFile(apexPath, "utf8"),
    fs.readFile(testPath, "utf8"),
  ]);

  // Verificar si el código Apex tiene líneas pero de acuerdo al tipo de Apex a analizar si es class standar normal o trigger:
  if (!apexCode.trim()) {
    throw new Error(`El archivo Apex está vacío: ${apexFileName}`);
  }
  if (!testCode.trim()) {
    throw new Error(`El archivo de prueba está vacío: ${testPath}`);
  }

  const finalPrompt = basePrompt
    .replace("===APEX_CLASS===", apexCode)
    .replace("===TEST_CLASS===", testCode)
    .replace("===TOTAL_LINES===", contarLineasClaseApex(apexCode));
  // .replace("NombreDeLaClase", apexFileName.split(".")[0]);

  return finalPrompt;
}

module.exports = { buildPromptFromApex };
