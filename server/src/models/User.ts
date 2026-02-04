import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db";

// 1. Описываем все поля, которые есть в базе
interface UserAttributes {
  Id: number;
  username: string;
  email: string;
  password?: string; // необязателен при выдаче данных наружу
  balance: number;
}

// 2. Описываем поля, которые НЕ обязательны при СОЗДАНИИ (например, id генерируется сам)
interface UserCreationAttributes extends Optional<
  UserAttributes,
  "Id" | "balance"
> {}

// 3. Создаем класс модели
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public Id!: number; // знак ! означает "будет инициализировано позже"
  public username!: string;
  public email!: string;
  public password!: string;
  public balance!: number;

  // Таймстампы (создаются автоматически)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 4. Инициализация полей (как мы делали раньше)
User.init(
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    balance: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "users",
  },
);

export default User;
