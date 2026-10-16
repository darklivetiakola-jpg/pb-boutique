<template>
  <div class="relative">
    <button @click="toggle" class="relative w-10 h-10 rounded-full bg-paper border border-line grid place-items-center text-ink hover:bg-page transition" :class="{ 'animate-pulse': unread }" aria-label="Notifications">
      <Icon name="bell" class="w-5 h-5" />
      <span v-if="unread" class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-bad text-white text-[11px] font-bold grid place-items-center">{{ unread > 9 ? "9+" : unread }}</span>
    </button>

    <div v-if="open" class="fixed inset-0 z-40" @click="open = false"></div>
    <Transition name="modal-content">
      <div v-if="open" class="absolute right-0 top-12 z-50 w-[360px] max-w-[92vw] bg-paper border border-line rounded-2xl shadow-pop overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-line">
          <b>Notifications</b>
          <button v-if="unread" @click="readAll" class="text-xs font-semibold text-gold">Tout marquer comme lu</button>
        </div>
        <div class="flex items-center gap-4 px-4 py-2 bg-page text-xs text-muted">
          <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" v-model="sound" @change="saveSound" /> Son à chaque commande</label>
          <button v-if="canDesktop" @click="askDesktop" class="underline">Activer les alertes bureau</button>
        </div>
        <div class="max-h-[60vh] overflow-y-auto">
          <div v-if="!items.length" class="p-8 text-center text-muted text-sm">Aucune notification pour l'instant.<br />Vous serez prévenu à chaque nouvelle commande.</div>
          <button v-for="n in items" :key="n.id" @click="openItem(n)" class="w-full text-left flex gap-3 px-4 py-3 border-b border-line last:border-0 hover:bg-page transition" :class="{ 'bg-gold-soft/60': !n.readAt }">
            <span class="w-9 h-9 rounded-full grid place-items-center shrink-0 text-base" :class="n.type === 'ORDER_PAID' ? 'bg-green-50' : 'bg-gold-soft'">{{ n.type === "ORDER_PAID" ? "💰" : "🛍️" }}</span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-semibold">{{ n.title }}</span>
              <span class="block text-xs text-muted truncate">{{ n.message }}</span>
              <span class="block text-[11px] text-muted mt-0.5">{{ ago(n.createdAt) }}</span>
            </span>
            <i v-if="!n.readAt" class="w-2 h-2 rounded-full bg-bad mt-2 shrink-0"></i>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Pop-ups « nouvelle commande » -->
    <Teleport to="body">
      <div class="fixed top-4 right-4 z-[70] flex flex-col gap-2 w-[340px] max-w-[calc(100vw-2rem)] pointer-events-none">
        <TransitionGroup name="modal-content">
          <button v-for="t in toasts" :key="t.id" @click="openItem(t.n); dismiss(t.id)" class="pointer-events-auto text-left flex gap-3 items-start bg-ink text-white rounded-2xl px-4 py-3 shadow-pop">
            <span class="text-xl leading-none mt-0.5">{{ t.n.type === "ORDER_PAID" ? "💰" : "🛍️" }}</span>
            <span class="min-w-0"><b class="block text-sm">{{ t.n.title }}</b><span class="block text-xs opacity-80">{{ t.n.message }}</span></span>
          </button>
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import apiClient from "../api/client";
import Icon from "./Icon.vue";

const router = useRouter();
const items = ref([]), unread = ref(0), open = ref(false), toasts = ref([]);
const sound = ref(localStorage.getItem("pb_admin_sound") !== "0");
const canDesktop = ref(typeof Notification !== "undefined" && Notification.permission === "default");
const baseTitle = document.title;
let timer, seeded = false, ctx = null;
const seen = new Set();

const saveSound = () => localStorage.setItem("pb_admin_sound", sound.value ? "1" : "0");
function toggle() { open.value = !open.value; }
function dismiss(id) { toasts.value = toasts.value.filter((t) => t.id !== id); }

function beep() {
  if (!sound.value) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    [[880, 0], [1175, 0.16]].forEach(([f, d]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + d;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.start(t); o.stop(t + 0.3);
    });
  } catch { /* le navigateur bloque le son tant qu'on n'a pas cliqué sur la page */ }
}

async function askDesktop() {
  try { const r = await Notification.requestPermission(); canDesktop.value = r === "default"; } catch { /* ignoré */ }
}

async function poll() {
  try {
    const { data } = await apiClient.get("/notifications");
    const fresh = data.items.filter((n) => !seen.has(n.id) && !n.readAt);
    data.items.forEach((n) => seen.add(n.id));
    items.value = data.items; unread.value = data.unread;
    document.title = data.unread ? `(${data.unread}) ${baseTitle}` : baseTitle;
    if (seeded && fresh.length) {
      beep();
      fresh.slice(0, 3).forEach((n) => {
        const id = n.id; toasts.value.push({ id, n });
        setTimeout(() => dismiss(id), 9000);
        if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
          try { new Notification(n.title, { body: n.message, icon: import.meta.env.BASE_URL + "logo.png" }); } catch { /* ignoré */ }
        }
      });
      window.dispatchEvent(new Event("pb:orders-refresh"));
    }
    seeded = true;
  } catch { /* réessaiera */ }
}

async function readAll() {
  items.value = items.value.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }));
  unread.value = 0; document.title = baseTitle;
  try { await apiClient.post("/notifications/read", { all: true }); } catch { /* ignoré */ }
}
async function openItem(n) {
  open.value = false;
  if (!n.readAt) {
    n.readAt = new Date().toISOString(); unread.value = Math.max(0, unread.value - 1);
    document.title = unread.value ? `(${unread.value}) ${baseTitle}` : baseTitle;
    try { await apiClient.post("/notifications/read", { ids: [n.id] }); } catch { /* ignoré */ }
  }
  router.push(n.link || "/commandes");
}
function ago(d) {
  const m = Math.round((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "à l’instant"; if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60); if (h < 24) return `il y a ${h} h`;
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

onMounted(() => { poll(); timer = setInterval(poll, 12000); });
onBeforeUnmount(() => { clearInterval(timer); document.title = baseTitle; });
</script>
