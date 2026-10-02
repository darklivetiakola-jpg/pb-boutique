<template>
  <div class="space-y-5">
    <!-- Barre d'outils -->
    <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
      <div class="relative flex-1">
        <Icon name="search" class="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input v-model.trim="q" type="search" placeholder="Rechercher : référence, client, téléphone…" class="input !pl-11" />
      </div>
      <button @click="load(true)" class="btn-outline !bg-paper border border-line flex items-center justify-center gap-2" :disabled="loading">
        <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>
        Actualiser
      </button>
    </div>

    <div v-if="newCount" class="flex items-center justify-between gap-3 rounded-2xl bg-gold-soft text-gold px-4 py-3 text-sm font-semibold animate-rise">
      <span>🔔 {{ newCount }} nouvelle{{ newCount > 1 ? "s" : "" }} commande{{ newCount > 1 ? "s" : "" }} reçue{{ newCount > 1 ? "s" : "" }}</span>
      <button @click="newCount = 0" class="text-xs underline">OK</button>
    </div>

    <!-- Filtres -->
    <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      <button v-for="f in filters" :key="f.value" @click="filter = f.value"
        class="shrink-0 text-sm font-medium px-4 py-2 rounded-full border transition-all flex items-center gap-2"
        :class="filter === f.value ? 'bg-ink text-white border-ink' : 'bg-paper border-line text-muted hover:text-ink'">
        {{ f.label }}
        <span class="text-[11px] font-bold rounded-full px-1.5 min-w-[20px] text-center" :class="filter === f.value ? 'bg-white/20' : 'bg-page'">{{ count(f.value) }}</span>
      </button>
    </div>

    <!-- Liste -->
    <div v-if="loading && !orders.length" class="space-y-3"><div v-for="i in 4" :key="i" class="skeleton h-20 w-full"></div></div>
    <div v-else-if="!filtered.length" class="card p-12 text-center text-muted">
      <div class="text-4xl mb-2">📦</div>Aucune commande ne correspond.
    </div>
    <div v-else class="grid gap-3">
      <button v-for="(o, i) in filtered" :key="o.id" @click="open(o)"
        class="card w-full text-left p-4 sm:p-5 grid grid-cols-[auto_1fr_auto] items-center gap-4 hover:shadow-pop transition animate-rise" :style="{ animationDelay: `${Math.min(i, 8) * 25}ms` }">
        <div class="w-11 h-11 rounded-full grid place-items-center font-bold text-sm" :class="chip(o.status).avatar">{{ initials(o.fullName) }}</div>
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold truncate">{{ o.fullName }}</span>
            <span class="text-[11px] font-bold rounded-full px-2 py-0.5" :class="chip(o.status).pill">{{ chip(o.status).label }}</span>
          </div>
          <div class="text-xs text-muted mt-0.5 truncate">
            <span class="font-mono">{{ o.reference }}</span> · {{ o.city }} · {{ ago(o.createdAt) }} · {{ itemCount(o) }} article{{ itemCount(o) > 1 ? "s" : "" }}
          </div>
        </div>
        <div class="text-right">
          <div class="font-bold">{{ fmt(o.totalAmount) }} F</div>
          <ContactButtons compact class="justify-end mt-1.5" :phone="o.phone" :email="o.email" :name="o.fullName" :message="defaultTemplate(o).text(o)" />
        </div>
      </button>
    </div>

    <!-- Fiche commande (panneau latéral / feuille mobile) -->
    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="sel" class="fixed inset-0 z-50 flex items-end sm:justify-end bg-black/40 backdrop-blur-[3px]" @click.self="sel = null">
          <aside class="sheet-panel w-full sm:w-[500px] max-h-[94vh] sm:max-h-none sm:h-full bg-paper rounded-t-3xl sm:rounded-none sm:rounded-l-3xl shadow-pop overflow-y-auto overscroll-contain pb-[max(env(safe-area-inset-bottom),20px)]" role="dialog" aria-modal="true">
            <div class="sticky top-0 z-10 bg-paper/90 backdrop-blur px-5 pt-4 pb-3 border-b border-line flex items-start justify-between gap-3">
              <div>
                <div class="text-xs text-muted">Commande</div>
                <button @click="copy(sel.reference)" class="font-mono font-bold text-lg leading-tight hover:text-gold" title="Copier">{{ sel.reference }}</button>
                <div class="text-xs text-muted mt-0.5">{{ longDate(sel.createdAt) }}</div>
              </div>
              <button @click="sel = null" class="w-9 h-9 rounded-full bg-page grid place-items-center text-muted hover:text-ink" aria-label="Fermer"><Icon name="close" class="w-4 h-4" /></button>
            </div>

            <div class="p-5 space-y-6">
              <!-- Étapes -->
              <div v-if="sel.status === 'CANCELLED'" class="rounded-2xl bg-red-50 text-bad px-4 py-3 text-sm font-semibold">Commande annulée</div>
              <ol v-else class="grid grid-cols-5">
                <li v-for="(s, i) in STEPS" :key="s.key" class="relative text-center text-[11px] pt-6" :class="i <= idx(sel.status) ? 'text-ink font-semibold' : 'text-muted'">
                  <span class="absolute top-0 left-1/2 -ml-[7px] w-[14px] h-[14px] rounded-full border-2 z-[1]" :class="i <= idx(sel.status) ? 'bg-gold border-gold' : 'bg-page border-line'" :style="i === idx(sel.status) ? 'box-shadow:0 0 0 5px rgba(0,113,227,.18)' : ''"></span>
                  <span v-if="i > 0" class="absolute top-[6px] left-[-50%] right-1/2 h-[2px]" :class="i <= idx(sel.status) ? 'bg-gold' : 'bg-line'"></span>
                  {{ s.label }}
                </li>
              </ol>

              <!-- Client + contact -->
              <section>
                <h3 class="text-xs font-bold uppercase tracking-wide text-muted mb-2">Client</h3>
                <div class="rounded-2xl border border-line p-4 space-y-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full grid place-items-center font-bold" :class="chip(sel.status).avatar">{{ initials(sel.fullName) }}</div>
                    <div class="min-w-0">
                      <div class="font-bold">{{ sel.fullName }}</div>
                      <div class="text-sm text-muted truncate">{{ sel.phone }}<span v-if="sel.email"> · {{ sel.email }}</span></div>
                    </div>
                  </div>
                  <ContactButtons :phone="sel.phone" :email="sel.email" :name="sel.fullName" :message="msgText" :subject="`Votre commande ${sel.reference}`" />
                  <div>
                    <div class="text-xs font-semibold text-muted mb-1.5">Message WhatsApp</div>
                    <div class="flex gap-2 flex-wrap mb-2">
                      <button v-for="t in TEMPLATES" :key="t.key" @click="tpl = t.key"
                        class="text-xs px-3 py-1.5 rounded-full border transition" :class="activeTpl.key === t.key ? 'bg-gold text-white border-gold' : 'border-line text-muted hover:text-ink'">{{ t.label }}</button>
                    </div>
                    <textarea v-model="custom" rows="4" class="input !text-sm leading-relaxed resize-none" aria-label="Message"></textarea>
                  </div>
                  <div class="flex items-start gap-2 text-sm">
                    <span class="mt-0.5">📍</span>
                    <div class="flex-1">{{ sel.deliveryAddress }}, {{ sel.city }}</div>
                    <button @click="copy(`${sel.deliveryAddress}, ${sel.city}`)" class="text-xs text-gold font-semibold">Copier</button>
                  </div>
                </div>
              </section>

              <!-- Articles -->
              <section>
                <h3 class="text-xs font-bold uppercase tracking-wide text-muted mb-2">Articles</h3>
                <div class="rounded-2xl border border-line divide-y divide-line">
                  <div v-for="it in sel.items" :key="it.id" class="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <div class="min-w-0"><div class="font-medium truncate">{{ it.productName }}</div><div class="text-xs text-muted">Taille {{ it.size }} · Qté {{ it.quantity }}</div></div>
                    <div class="font-semibold whitespace-nowrap">{{ fmt(it.unitPrice * it.quantity) }} F</div>
                  </div>
                  <div class="flex items-center justify-between px-4 py-3 font-bold"><span>Total</span><span>{{ fmt(sel.totalAmount) }} F</span></div>
                </div>
                <div v-if="sel.payment" class="text-xs text-muted mt-2">Paiement : {{ sel.payment.method || "—" }} · {{ payLabel(sel.payment.status) }}</div>
              </section>

              <!-- Actions -->
              <section class="space-y-2">
                <button v-if="NEXT[sel.status]" @click="setStatus(sel, NEXT[sel.status].to)" class="btn-primary w-full !h-12 !rounded-full">{{ NEXT[sel.status].label }}</button>
                <div class="flex gap-2">
                  <select :value="sel.status" @change="setStatus(sel, $event.target.value)" class="input flex-1 !text-sm" aria-label="Changer le statut">
                    <option v-for="s in ALL" :key="s.key" :value="s.key">{{ s.label }}</option>
                  </select>
                  <button v-if="sel.status !== 'CANCELLED' && sel.status !== 'DELIVERED'" @click="cancel(sel)" class="btn-outline !text-bad whitespace-nowrap">Annuler</button>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </Transition>
      <Transition name="sheet"><div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-pop">{{ toast }}</div></Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from "vue";
import apiClient from "../api/client";
import Icon from "../components/Icon.vue";
import ContactButtons from "../components/ContactButtons.vue";
import { TEMPLATES, defaultTemplate, waLink } from "../utils/contact";

const orders = ref([]), loading = ref(true), q = ref(""), filter = ref("ALL");
const sel = ref(null), tpl = ref(""), custom = ref(""), toast = ref(""), newCount = ref(0);
let timer, seen = null;

const STEPS = [{ key: "PENDING", label: "Reçue" }, { key: "PAID", label: "Payée" }, { key: "PROCESSING", label: "Préparée" }, { key: "SHIPPED", label: "Expédiée" }, { key: "DELIVERED", label: "Livrée" }];
const ALL = [...STEPS.map((s) => ({ ...s, label: { PENDING: "En attente", PAID: "Payée", PROCESSING: "En préparation", SHIPPED: "Expédiée", DELIVERED: "Livrée" }[s.key] })), { key: "CANCELLED", label: "Annulée" }];
const NEXT = {
  PENDING: { to: "PAID", label: "Marquer comme payée" }, PAID: { to: "PROCESSING", label: "Lancer la préparation" },
  PROCESSING: { to: "SHIPPED", label: "Marquer comme expédiée" }, SHIPPED: { to: "DELIVERED", label: "Marquer comme livrée" },
};
const CHIPS = {
  PENDING: { label: "En attente", pill: "bg-amber-50 text-warn", avatar: "bg-amber-50 text-warn" },
  PAID: { label: "Payée", pill: "bg-green-50 text-good", avatar: "bg-green-50 text-good" },
  PROCESSING: { label: "En préparation", pill: "bg-gold-soft text-gold", avatar: "bg-gold-soft text-gold" },
  SHIPPED: { label: "Expédiée", pill: "bg-gold-soft text-gold", avatar: "bg-gold-soft text-gold" },
  DELIVERED: { label: "Livrée", pill: "bg-green-50 text-good", avatar: "bg-green-50 text-good" },
  CANCELLED: { label: "Annulée", pill: "bg-red-50 text-bad", avatar: "bg-red-50 text-bad" },
};
const chip = (s) => CHIPS[s] || CHIPS.PENDING;
const filters = [{ value: "ALL", label: "Toutes" }, { value: "PENDING", label: "En attente" }, { value: "PAID", label: "Payées" }, { value: "PROCESSING", label: "Préparation" }, { value: "SHIPPED", label: "Expédiées" }, { value: "DELIVERED", label: "Livrées" }, { value: "CANCELLED", label: "Annulées" }];
const count = (v) => (v === "ALL" ? orders.value.length : orders.value.filter((o) => o.status === v).length);

const filtered = computed(() => {
  const s = q.value.toLowerCase();
  return orders.value.filter((o) => (filter.value === "ALL" || o.status === filter.value) &&
    (!s || [o.reference, o.fullName, o.phone, o.email, o.city].some((x) => String(x || "").toLowerCase().includes(s))));
});

const idx = (s) => Math.max(0, STEPS.findIndex((x) => x.key === s));
const fmt = (n) => Math.round(n).toLocaleString("fr-FR");
const itemCount = (o) => (o.items || []).reduce((n, i) => n + i.quantity, 0);
const initials = (n = "") => n.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
const longDate = (d) => new Date(d).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
const payLabel = (s) => ({ PENDING: "en attente", ACCEPTED: "accepté", REFUSED: "refusé", CANCELLED: "annulé" }[s] || s || "—");
function ago(d) {
  const m = Math.round((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "à l’instant"; if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60); if (h < 24) return `il y a ${h} h`;
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
function say(t) { toast.value = t; clearTimeout(say._t); say._t = setTimeout(() => (toast.value = ""), 2200); }
async function copy(t) { try { await navigator.clipboard.writeText(t); say("Copié"); } catch { say("Copie impossible"); } }

const activeTpl = computed(() => TEMPLATES.find((t) => t.key === tpl.value) || (sel.value ? defaultTemplate(sel.value) : TEMPLATES[0]));
const msgText = computed(() => custom.value);
watch(() => [sel.value?.id, tpl.value], () => { if (sel.value) custom.value = activeTpl.value.text(sel.value); });

function open(o) { sel.value = o; tpl.value = defaultTemplate(o).key; custom.value = defaultTemplate(o).text(o); }

async function load(manual = false) {
  loading.value = true;
  try {
    const { data } = await apiClient.get("/orders");
    if (seen) { const fresh = data.filter((o) => !seen.has(o.id)).length; if (fresh) newCount.value += fresh; }
    seen = new Set(data.map((o) => o.id));
    orders.value = data;
    if (sel.value) sel.value = data.find((o) => o.id === sel.value.id) || null;
    if (manual) say("Liste à jour");
  } catch { say("Impossible de charger les commandes"); }
  finally { loading.value = false; }
}

async function setStatus(o, status) {
  if (o.status === status) return;
  const prev = o.status; o.status = status;
  try { await apiClient.patch(`/orders/${o.id}/status`, { status }); say("Statut mis à jour"); }
  catch { o.status = prev; say("Échec de la mise à jour"); }
}
function cancel(o) { if (confirm(`Annuler la commande ${o.reference} ?`)) setStatus(o, "CANCELLED"); }

onMounted(() => { load(); timer = setInterval(() => load(), 45000); });
onBeforeUnmount(() => clearInterval(timer));
</script>

<style scoped>
.sheet-enter-active, .sheet-leave-active { transition: opacity .22s; }
.sheet-enter-active .sheet-panel, .sheet-leave-active .sheet-panel { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet-panel, .sheet-leave-to .sheet-panel { transform: translateY(40px); }
@media (min-width: 640px) { .sheet-enter-from .sheet-panel, .sheet-leave-to .sheet-panel { transform: translateX(40px); } }
</style>
