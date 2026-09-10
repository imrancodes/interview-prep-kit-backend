import { askGeminiForJson } from "./gemini.js";
import { questionsPrompt } from "./prompts.js";

export const generateQuestions = async (role, companyBrief, requirements) =>
  askGeminiForJson(questionsPrompt(role, companyBrief, requirements));

export const normalizeQuestions = (questions, allowedIds) =>
  (Array.isArray(questions) ? questions : [])
    .map((question, index) => ({
      id: `q${index + 1}`,
      requirement_ids: (Array.isArray(question.requirement_ids)
        ? question.requirement_ids
        : []
      ).filter((id) => allowedIds.includes(id)),
      category: [
        "technical",
        "behavioural",
        "system-design",
        "company-fit",
      ].includes(question.category)
        ? question.category
        : "technical",
      prompt: typeof question.prompt === "string" ? question.prompt.trim() : "",
      answer_outline:
        typeof question.answer_outline === "string"
          ? question.answer_outline.trim()
          : "",
      difficulty: [1, 2, 3].includes(Number(question.difficulty))
        ? Number(question.difficulty)
        : 2,
    }))
    .filter((question) => question.prompt && question.requirement_ids.length);
