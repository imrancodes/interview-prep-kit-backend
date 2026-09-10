import Kit from "../models/Kit.js";
import { generateFlashcards, normalizeFlashcards } from "../services/flashcardGenerator.js";
import { buildSchedule } from "../services/scheduler.js";

export const createPlan = async (req, res, next) => {
  try {
    const kit = await Kit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!kit) return res.status(404).json({ success: false, message: "Interview kit not found." });
    if (!kit.questions?.length) return res.status(400).json({ success: false, message: "Generate interview questions before creating a study plan." });
    const requirementIds = (kit.role?.requirements || []).map((requirement) => requirement.id);
    kit.schedule = buildSchedule(kit.source?.interview_days, kit.questions);
    try { kit.flashcards = normalizeFlashcards(await generateFlashcards(kit.role, kit.role?.requirements || [], kit.questions), requirementIds); } catch (error) { console.error("Flashcard generation failed; saving schedule only", { kitId: kit._id.toString(), error: error.message, status: error.statusCode }); }
    await kit.save();
    return res.json({ success: true, data: { kit, partial: !kit.flashcards.length } });
  } catch (error) { console.error("Study plan generation failed", { kitId: req.params.id, error: error.message, status: error.statusCode }); next(error); }
};
