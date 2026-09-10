import { askGeminiForJson } from "./gemini.js";

const prompt = (role, brief, requirements) =>
  `Generate interview questions using only the requirements below. Return STRICT JSON only as an array of objects: [{"id":"q1","requirement_ids":["r1"],"category":"technical|behavioural|system-design|company-fit","prompt":"","answer_outline":"","difficulty":1}]. Every question must reference one or more provided requirement IDs. difficulty must be 1, 2, or 3. Do not invent technologies or requirements.\n\nROLE: ${role.title || "Not specified"}\nCOMPANY BRIEF: ${brief.summary || "Not available"}\nREQUIREMENTS: ${JSON.stringify(requirements)}`;

export const generateQuestions = async (role, companyBrief, requirements) =>
  askGeminiForJson(prompt(role, companyBrief, requirements));

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
