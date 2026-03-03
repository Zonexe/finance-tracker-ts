import { Router } from "express";
import { register, login, checkEmail } from "../controllers/userController";

const router = Router();

router.post("/check-email", checkEmail); 
router.post("/register", register); 
router.post("/login", login); 

export default router;
