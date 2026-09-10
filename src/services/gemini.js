import axios from "axios";

const parseJson = (text) =>
  JSON.parse(
    text
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "")
      .trim(),
  );
const friendlyGeminiError = (error) => {
  const status = error.response?.status;
  const providerMessage = error.response?.data?.error?.message || error.message;
  console.error("Gemini API request failed", {
    status,
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    providerMessage,
    code: error.code,
  });
  if (status === 400)
    return Object.assign(
      new Error(
        "The AI research service is temporarily unavailable. Please try again in a moment.",
      ),
      { statusCode: 503 },
    );
  if (status === 404)
    return Object.assign(
      new Error("Gemini model not found. Check GEMINI_MODEL in your .env."),
      { statusCode: 503 },
    );
  if (status === 401 || status === 403)
    return Object.assign(
      new Error(
        "The AI service is not configured correctly. Please contact support.",
      ),
      { statusCode: 503 },
    );
  if (status === 429)
    return Object.assign(
      new Error(
        "The AI service is busy right now. Please try again in a few minutes.",
      ),
      { statusCode: 503 },
    );
  if (status === 503)
    return Object.assign(
      new Error(
        "The AI research service is temporarily busy. Please try again in a minute.",
      ),
      { statusCode: 503 },
    );
  if (error.code === "ECONNABORTED" || !error.response)
    return Object.assign(
      new Error(
        "We could not reach the AI research service. Please check your connection and try again.",
      ),
      { statusCode: 503 },
    );
  return Object.assign(
    new Error(
      "We couldn’t generate the draft kit right now. Please try again.",
    ),
    { statusCode: 502 },
  );
};

export const askGeminiForJson = async (prompt) => {
  if (!process.env.GEMINI_API_KEY)
    throw Object.assign(
      new Error(
        "The AI service has not been configured yet. Please contact support.",
      ),
      { statusCode: 503 },
    );
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  try {
    let data;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        ({ data } = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          },
          {
            timeout: 30000,
            headers: { "x-goog-api-key": process.env.GEMINI_API_KEY },
          },
        ));
        break;
      } catch (error) {
        if (![429, 503].includes(error.response?.status) || attempt === 2)
          throw error;
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * 2 ** attempt),
        );
      }
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text)
      throw Object.assign(new Error("Empty AI response"), {
        response: { status: 502 },
      });
    try {
      return parseJson(text);
    } catch {
      throw Object.assign(new Error("Invalid AI response"), {
        response: { status: 502 },
      });
    }
  } catch (error) {
    throw friendlyGeminiError(error);
  }
};
