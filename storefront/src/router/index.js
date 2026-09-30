import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Category from "../views/Category.vue";
import ProductDetail from "../views/ProductDetail.vue";
import Account from "../views/Account.vue";
import Cart from "../views/Cart.vue";
import Confirmation from "../views/Confirmation.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/categorie/:slug", name: "category", component: Category },
  { path: "/produit/:id", name: "product", component: ProductDetail },
  { path: "/panier", name: "cart", component: Cart },
  { path: "/compte", name: "account", component: Account },
  { path: "/confirmation", name: "confirmation", component: Confirmation },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

export default router;
