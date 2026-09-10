import Kit from "../models/Kit.js";

const practicePayload = (kit) => {
  const questions = Array.isArray(kit.questions) ? kit.questions : [];
  const questionIds = questions.map((question) => question.id);
  const completedIds = [
    ...new Set(kit.practice?.completed_question_ids || []),
  ].filter((id) => questionIds.includes(id));
  const completedSet = new Set(completedIds);
  const unansweredIds = questionIds.filter((id) => !completedSet.has(id));
  const savedCurrent = kit.practice?.last_question_id;
  const currentQuestionId = unansweredIds.includes(savedCurrent)
    ? savedCurrent
    : unansweredIds[0] || null;
  const completed = completedIds.length;
  const total = questions.length;

  return {
    progress: {
      completed,
      total,
      percentage: total ? Math.round((completed / total) * 100) : 0,
    },
    currentQuestionId,
    questions,
  };
};

const findOwnedKit = async (req, res) => {
  const kit = await Kit.findById(req.params.id);
  if (!kit) {
    res.status(404).json({ success: false, message: "Kit not found" });
    return null;
  }
  if (kit.userId.toString() !== req.user._id.toString()) {
    res.status(403).json({ success: false, message: "Forbidden" });
    return null;
  }
  return kit;
};

export const getPractice = async (req, res, next) => {
  try {
    const kit = await findOwnedKit(req, res);
    if (!kit) return;
    return res.json({ success: true, ...practicePayload(kit) });
  } catch (error) {
    next(error);
  }
};

export const completePracticeQuestion = async (req, res, next) => {
  try {
    const kit = await findOwnedKit(req, res);
    if (!kit) return;
    const questionId =
      typeof req.body?.questionId === "string" ? req.body.questionId : "";
    if (!kit.questions.some((question) => question.id === questionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Question not found in this kit" });
    }
    const completedIds = new Set(kit.practice?.completed_question_ids || []);
    completedIds.add(questionId);
    const unansweredIds = kit.questions
      .map((question) => question.id)
      .filter((id) => !completedIds.has(id));
    kit.practice = {
      completed_question_ids: [...completedIds],
      last_question_id: unansweredIds[0] || null,
      last_practiced_at: new Date(),
    };
    await kit.save();
    return res.json({ success: true, ...practicePayload(kit) });
  } catch (error) {
    next(error);
  }
};

export const resetPractice = async (req, res, next) => {
  try {
    const kit = await findOwnedKit(req, res);
    if (!kit) return;
    kit.practice = {
      completed_question_ids: [],
      last_question_id: null,
      last_practiced_at: null,
    };
    await kit.save();
    return res.json({ success: true, ...practicePayload(kit) });
  } catch (error) {
    next(error);
  }
};
