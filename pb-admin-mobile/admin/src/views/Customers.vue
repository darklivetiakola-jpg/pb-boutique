<template>
  <div class="space-y-5">
    <div class="relative">
      <Icon name="search" class="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <input v-model.trim="q" type="search" placeholder="Rechercher un client : nom, e-mail, téléphone…" class="input !pl-11 !bg-paper !border-line" />
    </div>

    <div v-if="loading" class="space-y-3"><div v-for="i in 4" :key="i" class="skeleton h-20 w-full"></div></div>
    <div v-else-if="!filtered.length" class="card p-12 text-center text-muted"><div class="text-4xl mb-2">👥</div>{{ customers.length ? "Aucun résultat." : "Aucun client inscrit pour le moment." }}</div>

    <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="(c, i) in filtered" :key="c.id" class="card p-4 flex items-center gap-4 animate-rise" :style="{ animationDelay: `${Math.min(i, 8) * 25}ms` }">
        <div class="w-12 h-12 rounded-full bg-gold-soft text-gold grid place-items-center font-bold shrink-0">{{ initials(c) }}</div>
        <div class="min-w-0 flex-1">
          <div class="font-semibold truncate">{{ c.firstName }} {{ c.lastName }}</div>
          <div class="text-xs text-muted truncate">{{ c.email }}</div>
          <div class="text-xs text-muted truncate">{{ c.phone || "Pas de téléphone" }} · {{ c.city || "—" }}</div>
          <div class="text-[11px] text-muted mt-1">{{ c._count?.orders || 0 }} commande{{ (c._count?.orders || 0) > 1 ? "s" : "" }} · inscrit le {{ new Date(c.createdAt).toLocaleDateString("fr-FR") }}</div>
        </div>
        <ContactButtons compact class="flex-col !items-end" :phone="c.phone" :email="c.email" :name="c.firstName" :message="`Bonjour ${c.firstName}, c’est PB Boutique Hommes 👋`" />
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import apiClient from "../api/client";
import Icon from "../components/Icon.vue";
import ContactButtons from "../components/ContactButtons.vue";

const customers = ref([]), loading = ref(true), q = ref("");
const initials = (c) => ((c.firstName?.[0] || "") + (c.lastName?.[0] || "")).toUpperCase() || "?";
const filtered = computed(() => {
  const s = q.value.toLowerCase();
  return customers.value.filter((c) => !s || [c.firstName, c.lastName, c.email, c.phone, c.city].some((x) => String(x || "").toLowerCase().includes(s)));
});
onMounted(async () => {
  try { const { data } = await apiClient.get("/customers"); customers.value = data; } finally { loading.value = false; }
});
</script>
