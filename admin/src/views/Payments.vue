<template>
  <div class="card overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-line text-left text-xs text-muted uppercase tracking-wide">
          <th class="py-3 px-5">Transaction</th><th>Commande</th><th>Client</th><th>Montant</th><th class="pr-5">Statut</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading"><td colspan="5" class="p-8"><div class="skeleton h-40 w-full"></div></td></tr>
        <tr v-else-if="!payments.length"><td colspan="5" class="p-10 text-center text-muted">Aucune transaction encore enregistrée.</td></tr>
        <tr v-for="(p, i) in payments" :key="p.id" class="border-b border-line last:border-0 animate-rise" :style="{ animationDelay: `${i * 25}ms` }">
          <td class="py-3 px-5 font-mono text-xs">{{ p.transactionId }}</td>
          <td>{{ p.order?.reference }}</td>
          <td class="text-muted">{{ p.order?.fullName }}</td>
          <td class="font-semibold">{{ fmt(p.amount) }} F</td>
          <td class="pr-5">
            <span class="badge" :class="p.status === 'ACCEPTED' ? 'bg-green-50 text-good' : p.status === 'REFUSED' ? 'bg-red-50 text-bad' : 'bg-page text-muted'">
              {{ statusLabel(p.status) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import apiClient from "../api/client";

const payments = ref([]);
const loading = ref(true);
function fmt(n) { return Math.round(n).toLocaleString("fr-FR"); }
function statusLabel(s) { return { INITIATED: "Initié", ACCEPTED: "Accepté", REFUSED: "Refusé", CANCELLED: "Annulé" }[s] || s; }

onMounted(async () => {
  const { data } = await apiClient.get("/payments");
  payments.value = data;
  loading.value = false;
});
</script>
