import express from "express";

import { getTeam } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/team", getTeam);

export default router;

