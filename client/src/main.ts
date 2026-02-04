import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router"; // Импортируем наш роутер

const app = createApp(App);

app.use(createPinia());
app.use(router); // ГОВОРИМ VUE ИСПОЛЬЗОВАТЬ РОУТЕР

app.mount("#app");
