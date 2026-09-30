<template>
  <div class="space-y-5">
    <div class="grid grid-cols-3 gap-4">
      <div class="card p-4 animate-rise"><div class="text-xs text-muted mb-1">Total variantes</div><div class="font-serif text-xl">{{ variants.length }}</div></div>
      <div class="card p-4 animate-rise" style="animation-delay:60ms"><div class="text-xs text-muted mb-1">Stock faible</div><div class="font-serif text-xl text-warn">{{ lowCount }}</div></div>
      <div class="card p-4 animate-rise" style="animation-delay:120ms"><div class="text-xs text-muted mb-1">Rupture</div><div class="font-serif text-xl text-bad">{{ outCount }}</div></div>
    </div>

    <div class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-line text-left text-xs text-muted uppercase tracking-wide">
            <th class="py-3 px-5">Produit</th><th>Taille</th><th>SKU</th><th>Stock</th><th class="pr-5">Ajuster</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="p-8"><div class="skeleton h-40 w-full"></div></td></tr>
          <tr v-for="(v, i) in variants" :key="v.id" class="border-b border-line last:border-0 animate-rise" :style="{ animationDelay: `${i * 20}ms` }">
            <td class="py-3 px-5 font-medium">{{ v.productName }}</td>
            <td>{{ v.size }}</td>
            <td class="text-muted text-xs">{{ v.sku }}</td>
            <td>
              <span class="badge" :class="v.stock === 0 ? 'bg-red-50 text-bad' : v.stock <= v.lowStockThreshold ? 'bg-amber-50 text-warn' : 'bg-green-50 text-good'">
                {{ v.stock }}
              </span>
            </td>
            <td class="pr-5">
              <div class="flex items-center gap-2">
                <button @click="adjust(v, -1)" class="w-7 h-7 rounded-lg border border-line hover:bg-page">−</button>
                <button @click="adjust(v, 1)" class="w-7 h-7 rounded-lg border border-line hover:bg-page">+</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-xs text-muted">L'endpoint <code>/api/products</code> renvoie les variantes imbriquées dans chaque produit — cette vue les aplatit pour un ajustement rapide.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import apiClient from "../api/client";

const products = ref([]);
const loading = ref(true);

const variants = computed(() =>
  products.value.flatMap(p => (p.variants || []).map(v => ({ ...v, productName: p.name })))
);
const lowCount = computed(() => variants.value.filter(v => v.stock > 0 && v.stock <= v.lowStockThreshold).length);
const outCount = computed(() => variants.value.filter(v => v.stock === 0).length);

async function load() {
  loading.value = true;
  const { data } = await apiClient.get("/products?all=1");
  // On récupère le détail de chaque produit pour avoir les variantes complètes
  const detailed = await Promise.all(data.map(p => apiClient.get(`/products/${p.slug}`).then(r => r.data)));
  products.value = detailed;
  loading.value = false;
}

async function adjust(variant, delta) {
  const next = Math.max(0, variant.stock + delta);
  variant.stock = next; // optimiste
  await apiClient.patch(`/products/variants/${variant.id}/stock`, { stock: next });
}

onMounted(load);
</script>
