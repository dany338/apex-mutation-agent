function parseMutationsFromText(text) {
  const mutations = [];
  const lines = text.split("\n");

  let current = {};
  let captureMutation = false;
  let captureOriginal = false;

  for (const line of lines) {
    if (line.startsWith("### 💥 Mutación")) {
      if (current.description) {
        mutations.push({ ...current });
        current = {};
      }
    } else if (
      line.startsWith("📝 Descripción:") ||
      line.startsWith("📝 Description:")
    ) {
      current.description = line.replace("📝 Descripción:", "").trim();
    } else if (
      line.startsWith("📍 Línea afectada:") ||
      line.startsWith("📍 Affected line:")
    ) {
      current.line = line.replace("📍 Línea afectada:", "").trim();
    } else if (
      line.startsWith("🧠 Tipo de mutación:") ||
      line.startsWith("🧠 Mutation type:")
    ) {
      current.type = line.replace("🧠 Tipo de mutación:", "").trim();
    } else if (
      line.startsWith("💥 Impacto esperado:") ||
      line.startsWith("💥 Expected impact:")
    ) {
      current.explanation = line.replace("💥 Impacto esperado:", "").trim();
    } else if (
      line.startsWith("🔁 Línea de código mutada:") ||
      line.startsWith("🔁 Mutated code line:")
    ) {
      captureMutation = true;
    } else if (
      line.startsWith("🔁 Línea de código original:") ||
      line.startsWith("🔁 Original code line:")
    ) {
      captureOriginal = true;
    } else if (
      (captureMutation || captureOriginal) &&
      line.trim() !== "" &&
      !line.trim().startsWith("```")
    ) {
      if (captureMutation) {
        current.mutated = line.trim();
        captureMutation = false;
      } else if (captureOriginal) {
        current.original = line.trim();
        captureOriginal = false;
      }
    }
  }

  if (current.description) {
    mutations.push({ ...current });
  }

  return mutations;
}

module.exports = { parseMutationsFromText };
