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

  // 1. Извлекаем токен из строки "Bearer <token>".
  // Мы берем только вторую часть массива после пробела.
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  try {
    // 2. Берем секретный ключ. Он нужен для проверки подлинности токена.
    const secret = process.env.JWT_SECRET as string;

    // 3. ПРОВЕРКА И РАСШИФРОВКА:
    // jwt.verify проверяет, не изменен ли токен, и извлекает данные (userId).
    // 'as JwtUser' подсказывает TypeScript, какие именно поля есть внутри.
    const decoded = jwt.verify(token, secret) as JwtUser;

    // 4. ПЕРЕДАЧА ДАННЫХ ДАЛЬШЕ:
    // Записываем расшифрованный ID в объект запроса,
    // чтобы контроллеры могли сразу его использовать.
    req.user = decoded;

    // Пропускаем запрос к следующей функции (контроллеру)
    next();
  } catch (error: any) {
    console.error("❌ Ошибка токена:", error.message);
    return res
      .status(403)
      .json({ error: "Токен недействителен или просрочен" });
  }
};
