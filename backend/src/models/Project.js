import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["planning", "in-progress", "blocked", "completed", "archived"],
      default: "planning",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    dueDate: Date,
    budget: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    color: {
      type: String,
      default: "indigo",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ name: "text", description: "text", category: "text" });

const Project = mongoose.model("Project", projectSchema);

export default Project;

