import Kit from "../models/Kit.js";
import {
  generateFlashcardsForKit,
  generateQuestionsForKit,
  generateScheduleForKit,
} from "../services/kitGenerator.js";

const getOwnedKit = async (req, res) => {
  const kit = await Kit.findById(req.params.id);
  if (!kit) {
    res
      .status(404)
      .json({
        success: false,
        message: "Kit not found",
        code: "KIT_NOT_FOUND",
      });
    return null;
  }
  if (kit.userId.toString() !== req.user._id.toString()) {
    res
      .status(403)
      .json({ success: false, message: "Forbidden", code: "FORBIDDEN" });
    return null;
  }
  return kit;
};

export const regenerateQuestions = async (req, res, next) => {
  try {
    const kit = await getOwnedKit(req, res);
    if (!kit) return;
    const { questions, coverage } = await generateQuestionsForKit(kit);
    kit.questions = questions;
    kit.coverage = coverage;
    await kit.save();
    return res.json({
      success: true,
      data: { questions: kit.questions, coverage: kit.coverage },
    });
  } catch (error) {
    next(error);
  }
};

export const regenerateFlashcards = async (req, res, next) => {
  try {
    const kit = await getOwnedKit(req, res);
    if (!kit) return;
    if (!kit.questions?.length)
      return res
        .status(400)
        .json({
          success: false,
          message: "Generate questions before flashcards.",
          code: "QUESTIONS_REQUIRED",
        });
    kit.flashcards = await generateFlashcardsForKit(kit);
    await kit.save();
    return res.json({ success: true, data: { flashcards: kit.flashcards } });
  } catch (error) {
    next(error);
  }
};

export const regenerateSchedule = async (req, res, next) => {
  try {
    const kit = await getOwnedKit(req, res);
    if (!kit) return;
    if (!kit.questions?.length)
      return res
        .status(400)
        .json({
          success: false,
          message: "Generate questions before a schedule.",
          code: "QUESTIONS_REQUIRED",
        });
    kit.schedule = generateScheduleForKit(kit);
    await kit.save();
    return res.json({ success: true, data: { schedule: kit.schedule } });
  } catch (error) {
    next(error);
  }
};
