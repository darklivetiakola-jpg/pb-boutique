import re, pathlib

def rw(p, fn):
    f = pathlib.Path(p)
    if not f.exists():
        print("MANQUANT  ", p); return
    s = f.read_text(); n = fn(s); f.write_text(n)
    print(("modifié    " if n != s else "déjà ok    ") + p)

# ====================== ACCUEIL ======================
VM_MARKUP = '''<div class="vm" aria-label="Nos catégories">
          <div v-for="(col, ci) in vmCols" :key="ci" class="vm-col" :class="[ci % 2 ? 'down' : 'up', `c${ci}`]">
            <div class="vm-track">
              <div v-for="copy in 2" :key="copy" class="vm-set" :aria-hidden="copy === 2 ? 'true' : undefined">
                <router-link v-for="c in col" :key="c.slug" :to="`/categorie/${c.slug}`" class="vm-tile" :tabindex="copy === 2 ? -1 : undefined">
                  <span class="vm-bg" :style="{ backgroundImage: `url('${c.img}')` }"></span>
                  <span class="vm-shade"></span>
                  <span class="vm-info"><b>{{ c.name }}</b><em>{{ c.tags }}</em></span>
                  <i class="fa-solid fa-arrow-right vm-go"></i>
                </router-link>
              </div>
            </div>
          </div>
        </div>'''

VM_STYLE = '''
<style>
/* Catégories : colonnes qui défilent seules (vers le haut / vers le bas), pause au toucher ou au survol */
.vm { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; height: min(78vh, 620px); overflow: hidden; margin-top: 8px;
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 10%, #000 90%, transparent); mask-image: linear-gradient(180deg, transparent, #000 10%, #000 90%, transparent); }
.vm-col { overflow: hidden; min-width: 0; }
.vm-track { display: flex; flex-direction: column; will-change: transform; animation: vm-up var(--vm-t, 34s) linear infinite; }
.vm-col.down .vm-track { animation-name: vm-down; --vm-t: 40s; }
.vm-col.c2 .vm-track { --vm-t: 46s; }
.vm-set { display: flex; flex-direction: column; gap: 12px; padding-bottom: 12px; }
@keyframes vm-up { from { transform: translateY(0); } to { transform: translateY(-50%); } }
@keyframes vm-down { from { transform: translateY(-50%); } to { transform: translateY(0); } }
.vm:hover .vm-track, .vm:focus-within .vm-track, .vm:active .vm-track { animation-play-state: paused; }
.vm-tile { position: relative; display: block; flex: none; aspect-ratio: 4 / 5.2; border-radius: 22px; overflow: hidden; background: #151517; box-shadow: var(--shadow-1); }
.vm-bg { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform .6s; }
.vm-tile:hover .vm-bg { transform: scale(1.05); }
.vm-shade { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, .78)); }
.vm-info { position: absolute; left: 14px; right: 14px; bottom: 14px; display: grid; gap: 2px; color: #fff; }
.vm-info b { font-size: 1.15rem; letter-spacing: -0.03em; line-height: 1.15; }
.vm-info em { font-style: normal; font-size: .74rem; color: rgba(255, 255, 255, .72); }
.vm-go { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%; background: #D4A62A; color: #111; display: grid; place-items: center; font-size: .8rem; }
@media (min-width: 900px) { .vm { grid-template-columns: repeat(3, 1fr); gap: 16px; height: 640px; } .vm-set { gap: 16px; padding-bottom: 16px; } }
@media (prefers-reduced-motion: reduce) {
  .vm { height: auto; -webkit-mask-image: none; mask-image: none; }
  .vm-track { animation: none; } .vm-set[aria-hidden="true"] { display: none; }
}
</style>
'''

def home(s):
    # 1) plus de bandeau « Livraison 48h / Mobile Money / Échange gratuit / Conseil style »
    s = re.sub(r"[ \t]*<!-- FEATURE STRIP -->.*?(?=[ \t]*<!-- CATEGORIES -->)", "", s, count=1, flags=re.S)
    # 2) catégories : colonnes qui défilent automatiquement à la verticale
    if 'class="vm"' not in s:
        s = re.sub(r'<div class="cat-grid-clean">.*?</router-link>\s*</div>', lambda m: VM_MARKUP, s, count=1, flags=re.S)
        s = s.replace('import { ref, onMounted } from "vue";', 'import { ref, computed, onMounted, onBeforeUnmount } from "vue";', 1)
        s = s.replace("const subscribed = ref(false);", "const subscribed = ref(false);", 1)
        s = s.rstrip("\n")
        # script : calcul des colonnes (2 sur téléphone, 3 sur grand écran)
        s = s.replace("\n</script>", '''
const nCols = ref(typeof window !== "undefined" && window.innerWidth >= 900 ? 3 : 2);
const vmCols = computed(() => Array.from({ length: nCols.value }, (_, k) => cats.filter((_, i) => i % nCols.value === k)));
const onResize = () => { nCols.value = window.innerWidth >= 900 ? 3 : 2; };
onMounted(() => window.addEventListener("resize", onResize));
onBeforeUnmount(() => window.removeEventListener("resize", onResize));
</script>''', 1)
        s += "\n" + VM_STYLE
    # 3) produits : une seule grille (2 colonnes sur téléphone), plus de doublon « coup de cœur »
    s = re.sub(r"[ \t]*<!-- COUP DE COEUR -->.*?(?=[ \t]*<!-- HERITAGE -->)", "", s, count=1, flags=re.S)
    s = s.replace("products.items.slice(0, 8)", "products.items.slice(0, 12)")
    return s
rw("storefront/src/views/Home.vue", home)

# Grille produits : 2 colonnes sur téléphone, on fait défiler pour voir la suite
MARK = "/* [mobile] grille produits 2 colonnes */"
def theme(s):
    if MARK in s: return s
    return s.rstrip("\n") + "\n\n" + MARK + """
@media (max-width: 720px) {
  .prod-grid, .cat-prod-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px 12px; }
}
"""
rw("storefront/src/assets/theme.css", theme)

# ====================== COMMANDE : COMPTE OBLIGATOIRE ======================
def orders_routes(s):
    return s.replace('router.post("/checkout", attachUserIfPresent, checkout);', 'router.post("/checkout", requireAuth, checkout);   // commande réservée aux comptes connectés')
rw("backend/src/routes/orders.routes.js", orders_routes)

def checkout_store(s):
    if "goLogin" in s: return s
    s = s.replace('import { useCartStore } from "./cart";', 'import { useCartStore } from "./cart";\nimport { useAuthStore } from "./auth";\nimport { useToastStore } from "./toast";', 1)
    s = s.replace("export const useCheckoutStore", '''async function goLogin(msg = "Créez un compte ou connectez-vous pour commander.") {
  useToastStore().show(msg);
  const { default: router } = await import("../router");
  router.push({ path: "/compte", query: { redirect: router.currentRoute.value.fullPath } });
}

export const useCheckoutStore''', 1)
    s = s.replace('''      if (!cart.items.length) return false;
      this.open = true;''', '''      if (!cart.items.length) return false;
      const auth = useAuthStore();
      if (!auth.user) {   // commande réservée aux comptes : on vérifie la session, sinon direction connexion
        (async () => {
          if (!auth.ready) await auth.fetchMe();
          if (auth.user) { this.open = true; this.error = ""; this.confirmation = null; this.method = "mobile_money"; }
          else goLogin();
        })();
        return true;
      }
      this.open = true;''', 1)
    s = s.replace("customer: { name: form.name, phone: form.phone, address: form.address },",
                  "customer: { name: form.name, phone: form.phone, address: form.address, email: useAuthStore().user?.email, city: useAuthStore().user?.city || undefined },")
    s = s.replace('this.error = err.response?.data?.error || "Une erreur est survenue.";',
                  'if (err.response?.status === 401) { this.open = false; goLogin("Votre session a expiré. Reconnectez-vous pour commander."); return; }\n        this.error = err.response?.data?.error || "Une erreur est survenue.";')
    return s
rw("storefront/src/stores/checkout.js", checkout_store)

def modal(s):
    if "useAuthStore" in s: return s
    s = s.replace('import { useCheckoutStore } from "../stores/checkout";', 'import { useCheckoutStore } from "../stores/checkout";\nimport { useAuthStore } from "../stores/auth";', 1)
    s = s.replace('const form = reactive({ name: "", phone: "", address: "" });',
                  '''const auth = useAuthStore();
// Les informations du compte sont préremplies : le client n'a rien à retaper
const u = auth.user || {};
const form = reactive({
  name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
  phone: u.phone || "",
  address: [u.address, u.city].filter(Boolean).join(", "),
});''', 1)
    return s
rw("storefront/src/components/CheckoutModal.vue", modal)

def account(s):
    if "afterAuth" in s: return s
    s = s.replace('import { useAuthStore } from "../stores/auth";', 'import { useRoute, useRouter } from "vue-router";\nimport { useAuthStore } from "../stores/auth";', 1)
    s = s.replace("const auth = useAuthStore(), cart = useCartStore(), toast = useToastStore();",
                  '''const auth = useAuthStore(), cart = useCartStore(), toast = useToastStore();
const route = useRoute(), router = useRouter();
// Après connexion, retour là où le client voulait aller (ex. finaliser sa commande)
function afterAuth() {
  const r = route.query.redirect;
  if (typeof r === "string" && r.startsWith("/") && !r.startsWith("//")) router.push(r);
}''', 1)
    s = s.replace("await auth.login(loginForm.email, loginForm.password); await loadOrders();", "await auth.login(loginForm.email, loginForm.password); await loadOrders(); afterAuth();")
    s = s.replace("await auth.register({ ...registerForm, phone: registerForm.phone || undefined }); await loadOrders();", "await auth.register({ ...registerForm, phone: registerForm.phone || undefined }); await loadOrders(); afterAuth();")
    s = s.replace("await auth.loginWithGoogle(response.credential); await loadOrders();", "await auth.loginWithGoogle(response.credential); await loadOrders(); afterAuth();")
    s = s.replace('<div class="seg" role="tablist">', '<div v-if="route.query.redirect" class="banner ok"><i class="fa-solid fa-bag-shopping"></i>Connectez-vous ou créez un compte pour finaliser votre commande. Votre panier est conservé.</div>\n\n      <div class="seg" role="tablist">', 1)
    return s
rw("storefront/src/views/Account.vue", account)

# ====================== SERVEUR : plus d'erreur « MIME type text/html » après une mise à jour ======================
SERVE = '''if (fs.existsSync(adminDist)) {
  app.use("/admin", express.static(adminDist, staticOpts));
  // un fichier manquant (avec extension) renvoie 404, jamais la page HTML
  app.get("/admin/*", (req, res, next) => (/\\.[a-z0-9]+$/i.test(req.path) ? next() : sendIndex(adminDist, res)));
}
if (fs.existsSync(shopDist)) {
  app.use(express.static(shopDist, staticOpts));
  app.get(/^\\/(?!api\\/|uploads\\/|admin(\\/|$))[^.]*$/, (req, res) => sendIndex(shopDist, res));
}
'''
HELPERS = '''// Cache : index.html jamais mis en cache (sinon un ancien index réclame des fichiers qui n'existent plus), fichiers /assets/ éternels
const staticOpts = {
  setHeaders: (res, file) => {
    if (/index\\.html$/.test(file)) res.setHeader("Cache-Control", "no-cache");
    else if (/[\\\\/]assets[\\\\/]/.test(file)) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    else res.setHeader("Cache-Control", "public, max-age=3600");
  },
};
const sendIndex = (dir, res) => { res.setHeader("Cache-Control", "no-cache"); res.sendFile(path.join(dir, "index.html")); };
'''
def app_js(s):
    if "const staticOpts" in s: return s
    n = re.sub(r"if \(fs\.existsSync\(adminDist\)\) \{.*?\n\}\nif \(fs\.existsSync\(shopDist\)\) \{.*?\n\}\n", lambda m: HELPERS + SERVE, s, count=1, flags=re.S)
    return n
rw("backend/src/app.js", app_js)
