<template>
  <div class="space-y-4">
    <div v-if="loading" class="space-y-3"><div v-for="i in 4" :key="i" class="skeleton h-20 w-full"></div></div>
    <div v-else-if="loadError" class="card p-8 text-center">
      <p class="text-bad font-medium mb-3">{{ loadError }}</p>
      <button @click="load" class="btn-outline">Réessayer</button>
    </div>
    <div v-else-if="!payments.length" class="card p-12 text-center text-muted"><div class="text-4xl mb-2">💳</div>Aucune transaction enregistrée pour l’instant.</div>

    <template v-else>
      <!-- Téléphone : cartes -->
      <div class="grid gap-3 md:hidden">
        <article v-for="p in payments" :key="p.id" class="card p-4">
          <div class="flex items-center justify-between gap-3">
            <div class="font-bold text-lg">{{ fmt(p.amount) }} F</div>
            <span class="badge" :class="tone(p.status)">{{ statusLabel(p.status) }}</span>
          </div>
          <div class="mt-1 text-sm">{{ p.order?.fullName || "—" }} <span class="text-muted">· {{ p.order?.reference }}</span></div>
          <div class="mt-1 text-xs text-muted font-mono truncate">{{ p.transactionId }}</div>
        </article>
      </div>

      <!-- Ordinateur / tablette : tableau -->
      <div class="card overflow-hidden hidden md:block">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line text-left text-xs text-muted font-medium">
              <th class="py-3 px-5">Transaction</th><th>Commande</th><th>Client</th><th>Montant</th><th class="pr-5">Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in payments" :key="p.id" class="border-b border-line last:border-0">
              <td class="py-3 px-5 font-mono text-xs">{{ p.transactionId }}</td>
              <td>{{ p.order?.reference }}</td>
              <td class="text-muted">{{ p.order?.fullName }}</td>
              <td class="font-semibold">{{ fmt(p.amount) }} F</td>
              <td class="pr-5"><span class="badge" :class="tone(p.status)">{{ statusLabel(p.status) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import apiClient from "../api/client";
import { errMsg } from "../utils/toast";

const payments = ref([]);
const loading = ref(true);
const loadError = ref("");
const fmt = (n) => Math.round(n || 0).toLocaleString("fr-FR");
const statusLabel = (s) => ({ INITIATED: "Initié", ACCEPTED: "Accepté", REFUSED: "Refusé", CANCELLED: "Annulé" }[s] || s);
const tone = (s) => (s === "ACCEPTED" ? "bg-green-50 text-good" : s === "REFUSED" ? "bg-red-50 text-bad" : "bg-page text-muted");

async function load() {
  loading.value = true; loadError.value = "";
  try { const { data } = await apiClient.get("/payments"); payments.value = data; }
  catch (e) { loadError.value = errMsg(e, "Impossible de charger les paiements."); }
  finally { loading.value = false; }
}
onMounted(load);
</script>
