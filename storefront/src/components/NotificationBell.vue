<template>
  <div v-if="auth.user" class="nb" ref="root">
    <button class="hact nb-btn" :class="{ ring: n.unread }" @click="toggle" aria-label="Notifications" :aria-expanded="n.open">
      <i class="fa-regular fa-bell"></i>
      <span v-if="n.unread" class="hact-badge nb-badge">{{ n.unread > 9 ? "9+" : n.unread }}</span>
    </button>

    <Transition name="nbp">
      <div v-if="n.open" class="nb-panel" role="dialog" aria-label="Notifications">
        <div class="nb-head">
          <b>Notifications</b>
          <button v-if="n.unread" class="nb-all" @click="n.markAllRead()">Tout marquer comme lu</button>
        </div>
        <div v-if="!n.items.length" class="nb-empty"><i class="fa-regular fa-bell-slash"></i><p>Rien pour l'instant.<br />Vous serez prévenu à chaque étape de votre colis.</p></div>
        <ul v-else class="nb-list">
          <li v-for="it in n.items" :key="it.id">
            <button class="nb-item" :class="{ unread: !it.readAt }" @click="openItem(it)">
              <span class="nb-ico" :class="tone(it)"><i :class="icon(it)"></i></span>
              <span class="nb-txt"><b>{{ it.title }}</b><small>{{ it.message }}</small><em>{{ ago(it.createdAt) }}</em></span>
              <i v-if="!it.readAt" class="nb-dot"></i>
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useNotificationsStore } from "../stores/notifications";

const auth = useAuthStore(), n = useNotificationsStore();
const router = useRouter(), route = useRoute();
const root = ref(null);

watch(() => auth.user, (u) => { if (u) n.start(); else n.stop(); }, { immediate: true });
watch(() => route.fullPath, () => { n.open = false; });

function toggle() { n.open = !n.open; }
function openItem(it) {
  n.markRead(it.id);
  n.open = false;
  router.push(it.link || "/compte");
}
const icon = (it) => ({ ORDER_NEW: "fa-solid fa-bag-shopping", ORDER_PAID: "fa-solid fa-circle-check", ORDER_STATUS: statusIcon(it) }[it.type] || "fa-solid fa-bell");
function statusIcon(it) {
  const t = it.title || "";
  if (t.includes("expédié")) return "fa-solid fa-truck-fast";
  if (t.includes("livré")) return "fa-solid fa-box-open";
  if (t.includes("annulée")) return "fa-solid fa-ban";
  if (t.includes("Paiement")) return "fa-solid fa-circle-check";
  if (t.includes("préparation")) return "fa-solid fa-shirt";
  return "fa-solid fa-bag-shopping";
}
const tone = (it) => (/annul/i.test(it.title) ? "bad" : /livr|Paiement/i.test(it.title) ? "ok" : "gold");
function ago(d) {
  const m = Math.round((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "à l’instant"; if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60); if (h < 24) return `il y a ${h} h`;
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
function onKey(e) { if (e.key === "Escape") n.open = false; }
function onDoc(e) { if (n.open && root.value && !root.value.contains(e.target)) n.open = false; }
onMounted(() => { document.addEventListener("keydown", onKey); document.addEventListener("pointerdown", onDoc); });
onBeforeUnmount(() => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDoc); });
</script>

<style>
.nb { position: relative; }
.nb-btn { border: 0; cursor: pointer; }
.nb-badge { top: 4px; right: 3px; background: #E5484D; color: #fff; }
.nb-btn.ring i { animation: nb-ring 2.4s ease-in-out infinite; transform-origin: 50% 0; }
@keyframes nb-ring { 0%,60%,100% { transform: rotate(0); } 66% { transform: rotate(14deg); } 72% { transform: rotate(-12deg); } 78% { transform: rotate(8deg); } 84% { transform: rotate(-6deg); } }
.nb-panel { position: absolute; right: -6px; top: calc(100% + 10px); width: 360px; max-height: 70vh; overflow: auto; z-index: 1200; background: var(--surface, #fff); color: var(--ink, #1D1D1F); border: 1px solid var(--border, #E8E8ED); border-radius: 18px; box-shadow: 0 24px 60px rgba(0,0,0,.28); text-align: left; }
.nb-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 10px; position: sticky; top: 0; background: inherit; border-bottom: 1px solid var(--border, #E8E8ED); }
.nb-head b { font-size: .98rem; } .nb-all { font-size: .76rem; color: var(--gold, #0071E3); background: none; border: 0; cursor: pointer; font-weight: 600; }
.nb-list { list-style: none; margin: 0; padding: 6px; }
.nb-item { width: 100%; display: flex; gap: 12px; align-items: flex-start; text-align: left; padding: 10px; border-radius: 12px; background: none; border: 0; cursor: pointer; color: inherit; position: relative; }
.nb-item:hover { background: var(--bg2, #F5F5F7); } .nb-item.unread { background: color-mix(in srgb, #D4A62A 10%, transparent); }
.nb-ico { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; flex-shrink: 0; font-size: .95rem; }
.nb-ico.gold { background: rgba(212,166,42,.18); color: #A8801A; } .nb-ico.ok { background: rgba(48,209,88,.16); color: #1C8F3E; } .nb-ico.bad { background: rgba(229,72,77,.14); color: #C62828; }
.nb-txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.nb-txt b { font-size: .88rem; } .nb-txt small { font-size: .8rem; color: var(--ink2, #555); line-height: 1.35; } .nb-txt em { font-style: normal; font-size: .7rem; color: var(--ink3, #888); }
.nb-dot { width: 9px; height: 9px; border-radius: 50%; background: #E5484D; position: absolute; right: 12px; top: 14px; }
.nb-empty { padding: 34px 20px; text-align: center; color: var(--ink2, #666); } .nb-empty i { font-size: 1.6rem; margin-bottom: 8px; opacity: .6; } .nb-empty p { font-size: .85rem; line-height: 1.45; }
.nbp-enter-active, .nbp-leave-active { transition: opacity .16s ease, transform .16s ease; } .nbp-enter-from, .nbp-leave-to { opacity: 0; transform: translateY(-6px) scale(.98); }
@media (max-width: 640px) {
  .nb { position: static; }
  .nb-panel { position: fixed; left: 8px; right: 8px; top: calc(var(--header-h, 60px) + 8px); width: auto; max-height: 78vh; }
}
</style>
