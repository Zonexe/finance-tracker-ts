import { defineStore } from "pinia";
import { ref, computed } from "vue"; // Добавили computed
import type { User } from "../types";

export const useAuthStore = defineStore("auth", () => {
  // 1. Пытаемся достать данные из памяти при запуске приложения
  const token = ref<string | null>(localStorage.getItem("token"));

  // Юзера тоже достаем из памяти. JSON.parse превращает строку обратно в объект.
  const savedUser = localStorage.getItem("user");
  const user = ref<User | null>(savedUser ? JSON.parse(savedUser) : null);

  // 2. Геттер: залогинен ли юзер?
  // В Vue лучше использовать computed, он работает быстрее и "умнее" обычных функций
  const isLoggedIn = computed(() => !!token.value);

  // 3. Действия
  const setAuth = (newToken: string, newUser: User) => {
    token.value = newToken;
    user.value = newUser;

    localStorage.setItem("token", newToken);
    // ВАЖНО: превращаем объект в строку для хранения
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // 4. Возвращаем ВСЁ, что хотим использовать в компонентах
  // (Ты забыл добавить isLoggedIn в прошлый раз)
  return { token, user, isLoggedIn, setAuth, logout };
});
