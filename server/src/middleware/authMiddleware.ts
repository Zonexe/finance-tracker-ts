import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtUser {
  userId: number;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;


  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  try {

    const secret = process.env.JWT_SECRET as string;


    const decoded = jwt.verify(token, secret) as JwtUser;


    req.user = decoded;


    next();
  } catch (error: any) {
    console.error("❌ Ошибка токена:", error.message);
    return res
      .status(403)
      .json({ error: "Токен недействителен или просрочен" });
  }
};
