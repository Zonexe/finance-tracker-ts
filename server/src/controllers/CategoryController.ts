import { Request, Response } from "express";
import { Category, User } from "../models/associations"; // Используем import
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
