import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

import { Category, sequelize } from "./models/associations";
import categoryRoutes from "./routes/categoryRoutes";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRouters";
import statisticsRoutes from "./routes/statisticsRoutes";
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
app.use("/api/stats", statisticsRoutes);

const start = async () => {
  try {
    await sequelize.authenticate();

    await sequelize.sync({ alter: true });

    console.log(" Database connected and synced");

    app.listen(PORT, () => {
      console.log(` Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(" Error during server startup:", error);
  }
};

start();
