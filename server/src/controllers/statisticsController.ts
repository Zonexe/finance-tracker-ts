import { Request, Response } from "express";
import { Transaction, Category, sequelize } from "../models/associations";

class StatisticsController {
  public async getExpensesByCategory(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user?.userId;


      const stats = await Transaction.findAll({
        attributes: [

          [sequelize.fn("SUM", sequelize.col("amount")), "total"],
          "categoryId",
        ],
        where: { userId }, 
        include: [
          {
            model: Category,
            attributes: ["name", "type"],
            where: { type: "expense" }, 
          },
        ],
        
        group: [
          "Transaction.categoryId",
          "Category.Id",
          "Category.name",
          "Category.type",
        ],
      });

      
      res.json(stats);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Ошибка сервера при расчете статистики" });
    }
  }
}

export default new StatisticsController();
