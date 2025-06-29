const axios = require("axios");
const { openaiApiKey, openaiModel } = require("./config");

async function sendPromptToOpenAI(promptText) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: openaiModel,
        messages: [
          {
            role: "system",
            content: "Eres un asistente experto en Apex y pruebas mutantes.",
          },
          { role: "user", content: promptText },
        ],
        temperature: 0.2, // 0.7
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "❌ Error al contactar OpenAI:",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = { sendPromptToOpenAI };
