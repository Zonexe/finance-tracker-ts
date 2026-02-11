import { Router } from "express";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../controllers/CategoryController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getCategories);
router.post("/", authMiddleware, createCategory);

// ПРОВЕРЬ ЭТУ СТРОКУ:
// Должно быть .delete, путь '/:Id' и функция deleteCategory
router.delete("/:Id", authMiddleware, deleteCategory);

export default router;
