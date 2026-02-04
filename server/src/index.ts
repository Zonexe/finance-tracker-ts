import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

import { Category, sequelize } from "./models/associations";
import categoryRoutes from "./routes/categoryRoutes";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRouters"; // Проверь название файла! // Проверь название файла!

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Базовый маршрут для проверки
app.get("/", (req, res) => {
  res.send("Finance Tracker API is running...");
});
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/transactions", transactionRoutes);

const start = async () => {
  try {
    // 1. Проверяем связь с базой
    await sequelize.authenticate();

    // 2. Синхронизируем структуру (alter: true не удаляет данные, а только подправляет таблицы)
    await sequelize.sync({ alter: true });

    console.log("✨ Database connected and synced");

    // 3. Запускаем сервер
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error during server startup:", error);
  }
};

start();
