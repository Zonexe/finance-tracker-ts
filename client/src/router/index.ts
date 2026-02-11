import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AuthView from "../views/AuthView.vue";
// 1. ОБЯЗАТЕЛЬНО ДОБАВЬ ЭТУ СТРОКУ:
import CategoriesView from "../views/CategoriesView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/auth",
      name: "auth",
      component: AuthView,
    },
    {
      path: "/categories",
      name: "categories",
      // 2. Теперь это название будет работать
      component: CategoriesView,
    },
  ],
});

export default router;
