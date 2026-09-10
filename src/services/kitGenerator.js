import { calculateCoverage } from "./coverage.js";
import { crawlCompany } from "./crawler.js";
import { extractRole, generateCompanyBrief } from "./extractor.js";
import {
  generateFlashcards,
  normalizeFlashcards,
} from "./flashcardGenerator.js";
import { generateQuestions, normalizeQuestions } from "./questionGenerator.js";
import { buildSchedule } from "./scheduler.js";

export const normalizeRequirements = (requirements) =>
  (Array.isArray(requirements) ? requirements : [])
    .filter((item) => typeof item?.text === "string" && item.text.trim())
    .map((item, index) => ({
      id: `r${index + 1}`,
      text: item.text.trim(),
      kind: ["technical", "behavioural", "domain"].includes(item.kind)
        ? item.kind
        : "technical",
      priority: item.priority === "nice" ? "nice" : "must",
    }));

export const generateQuestionsForKit = async (kit) => {
  const requirementIds = (kit.role?.requirements || []).map(
    (requirement) => requirement.id,
  );
  const questions = normalizeQuestions(
    await generateQuestions(
      kit.role,
      kit.company_brief,
      kit.role?.requirements || [],
    ),
    requirementIds,
  );
  return {
    questions,
    coverage: calculateCoverage(kit.role?.requirements || [], questions, 1),
  };
};

export const generateFlashcardsForKit = async (kit) => {
  const requirementIds = (kit.role?.requirements || []).map(
    (requirement) => requirement.id,
  );
  return normalizeFlashcards(
    await generateFlashcards(
      kit.role,
      kit.role?.requirements || [],
      kit.questions || [],
    ),
    requirementIds,
  );
};

export const generateScheduleForKit = (kit) =>
  buildSchedule(kit.source?.interview_days, kit.questions || []);

export const generateInterviewKit = async ({
  companyUrl,
  days,
  jobDescription,
}) => {
  const url = new URL(companyUrl);
  if (!["http:", "https:"].includes(url.protocol))
    throw Object.assign(new Error("Company URL must use HTTP or HTTPS"), {
      statusCode: 400,
      code: "INVALID_URL",
    });
  const { pages, urls } = await crawlCompany(companyUrl);
  const roleResult = await extractRole(jobDescription);
  const requirements = normalizeRequirements(roleResult.requirements);
  const companyBriefResult = await generateCompanyBrief(
    pages.map((page) => page.text).join("\n\n") ||
      "No company-page content was available.",
    urls,
  );
  const role = {
    title: roleResult.title || "",
    seniority: roleResult.seniority || "",
    responsibilities: Array.isArray(roleResult.responsibilities)
      ? roleResult.responsibilities.filter((item) => typeof item === "string")
      : [],
    requirements,
  };
  const company_brief = {
    ...companyBriefResult,
    sources: Array.isArray(companyBriefResult.sources)
      ? companyBriefResult.sources.filter((source) => urls.includes(source))
      : [],
  };
  const questions = normalizeQuestions(
    await generateQuestions(role, company_brief, requirements),
    requirements.map((requirement) => requirement.id),
  );
  const flashcards = normalizeFlashcards(
    await generateFlashcards(role, requirements, questions),
    requirements.map((requirement) => requirement.id),
  );
  return {
    source: {
      company: url.hostname.replace(/^www\./, ""),
      company_url: companyUrl,
      role: role.title,
      interview_days: Number(days),
      jd_chars: jobDescription.length,
      researched_at: new Date(),
      pages_used: urls,
    },
    company_brief,
    role,
    questions,
    flashcards,
    schedule: buildSchedule(days, questions),
    coverage: calculateCoverage(requirements, questions, 1),
    status: "ready",
  };
};
