import sequelize from "../db";
import User from "./User";
import Category from "./Category";
import Transaction from "./Transaction";

// Связи
User.hasMany(Transaction, { foreignKey: "userId", sourceKey: "Id" });
Transaction.belongsTo(User, { foreignKey: "userId", targetKey: "Id" });

Category.hasMany(Transaction, { foreignKey: "categoryId", sourceKey: "Id" });
Transaction.belongsTo(Category, { foreignKey: "categoryId", targetKey: "Id" });

User.hasMany(Category, { foreignKey: "userId", sourceKey: "Id" });
Category.belongsTo(User, { foreignKey: "userId", targetKey: "Id" });

export { sequelize, User, Category, Transaction };
