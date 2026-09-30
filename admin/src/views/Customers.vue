<template>
  <div class="card overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-line text-left text-xs text-muted uppercase tracking-wide">
          <th class="py-3 px-5">Client</th><th>Email</th><th>Téléphone</th><th>Ville</th><th>Commandes</th><th class="pr-5">Inscrit le</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading"><td colspan="6" class="p-8"><div class="skeleton h-40 w-full"></div></td></tr>
        <tr v-else-if="!customers.length"><td colspan="6" class="p-10 text-center text-muted">Aucun client inscrit pour le moment.</td></tr>
        <tr v-for="(c, i) in customers" :key="c.id" class="border-b border-line last:border-0 animate-rise" :style="{ animationDelay: `${i * 25}ms` }">
          <td class="py-3 px-5 font-medium">{{ c.firstName }} {{ c.lastName }}</td>
          <td class="text-muted">{{ c.email }}</td>
          <td>{{ c.phone || "—" }}</td>
          <td>{{ c.city }}</td>
          <td><span class="badge bg-gold-soft text-gold-deep">{{ c._count.orders }}</span></td>
          <td class="pr-5 text-muted text-xs">{{ new Date(c.createdAt).toLocaleDateString("fr-FR") }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import apiClient from "../api/client";

const customers = ref([]);
const loading = ref(true);

onMounted(async () => {
  const { data } = await apiClient.get("/customers");
  customers.value = data;
  loading.value = false;
});
</script>
