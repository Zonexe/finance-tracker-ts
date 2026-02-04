import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db";

interface CategoryAttributes {
  Id: number;
  name: string;
  type: string;
  userId: number | null;
}

interface CategoryCreationAttributes extends Optional<
  CategoryAttributes,
  "Id" | "userId"
> {}

class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  public Id!: number;
  public name!: string;
  public type!: string;
  public userId!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Category.init(
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "categories",
  },
);

export default Category;
