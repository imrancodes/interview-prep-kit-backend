import mongoose from "mongoose";

const kitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    source: { type: String, default: "" },
    company_brief: { type: mongoose.Schema.Types.Mixed, default: null },
    role: { type: String, default: "" },
    questions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    flashcards: { type: [mongoose.Schema.Types.Mixed], default: [] },
    schedule: { type: mongoose.Schema.Types.Mixed, default: null },
    coverage: { type: mongoose.Schema.Types.Mixed, default: null },
    status: { type: String, enum: ["draft", "ready"], default: "draft" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model("Kit", kitSchema);
