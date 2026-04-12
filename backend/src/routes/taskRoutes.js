import express from "express";

import {
  addComment,
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  toggleSubtask,
  updateTask,
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getTasks).post(createTask);
router.route("/:id").get(getTaskById).put(updateTask).delete(deleteTask);
router.post("/:id/comments", addComment);
router.patch("/:id/subtasks/:subtaskId", toggleSubtask);

export default router;

