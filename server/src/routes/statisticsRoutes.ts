import { Router } from "express";
import statisticsController from "../controllers/statisticsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();


router.get(
  "/category-totals",
  authMiddleware,
  statisticsController.getExpensesByCategory,
);

export default router;
