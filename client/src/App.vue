<script setup lang="ts">
import { RouterView } from "vue-router";
import { useAuthStore } from "./stores/auth";

const auth = useAuthStore();
</script>

<template>
  <header v-if="auth.isLoggedIn">
    <!-- Здесь позже сделаем красивое меню -->
    <nav>
      <strong>Finance Tracker</strong> |
      <button @click="auth.logout()">Выйти</button>
    </nav>
  </header>

  <!-- RouterView — это место, куда будут "подставляться" HomeView или AuthView -->
  <RouterView />
</template>

<style>
/* Сюда можно добавить отступы для всего приложения */
#app {
  padding: 20px;
}
</style>
