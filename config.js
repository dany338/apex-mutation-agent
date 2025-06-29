require("dotenv").config();

module.exports = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: "gpt-4o", // Puedes cambiar a gpt-4o si está disponible
  basePromptPath: "./prompts/basePrompt.txt",
  apexFolderPath: "../DiscountCalculatorApp/force-app/main/default/classes",
  backupFolderPath: "./backup/",
  mutationsFolderPath: "./mutations/",
};
