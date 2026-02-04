export interface User {
  Id: number;
  username: string;
  email: string;
  balance: number;
}

export interface Category {
  Id: number;
  name: string;
  type: "income" | "expense"; // Теперь тут нельзя ошибиться
  userId: number | null;
}

export interface Transaction {
  Id: number;
  amount: number;
  comment?: string;
  date: string; // JSON передает даты строками
  userId: number;
  categoryId: number;
  Category?: Category; // Позволяет писать item.Category.name
}
