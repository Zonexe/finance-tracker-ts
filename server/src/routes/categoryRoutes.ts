import { Router } from "express";
import {
  getCategories,
  createCategory,
} from "../controllers/CategoryController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createCategory);
router.get("/", authMiddleware, getCategories);

export default router;
