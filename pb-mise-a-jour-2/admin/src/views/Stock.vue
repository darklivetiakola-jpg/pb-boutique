<template>
  <div class="space-y-4">
    <!-- Résumé (cliquable : sert aussi de filtre) -->
    <div class="grid grid-cols-3 gap-3">
      <button v-for="c in cards" :key="c.value" @click="filter = c.value" class="card p-3 sm:p-4 text-left transition active:scale-[0.98]" :class="filter === c.value ? 'ring-2 ring-gold' : ''">
        <div class="text-xs text-muted mb-1">{{ c.label }}</div>
        <div class="text-xl sm:text-2xl font-bold" :class="c.tone">{{ c.n }}</div>
      </button>
    </div>

    <div class="relative">
      <Icon name="search" class="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <input v-model.trim="q" type="search" placeholder="Produit, taille, SKU…" class="input !pl-11 !bg-paper !border-line" />
    </div>

    <div v-if="loading" class="space-y-3"><div v-for="i in 5" :key="i" class="skeleton h-16 w-full"></div></div>
    <div v-else-if="loadError" class="card p-8 text-center">
      <p class="text-bad font-medium mb-3">{{ loadError }}</p>
      <button @click="load" class="btn-outline">Réessayer</button>
    </div>
    <div v-else-if="!filtered.length" class="card p-10 text-center text-muted"><div class="text-4xl mb-2">📦</div>Aucune variante ne correspond.</div>

    <div v-else class="card divide-y divide-line overflow-hidden">
      <div v-for="v in filtered" :key="v.id" class="flex items-center gap-3 px-4 py-3">
        <div class="min-w-0 flex-1">
          <div class="font-medium leading-snug line-clamp-2">{{ v.productName }}</div>
          <div class="flex items-center gap-2 mt-1 flex-wrap">
            <span class="text-xs text-muted">Taille {{ v.size }}<span v-if="v.color"> · {{ v.color }}</span><span v-if="v.sku" class="hidden sm:inline"> · {{ v.sku }}</span></span>
            <span class="badge !py-0.5" :class="tone(v)">{{ v.stock === 0 ? "Rupture" : v.stock <= v.lowStockThreshold ? "Faible" : "OK" }}</span>
          </div>
        </div>
        <!-- Ajustement : gros boutons faciles à toucher + saisie directe -->
        <div class="flex items-center gap-1 shrink-0">
          <button @click="adjust(v, -1)" :disabled="v.stock === 0" class="w-11 h-11 rounded-xl border border-line text-lg font-semibold active:bg-page disabled:opacity-40" aria-label="Retirer 1">−</button>
          <input :value="v.stock" @change="setStock(v, $event.target.value)" type="number" min="0" inputmode="numeric" class="w-14 h-11 text-center font-bold rounded-xl bg-page border border-transparent focus:bg-paper focus:border-gold focus:outline-none text-[16px]" :aria-label="`Stock ${v.productName} ${v.size}`" />
          <button @click="adjust(v, 1)" class="w-11 h-11 rounded-xl border border-line text-lg font-semibold active:bg-page" aria-label="Ajouter 1">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import apiClient from "../api/client";
import Icon from "../components/Icon.vue";
import { say, errMsg } from "../utils/toast";

const products = ref([]);
const loading = ref(true);
const loadError = ref("");
const q = ref("");
const filter = ref("ALL");

const variants = computed(() => products.value.filter((p) => p.status !== "ARCHIVED").flatMap((p) => (p.variants || []).map((v) => ({ ...v, productName: p.name }))));
const isOut = (v) => v.stock === 0;
const isLow = (v) => v.stock > 0 && v.stock <= v.lowStockThreshold;
const lowCount = computed(() => variants.value.filter(isLow).length);
const outCount = computed(() => variants.value.filter(isOut).length);
const cards = computed(() => [
  { value: "ALL", label: "Variantes", n: variants.value.length, tone: "" },
  { value: "LOW", label: "Stock faible", n: lowCount.value, tone: "text-warn" },
  { value: "OUT", label: "En rupture", n: outCount.value, tone: "text-bad" },
]);
const tone = (v) => (isOut(v) ? "bg-red-50 text-bad" : isLow(v) ? "bg-amber-50 text-warn" : "bg-green-50 text-good");

const filtered = computed(() => {
  const s = q.value.toLowerCase();
  return variants.value
    .filter((v) => (filter.value === "ALL" || (filter.value === "LOW" ? isLow(v) : isOut(v))))
    .filter((v) => !s || [v.productName, v.size, v.sku, v.color].some((x) => String(x || "").toLowerCase().includes(s)))
    // les ruptures et stocks faibles d'abord : c'est ce qui demande une action
    .sort((a, b) => a.stock - b.stock || a.productName.localeCompare(b.productName));
});

async function load() {
  loading.value = true; loadError.value = "";
  try {
    // Une seule requête : la liste « admin » renvoie maintenant les variantes
    const { data } = await apiClient.get("/products?all=1");
    products.value = data;
  } catch (e) { loadError.value = errMsg(e, "Impossible de charger le stock."); }
  finally { loading.value = false; }
}

async function writeStock(v, next) {
  const prev = v.stock;
  v.stock = next; // affichage immédiat
  try { await apiClient.patch(`/products/variants/${v.id}/stock`, { stock: next }); }
  catch (e) { v.stock = prev; say(errMsg(e, "Mise à jour du stock impossible"), "error"); }
}
const adjust = (v, d) => writeStock(v, Math.max(0, v.stock + d));
function setStock(v, raw) {
  const n = Math.max(0, Math.floor(Number(raw)));
  if (Number.isNaN(n)) return;
  writeStock(v, n);
}

onMounted(load);
</script>
