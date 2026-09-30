import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import Login from "../views/Login.vue";
import AdminLayout from "../components/AdminLayout.vue";
import Dashboard from "../views/Dashboard.vue";
import Products from "../views/Products.vue";
import Stock from "../views/Stock.vue";
import Orders from "../views/Orders.vue";
import Customers from "../views/Customers.vue";
import Payments from "../views/Payments.vue";
import Posts from "../views/Posts.vue";
import Settings from "../views/Settings.vue";

const routes = [
  { path: "/login", name: "login", component: Login, meta: { public: true } },
  {
    path: "/",
    component: AdminLayout,
    children: [
      { path: "", name: "dashboard", component: Dashboard },
      { path: "produits", name: "products", component: Products },
      { path: "stock", name: "stock", component: Stock },
      { path: "commandes", name: "orders", component: Orders },
      { path: "clients", name: "customers", component: Customers },
      { path: "paiements", name: "payments", component: Payments },
      { path: "contenu", name: "posts", component: Posts },
      { path: "parametres", name: "settings", component: Settings },
    ],
  },
];

const router = createRouter({ history: createWebHistory(), routes, scrollBehavior: () => ({ top: 0 }) });

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.ready) await auth.fetchMe();
  if (!to.meta.public && !auth.user) return { name: "login" };
  if (to.name === "login" && auth.user) return { name: "dashboard" };
  return true;
});

export default router;
