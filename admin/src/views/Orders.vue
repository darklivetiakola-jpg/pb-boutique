<template>
  <div class="space-y-5">
    <div class="flex gap-2">
      <button v-for="s in statusFilters" :key="s.value" @click="filter = s.value"
        class="text-xs px-3.5 py-1.5 rounded-full border transition-all"
        :class="filter === s.value ? 'bg-gold text-white border-gold' : 'border-line text-muted hover:border-ink'">
        {{ s.label }}
      </button>
    </div>

    <div class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-line text-left text-xs text-muted uppercase tracking-wide">
            <th class="py-3 px-5">Référence</th><th>Client</th><th>Ville</th><th>Total</th><th>Statut</th><th class="pr-5">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="p-8"><div class="skeleton h-40 w-full"></div></td></tr>
          <tr v-for="(o, i) in filtered" :key="o.id" class="border-b border-line last:border-0 animate-rise" :style="{ animationDelay: `${i * 25}ms` }">
            <td class="py-3 px-5 font-mono text-xs font-medium">{{ o.reference }}</td>
            <td>{{ o.fullName }}</td>
            <td class="text-muted">{{ o.city }}</td>
            <td class="font-semibold">{{ fmt(o.totalAmount) }} F</td>
            <td>
              <select :value="o.status" @change="updateStatus(o, $event.target.value)" class="text-xs border border-line rounded-lg px-2 py-1 bg-paper" :class="statusColor(o.status)">
                <option value="PENDING">En attente</option>
                <option value="PAID">Payée</option>
                <option value="PROCESSING">En préparation</option>
                <option value="SHIPPED">Expédiée</option>
                <option value="DELIVERED">Livrée</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </td>
            <td class="pr-5 text-muted text-xs">{{ new Date(o.createdAt).toLocaleDateString("fr-FR") }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import apiClient from "../api/client";

const orders = ref([]);
const loading = ref(true);
const filter = ref("ALL");

const statusFilters = [
  { value: "ALL", label: "Toutes" }, { value: "PENDING", label: "En attente" },
  { value: "PAID", label: "Payées" }, { value: "SHIPPED", label: "Expédiées" },
];

const filtered = computed(() => filter.value === "ALL" ? orders.value : orders.value.filter(o => o.status === filter.value));

function fmt(n) { return Math.round(n).toLocaleString("fr-FR"); }
function statusColor(s) {
  return { PENDING: "text-warn", PAID: "text-good", PROCESSING: "text-gold-deep", SHIPPED: "text-good", DELIVERED: "text-good", CANCELLED: "text-bad" }[s] || "";
}

async function load() {
  loading.value = true;
  const { data } = await apiClient.get("/orders");
  orders.value = data;
  loading.value = false;
}

async function updateStatus(order, status) {
  order.status = status;
  await apiClient.patch(`/orders/${order.id}/status`, { status });
}

onMounted(load);
</script>
