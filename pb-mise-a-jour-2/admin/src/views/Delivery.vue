<template>
  <div class="space-y-4 max-w-2xl">
    <div class="card p-4 flex gap-3 items-start">
      <span class="w-10 h-10 rounded-xl bg-gold-soft text-gold grid place-items-center shrink-0"><Icon name="truck" class="w-5 h-5" /></span>
      <div class="text-sm">
        <div class="font-semibold">Frais de livraison par commune</div>
        <p class="text-muted mt-0.5">Le client choisit sa zone au moment de commander, et le tarif s'ajoute au total.
          <template v-if="freeFrom"> Livraison <b>offerte</b> dès {{ fmt(freeFrom) }} F d'achats.</template></p>
      </div>
    </div>

    <!-- Ajouter une zone -->
    <form @submit.prevent="add" class="card p-4 space-y-3">
      <div class="text-sm font-semibold">Ajouter une zone</div>
      <div v-if="suggestions.length" class="flex gap-2 scroll-x -mx-4 px-4">
        <button v-for="s in suggestions" :key="s" type="button" @click="newName = s" class="chip chip-off">{{ s }}</button>
      </div>
      <div class="grid grid-cols-[1fr_120px] gap-3">
        <input v-model.trim="newName" required maxlength="60" placeholder="Ex. Cocody" class="input" autocomplete="off" />
        <input v-model.number="newFee" required type="number" min="0" inputmode="numeric" placeholder="2000" class="input" aria-label="Tarif en FCFA" />
      </div>
      <button class="btn-primary w-full !h-12" :disabled="adding">{{ adding ? "Ajout…" : "Ajouter la zone" }}</button>
    </form>

    <div v-if="loading" class="space-y-3"><div v-for="i in 3" :key="i" class="skeleton h-16 w-full"></div></div>
    <div v-else-if="loadError" class="card p-8 text-center">
      <p class="text-bad font-medium mb-3">{{ loadError }}</p>
      <button @click="load" class="btn-outline">Réessayer</button>
    </div>
    <div v-else-if="!zones.length" class="card p-8 text-center text-muted">
      <div class="text-4xl mb-2">🚚</div>
      Aucune zone pour l'instant : les clients commandent <b>sans frais de livraison</b>. Ajoutez vos communes ci-dessus.
    </div>

    <div v-else class="card divide-y divide-line overflow-hidden">
      <div v-for="z in zones" :key="z.id" class="flex items-center gap-3 px-4 py-3" :class="z.active ? '' : 'opacity-60'">
        <div class="min-w-0 flex-1">
          <div class="font-medium truncate">{{ z.name }}</div>
          <button type="button" @click="toggle(z)" class="text-xs font-semibold mt-0.5 min-h-[28px]" :class="z.active ? 'text-good' : 'text-muted'">{{ z.active ? "● Active" : "○ Désactivée" }}</button>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <input :value="z.fee" @change="saveFee(z, $event.target.value)" type="number" min="0" inputmode="numeric" class="w-24 h-11 text-right font-semibold rounded-xl bg-page border border-transparent focus:bg-paper focus:border-gold focus:outline-none px-3 text-[16px]" :aria-label="`Tarif ${z.name}`" />
          <span class="text-sm text-muted">F</span>
        </div>
        <button @click="remove(z)" class="icon-btn hover:!text-bad shrink-0" :aria-label="`Supprimer ${z.name}`"><Icon name="trash" class="w-[18px] h-[18px]" /></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import apiClient from "../api/client";
import Icon from "../components/Icon.vue";
import { say, errMsg } from "../utils/toast";

const COMMUNES = ["Cocody", "Angré", "Riviera", "Yopougon", "Abobo", "Adjamé", "Plateau", "Marcory", "Treichville", "Koumassi", "Port-Bouët", "Bingerville", "Attécoubé", "Anyama"];

const zones = ref([]);
const freeFrom = ref(0);
const loading = ref(true);
const loadError = ref("");
const newName = ref("");
const newFee = ref(null);
const adding = ref(false);

const fmt = (n) => Math.round(n || 0).toLocaleString("fr-FR");
const suggestions = computed(() => COMMUNES.filter((c) => !zones.value.some((z) => z.name.toLowerCase() === c.toLowerCase())));

async function load() {
  loading.value = true; loadError.value = "";
  try {
    const [all, pub] = await Promise.all([apiClient.get("/delivery-zones/all"), apiClient.get("/delivery-zones").catch(() => ({ data: {} }))]);
    zones.value = all.data;
    freeFrom.value = pub.data?.freeShippingFrom || 0;
  } catch (e) { loadError.value = errMsg(e, "Impossible de charger les zones."); }
  finally { loading.value = false; }
}

async function add() {
  adding.value = true;
  try {
    const { data } = await apiClient.post("/delivery-zones", { name: newName.value, fee: newFee.value });
    zones.value.push(data);
    say(`Zone « ${data.name} » ajoutée`);
    newName.value = ""; newFee.value = null;
  } catch (e) { say(errMsg(e, "Ajout impossible"), "error"); }
  finally { adding.value = false; }
}

async function saveFee(z, raw) {
  const fee = Math.round(Number(raw));
  if (!Number.isFinite(fee) || fee < 0 || fee === z.fee) return load();
  const prev = z.fee; z.fee = fee;
  try { await apiClient.patch(`/delivery-zones/${z.id}`, { fee }); say("Tarif mis à jour"); }
  catch (e) { z.fee = prev; say(errMsg(e, "Mise à jour impossible"), "error"); }
}

async function toggle(z) {
  const prev = z.active; z.active = !prev;
  try { await apiClient.patch(`/delivery-zones/${z.id}`, { active: z.active }); say(z.active ? "Zone activée" : "Zone désactivée"); }
  catch (e) { z.active = prev; say(errMsg(e, "Changement impossible"), "error"); }
}

async function remove(z) {
  if (!confirm(`Supprimer la zone « ${z.name} » ? Les anciennes commandes gardent leur tarif.`)) return;
  try { await apiClient.delete(`/delivery-zones/${z.id}`); zones.value = zones.value.filter((x) => x.id !== z.id); say("Zone supprimée"); }
  catch (e) { say(errMsg(e, "Suppression impossible"), "error"); }
}

onMounted(load);
</script>
