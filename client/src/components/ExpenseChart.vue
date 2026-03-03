<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from "chart.js";
import axios from "axios";
import { useAuthStore } from "../stores/auth";

// 1. Регистрируем модули Chart.js (обязательно для работы)
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const auth = useAuthStore();

// 2. Описываем структуру данных для графика
const chartData = ref<{
  labels: string[];
  datasets: { backgroundColor: string[]; data: number[] }[];
}>({
  labels: [],
  datasets: [
    { backgroundColor: ["#41B883", "#E46651", "#00D8FF", "#DD1B16"], data: [] },
  ],
});

// Флаг загрузки
const loaded = ref(false);

const fetchChartData = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/stats/category-totals",
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      },
    );

    const rawData = response.data;

    // 3. ПРЕОБРАЗОВАНИЕ ДАННЫХ
    // Извлекаем названия категорий для подписей (Labels)
    chartData.value.labels = rawData.map((item: any) => item.Category.name);

    // Извлекаем суммы для самого графика
    chartData.value.datasets[0]!.data = rawData.map((item: any) =>
      Number(item.total),
    );

    loaded.value = true;
  } catch (e) {
    console.error("Ошибка загрузки данных для графика", e);
  }
};

onMounted(fetchChartData);
</script>

<template>
  <div class="chart-container">
    <h3>Распределение расходов</h3>
    <!-- Показываем график только когда данные загружены -->
    <Pie v-if="loaded" :data="chartData" />
    <p v-else>Загрузка статистики...</p>
  </div>
</template>

<style scoped>
.chart-container {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}
</style>
