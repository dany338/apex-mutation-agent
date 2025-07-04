require("dotenv").config();

module.exports = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: "gpt-4o", // Puedes cambiar a gpt-4o si está disponible
  // basePromptPath: "./prompts/basePromptEn.txt", // "./prompts/basePromptEn.txt",
  basePromptPath: "./prompts/prompt-trigger-es.txt", // "./prompts/basePromptEn.txt",
  // apexFolderPath: "../DiscountCalculatorApp/force-app/main/default/classes",
  apexFolderPath: "../apex-mutation-test/force-app/main/default",
  apexFolderProject: "../apex-mutation-test", // DiscountCalculatorApp
  apexFileName: "AccountPhoneChangeTrigger.cls", // AccountPhoneChangeTrigger
  apexFolderApex: "./apex",
  backupFolderPath: "./backup/",
  mutationsFolderPath: "./mutations/",
};
