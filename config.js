require("dotenv").config();
const path = require("path");

module.exports = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: "gpt-4o", // Puedes cambiar a gpt-4o si está disponible
  // basePromptPath: "./prompts/basePromptEn.txt", // "./prompts/basePromptEn.txt",
  basePromptPath: path.resolve(__dirname, "./prompts/prompt-trigger-en.txt"), // "./prompts/basePromptEn.txt",
  // apexFolderPath: "../DiscountCalculatorApp/force-app/main/default/classes",
  apexFolderPath: path.resolve(
    __dirname,
    "../apex-mutation-test/force-app/main/default"
  ),
  apexFolderProject: path.resolve(__dirname, "../apex-mutation-test"), // DiscountCalculatorApp
  apexFileName: "AccountPhoneChangeTrigger.cls", // AccountPhoneChangeTrigger
  apexFolderApex: path.resolve(__dirname, "./apex"),
  backupFolderPath: path.resolve(__dirname, "./backup/"),
  mutationsFolderPath: path.resolve(__dirname, "./mutations/"),
};
