<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { useAuthStore } from "../stores/auth";
import type { Transaction, Category } from "../types";
import router from "@/router";

const auth = useAuthStore();
const transactions = ref<Transaction[]>([]);
const categories = ref<Category[]>([]);

// Данные формы
const amount = ref<number | "">("");
const categoryId = ref<number | "">("");
const comment = ref("");

const API_URL = "http://localhost:5000/api";

// 1. Загрузка данных
const loadData = async () => {
  if (!auth.token || auth.token === "null") {
    console.warn("Запрос отменен: пользователь не авторизован");
    router.push("/auth"); // Перекидываем на вход
    return;
  }
  try {
    const resT = await axios.get(`${API_URL}/transactions`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    transactions.value = resT.data;

    const resC = await axios.get(`${API_URL}/categories`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    categories.value = resC.data;
  } catch (error) {
    console.error("Ошибка при загрузке данных", error);
  }
};

// 2. Добавление транзакции
const handleAdd = async () => {
  if (!amount.value || !categoryId.value) {
    alert("Заполните сумму и категорию");
    return;
  }

  try {
    const response = await axios.post(
      `${API_URL}/transactions`,
      {
        amount: amount.value,
        categoryId: categoryId.value,
        comment: comment.value,
      },
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      },
    );

    // Добавляем новую транзакцию в начало списка
    // Мы берем полную информацию о транзакции, которую вернул сервер
    transactions.value.unshift(response.data.transaction);

    // Обновляем баланс в Pinia
    if (auth.user) {
      auth.user.balance = response.data.newBalance;
      localStorage.setItem("user", JSON.stringify(auth.user));
    }

    // Очищаем форму
    amount.value = "";
    categoryId.value = "";
    comment.value = "";

    // После добавления транзакции полезно перезагрузить данные,
    // чтобы подтянулись названия категорий в список
    await loadData();
  } catch (error: any) {
    alert(error.response?.data?.error || "Ошибка сервера");
  }
};

// Функция для красивой даты
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  });
};

onMounted(loadData);
</script>

<template>
  <div class="home-container" v-if="auth.user">
    <!-- 1. КАРТОЧКА БАЛАНСА -->
    <div class="card balance-card">
      <span class="label">Общий баланс</span>
      <h2 :class="['balance-value', { negative: auth.user?.balance < 0 }]">
        {{ auth.user?.balance?.toLocaleString() || 0 }} ₽
      </h2>
    </div>

    <!-- 2. ФОРМА ДОБАВЛЕНИЯ -->
    <div class="card add-form">
      <h3>Новая операция</h3>
      <form @submit.prevent="handleAdd">
        <div class="form-row">
          <input
            v-model="amount"
            type="number"
            class="form-input"
            placeholder="Сумма"
            required
          />

          <select v-model="categoryId" class="form-input" required>
            <option value="" disabled>Категория</option>
            <option v-for="cat in categories" :key="cat.Id" :value="cat.Id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <input
          v-model="comment"
          type="text"
          class="form-input"
          placeholder="Комментарий (необязательно)"
        />
        <button type="submit" class="btn-primary">Добавить запись</button>
      </form>
    </div>

    <!-- 3. СПИСОК ТРАНЗАКЦИЙ -->
    <div class="card history">
      <h3>История операций</h3>

      <div v-if="transactions.length === 0" class="empty-state">
        Здесь пока пусто...
      </div>

      <div v-for="t in transactions" :key="t.Id" class="transaction-item">
        <div class="t-left">
          <div class="t-date">{{ formatDate(t.date) }}</div>
          <div class="t-info">
            <span class="t-category">{{
              t.Category?.name || "Без категории"
            }}</span>
            <span class="t-comment" v-if="t.comment">{{ t.comment }}</span>
          </div>
        </div>

        <!-- Если категория типа expense, ставим минус, если income - плюс -->
        <div :class="['t-amount', t.Category?.type]">
          {{ t.Category?.type === "expense" ? "-" : "+" }} {{ t.amount }} ₽
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 500px;
  margin: 20px auto;
  padding: 0 15px;
}

.balance-card {
  text-align: center;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #42b983 0%, #34495e 100%);
  color: white;
}
.balance-value {
  font-size: 2.5rem;
  margin: 10px 0;
}
.balance-value.negative {
  color: #ff7675;
}
.label {
  opacity: 0.8;
  font-size: 0.9rem;
}

.form-row {
  display: flex;
  gap: 10px;
}

.history {
  margin-top: 20px;
}

/* Стили элементов списка */
.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.transaction-item:last-child {
  border-bottom: none;
}

.t-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.t-date {
  font-size: 0.8rem;
  color: #999;
  background: #f8f9fa;
  padding: 5px;
  border-radius: 6px;
  width: 45px;
  text-align: center;
}

.t-info {
  display: flex;
  flex-direction: column;
}
.t-category {
  font-weight: 600;
  font-size: 1rem;
}
.t-comment {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.t-amount {
  font-weight: bold;
  font-size: 1.1rem;
}
.t-amount.expense {
  color: var(--danger-color);
}
.t-amount.income {
  color: var(--primary-color);
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}
</style>
