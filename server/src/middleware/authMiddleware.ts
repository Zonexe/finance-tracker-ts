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
  const authHeader = req.headers.authorization; // Более надежный способ получения
  const token = authHeader?.split(" ")[1];

  console.log("ПРИШЕЛ ТОКЕН:", token);
  if (!token) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  try {
    const secret = process.env.JWT_SECRET;

    // ПРОВЕРКА: если секрет не подгрузился из .env
    if (!secret) {
      console.error("❌ ОШИБКА: JWT_SECRET не найден в переменных окружения!");
      return res.status(500).json({ error: "Ошибка конфигурации сервера" });
    }

    const decoded = jwt.verify(token, secret) as JwtUser;
    req.user = decoded;
    next();
  } catch (error: any) {
    // ВАЖНО: выводим реальную причину ошибки в консоль бэкенда
    console.error("❌ Ошибка токена:", error.message);
    return res
      .status(403)
      .json({ error: "Токен недействителен или просрочен" });
  }
};
