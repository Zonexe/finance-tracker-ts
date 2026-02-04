import { Router } from "express";
import { register, login, checkEmail } from "../controllers/userController";

const router = Router();

router.post("/check-email", checkEmail); // Путь: /api/auth/check-email
router.post("/register", register); // Путь: /api/auth/register
router.post("/login", login); // Путь: /api/auth/login

export default router;
