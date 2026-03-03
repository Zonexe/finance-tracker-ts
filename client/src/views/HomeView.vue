<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { useAuthStore } from "../stores/auth";
import type { Transaction, Category } from "../types";
import { useRouter } from "vue-router"; // Изменили импорт
import ExpenseChart from "../components/ExpenseChart.vue";

const auth = useAuthStore();
const router = useRouter(); // Инициализируем роутер через хук
const transactions = ref<Transaction[]>([]);
const categories = ref<Category[]>([]);

const amount = ref<number | "">("");
const categoryId = ref<number | "">("");
const comment = ref("");

const API_URL = "http://localhost:5000/api";

const loadData = async () => {
  // Если токена нет - уходим на страницу логина
  if (!auth.token || auth.token === "null") {
    router.push("/auth");
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

    // Добавляем новую транзакцию в список
    transactions.value.unshift(response.data.transaction);

    // Обновляем баланс в Pinia и LocalStorage
    if (auth.user) {
      auth.user.balance = response.data.newBalance;
      localStorage.setItem("user", JSON.stringify(auth.user));
    }

    amount.value = "";
    categoryId.value = "";
    comment.value = "";

    // Обновляем данные, чтобы подтянулись связи (названия категорий)
    await loadData();
  } catch (error: any) {
    alert(error.response?.data?.error || "Ошибка сервера");
  }
};

const handleDelete = async (Id: number) => {
  if (!confirm("Удалить эту операцию? Деньги вернутся на баланс.")) return;

  try {
    const response = await axios.delete(`${API_URL}/transactions/${Id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    transactions.value = transactions.value.filter((t) => t.Id !== Id);

    if (auth.user) {
      auth.user.balance = response.data.newBalance;
      localStorage.setItem("user", JSON.stringify(auth.user));
    }
  } catch (error) {
    alert("Не удалось удалить транзакцию");
  }
};

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
    <!-- 1. БАЛАНС -->
    <div class="card balance-card">
      <span class="label">Общий баланс</span>
      <h2 :class="['balance-value', { negative: auth.user.balance < 0 }]">
        {{ auth.user.balance?.toLocaleString() || 0 }} ₽
      </h2>
    </div>

    <!-- 2. ФОРМА -->
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
          placeholder="Комментарий (опционально)"
        />
        <button type="submit" class="btn-primary">Добавить</button>
      </form>
    </div>

    <!-- 3. ИСТОРИЯ (ИСПРАВЛЕНА ВЕРСТКА) -->
    <div class="card history">
      <h3>История операций</h3>
      <div v-if="transactions.length === 0" class="empty-state">
        Траты не найдены
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

        <div class="t-right">
          <!-- Динамический цвет суммы -->
          <div :class="['t-amount', t.Category?.type]">
            {{ t.Category?.type === "expense" ? "-" : "+" }} {{ t.amount }} ₽
          </div>
          <button
            @click="handleDelete(t.Id)"
            class="delete-btn"
            title="Удалить"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Твои стили отличные, оставляем их без изменений */
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
  border: none;
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
  color: var(--text-color);
}
.t-comment {
  font-size: 0.8rem;
  color: #7f8c8d;
}
.t-right {
  display: flex;
  align-items: center;
  gap: 12px;
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
.delete-btn {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 1.1rem;
  transition: color 0.2s;
}
.delete-btn:hover {
  color: var(--danger-color);
}
.empty-state {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}
</style>
