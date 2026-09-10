import { askGeminiForJson } from "./gemini.js";
import { flashcardsPrompt } from "./prompts.js";

export const generateFlashcards = (role, requirements, questions) =>
  askGeminiForJson(flashcardsPrompt(role, requirements, questions));

export const normalizeFlashcards = (cards, allowedIds) =>
  (Array.isArray(cards) ? cards : [])
    .map((card, index) => ({
      id: `f${index + 1}`,
      requirement_ids: (Array.isArray(card.requirement_ids)
        ? card.requirement_ids
        : []
      ).filter((id) => allowedIds.includes(id)),
      front: typeof card.front === "string" ? card.front.trim() : "",
      back:
        typeof card.back === "string"
          ? card.back.trim().split(/\s+/).slice(0, 80).join(" ")
          : "",
    }))
    .filter((card) => card.front && card.back && card.requirement_ids.length);
