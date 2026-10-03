<template>
  <main class="acc">
    <!-- ================= NON CONNECTÉ ================= -->
    <section v-if="!auth.user" class="auth">
      <div class="auth-head">
        <h1>{{ tab === "login" ? "Bon retour." : "Créer un compte." }}</h1>
        <p>{{ tab === "login" ? "Connectez-vous pour suivre vos commandes et retrouver vos favoris." : "Un compte pour commander plus vite et suivre vos livraisons." }}</p>
      </div>

      <div v-if="route.query.redirect" class="banner ok"><i class="fa-solid fa-bag-shopping"></i>Connectez-vous ou créez un compte pour finaliser votre commande. Votre panier est conservé.</div>

      <div class="seg" role="tablist">
        <button role="tab" :aria-selected="tab === 'login'" :class="{ on: tab === 'login' }" @click="tab = 'login'; error = ''">Connexion</button>
        <button role="tab" :aria-selected="tab === 'register'" :class="{ on: tab === 'register' }" @click="tab = 'register'; error = ''">Inscription</button>
      </div>

      <div v-if="error" class="banner bad" role="alert"><i class="fa-solid fa-circle-exclamation"></i>{{ error }}</div>

      <div class="gbtn"><div ref="googleBtn"></div></div>
      <div class="or"><span>ou avec votre email</span></div>

      <form v-if="tab === 'login'" class="form" @submit.prevent="doLogin" novalidate>
        <label class="fld"><span>Email</span>
          <input v-model.trim="loginForm.email" type="email" autocomplete="email" inputmode="email" placeholder="vous@exemple.com" required /></label>
        <label class="fld"><span>Mot de passe</span>
          <div class="pw"><input v-model="loginForm.password" :type="show ? 'text' : 'password'" autocomplete="current-password" placeholder="Votre mot de passe" required />
            <button type="button" class="eye" @click="show = !show" :aria-label="show ? 'Masquer' : 'Afficher'"><i class="fa-regular" :class="show ? 'fa-eye-slash' : 'fa-eye'"></i></button></div></label>
        <button class="cta" :disabled="busy">{{ busy ? "Connexion…" : "Se connecter" }}</button>
      </form>

      <form v-else class="form" @submit.prevent="doRegister" novalidate>
        <div class="two">
          <label class="fld"><span>Prénom</span><input v-model.trim="registerForm.firstName" autocomplete="given-name" placeholder="Prénom" required /></label>
          <label class="fld"><span>Nom</span><input v-model.trim="registerForm.lastName" autocomplete="family-name" placeholder="Nom" required /></label>
        </div>
        <label class="fld"><span>Email</span><input v-model.trim="registerForm.email" type="email" autocomplete="email" inputmode="email" placeholder="vous@exemple.com" required /></label>
        <label class="fld"><span>Téléphone <em>(pour la livraison)</em></span><input v-model.trim="registerForm.phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="07 00 00 00 00" /></label>
        <label class="fld"><span>Mot de passe</span>
          <div class="pw"><input v-model="registerForm.password" :type="show ? 'text' : 'password'" autocomplete="new-password" placeholder="8 caractères minimum" required />
            <button type="button" class="eye" @click="show = !show" :aria-label="show ? 'Masquer' : 'Afficher'"><i class="fa-regular" :class="show ? 'fa-eye-slash' : 'fa-eye'"></i></button></div>
          <div class="meter"><i :style="{ width: strength(registerForm.password).pct + '%', background: strength(registerForm.password).color }"></i></div></label>
        <button class="cta" :disabled="busy">{{ busy ? "Création…" : "Créer mon compte" }}</button>
      </form>

      <p class="trust"><i class="fa-solid fa-lock"></i> Connexion sécurisée. Vos données ne sont jamais partagées ni revendues.</p>
    </section>

    <!-- ================= CONNECTÉ : HUB PROFIL ================= -->
    <section v-else class="hub">
      <Transition name="push" mode="out-in">
        <!-- Accueil du profil -->
        <div v-if="view === 'home'" key="home">
          <div class="me">
            <div class="avatar">{{ initials }}</div>
            <div class="me-txt">
              <h1>{{ auth.user.firstName }} {{ auth.user.lastName }}</h1>
              <p>{{ auth.user.email }}</p>
            </div>
          </div>

          <div class="tiles">
            <button class="tile" @click="go('orders')"><b>{{ orders.length }}</b><span>Commandes</span></button>
            <router-link class="tile" to="/favoris"><b>{{ cart.wishlist.length }}</b><span>Favoris</span></router-link>
            <router-link class="tile" to="/panier"><b>{{ cart.itemsCount }}</b><span>Panier</span></router-link>
          </div>

          <p class="cap">Mon activité</p>
          <div class="grp">
            <button class="row" @click="go('orders')"><span class="ico gold"><i class="fa-solid fa-bag-shopping"></i></span><span class="lbl">Mes commandes<small>{{ lastOrderHint }}</small></span><i class="fa-solid fa-chevron-right chev"></i></button>
            <router-link class="row" to="/favoris"><span class="ico red"><i class="fa-solid fa-heart"></i></span><span class="lbl">Mes favoris</span><i class="fa-solid fa-chevron-right chev"></i></router-link>
          </div>

          <p class="cap">Compte</p>
          <div class="grp">
            <button class="row" @click="go('profile')"><span class="ico blue"><i class="fa-solid fa-user"></i></span><span class="lbl">Informations personnelles<small>Nom, téléphone, adresse</small></span><i class="fa-solid fa-chevron-right chev"></i></button>
            <button class="row" @click="go('security')"><span class="ico green"><i class="fa-solid fa-shield-halved"></i></span><span class="lbl">Sécurité<small>Mot de passe</small></span><i class="fa-solid fa-chevron-right chev"></i></button>
            <button class="row" @click="go('privacy')"><span class="ico gray"><i class="fa-solid fa-hand"></i></span><span class="lbl">Confidentialité<small>Mes données</small></span><i class="fa-solid fa-chevron-right chev"></i></button>
          </div>

          <p class="cap">Préférences</p>
          <div class="grp">
            <button class="row" @click="go('appearance')"><span class="ico purple"><i class="fa-solid fa-circle-half-stroke"></i></span><span class="lbl">Apparence<small>{{ theme === "light" ? "Clair" : "Sombre" }}</small></span><i class="fa-solid fa-chevron-right chev"></i></button>
          </div>

          <p class="cap">Assistance</p>
          <div class="grp">
            <a class="row" :href="wa('Bonjour PB Boutique, j’ai une question.')" target="_blank" rel="noopener"><span class="ico wa"><i class="fa-brands fa-whatsapp"></i></span><span class="lbl">Écrire sur WhatsApp<small>Réponse rapide, 8h – 20h</small></span><i class="fa-solid fa-arrow-up-right-from-square chev"></i></a>
            <a class="row" href="mailto:contact@pbboutique.ci"><span class="ico orange"><i class="fa-solid fa-envelope"></i></span><span class="lbl">Nous écrire par email</span><i class="fa-solid fa-arrow-up-right-from-square chev"></i></a>
          </div>

          <div class="grp mt">
            <button class="row danger" @click="confirmOut = true"><span class="lbl center">Se déconnecter</span></button>
          </div>
          <p class="ver">PB Boutique Hommes · Abidjan</p>
        </div>

        <!-- Sous-pages -->
        <div v-else key="sub">
          <button class="back" @click="back"><i class="fa-solid fa-chevron-left"></i> {{ view === "order" ? "Commandes" : "Profil" }}</button>

          <!-- COMMANDES -->
          <template v-if="view === 'orders'">
            <h2 class="ttl">Mes commandes</h2>
            <p v-if="ordersLoading" class="muted">Chargement…</p>
            <div v-else-if="!orders.length" class="empty"><div class="empty-ic"><i class="fa-solid fa-bag-shopping"></i></div><h3>Aucune commande</h3><p>Vos commandes apparaîtront ici.</p><router-link to="/categorie/nouveautes" class="cta sm">Découvrir la collection</router-link></div>
            <div v-else class="grp">
              <button v-for="o in orders" :key="o.id" class="row ord" @click="openOrder(o)">
                <span class="lbl"><b>{{ o.reference }}</b><small>{{ dateFmt(o.createdAt) }} · {{ fmt(o.totalAmount) }}</small></span>
                <span class="chip" :class="chipClass(o.status)">{{ statusLabel(o.status) }}</span>
                <i class="fa-solid fa-chevron-right chev"></i>
              </button>
            </div>
          </template>

          <!-- DÉTAIL COMMANDE -->
          <template v-else-if="view === 'order' && sel">
            <h2 class="ttl mono">{{ sel.reference }}</h2>
            <p class="muted">Passée le {{ dateFmt(sel.createdAt) }}</p>
            <div v-if="sel.status === 'CANCELLED'" class="banner bad"><i class="fa-solid fa-ban"></i>Cette commande a été annulée.</div>
            <ol v-else class="steps">
              <li v-for="(s, i) in STEPS" :key="s.key" :class="{ done: i <= stepIdx(sel.status), now: i === stepIdx(sel.status) }"><i></i><span>{{ s.label }}</span></li>
            </ol>
            <p class="cap">Articles</p>
            <div class="grp">
              <div v-for="it in sel.items" :key="it.id" class="row static"><span class="lbl"><b>{{ it.productName }}</b><small>Taille {{ it.size }} · Qté {{ it.quantity }}</small></span><span class="amt">{{ fmt(it.unitPrice * it.quantity) }}</span></div>
              <div class="row static total"><span class="lbl"><b>Total</b></span><span class="amt">{{ fmt(sel.totalAmount) }}</span></div>
            </div>
            <p class="cap">Livraison</p>
            <div class="grp"><div class="row static"><span class="lbl"><b>{{ sel.fullName }}</b><small>{{ sel.deliveryAddress }}, {{ sel.city }}<br />{{ sel.phone }}</small></span></div></div>
            <a class="cta ghost" :href="wa(`Bonjour, au sujet de ma commande ${sel.reference}…`)" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Une question sur cette commande ?</a>
          </template>

          <!-- INFOS PERSO -->
          <template v-else-if="view === 'profile'">
            <h2 class="ttl">Informations personnelles</h2>
            <div v-if="msg.text" class="banner" :class="msg.ok ? 'ok' : 'bad'" role="status"><i class="fa-solid" :class="msg.ok ? 'fa-circle-check' : 'fa-circle-exclamation'"></i>{{ msg.text }}</div>
            <form class="form" @submit.prevent="saveProfile">
              <div class="two">
                <label class="fld"><span>Prénom</span><input v-model.trim="pf.firstName" autocomplete="given-name" required /></label>
                <label class="fld"><span>Nom</span><input v-model.trim="pf.lastName" autocomplete="family-name" required /></label>
              </div>
              <label class="fld"><span>Email</span><input :value="auth.user.email" disabled /><small>L’email ne peut pas être modifié.</small></label>
              <label class="fld"><span>Téléphone</span><input v-model.trim="pf.phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="07 00 00 00 00" /></label>
              <label class="fld"><span>Adresse de livraison</span><input v-model.trim="pf.address" autocomplete="street-address" placeholder="Quartier, rue, repère" /></label>
              <label class="fld"><span>Ville</span><input v-model.trim="pf.city" autocomplete="address-level2" placeholder="Abidjan" /></label>
              <button class="cta" :disabled="busy">{{ busy ? "Enregistrement…" : "Enregistrer" }}</button>
            </form>
          </template>

          <!-- SÉCURITÉ -->
          <template v-else-if="view === 'security'">
            <h2 class="ttl">Sécurité</h2>
            <p class="muted">Choisissez un mot de passe d’au moins 10 caractères, avec des lettres et des chiffres.</p>
            <div v-if="msg.text" class="banner" :class="msg.ok ? 'ok' : 'bad'" role="status"><i class="fa-solid" :class="msg.ok ? 'fa-circle-check' : 'fa-circle-exclamation'"></i>{{ msg.text }}</div>
            <form class="form" @submit.prevent="savePassword">
              <label class="fld"><span>Mot de passe actuel <em>(vide si connexion Google)</em></span><input v-model="pw.current" :type="show ? 'text' : 'password'" autocomplete="current-password" /></label>
              <label class="fld"><span>Nouveau mot de passe</span>
                <div class="pw"><input v-model="pw.next" :type="show ? 'text' : 'password'" autocomplete="new-password" required minlength="10" />
                  <button type="button" class="eye" @click="show = !show"><i class="fa-regular" :class="show ? 'fa-eye-slash' : 'fa-eye'"></i></button></div>
                <div class="meter"><i :style="{ width: strength(pw.next).pct + '%', background: strength(pw.next).color }"></i></div>
                <small>Force : {{ strength(pw.next).label }}</small></label>
              <label class="fld"><span>Confirmer</span><input v-model="pw.confirm" :type="show ? 'text' : 'password'" autocomplete="new-password" required /></label>
              <button class="cta" :disabled="busy">{{ busy ? "Mise à jour…" : "Changer le mot de passe" }}</button>
            </form>
          </template>

          <!-- CONFIDENTIALITÉ -->
          <template v-else-if="view === 'privacy'">
            <h2 class="ttl">Confidentialité</h2>
            <p class="muted">Vos données restent les vôtres. Nous les utilisons uniquement pour traiter vos commandes et vous livrer.</p>
            <div class="grp">
              <button class="row" @click="exportData"><span class="ico blue"><i class="fa-solid fa-download"></i></span><span class="lbl">Télécharger mes données<small>Profil et commandes (fichier JSON)</small></span><i class="fa-solid fa-chevron-right chev"></i></button>
              <a class="row" :href="wa(`Bonjour, je souhaite supprimer mon compte PB Boutique (${auth.user.email}).`)" target="_blank" rel="noopener"><span class="ico red"><i class="fa-solid fa-user-xmark"></i></span><span class="lbl">Demander la suppression du compte<small>Traitée sous 48h par notre équipe</small></span><i class="fa-solid fa-arrow-up-right-from-square chev"></i></a>
            </div>
          </template>

          <!-- APPARENCE -->
          <template v-else-if="view === 'appearance'">
            <h2 class="ttl">Apparence</h2>
            <div class="themes">
              <button :class="{ on: theme === 'dark' }" @click="setTheme('dark')"><div class="pv dark"><i></i><i></i></div><span>Sombre</span></button>
              <button :class="{ on: theme === 'light' }" @click="setTheme('light')"><div class="pv light"><i></i><i></i></div><span>Clair</span></button>
            </div>
            <p class="muted">Le mode sombre est le thème d’origine de la boutique. Le mode clair est disponible mais moins travaillé.</p>
          </template>
        </div>
      </Transition>
    </section>

    <!-- Feuille de confirmation (iOS action sheet) -->
    <Transition name="sheet">
      <div v-if="confirmOut" class="sheet-bg" @click.self="confirmOut = false">
        <div class="sheet" role="dialog" aria-modal="true">
          <div class="sheet-card"><p>Se déconnecter de PB Boutique ?</p><button class="danger" @click="doLogout">Se déconnecter</button></div>
          <button class="sheet-cancel" @click="confirmOut = false">Annuler</button>
        </div>
      </div>
    </Transition>
  </main>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useCartStore } from "../stores/cart";
import { useToastStore } from "../stores/toast";
import apiClient from "../api/client";

const WHATSAPP = "2250700000000"; // ← remplacez par le vrai numéro (format international, sans +)
const auth = useAuthStore(), cart = useCartStore(), toast = useToastStore();
const route = useRoute(), router = useRouter();
// Après connexion, retour là où le client voulait aller (ex. finaliser sa commande)
function afterAuth() {
  const r = route.query.redirect;
  if (typeof r === "string" && r.startsWith("/") && !r.startsWith("//")) router.push(r);
}

const tab = ref("login"), error = ref(""), busy = ref(false), show = ref(false);
const view = ref("home"), sel = ref(null), confirmOut = ref(false);
const orders = ref([]), ordersLoading = ref(true);
const googleBtn = ref(null);
const msg = reactive({ ok: false, text: "" });
const theme = ref(localStorage.getItem("pb_theme") || "dark");

const loginForm = reactive({ email: "", password: "" });
const registerForm = reactive({ firstName: "", lastName: "", email: "", phone: "", password: "" });
const pf = reactive({ firstName: "", lastName: "", phone: "", address: "", city: "" });
const pw = reactive({ current: "", next: "", confirm: "" });

const STEPS = [{ key: "PENDING", label: "Reçue" }, { key: "PAID", label: "Payée" }, { key: "PROCESSING", label: "Préparée" }, { key: "SHIPPED", label: "Expédiée" }, { key: "DELIVERED", label: "Livrée" }];
const LABEL = { PENDING: "En attente", PAID: "Payée", PROCESSING: "En préparation", SHIPPED: "Expédiée", DELIVERED: "Livrée", CANCELLED: "Annulée" };
const stepIdx = (s) => Math.max(0, STEPS.findIndex((x) => x.key === s));
const statusLabel = (s) => LABEL[s] || s;
const chipClass = (s) => ({ PENDING: "warn", CANCELLED: "bad" }[s] || "ok");
const fmt = (n) => Number(n).toLocaleString("fr-FR") + " FCFA";
const dateFmt = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const wa = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

const initials = computed(() => ((auth.user?.firstName?.[0] || "") + (auth.user?.lastName?.[0] || "")).toUpperCase() || "PB");
const lastOrderHint = computed(() => (orders.value[0] ? `Dernière : ${statusLabel(orders.value[0].status).toLowerCase()}` : "Aucune commande"));

function strength(v = "") {
  let n = 0;
  if (v.length >= 8) n++; if (v.length >= 12) n++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) n++;
  if (/\d/.test(v)) n++; if (/[^A-Za-z0-9]/.test(v)) n++;
  const L = [["—", "#C62828"], ["Très faible", "#E5484D"], ["Faible", "#E5484D"], ["Moyen", "#D4A62A"], ["Bon", "#D4A62A"], ["Fort", "#30D158"]][v ? n : 0];
  return { pct: v ? (n / 5) * 100 : 0, label: L[0], color: L[1] };
}

function go(v) { msg.text = ""; show.value = false; view.value = v; window.scrollTo({ top: 0 }); }
function back() { go(view.value === "order" ? "orders" : "home"); }
function openOrder(o) { sel.value = o; go("order"); }
function fillProfile() { const u = auth.user || {}; Object.assign(pf, { firstName: u.firstName || "", lastName: u.lastName || "", phone: u.phone || "", address: u.address || "", city: u.city || "" }); }
watch(() => auth.user, fillProfile, { immediate: true });

const apiError = (e, fb) => e.response?.data?.details?.newPassword?.[0] || e.response?.data?.error || fb;

async function doLogin() {
  error.value = ""; busy.value = true;
  try { await auth.login(loginForm.email, loginForm.password); await loadOrders(); afterAuth(); }
  catch (e) { error.value = apiError(e, "Email ou mot de passe incorrect."); }
  finally { busy.value = false; }
}
async function doRegister() {
  error.value = "";
  if (registerForm.password.length < 8) { error.value = "Le mot de passe doit contenir au moins 8 caractères."; return; }
  busy.value = true;
  try { await auth.register({ ...registerForm, phone: registerForm.phone || undefined }); await loadOrders(); afterAuth(); }
  catch (e) { error.value = apiError(e, "Impossible de créer le compte."); }
  finally { busy.value = false; }
}
async function doLogout() { confirmOut.value = false; await auth.logout(); orders.value = []; view.value = "home"; toast.show("Vous êtes déconnecté"); }

async function saveProfile() {
  msg.text = ""; busy.value = true;
  try { const { data } = await apiClient.patch("/auth/me", { ...pf }); auth.user = data; msg.ok = true; msg.text = "Informations enregistrées."; }
  catch (e) { msg.ok = false; msg.text = apiError(e, "Enregistrement impossible."); }
  finally { busy.value = false; }
}
async function savePassword() {
  msg.text = "";
  if (pw.next !== pw.confirm) { msg.ok = false; msg.text = "Les deux mots de passe ne correspondent pas."; return; }
  busy.value = true;
  try {
    await apiClient.post("/auth/change-password", { currentPassword: pw.current || undefined, newPassword: pw.next });
    msg.ok = true; msg.text = "Mot de passe mis à jour."; pw.current = pw.next = pw.confirm = "";
  } catch (e) { msg.ok = false; msg.text = apiError(e, "Mise à jour impossible."); }
  finally { busy.value = false; }
}

function setTheme(t) {
  theme.value = t; localStorage.setItem("pb_theme", t);
  document.documentElement.setAttribute("data-theme", t);
  document.documentElement.style.colorScheme = t;
}
function exportData() {
  const blob = new Blob([JSON.stringify({ profil: auth.user, commandes: orders.value }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "mes-donnees-pb-boutique.json"; a.click();
  URL.revokeObjectURL(a.href); toast.show("Fichier téléchargé");
}

async function loadOrders() {
  ordersLoading.value = true;
  try { const { data } = await apiClient.get("/orders"); orders.value = data; } catch { orders.value = []; }
  finally { ordersLoading.value = false; }
}

let gInit = false;
async function handleGoogle(response) {
  error.value = "";
  try { await auth.loginWithGoogle(response.credential); await loadOrders(); afterAuth(); }
  catch (e) { error.value = apiError(e, "Connexion Google impossible."); }
}
function renderGoogle() {
  if (auth.user || !googleBtn.value) return;
  if (typeof google === "undefined" || !google.accounts) { setTimeout(renderGoogle, 400); return; }
  if (!gInit) { google.accounts.id.initialize({ client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, callback: handleGoogle }); gInit = true; }
  googleBtn.value.innerHTML = "";
  google.accounts.id.renderButton(googleBtn.value, { theme: "outline", size: "large", shape: "pill", text: tab.value === "login" ? "signin_with" : "signup_with", width: Math.min(400, googleBtn.value.parentElement?.clientWidth || 320), locale: "fr" });
}

onMounted(async () => {
  if (!auth.ready) await auth.fetchMe();
  if (auth.user) await loadOrders();
  await nextTick(); renderGoogle();
});
watch(() => auth.user, async (u) => { if (u) await loadOrders(); else { await nextTick(); renderGoogle(); } });
watch(tab, async () => { await nextTick(); renderGoogle(); });
</script>

<style scoped>
.acc { max-width: 560px; margin: 0 auto; padding: 28px 16px 100px; }
h1, h2, h3 { color: var(--ink); }
.muted { color: var(--ink2); font-size: .92rem; margin: 6px 0 16px; line-height: 1.5; }

/* ---------- Authentification ---------- */
.auth-head h1 { font-size: clamp(2rem, 7vw, 2.6rem); letter-spacing: -0.035em; }
.auth-head p { color: var(--ink2); margin: 8px 0 22px; line-height: 1.5; }
.seg { display: grid; grid-template-columns: 1fr 1fr; background: var(--bg2); border-radius: 12px; padding: 3px; margin-bottom: 18px; }
.seg button { height: 38px; border-radius: 10px; font-weight: 600; color: var(--ink2); transition: background .2s, color .2s; }
.seg button.on { background: var(--surface); color: var(--ink); box-shadow: 0 1px 4px rgba(0,0,0,.25); }
.gbtn { min-height: 44px; display: flex; justify-content: center; }
.or { display: flex; align-items: center; gap: 12px; color: var(--ink3); font-size: .78rem; margin: 16px 0; }
.or::before, .or::after { content: ""; flex: 1; height: 1px; background: var(--border); }
.form { display: grid; gap: 14px; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.fld { display: grid; gap: 6px; min-width: 0; }
.fld > span { font-size: .8rem; font-weight: 600; color: var(--ink2); }
.fld em { font-style: normal; font-weight: 400; color: var(--ink3); }
.fld small { color: var(--ink3); font-size: .76rem; }
.fld input { width: 100%; min-width: 0; height: 50px; padding: 0 16px; border-radius: 14px; border: 1.5px solid var(--border); background: var(--surface); color: var(--ink); font-size: 16px; -webkit-appearance: none; appearance: none; transition: border-color .2s, box-shadow .2s; }
.fld input:focus { outline: none; border-color: #D4A62A; box-shadow: 0 0 0 4px rgba(212,166,42,.18); }
.fld input:disabled { opacity: .55; }
.pw { position: relative; }
.pw input { padding-right: 52px; }
.eye { position: absolute; right: 4px; top: 4px; width: 42px; height: 42px; border-radius: 10px; color: var(--ink2); }
.meter { height: 5px; border-radius: 3px; background: var(--bg2); overflow: hidden; margin-top: 4px; }
.meter i { display: block; height: 100%; border-radius: 3px; transition: width .3s, background .3s; }
.cta { display: flex; align-items: center; justify-content: center; gap: 8px; height: 52px; border-radius: 99px; background: #D4A62A; color: #111; font-weight: 700; font-size: 1rem; text-decoration: none; transition: transform .15s, opacity .2s; }
.cta:active { transform: scale(.98); } .cta:disabled { opacity: .6; }
.cta.ghost { background: var(--surface); color: var(--ink); border: 1px solid var(--border); margin-top: 18px; }
.cta.sm { height: 44px; padding: 0 22px; display: inline-flex; margin-top: 14px; }
.trust { color: var(--ink3); font-size: .78rem; text-align: center; margin-top: 18px; line-height: 1.5; }
.trust i { color: #D4A62A; margin-right: 4px; }
.banner { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 14px; font-size: .88rem; margin-bottom: 16px; line-height: 1.4; }
.banner.bad { background: rgba(255,69,58,.12); color: #FF6B6B; } .banner.ok { background: rgba(48,209,88,.12); color: #30D158; }

/* ---------- Hub profil ---------- */
.me { display: flex; align-items: center; gap: 16px; margin-bottom: 22px; }
.avatar { width: 68px; height: 68px; border-radius: 50%; background: linear-gradient(145deg, #E6BB4E, #B8891A); color: #111; display: grid; place-items: center; font-weight: 800; font-size: 1.5rem; box-shadow: 0 0 0 4px var(--bg), 0 0 0 6px rgba(212,166,42,.45); flex: none; }
.me-txt { min-width: 0; } .me-txt h1 { font-size: 1.45rem; letter-spacing: -0.03em; }
.me-txt p { color: var(--ink2); font-size: .9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 8px; }
.tile { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 14px 8px; text-align: center; color: var(--ink); text-decoration: none; display: block; transition: transform .15s; }
.tile:active { transform: scale(.97); } .tile b { display: block; font-size: 1.5rem; letter-spacing: -0.03em; } .tile span { font-size: .76rem; color: var(--ink2); }
.cap { font-size: .72rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ink3); margin: 22px 6px 8px; }
.grp { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; }
.grp.mt { margin-top: 26px; }
.row { display: flex; align-items: center; gap: 14px; width: 100%; min-height: 58px; padding: 10px 16px; color: var(--ink); text-align: left; text-decoration: none; border-bottom: 1px solid var(--border); background: transparent; transition: background .15s; }
.row:last-child { border-bottom: 0; } button.row:active, a.row:active { background: var(--bg2); }
.row.static { cursor: default; } .row.total b { font-size: 1rem; } .row.danger { justify-content: center; color: #FF453A; font-weight: 600; }
.ico { width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center; color: #fff; font-size: .85rem; flex: none; }
.ico.gold { background: #D4A62A; color: #111; } .ico.red { background: #FF453A; } .ico.blue { background: #0A84FF; } .ico.green { background: #30D158; color: #08210f; }
.ico.gray { background: #8E8E93; } .ico.purple { background: #BF5AF2; } .ico.orange { background: #FF9F0A; color: #111; } .ico.wa { background: #25D366; color: #08210f; }
.lbl { flex: 1; min-width: 0; display: grid; gap: 1px; font-weight: 500; } .lbl.center { text-align: center; flex: none; }
.lbl small { color: var(--ink3); font-weight: 400; font-size: .78rem; }
.chev { color: var(--ink3); font-size: .75rem; flex: none; }
.ver { text-align: center; color: var(--ink3); font-size: .74rem; margin-top: 18px; }
.amt { font-weight: 600; white-space: nowrap; }

/* ---------- Sous-pages ---------- */
.back { display: inline-flex; align-items: center; gap: 8px; color: #E6BB4E; font-weight: 600; margin-bottom: 14px; padding: 6px 4px; }
.ttl { font-size: 1.9rem; letter-spacing: -0.035em; margin-bottom: 4px; } .ttl.mono { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 1.2rem; letter-spacing: 0; }
.ord .lbl b { font-size: .95rem; }
.chip { font-size: .72rem; font-weight: 700; padding: 4px 10px; border-radius: 99px; white-space: nowrap; }
.chip.ok { background: rgba(48,209,88,.14); color: #30D158; } .chip.warn { background: rgba(212,166,42,.16); color: #E6BB4E; } .chip.bad { background: rgba(255,69,58,.14); color: #FF6B6B; }
.steps { list-style: none; display: grid; grid-template-columns: repeat(5, 1fr); margin: 18px 0 4px; }
.steps li { position: relative; text-align: center; font-size: .68rem; color: var(--ink3); padding-top: 22px; }
.steps li i { position: absolute; top: 0; left: 50%; width: 14px; height: 14px; margin-left: -7px; border-radius: 50%; background: var(--bg2); border: 2px solid var(--border2); z-index: 1; }
.steps li::before { content: ""; position: absolute; top: 6px; left: -50%; right: 50%; height: 2px; background: var(--border2); }
.steps li:first-child::before { display: none; }
.steps li.done i { background: #D4A62A; border-color: #D4A62A; } .steps li.done::before { background: #D4A62A; }
.steps li.now { color: var(--ink); font-weight: 700; } .steps li.now i { box-shadow: 0 0 0 5px rgba(212,166,42,.25); }
.empty { text-align: center; padding: 40px 10px; } .empty-ic { width: 76px; height: 76px; margin: 0 auto 16px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); display: grid; place-items: center; color: var(--ink3); font-size: 1.6rem; }
.empty h3 { font-size: 1.25rem; margin-bottom: 4px; } .empty p { color: var(--ink2); }
.themes { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 18px 0; }
.themes button { background: var(--surface); border: 2px solid var(--border); border-radius: 18px; padding: 12px; color: var(--ink); font-weight: 600; display: grid; gap: 10px; transition: border-color .2s; }
.themes button.on { border-color: #D4A62A; }
.pv { height: 84px; border-radius: 12px; padding: 10px; display: grid; gap: 6px; align-content: start; }
.pv i { height: 10px; border-radius: 5px; } .pv i:first-child { width: 60%; } .pv i:last-child { width: 85%; }
.pv.dark { background: #0B0B0C; } .pv.dark i { background: #2a2a2e; } .pv.dark i:first-child { background: #D4A62A; }
.pv.light { background: #FAF9F6; border: 1px solid #E9E6DE; } .pv.light i { background: #E9E6DE; } .pv.light i:first-child { background: #0B0B0C; }

/* ---------- Animations ---------- */
.push-enter-active, .push-leave-active { transition: transform .28s cubic-bezier(.2,.8,.2,1), opacity .2s; }
.push-enter-from { transform: translateX(28px); opacity: 0; } .push-leave-to { transform: translateX(-28px); opacity: 0; }
.sheet-bg { position: fixed; inset: 0; z-index: 1100; background: rgba(0,0,0,.5); backdrop-filter: blur(4px); display: flex; align-items: flex-end; justify-content: center; padding: 12px 12px max(env(safe-area-inset-bottom), 12px); }
.sheet { width: 100%; max-width: 520px; display: grid; gap: 8px; }
.sheet-card { background: var(--surface); border-radius: 18px; overflow: hidden; text-align: center; }
.sheet-card p { padding: 16px; color: var(--ink2); font-size: .88rem; border-bottom: 1px solid var(--border); }
.sheet-card .danger { width: 100%; padding: 17px; color: #FF453A; font-weight: 600; font-size: 1.05rem; }
.sheet-cancel { background: var(--surface); border-radius: 18px; padding: 17px; font-weight: 700; color: var(--ink); font-size: 1.05rem; }
.sheet-enter-active, .sheet-leave-active { transition: opacity .2s; } .sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform .28s cubic-bezier(.2,.8,.2,1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; } .sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(40px); }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>
