import { askGeminiForJson } from "./gemini.js";
export const extractRole = (jobDescription) =>
  askGeminiForJson(
    `Read this job description. Return STRICT JSON only: {"title":"","seniority":"","responsibilities":[""],"requirements":[{"id":"r1","text":"","kind":"technical|behavioural|domain","priority":"must|nice"}]}. Extract only explicit information. Never invent a requirement. Use stable sequential IDs.\n\nJOB DESCRIPTION:\n${jobDescription}`,
  );
export const generateCompanyBrief = (companyText, urls) =>
  askGeminiForJson(
    `Using only the supplied company-site text, return STRICT JSON only: {"summary":"","what_they_do":"","sources":[]}. If the text is insufficient, explicitly say so rather than guessing. sources must be selected only from this URL list: ${JSON.stringify(urls)}.\n\nCOMPANY TEXT:\n${companyText.slice(0, 30000)}`,
  );
