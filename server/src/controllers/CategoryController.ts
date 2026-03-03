import { Request, Response } from "express";
import { Transaction, Category, User, sequelize } from "../models/associations"; 
import { Op } from "sequelize"; 

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

    const { name, type } = req.body;


    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      res.status(401).json({ error: "Пользователь не авторизован" });
      return;
    }


    const newCategory = await Category.create({
      name,
      type,
      userId: currentUserId, // Привязываем к текущему юзеру
    });

 
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


    const category = await Category.findByPk(categoryIdToDelete, {
      transaction: t,
    });

    if (!category) {
      await t.rollback();
      res.status(404).json({ error: "Категория не найдена" });
      return;
    }

 
    if (category.userId === null) {
      await t.rollback();
      res.status(403).json({ error: "Нельзя удалить системную категорию" });
      return;
    }

  
    if (category.userId !== currentUserId) {
      await t.rollback();
      res.status(403).json({ error: "Это не ваша категория" });
      return;
    }


    const [otherCategory] = await Category.findOrCreate({
      where: {
        name: "Другое",
        userId: null,
      },
      defaults: {
        name: "Другое", 
        type: "expense", 
        userId: null, 
      },
      transaction: t,
    });


    await Transaction.update(
      { categoryId: otherCategory.Id }, 
      {
        where: { categoryId: categoryIdToDelete },
        transaction: t,
      },
    );


    await category.destroy({ transaction: t });


    await t.commit();

    res.json({ message: "Категория удалена, данные перенесены в 'Другое'" });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: "Ошибка на сервере при удалении категории" });
  }
};
