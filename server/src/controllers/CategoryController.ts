import { Request, Response } from "express";
import { Transaction, Category, User, sequelize } from "../models/associations"; // Используем import
import { Op } from "sequelize"; // Используем import

export const getCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const currentUserId = req.user?.userId;

    const categories = await Category.findAll({
      where: {
        [Op.or]: [
          { userId: null },
          { userId: currentUserId }, // Личные категории текущего юзера
        ],
      },
      order: [["name", "ASC"]],
    });

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера при получении категорий" });
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // 1. Берем только имя и тип. Id база создаст сама.
    const { name, type } = req.body;

    // Достаем ID пользователя из токена (уже проверено Middleware)
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }

    // 2. Создаем категорию
    const newCategory = await Category.create({
      name,
      type,
      userId: currentUserId, // Привязываем к текущему юзеру
    });

    // 3. Достаем созданную категорию вместе с инфо о создателе (для подтверждения)
    const result = await Category.findByPk(newCategory.Id, {
      include: [{ model: User, attributes: ["username"] }],
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера при создании категории" });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const categoryIdToDelete = Number(req.params.Id);
    const currentUserId = req.user?.userId;

    if (isNaN(categoryIdToDelete)) {
      await t.rollback();
      res.status(400).json({ error: "Некорректный ID категории" });
      return;
    }

    // 1. Ищем категорию, которую хотим удалить
    const category = await Category.findByPk(categoryIdToDelete, {
      transaction: t,
    });

    if (!category) {
      await t.rollback();
      res.status(404).json({ error: "Категория не найдена" });
      return;
    }

    // 2. ЗАЩИТА: Запрещаем удалять системные категории (где userId === null)
    if (category.userId === null) {
      await t.rollback();
      res.status(403).json({ error: "Нельзя удалить системную категорию" });
      return;
    }

    // 3. ЗАЩИТА: Проверяем владельца
    if (category.userId !== currentUserId) {
      await t.rollback();
      res.status(403).json({ error: "Это не ваша категория" });
      return;
    }

    // 4. ЛОГИКА "ДРУГОЕ": Находим или создаем системную категорию для переноса
    // Мы ищем категорию "Другое", у которой userId равен null
    // Находим или создаем системную категорию "Другое"
    const [otherCategory] = await Category.findOrCreate({
      where: {
        name: "Другое",
        userId: null,
      },
      defaults: {
        name: "Другое", // Добавляем сюда, чтобы TS не ругался
        type: "expense", // Указываем тип по умолчанию
        userId: null, // Явно указываем, что она системная
      },
      transaction: t,
    });

    // 5. ПЕРЕПРИВЯЗКА: Все транзакции старой категории перекидываем на "Другое"
    await Transaction.update(
      { categoryId: otherCategory.Id }, // Новый ID (Другое)
      {
        where: { categoryId: categoryIdToDelete },
        transaction: t,
      },
    );

    // 6. УДАЛЕНИЕ самой категории
    await category.destroy({ transaction: t });

    // 7. ФИНАЛ
    await t.commit();

    res.json({ message: "Категория удалена, данные перенесены в 'Другое'" });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: "Ошибка на сервере при удалении категории" });
  }
};
