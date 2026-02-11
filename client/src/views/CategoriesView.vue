<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "../stores/auth";
import type { Category } from "../types";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();
const categories = ref<Category[]>([]);

const newName = ref("");
const newType = ref("expense");

const API_URL = "http://localhost:5000/api";

const fetchCategories = async () => {
  if (!auth.token || auth.token === "null") {
    router.push("/auth");
    return;
  }
  try {
    const resC = await axios.get(`${API_URL}/categories`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    categories.value = resC.data;
  } catch (error) {
    console.error("Ошибка при отображении категорий", error);
  }
};

const addCategory = async () => {
  if (!auth.token || auth.token === "null") {
    router.push("/auth");
    return;
  }
  try {
    const resC = await axios.post(
      `${API_URL}/categories`,
      { name: newName.value, type: newType.value },
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      },
    );

    categories.value.unshift(resC.data);

    newName.value = "";
    newType.value = "";

    await fetchCategories();
  } catch (error: any) {
    alert(error.response?.data?.error || "Ошибка сервера");
  }
};

const removeCategory = async (Id: number) => {
  if (!auth.token || auth.token === "null") {
    router.push("/auth");
    return;
  }

  if (!confirm("Вы уверены? Транзакции этой категории перейдут в 'Другое'."))
    return;

  try {
    // 1. Используем delete
    // 2. Добавляем слэш перед ID
    await axios.delete(`${API_URL}/categories/${Id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    // Обновляем список на экране
    categories.value = categories.value.filter((cat) => cat.Id !== Id);
  } catch (error) {
    alert("Не удалось удалить категорию");
  }
};

onMounted(fetchCategories);
</script>

<template>
  <div class="categories-container">
    <h1>Управление категориями</h1>

    <!-- 1. ФОРМА ДОБАВЛЕНИЯ -->
    <div class="card add-category-card">
      <h3>Добавить новую категорию</h3>
      <form @submit.prevent="addCategory" class="category-form">
        <input
          v-model="newName"
          type="text"
          class="form-input"
          placeholder="Название (например: Хобби)"
          required
        />

        <select v-model="newType" class="form-input">
          <option value="expense">Расход</option>
          <option value="income">Доход</option>
        </select>

        <button type="submit" class="btn-primary">Создать</button>
      </form>
    </div>

    <!-- 2. СПИСОК КАТЕГОРИЙ -->
    <div class="card categories-list-card">
      <h3>Список категорий</h3>
      <div class="categories-grid">
        <div v-for="cat in categories" :key="cat.Id" class="category-item">
          <div class="category-info">
            <span class="category-name">{{ cat.name }}</span>
            <span :class="['category-type', cat.type]">
              {{ cat.type === "income" ? "Доход" : "Расход" }}
            </span>
          </div>

          <!-- ЛОГИКА УДАЛЕНИЯ -->
          <div class="category-actions">
            <!-- Если userId есть — это личная категория, можно удалить -->
            <button
              v-if="cat.userId !== null"
              @click="removeCategory(cat.Id)"
              class="delete-btn"
              title="Удалить категорию"
            >
              🗑️
            </button>

            <!-- Если userId === null — это системная категория -->
            <span
              v-else
              class="system-badge"
              title="Эту категорию нельзя удалить"
            >
              Системная
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.categories-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  color: var(--text-color);
}

.add-category-card {
  margin-bottom: 25px;
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Стили элементов списка */
.categories-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: var(--border-radius);
  border: 1px solid #eee;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.category-name {
  font-weight: 600;
}

.category-type {
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: bold;
}

.category-type.income {
  background: #e8f5e9;
  color: var(--primary-color);
}

.category-type.expense {
  background: #ffebee;
  color: var(--danger-color);
}

/* Кнопки и значки */
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 5px;
  transition: transform 0.2s;
}

.delete-btn:hover {
  transform: scale(1.2);
}

.system-badge {
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 5px;
}

.card h3 {
  margin-top: 0;
  font-size: 1.1rem;
  color: #666;
}
</style>
