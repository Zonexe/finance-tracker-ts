import { Router } from "express";
import {
  addTransaction,
  getTransactions,
} from "../controllers/transactionController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authMiddleware, addTransaction);
router.get("/", authMiddleware, getTransactions);

export default router;
