import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/styles.css";
import "./assets/theme.css";
import "./assets/ios-mobile.css";
import "./assets/light-nike.css";

createApp(App).use(createPinia()).use(router).mount("#app");
