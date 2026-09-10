export const calculateCoverage = (requirements = [], questions = [], passes = 1) => {
  const requiredIds = requirements.map((requirement) => requirement.id).filter(Boolean);
  const coveredIds = new Set(questions.flatMap((question) => Array.isArray(question.requirement_ids) ? question.requirement_ids : []));
  return { uncovered_requirement_ids: requiredIds.filter((id) => !coveredIds.has(id)), passes };
};
