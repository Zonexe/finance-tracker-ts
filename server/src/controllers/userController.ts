import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/associations";
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: number;
  email: string;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    const userResponse = newUser.toJSON();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при регистрации" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;


    const user = await User.findOne({ where: { email } });


    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Неверный логин или пароль" });
      return;
    }

    const payload: TokenPayload = {
      userId: user.Id,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "24h",
    });


    res.json({
      token,
      username: user.username,
      Id: user.Id, 
      balance: user.balance, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при входе" });
  }
};

export const checkEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
