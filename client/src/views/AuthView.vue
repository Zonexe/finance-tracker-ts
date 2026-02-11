<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import type { User } from "../types";

const router = useRouter();
const auth = useAuthStore();

const step = ref<number>(1);
const isNewUser = ref<boolean>(false);
const email = ref<string>("");
const username = ref<string>("");
const password = ref<string>("");
const error = ref<string>("");
const isLoading = ref<boolean>(false); // Новая переменная для блокировки кнопок

interface LoginResponse {
  token: string;
  username: string;
  Id: number;
  balance: number;
}

const checkEmail = async () => {
  if (!email.value.includes("@")) {
    error.value = "Введите корректный email";
    return;
  }

  isLoading.value = true;
  try {
    error.value = "";
    const response = await axios.post(
      "http://localhost:5000/api/auth/check-email",
      {
        email: email.value,
      },
    );
    isNewUser.value = !response.data.exists;
    step.value = 2;
  } catch (err) {
    error.value = "Ошибка связи с сервером";
  } finally {
    isLoading.value = false;
  }
};

const handleAuth = async () => {
  isLoading.value = true;
  try {
    error.value = "";

    if (isNewUser.value) {
      await axios.post("http://localhost:5000/api/users/register", {
        username: username.value,
        email: email.value,
        password: password.value,
      });
    }

    const response = await axios.post<LoginResponse>(
      "http://localhost:5000/api/auth/login",
      {
        email: email.value,
        password: password.value,
      },
    );

    const userData: User = {
      Id: response.data.Id,
      username: response.data.username,
      email: email.value,
      balance: response.data.balance,
    };

    auth.setAuth(response.data.token, userData);
    /* 
  1. Сохраняем ТОКЕН в Pinia и LocalStorage. Он — наш "паспорт" для сервера. 
     Внутри него зашифрован наш ID, который сервер извлечет позже.
  2. Сохраняем ОБЪЕКТ userData (имя, баланс). Эти данные нужны только 
     фронтенду, чтобы отобразить ник и деньги на экране.
*/
    router.push("/");
  } catch (err: any) {
    error.value = err.response?.data?.error || "Ошибка авторизации";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="card auth-card">
      <h2>
        {{
          step === 1
            ? "Вход или регистрация"
            : isNewUser
              ? "Создать аккаунт"
              : "Введите пароль"
        }}
      </h2>

      <!-- ШАГ 1: Ввод почты -->
      <div v-if="step === 1">
        <input
          v-model="email"
          type="email"
          class="form-input"
          placeholder="Ваша почта"
          :disabled="isLoading"
          @keyup.enter="checkEmail"
        />
        <button @click="checkEmail" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? "Загрузка..." : "Продолжить" }}
        </button>
      </div>

      <!-- ШАГ 2: Пароль и никнейм -->
      <div v-else>
        <p class="email-hint">
          Почта: {{ email }}
          <span @click="step = 1" class="change-link">(изменить)</span>
        </p>

        <input
          v-if="isNewUser"
          v-model="username"
          type="text"
          class="form-input"
          placeholder="Придумайте никнейм"
          :disabled="isLoading"
        />
        <input
          v-model="password"
          type="password"
          class="form-input"
          placeholder="Пароль"
          :disabled="isLoading"
          @keyup.enter="handleAuth"
        />

        <button @click="handleAuth" class="btn-primary" :disabled="isLoading">
          {{
            isLoading
              ? "Загрузка..."
              : isNewUser
                ? "Зарегистрироваться"
                : "Войти"
          }}
        </button>
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  padding-top: 100px;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  text-align: center;
}
.email-hint {
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: #666;
}
.change-link {
  color: var(--primary-color);
  cursor: pointer;
  text-decoration: underline;
}
.error-msg {
  color: var(--danger-color);
  margin-top: 15px;
  font-size: 0.9rem;
}
/* Кнопка в состоянии disabled */
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
