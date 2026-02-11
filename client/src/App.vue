<script setup lang="ts">
import { RouterView, RouterLink } from "vue-router"; // Добавили RouterLink в импорт
import { useAuthStore } from "./stores/auth";

const auth = useAuthStore();
</script>

<template>
  <header v-if="auth.isLoggedIn" class="main-header">
    <nav class="container">
      <div class="nav-brand">
        <strong> Finance Tracker</strong>
      </div>

      <div class="nav-links">
        <!-- КНОПКИ НАВИГАЦИИ -->
        <RouterLink to="/" class="nav-item">Главная</RouterLink>
        <RouterLink to="/categories" class="nav-item">Категории</RouterLink>

        <span class="separator">|</span>

        <button @click="auth.logout()" class="logout-btn">Выйти</button>
      </div>
    </nav>
  </header>

  <main class="container">
    <RouterView />
  </main>
</template>

<style>
/* Глобальный контейнер для центровки контента */
.container {
  max-width: 1000px;
  margin: 0 auto;
}

.main-header {
  background: white;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 30px;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-item {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  transition: color 0.2s;
}

/* Цвет ссылки, когда мы находимся на этой странице */
.router-link-active {
  color: var(--primary-color);
  font-weight: bold;
}

.separator {
  color: #ddd;
}

.logout-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 5px 15px;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
}

.logout-btn:hover {
  background: #fff1f1;
  color: var(--danger-color);
  border-color: var(--danger-color);
}
</style>
