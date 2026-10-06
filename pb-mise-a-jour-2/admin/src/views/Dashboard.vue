<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- STAT CARDS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard label="Chiffre d'affaires" :value="stats?.revenueTotal || 0" suffix="F" icon="card" :delay="0" />
      <StatCard label="Commandes payées" :value="stats?.ordersCount || 0" icon="cart" :delay="60" />
      <StatCard label="Panier moyen" :value="stats?.averageBasket || 0" suffix="F" icon="trend-up" :delay="120" />
      <router-link to="/commandes" class="block" aria-label="Voir les commandes en attente">
        <StatCard label="En attente" :value="stats?.pendingOrders || 0" icon="alert"
          icon-bg="bg-amber-50" icon-color="text-warn" :delay="180" />
      </router-link>
    </div>

    <!-- CHART -->
    <div class="card p-4 sm:p-6 animate-rise" style="animation-delay:220ms">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="font-bold tracking-tight text-lg">Évolution des ventes</h2>
          <p class="text-xs text-muted">{{ days }} derniers jours</p>
        </div>
        <div class="flex gap-1.5 bg-page rounded-lg p-1">
          <button
            v-for="r in ranges" :key="r.days"
            @click="setRange(r.days)"
            class="text-xs px-3 py-2 min-h-[36px] rounded-md transition-all font-medium"
            :class="days === r.days ? 'bg-gold text-white' : 'text-muted hover:text-ink'"
          >{{ r.label }}</button>
        </div>
      </div>
      <div v-if="loading" class="skeleton h-56 sm:h-72 w-full"></div>
      <div v-else class="relative h-56 sm:h-72"><canvas ref="chartCanvas"></canvas></div>
    </div>

    <div class="grid lg:grid-cols-2 gap-4 sm:gap-6">
      <!-- TOP PRODUCTS -->
      <div class="card p-4 sm:p-6 animate-rise" style="animation-delay:280ms">
        <h2 class="font-bold tracking-tight text-lg mb-4">Meilleures ventes</h2>
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
      <div class="card p-4 sm:p-6 animate-rise" style="animation-delay:340ms">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold tracking-tight text-lg">Alertes stock</h2>
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
            class="flex items-center justify-between gap-3 py-2.5 border-b border-line last:border-0 text-sm">
            <span class="min-w-0">{{ a.product }} <span class="text-muted">— {{ a.size }}</span></span>
            <span class="badge shrink-0" :class="a.stock === 0 ? 'bg-red-50 text-bad' : 'bg-amber-50 text-warn'">{{ a.stock === 0 ? "Rupture" : a.stock + " restant" + (a.stock > 1 ? "s" : "") }}</span>
          </div>
          <router-link to="/stock" class="block text-center text-sm font-semibold text-gold pt-3">Gérer le stock</router-link>
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
        borderColor: "#0071E3",
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
          g.addColorStop(0, "rgba(0,113,227,0.22)");
          g.addColorStop(1, "rgba(0,113,227,0)");
          return g;
        },
        fill: true, tension: 0.35, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2.5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      animation: { duration: 700, easing: "easeOutCubic" },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => ` ${Math.round(c.parsed.y).toLocaleString("fr-FR")} F` } },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: "#E8E8ED" }, border: { display: false },
          ticks: { maxTicksLimit: 5, callback: (v) => (v >= 1000 ? `${Math.round(v / 1000)} k` : v) } },
        x: { grid: { display: false }, ticks: { maxTicksLimit: 6, maxRotation: 0 } },
      },
    },
  });
}

function setRange(d) { days.value = d; }
watch(days, load);
onMounted(load);
</script>
