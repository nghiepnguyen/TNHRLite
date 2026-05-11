const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Utility to extract JSON from AI response, handling markdown blocks or extra chatter.
 */
function cleanJsonResponse(text) {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
    const rawJson = jsonMatch[1].trim();
    return JSON.parse(rawJson);
  } catch (_error) {
    console.error("Critical: Failed to extract valid JSON from Gemini response. Raw text:", text);
    throw new Error("AI returned an invalid data format.");
  }
}

const getModel = () => {
  if (!genAI) return null;
  return genAI.getGenerativeModel(
    { model: "gemini-3-flash-preview" },
    { apiVersion: "v1beta" }
  );
};

module.exports = {
  genAI,
  cleanJsonResponse,
  getModel
};
