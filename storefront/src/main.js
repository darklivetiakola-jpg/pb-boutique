import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/styles.css";
import "./assets/theme.css";
import "./assets/ios-mobile.css";
import "./assets/light-nike.css";

createApp(App).use(createPinia()).use(router).mount("#app");

// Si une photo ne charge pas (ancien fichier supprimé), on affiche une image neutre.
const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23F0F0F0'/%3E%3Ctext x='200' y='255' font-family='Arial' font-size='22' fill='%23999' text-anchor='middle'%3EPhoto bient%C3%B4t%3C/text%3E%3C/svg%3E";
window.addEventListener("error", (e) => {
  const t = e.target;
  if (t && t.tagName === "IMG" && !t.dataset.fb) { t.dataset.fb = "1"; t.src = FALLBACK_IMG; }
}, true);
