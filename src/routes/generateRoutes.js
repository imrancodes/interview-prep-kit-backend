import { Router } from "express";
import { generateKit } from "../controllers/generateController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = Router();
router.post("/generate", protect, generateKit);
export default router;
