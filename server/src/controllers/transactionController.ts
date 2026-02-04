import { Request, Response } from "express";
import { Transaction, User, Category, sequelize } from "../models/associations";
import { Op, WhereOptions } from "sequelize";

type PeriodKey = "week" | "month" | "year";

const daysMap: Record<PeriodKey, number> = {
  week: 7,
  month: 30,
  year: 365,
};

export const addTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { amount, categoryId, comment } = req.body;
    const UserId = req.user?.userId;
    if (!UserId) {
      await t.rollback();
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }
    const user = await User.findByPk(UserId, { transaction: t });
    const category = await Category.findByPk(categoryId, { transaction: t });

    if (!user || !category) {
      await t.rollback();
      res.status(404).json({ error: "Пользователь или категория не найдены" });
      return;
    }

    const numericAmount = Number(amount);

    if (isNaN(numericAmount)) {
      await t.rollback();
      res.status(400).json({ error: "Некорректная сумма" });
      return;
    }

    if (category.type === "expense") {
      user.balance -= numericAmount;
    } else {
      user.balance += numericAmount;
    }

 
    await user.save({ transaction: t });

    // 5. Создаем запись о транзакции
    const newTransaction = await Transaction.create(
      {
        amount: numericAmount,
        categoryId: category.Id, 
        userId: user.Id,
        comment: comment || "",
        date: new Date(),
      },
      { transaction: t },
    );


    await t.commit();

    res.status(201).json({
      message: "Транзакция успешно добавлена",
      transaction: newTransaction,
      newBalance: user.balance,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: "Ошибка при создании транзакции" });
  }
};

export const getTransactions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { period } = req.query;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    let fromDate: Date | null = null;

    if (typeof period === "string" && period in daysMap) {
      const days = daysMap[period as PeriodKey];
      fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
    }

    const where: any = { userId };

    if (fromDate) {
      where.date = { [Op.gte]: fromDate };
    }

    const transactions = await Transaction.findAll({
      where,
      include: [Category],
      order: [["date", "DESC"]],
    });

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при выводе ваших транзакций" });
  }
};
