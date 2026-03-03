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
  // 1. Открываем транзакцию (создаем изолированный "черновик" в БД)
  const t = await sequelize.transaction();

  try {
    const { amount, categoryId, comment } = req.body;
    const userId = req.user?.userId; // camelCase для локальных переменных

    if (!userId) {
      await t.rollback();
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    // Ищем данные, привязывая их к транзакции (чтобы другие процессы их не меняли пока мы работаем)
    const user = await User.findByPk(userId, { transaction: t });
    const category = await Category.findByPk(categoryId, { transaction: t });

    if (!user || !category) {
      await t.rollback();
      res.status(404).json({ error: "Пользователь или категория не найдены" });
      return;
    }

    const numericAmount = Number(amount);

    if (category.type === "expense") {
      user.balance -= numericAmount;
    } else {
      user.balance += numericAmount;
    }

    // 2. Сохраняем новый баланс ВНУТРИ черновика транзакции.
    // На этом этапе база "замораживает" строку этого пользователя для других.
    await user.save({ transaction: t });

    // 3. Создаем запись о транзакции ВНУТРИ черновика.
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

    // 4. ФИНАЛИЗАЦИЯ: Все изменения из черновика переносятся в реальную БД одним махом.
    await t.commit();

    res.status(201).json({
      message: "Транзакция успешно добавлена",
      transaction: newTransaction,
      newBalance: user.balance,
    });
  } catch (error) {
    // 5. ОТКАТ: Если хоть одна строка в блоке try выдала ошибку,
    // отменяем все действия, чтобы баланс не "поломался".
    if (t) await t.rollback();
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

interface TransactionWithCategory extends Transaction {
  Category: Category; // Здесь мы гарантируем наличие категории
}

export const deleteTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const transactionId = Number(req.params.Id);
    const userId = req.user?.userId;

    if (isNaN(transactionId)) {
      await t.rollback();
      res.status(400).json({ error: "Некорректный ID транзакции" });
      return;
    }
    if (!userId) {
      await t.rollback();
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    const transaction = (await Transaction.findByPk(transactionId, {
      include: [Category],
      transaction: t,
    })) as unknown as TransactionWithCategory;

    if (!transaction) {
      await t.rollback();
      res.status(404).json({ error: "Транзакция не найдена" });
      return;
    }

    if (transaction.userId !== userId) {
      await t.rollback();
      res.status(403).json({ error: "Запрещено удалять чужие записи" });
      return;
    }

    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    if (transaction.Category?.type === "expense") {
      user.balance += Number(transaction.amount);
    } else {
      user.balance -= Number(transaction.amount);
    }

    await user.save({ transaction: t });
    await transaction.destroy({ transaction: t });

    await t.commit();

    res.json({ message: "Удалено", newBalance: user.balance });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: "Ошибка на сервере" });
  }
};
