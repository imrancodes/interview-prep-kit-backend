import { Router } from "express";
import {
  createKit,
  deleteKit,
  getKit,
  listKits,
} from "../controllers/kitController.js";
import {
  completePracticeQuestion,
  getPractice,
  resetPractice,
} from "../controllers/practiceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { createQuestions } from "../controllers/questionController.js";
import { createPlan } from "../controllers/planController.js";
import {
  regenerateFlashcards,
  regenerateQuestions,
  regenerateSchedule,
} from "../controllers/regenerateController.js";

const router = Router();
router.use(protect);
router.route("/").get(listKits).post(createKit);
router.post("/:id/questions", createQuestions);
router.post("/:id/plan", createPlan);
router.post("/:id/regenerate/questions", regenerateQuestions);
router.post("/:id/regenerate/flashcards", regenerateFlashcards);
router.post("/:id/regenerate/schedule", regenerateSchedule);
router.get("/:id/practice", getPractice);
router.post("/:id/practice/complete", completePracticeQuestion);
router.post("/:id/practice/reset", resetPractice);
router.route("/:id").get(getKit).delete(deleteKit);
export default router;
