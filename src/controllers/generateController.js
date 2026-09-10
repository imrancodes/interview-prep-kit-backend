import Kit from "../models/Kit.js";
import { crawlCompany } from "../services/crawler.js";
import { extractRole, generateCompanyBrief } from "../services/extractor.js";

const normalizeRequirements = (requirements) =>
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
export const generateKit = async (req, res, next) => {
  try {
    const { companyUrl, days, jobDescription } = req.body || {};
    if (
      typeof companyUrl !== "string" ||
      !companyUrl.trim() ||
      typeof jobDescription !== "string" ||
      jobDescription.trim().length < 30 ||
      !Number.isInteger(Number(days)) ||
      Number(days) < 1
    )
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Provide a company URL, job description (30+ characters), and at least one interview day",
        });
    const { pages, urls } = await crawlCompany(companyUrl.trim());
    const companyText = pages.map((page) => page.text).join("\n\n");
    const role = await extractRole(jobDescription.trim());
    const company_brief = await generateCompanyBrief(
      companyText || "No company-page content was available.",
      urls,
    );
    const kit = await Kit.create({
      userId: req.user._id,
      source: {
        company: new URL(companyUrl).hostname.replace(/^www\./, ""),
        company_url: companyUrl.trim(),
        role: role.title || "",
        interview_days: Number(days),
        jd_chars: jobDescription.length,
        researched_at: new Date(),
        pages_used: urls,
      },
      company_brief: {
        ...company_brief,
        sources: Array.isArray(company_brief.sources)
          ? company_brief.sources.filter((url) => urls.includes(url))
          : [],
      },
      role: {
        title: role.title || "",
        seniority: role.seniority || "",
        responsibilities: Array.isArray(role.responsibilities)
          ? role.responsibilities.filter((item) => typeof item === "string")
          : [],
        requirements: normalizeRequirements(role.requirements),
      },
      status: "draft",
    });
    return res.status(201).json({ success: true, kit });
  } catch (error) {
    console.error("Draft kit generation failed:", error.message);
    next(error);
  }
};
