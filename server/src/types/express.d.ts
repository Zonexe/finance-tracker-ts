import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      // Добавляем наше поле user, чтобы TS перестал ругаться
      user?: {
        userId: number;
      };
    }
  }
}
