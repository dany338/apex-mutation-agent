console.log("🔎 Verificando variables de entorno...");

const requiredVars = [
  "OPENAI_API_KEY",
  "TOKEN_GITHUB",
  "OWNER",
  "TARGET_REPOS",
];

let allSet = true;

for (const key of requiredVars) {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ La variable ${key} NO está definida.`);
    allSet = false;
  } else {
    console.log(
      `✅ ${key} está definida (${key === "TOKEN_GITHUB" ? "oculta" : value})`
    );
  }
}

if (!allSet) {
  console.error(
    "\n🚨 Faltan variables de entorno necesarias. Verifica tus GitHub Secrets."
  );
  process.exit(1);
} else {
  console.log("\n🎉 Todas las variables están definidas correctamente.\n");
}
