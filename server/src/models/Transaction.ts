import { DataTypes, Model, Optional } from "sequelize";
import Category from "./Category";
import sequelize from "../db";

interface TransactionAttributes {
  Id: number;
  amount: number;
  comment?: string;
  date: Date;
  userId: number;
  categoryId: number;
  Category?: Category;
}

interface TransactionCreationAttributes extends Optional<
  TransactionAttributes,
  "Id" | "comment"
> {}

class Transaction
  extends Model<TransactionAttributes, TransactionCreationAttributes>
  implements TransactionAttributes
{
  public Id!: number;
  public amount!: number;
  public comment?: string;
  public date!: Date;
  public userId!: number;
  public categoryId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "transactions",
  },
);

export default Transaction;
