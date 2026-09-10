import { askGeminiForJson } from "./gemini.js";
import { companyBriefPrompt, roleExtractionPrompt } from "./prompts.js";
export const extractRole = (jobDescription) =>
  askGeminiForJson(roleExtractionPrompt(jobDescription));
export const generateCompanyBrief = (companyText, urls) =>
  askGeminiForJson(companyBriefPrompt(companyText, urls));
