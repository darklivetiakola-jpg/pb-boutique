<template>
  <div class="space-y-6">
    <!-- STAT CARDS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Chiffre d'affaires" :value="stats?.revenueTotal || 0" suffix="F" icon="card" :delay="0" />
      <StatCard label="Commandes payées" :value="stats?.ordersCount || 0" icon="cart" :delay="60" />
      <StatCard label="Panier moyen" :value="stats?.averageBasket || 0" suffix="F" icon="trend-up" :delay="120" />
      <StatCard label="En attente" :value="stats?.pendingOrders || 0" icon="alert"
        icon-bg="bg-amber-50" icon-color="text-warn" :delay="180" />
    </div>

    <!-- CHART -->
    <div class="card p-6 animate-rise" style="animation-delay:220ms">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="font-serif text-lg">Évolution des ventes</h2>
          <p class="text-xs text-muted">30 derniers jours</p>
        </div>
        <div class="flex gap-1.5 bg-page rounded-lg p-1">
          <button
            v-for="r in ranges" :key="r.days"
            @click="setRange(r.days)"
            class="text-xs px-3 py-1.5 rounded-md transition-all font-medium"
            :class="days === r.days ? 'bg-gold text-white' : 'text-muted hover:text-ink'"
          >{{ r.label }}</button>
        </div>
      </div>
      <div v-if="loading" class="skeleton h-64 w-full"></div>
      <canvas v-else ref="chartCanvas" height="90"></canvas>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- TOP PRODUCTS -->
      <div class="card p-6 animate-rise" style="animation-delay:280ms">
        <h2 class="font-serif text-lg mb-4">Meilleures ventes</h2>
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="skeleton h-10 w-full"></div>
        </div>
        <div v-else-if="!stats?.topProducts?.length" class="text-sm text-muted py-6 text-center">
          Pas encore de ventes sur cette période.
        </div>
        <TransitionGroup v-else name="list" tag="div" class="space-y-1">
          <div v-for="(p, i) in stats.topProducts" :key="p.productName"
            class="flex items-center gap-3 py-2.5 border-b border-line last:border-0">
            <span class="w-6 h-6 rounded-full bg-page flex items-center justify-center text-xs font-bold text-muted">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">{{ p.productName }}</div>
              <div class="text-xs text-muted">{{ p.quantitySold }} vendus</div>
            </div>
            <div class="text-sm font-semibold">{{ fmt(p.revenue) }} F</div>
          </div>
        </TransitionGroup>
      </div>

      <!-- LOW STOCK -->
      <div class="card p-6 animate-rise" style="animation-delay:340ms">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-serif text-lg">Alertes stock</h2>
          <span v-if="stats?.lowStockAlerts?.length" class="badge bg-red-50 text-bad">{{ stats.lowStockAlerts.length }}</span>
        </div>
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="skeleton h-10 w-full"></div>
        </div>
        <div v-else-if="!stats?.lowStockAlerts?.length" class="text-sm text-muted py-6 text-center">
          Tout est en stock, rien à signaler.
        </div>
        <div v-else class="space-y-1">
          <div v-for="a in stats.lowStockAlerts" :key="a.product + a.size"
            class="flex items-center justify-between py-2.5 border-b border-line last:border-0 text-sm">
            <span>{{ a.product }} <span class="text-muted">— {{ a.size }}</span></span>
            <span class="badge bg-red-50 text-bad">{{ a.stock }} restants</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import Chart from "chart.js/auto";
import apiClient from "../api/client";
import StatCard from "../components/StatCard.vue";

const stats = ref(null);
const loading = ref(true);
const days = ref(30);
const chartCanvas = ref(null);
let chartInstance = null;

const ranges = [{ days: 7, label: "7j" }, { days: 30, label: "30j" }, { days: 90, label: "90j" }];

function fmt(n) { return Math.round(n).toLocaleString("fr-FR"); }

async function load() {
  loading.value = true;
  try {
    const { data } = await apiClient.get(`/dashboard/stats?days=${days.value}`);
    stats.value = data;
  } finally {
    loading.value = false;
    await nextTick();
    renderChart();
  }
}

function renderChart() {
  if (!chartCanvas.value || !stats.value) return;
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(chartCanvas.value, {
    type: "line",
    data: {
      labels: stats.value.revenueByDay.map(d => new Date(d.day).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })),
      datasets: [{
        label: "Chiffre d'affaires",
        data: stats.value.revenueByDay.map(d => d.total),
        borderColor: "#b4863a",
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
          g.addColorStop(0, "rgba(180,134,58,0.25)");
          g.addColorStop(1, "rgba(180,134,58,0)");
          return g;
        },
        fill: true, tension: 0.35, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2.5,
      }],
    },
    options: {
      responsive: true,
      animation: { duration: 900, easing: "easeOutCubic" },
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: "#ECE7DC" }, ticks: { callback: (v) => v.toLocaleString("fr-FR") } },
        x: { grid: { display: false } },
      },
    },
  });
}

function setRange(d) { days.value = d; }
watch(days, load);
onMounted(load);
</script>
