import Kit from "../models/Kit.js";

export const listKits = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        kits: await Kit.find({ userId: req.user._id }).sort({ createdAt: -1 }),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createKit = async (req, res, next) => {
  try {
    const body = req.body || {};
    const kit = await Kit.create({
      userId: req.user._id,
      source: typeof body.source === "string" ? body.source.trim() : "",
      role: typeof body.role === "string" ? body.role.trim() : "",
    });
    res.status(201).json({ success: true, data: { kit } });
  } catch (error) {
    next(error);
  }
};

export const getKit = async (req, res, next) => {
  try {
    const kit = await Kit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!kit)
      return res.status(404).json({ success: false, message: "Kit not found" });
    return res.json({ success: true, data: { kit } });
  } catch (error) {
    next(error);
  }
};

export const deleteKit = async (req, res, next) => {
  try {
    const kit = await Kit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!kit)
      return res.status(404).json({ success: false, message: "Kit not found" });
    return res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
