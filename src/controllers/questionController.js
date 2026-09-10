import Kit from "../models/Kit.js";
import { calculateCoverage } from "../services/coverage.js";
import {
  generateQuestions,
  normalizeQuestions,
} from "../services/questionGenerator.js";

export const createQuestions = async (req, res, next) => {
  try {
    const kit = await Kit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!kit)
      return res
        .status(404)
        .json({ success: false, message: "Interview kit not found." });
    const requirements = kit.role?.requirements || [];
    if (!requirements.length)
      return res
        .status(400)
        .json({
          success: false,
          message: "This kit has no requirements to generate questions from.",
        });
    const requirementIds = requirements.map((requirement) => requirement.id);
    let questions = normalizeQuestions(
      await generateQuestions(kit.role, kit.company_brief, requirements),
      requirementIds,
    );
    let coverage = calculateCoverage(requirements, questions, 1);
    if (coverage.uncovered_requirement_ids.length) {
      try {
        const missing = requirements.filter((requirement) =>
          coverage.uncovered_requirement_ids.includes(requirement.id),
        );
        const additional = normalizeQuestions(
          await generateQuestions(kit.role, kit.company_brief, missing),
          requirementIds,
        ).map((question, index) => ({
          ...question,
          id: `q${questions.length + index + 1}`,
        }));
        questions = [...questions, ...additional];
        coverage = calculateCoverage(requirements, questions, 2);
      } catch (error) {
        console.error("Question coverage second pass failed", {
          kitId: kit._id.toString(),
          error: error.message,
          status: error.statusCode,
        });
      }
    }
    kit.questions = questions;
    kit.coverage = coverage;
    await kit.save();
    return res.json({ success: true, data: { kit } });
  } catch (error) {
    console.error("Question generation failed", {
      kitId: req.params.id,
      error: error.message,
      status: error.statusCode,
      cause: error.cause?.message,
    });
    next(error);
  }
};
