<template>
  <main>
    <div class="breadcrumb"><div class="container"><div class="bc-inner">
      <router-link to="/">Accueil</router-link><span class="bc-sep"><i class="fa-solid fa-chevron-right"></i></span>
      <span class="bc-current">Mon compte</span>
    </div></div></div>

    <div class="account-wrap">
      <!-- NON CONNECTÉ -->
      <div v-if="!auth.user">
        <div class="account-tabs">
          <div class="account-tab" :class="{ on: tab === 'login' }" @click="tab = 'login'">Connexion</div>
          <div class="account-tab" :class="{ on: tab === 'register' }" @click="tab = 'register'">Créer un compte</div>
        </div>

        <div v-if="error" class="account-error" style="margin-bottom:14px;">{{ error }}</div>

        <form v-show="tab === 'login'" class="account-form on" @submit.prevent="doLogin">
          <div ref="googleBtnLogin"></div>
          <div class="account-divider">ou avec votre email</div>
          <label>Email</label>
          <input v-model="loginForm.email" type="email" required placeholder="vous@exemple.com"/>
          <label>Mot de passe</label>
          <input v-model="loginForm.password" type="password" required placeholder="••••••••"/>
          <button type="submit" class="btn btn-primary" style="justify-content:center;margin-top:6px;">Se connecter</button>
        </form>

        <form v-show="tab === 'register'" class="account-form on" @submit.prevent="doRegister">
          <div ref="googleBtnRegister"></div>
          <div class="account-divider">ou avec votre email</div>
          <div style="display:flex;gap:10px;">
            <input v-model="registerForm.firstName" type="text" required placeholder="Prénom" style="flex:1;"/>
            <input v-model="registerForm.lastName" type="text" required placeholder="Nom" style="flex:1;"/>
          </div>
          <input v-model="registerForm.email" type="email" required placeholder="vous@exemple.com"/>
          <input v-model="registerForm.phone" type="tel" placeholder="07 00 00 00 00"/>
          <input v-model="registerForm.password" type="password" required placeholder="Mot de passe (8 caractères min.)"/>
          <button type="submit" class="btn btn-primary" style="justify-content:center;margin-top:6px;">Créer mon compte</button>
        </form>
      </div>

      <!-- CONNECTÉ -->
      <div v-else class="account-profile">
        <h2>Bonjour {{ auth.user.firstName }} 👋</h2>
        <p class="sub">{{ auth.user.email }}</p>
        <button class="btn btn-ghost" style="width:100%;justify-content:center;" @click="doLogout">Se déconnecter</button>

        <div class="account-orders">
          <h3 style="font-size:1.05rem;margin-bottom:10px;">Mes commandes</h3>
          <p v-if="ordersLoading" style="color:var(--ink3);font-size:0.85rem;">Chargement…</p>
          <p v-else-if="!orders.length" style="color:var(--ink3);font-size:0.85rem;">Aucune commande pour le moment.</p>
          <div v-else v-for="o in orders" :key="o.id" class="order-row">
            <div>
              <div style="font-weight:600;">{{ o.reference }}</div>
              <div style="color:var(--ink3);font-size:0.78rem;">{{ new Date(o.createdAt).toLocaleDateString("fr-FR") }} · {{ fmt(o.totalAmount) }}</div>
            </div>
            <span class="order-status">{{ statusLabel(o.status) }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from "vue";
import { useAuthStore } from "../stores/auth";
import apiClient from "../api/client";

const auth = useAuthStore();
const tab = ref("login");
const error = ref("");
const orders = ref([]);
const ordersLoading = ref(true);
const googleBtnLogin = ref(null);
const googleBtnRegister = ref(null);

const loginForm = reactive({ email: "", password: "" });
const registerForm = reactive({ firstName: "", lastName: "", email: "", phone: "", password: "" });

const ORDER_STATUS_LABEL = {
  PENDING: "En attente", PAID: "Payée", PROCESSING: "En préparation",
  SHIPPED: "Expédiée", DELIVERED: "Livrée", CANCELLED: "Annulée",
};
function statusLabel(s) { return ORDER_STATUS_LABEL[s] || s; }
function fmt(n) { return Number(n).toLocaleString("fr-FR") + " FCFA"; }

async function doLogin() {
  error.value = "";
  try { await auth.login(loginForm.email, loginForm.password); await loadOrders(); }
  catch (err) { error.value = err.response?.data?.error || "Email ou mot de passe incorrect."; }
}
async function doRegister() {
  error.value = "";
  try { await auth.register({ ...registerForm }); await loadOrders(); }
  catch (err) { error.value = err.response?.data?.error || "Impossible de créer le compte."; }
}
async function doLogout() { await auth.logout(); orders.value = []; }

async function loadOrders() {
  ordersLoading.value = true;
  try { const { data } = await apiClient.get("/orders"); orders.value = data; }
  catch { orders.value = []; }
  finally { ordersLoading.value = false; }
}

async function handleGoogleCredential(response) {
  error.value = "";
  try { await auth.loginWithGoogle(response.credential); await loadOrders(); }
  catch (err) { error.value = err.response?.data?.error || "Connexion Google impossible."; }
}

function initGoogleButtons() {
  if (typeof google === "undefined" || !google.accounts) { setTimeout(initGoogleButtons, 400); return; }
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleCredential });
  [googleBtnLogin, googleBtnRegister].forEach(elRef => {
    if (elRef.value) google.accounts.id.renderButton(elRef.value, { theme: "outline", size: "large", width: 280, locale: "fr" });
  });
}

onMounted(async () => {
  if (!auth.ready) await auth.fetchMe();
  if (auth.user) await loadOrders();
  await nextTick();
  initGoogleButtons();
});
watch(() => auth.user, async (u) => { if (u) await loadOrders(); });
</script>
