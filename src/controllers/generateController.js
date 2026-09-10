import Kit from "../models/Kit.js";
import { generateInterviewKit } from "../services/kitGenerator.js";

const validateInput = ({ companyUrl, days, jobDescription }) => {
  if (typeof companyUrl !== "string" || !companyUrl.trim())
    return "Provide a company URL.";
  if (typeof jobDescription !== "string" || jobDescription.trim().length < 30)
    return "Provide a job description with at least 30 characters.";
  if (!Number.isInteger(Number(days)) || Number(days) < 1 || Number(days) > 365)
    return "Interview days must be a whole number between 1 and 365.";
  return null;
};

export const generateKit = async (req, res, next) => {
  try {
    const input = req.body || {};
    const validationError = validateInput(input);
    if (validationError)
      return res
        .status(400)
        .json({
          success: false,
          message: validationError,
          code: "VALIDATION_FAILED",
        });
    const generated = await generateInterviewKit({
      companyUrl: input.companyUrl.trim(),
      days: Number(input.days),
      jobDescription: input.jobDescription.trim(),
    });
    const kit = await Kit.create({ userId: req.user._id, ...generated });
    return res.status(201).json({ success: true, kit });
  } catch (error) {
    next(error);
  }
};
