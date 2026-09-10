import { Router } from "express";
import { createKit, deleteKit, getKit, listKits } from "../controllers/kitController.js";
import { protect } from "../middleware/authMiddleware.js";
import { createQuestions } from "../controllers/questionController.js";

const router = Router();
router.use(protect);
router.route("/").get(listKits).post(createKit);
router.post("/:id/questions", createQuestions);
router.route("/:id").get(getKit).delete(deleteKit);
export default router;
