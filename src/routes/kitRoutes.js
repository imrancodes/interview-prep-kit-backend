import { Router } from "express";
import { createKit, deleteKit, getKit, listKits } from "../controllers/kitController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.use(protect);
router.route("/").get(listKits).post(createKit);
router.route("/:id").get(getKit).delete(deleteKit);
export default router;
