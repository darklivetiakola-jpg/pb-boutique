<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button v-for="t in tabs" :key="t.value" @click="tab = t.value"
          class="shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border transition-all"
          :class="tab === t.value ? 'bg-gold text-white border-gold' : 'bg-paper border-line text-muted hover:text-ink'">{{ t.label }}</button>
      </div>
      <button @click="tab === 'FLASH' ? openFlash() : openCreate()" class="btn-primary flex items-center gap-2 text-sm">
        <Icon name="plus" class="w-4 h-4" /> {{ current.add }}
      </button>
    </div>
    <p class="text-sm text-muted">{{ current.help }}</p>

    <div v-if="loading" class="grid md:grid-cols-2 gap-4"><div v-for="i in 4" :key="i" class="skeleton h-28 w-full"></div></div>

    <!-- ===== VENTES FLASH ===== -->
    <template v-else-if="tab === 'FLASH'">
      <div v-if="!flash.length" class="card p-10 text-center text-muted">Aucune vente flash. Choisissez un produit, un prix et une heure de fin.</div>
      <div v-else class="grid md:grid-cols-2 gap-4">
        <div v-for="f in flash" :key="f.id" class="card p-4 flex gap-4 animate-rise">
          <div class="w-20 h-24 rounded-xl bg-page overflow-hidden shrink-0"><img v-if="f.image" :src="f.image" class="w-full h-full object-cover" /></div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="badge" :class="f.live ? 'bg-green-50 text-good' : 'bg-page text-muted'">{{ f.live ? "⚡ En cours" : "Terminée" }}</span>
              <span class="badge bg-red-50 text-bad">−{{ pct(f.basePrice, f.flashPrice) }}%</span>
            </div>
            <div class="font-semibold truncate">{{ f.name }}</div>
            <div class="text-sm"><b>{{ fmt(f.flashPrice) }} F</b> <span class="text-muted line-through ml-1">{{ fmt(f.basePrice) }} F</span></div>
            <div class="text-xs text-muted mt-0.5">Fin : {{ longDate(f.flashEndsAt) }}</div>
            <div class="flex gap-3 mt-2 text-sm">
              <button @click="openFlash(f)" class="text-gold font-medium">Modifier</button>
              <button @click="stopFlash(f)" class="text-bad font-medium">Arrêter</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== BANDEAU / ALERTE / AFFICHES ===== -->
    <template v-else>
      <div v-if="!list.length" class="card p-10 text-center text-muted">Rien ici pour l'instant.</div>
      <div v-else class="grid md:grid-cols-2 gap-4">
        <div v-for="p in list" :key="p.id" class="card overflow-hidden animate-rise">
          <div class="h-24 relative grid place-items-center text-center px-4" :style="{ background: p.bgColor || '#0B0B0C', color: p.textColor || '#fff' }">
            <img v-if="p.image" :src="p.image" class="absolute inset-0 w-full h-full object-cover opacity-80" />
            <span class="relative font-bold drop-shadow">{{ p.title }}</span>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-between mb-1.5">
              <span class="badge" :class="state(p).cls">{{ state(p).label }}</span>
              <div class="flex gap-3">
                <button @click="toggle(p)" class="text-xs font-medium text-muted hover:text-ink">{{ p.active ? "Désactiver" : "Activer" }}</button>
                <button @click="openEdit(p)" class="text-muted hover:text-ink"><Icon name="edit" class="w-4 h-4" /></button>
                <button @click="remove(p)" class="text-muted hover:text-bad"><Icon name="trash" class="w-4 h-4" /></button>
              </div>
            </div>
            <p v-if="p.subtitle" class="text-sm text-muted line-clamp-2">{{ p.subtitle }}</p>
            <p class="text-xs text-muted mt-1">
              <template v-if="p.startsAt">Du {{ longDate(p.startsAt) }} </template><template v-if="p.endsAt">jusqu'au {{ longDate(p.endsAt) }}</template>
              <template v-if="!p.startsAt && !p.endsAt">Sans date limite</template>
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== MODALE PROMO ===== -->
    <Transition name="modal">
      <div v-if="modal" class="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4" @click.self="modal = false">
        <Transition name="modal-content" appear>
          <div class="bg-paper rounded-t-3xl sm:rounded-3xl shadow-pop w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold tracking-tight">{{ editing ? "Modifier" : current.add }}</h2>
              <button @click="modal = false" class="text-muted hover:text-ink"><Icon name="close" class="w-5 h-5" /></button>
            </div>
            <div v-if="!editing" class="flex flex-wrap gap-2 mb-4">
              <button v-for="p in presets" :key="p.name" type="button" @click="applyPreset(p)" class="text-xs font-semibold px-3 py-1.5 rounded-full bg-page hover:bg-line">{{ p.name }}</button>
            </div>
            <form @submit.prevent="save" class="space-y-3.5">
              <input v-model="form.title" required maxlength="140" :placeholder="tab === 'ALERT' ? 'Ex. BLACK FRIDAY : -50% sur tout !' : 'Titre'" class="input" />
              <input v-model="form.subtitle" maxlength="200" placeholder="Sous-titre (optionnel)" class="input" />
              <div v-if="tab !== 'ALERT'"><p class="text-xs text-muted mb-1.5">Image {{ tab === 'BANNER' ? '(affiche, format paysage conseillé)' : '(petite vignette du ticket, optionnel)' }}</p><ImageUpload v-model="form.image" /></div>
              <div class="grid grid-cols-2 gap-3">
                <input v-model="form.ctaLabel" maxlength="40" placeholder="Texte du bouton" class="input" />
                <input v-model="form.ctaUrl" placeholder="/categorie/polos ou https://…" class="input" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <label class="text-xs text-muted">Couleur de fond
                  <div class="flex gap-2 mt-1"><input type="color" v-model="bg" class="h-10 w-12 rounded-lg border border-line bg-paper" /><button type="button" class="text-xs underline" @click="form.bgColor = null">défaut</button></div></label>
                <label class="text-xs text-muted">Couleur du texte
                  <div class="flex gap-2 mt-1"><input type="color" v-model="fg" class="h-10 w-12 rounded-lg border border-line bg-paper" /><button type="button" class="text-xs underline" @click="form.textColor = null">défaut</button></div></label>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <label class="text-xs text-muted">Début (optionnel)<input v-model="form.startsAt" type="datetime-local" class="input mt-1" /></label>
                <label class="text-xs text-muted">Fin (optionnel){{ tab === 'ALERT' ? ' — affiche un compte à rebours' : '' }}<input v-model="form.endsAt" type="datetime-local" class="input mt-1" /></label>
              </div>
              <div class="flex items-center justify-between gap-3">
                <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.active" /> En ligne</label>
                <label class="flex items-center gap-2 text-sm text-muted">Ordre <input v-model.number="form.position" type="number" class="input !w-20 !py-1.5" /></label>
              </div>
              <p v-if="err" class="text-bad text-sm">{{ err }}</p>
              <div class="flex gap-3 pt-2">
                <button type="button" @click="modal = false" class="btn-outline flex-1">Annuler</button>
                <button type="submit" class="btn-primary flex-1" :disabled="busy">{{ busy ? "…" : "Enregistrer" }}</button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ===== MODALE VENTE FLASH ===== -->
    <Transition name="modal">
      <div v-if="flashModal" class="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4" @click.self="flashModal = false">
        <Transition name="modal-content" appear>
          <div class="bg-paper rounded-t-3xl sm:rounded-3xl shadow-pop w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold tracking-tight">⚡ Vente flash</h2>
              <button @click="flashModal = false" class="text-muted hover:text-ink"><Icon name="close" class="w-5 h-5" /></button>
            </div>
            <form @submit.prevent="saveFlash" class="space-y-3.5">
              <select v-model="fForm.productId" required class="input" :disabled="!!fEditing">
                <option value="" disabled>Choisir un produit…</option>
                <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }} — {{ fmt(p.basePrice) }} F</option>
              </select>
              <div>
                <input v-model.number="fForm.flashPrice" required type="number" min="1" placeholder="Prix flash (F CFA)" class="input" />
                <p v-if="chosen && fForm.flashPrice" class="text-xs mt-1" :class="fForm.flashPrice < chosen.basePrice ? 'text-good' : 'text-bad'">
                  {{ fForm.flashPrice < chosen.basePrice ? `Remise de ${pct(chosen.basePrice, fForm.flashPrice)}%` : "Le prix flash doit être inférieur au prix actuel" }}
                </p>
              </div>
              <label class="text-xs text-muted block">Fin de la vente flash<input v-model="fForm.flashEndsAt" required type="datetime-local" class="input mt-1" /></label>
              <div class="flex flex-wrap gap-2">
                <button v-for="d in durations" :key="d.label" type="button" @click="fForm.flashEndsAt = inHours(d.h)" class="text-xs font-semibold px-3 py-1.5 rounded-full bg-page hover:bg-line">{{ d.label }}</button>
              </div>
              <p v-if="err" class="text-bad text-sm">{{ err }}</p>
              <div class="flex gap-3 pt-2">
                <button type="button" @click="flashModal = false" class="btn-outline flex-1">Annuler</button>
                <button type="submit" class="btn-primary flex-1" :disabled="busy">{{ busy ? "…" : "Lancer" }}</button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import apiClient from "../api/client";
import Icon from "../components/Icon.vue";
import ImageUpload from "../components/ImageUpload.vue";

const tabs = [
  { value: "TICKER", label: "Bandeau défilant", add: "Nouveau ticket", help: "Petits tickets (avec image) qui défilent en haut de la boutique : livraison, promos, infos pratiques…" },
  { value: "ALERT", label: "Alerte", add: "Nouvelle alerte", help: "Une barre d'alerte bien visible tout en haut (ex. BLACK FRIDAY). Une seule est affichée : la plus prioritaire." },
  { value: "BANNER", label: "Affiches", add: "Nouvelle affiche", help: "Grandes affiches en carrousel sur la page d'accueil." },
  { value: "FLASH", label: "Ventes flash", add: "Nouvelle vente flash", help: "Un produit à prix réduit pendant un temps limité, avec compte à rebours. Le prix flash s'applique automatiquement à la commande, et s'arrête tout seul." },
];
const tab = ref("TICKER");
const current = computed(() => tabs.find((t) => t.value === tab.value));
const promos = ref([]), flash = ref([]), products = ref([]), loading = ref(true);
const modal = ref(false), editing = ref(null), form = ref({}), err = ref(""), busy = ref(false);
const flashModal = ref(false), fEditing = ref(null), fForm = ref({ productId: "", flashPrice: null, flashEndsAt: "" });

const list = computed(() => promos.value.filter((p) => p.kind === tab.value));
const chosen = computed(() => products.value.find((p) => p.id === fForm.value.productId));
const fmt = (n) => Math.round(n).toLocaleString("fr-FR");
const pct = (a, b) => Math.round((1 - b / a) * 100);
const longDate = (d) => new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const pad = (n) => String(n).padStart(2, "0");
const toLocal = (iso) => { if (!iso) return ""; const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const inHours = (h) => toLocal(new Date(Date.now() + h * 3600e3));
const durations = [{ label: "1 h", h: 1 }, { label: "6 h", h: 6 }, { label: "24 h", h: 24 }, { label: "3 jours", h: 72 }, { label: "7 jours", h: 168 }];

const bg = computed({ get: () => form.value.bgColor || "#0b0b0c", set: (v) => (form.value.bgColor = v) });
const fg = computed({ get: () => form.value.textColor || "#ffffff", set: (v) => (form.value.textColor = v) });

const PRESETS = {
  ALERT: [
    { name: "🖤 Black Friday", title: "BLACK FRIDAY : jusqu'à -50% sur toute la boutique !", ctaLabel: "J'en profite", ctaUrl: "/decouvrir", bgColor: "#0A0A0A", textColor: "#F2D58A" },
    { name: "⚡ Vente flash", title: "VENTE FLASH : prix cassés aujourd'hui seulement", ctaLabel: "Voir", ctaUrl: "/", bgColor: "#C8102E", textColor: "#ffffff" },
    { name: "🎁 Fêtes", title: "Spécial fêtes : livraison offerte dès 50 000 F", bgColor: "#14532D", textColor: "#ffffff" },
  ],
  TICKER: [
    { name: "🚚 Livraison 48h", title: "Livraison 48h", subtitle: "Partout à Abidjan", bgColor: "#0B0B0C", textColor: "#F2D58A" },
    { name: "🔁 Échange 7 jours", title: "Échange gratuit 7 jours", subtitle: "Sans prise de tête", bgColor: "#0B0B0C", textColor: "#F2D58A" },
    { name: "🔥 -20% Polos", title: "-20% sur les polos", subtitle: "Cette semaine", ctaUrl: "/categorie/polos", bgColor: "#C8102E", textColor: "#ffffff" },
  ],
  BANNER: [
    { name: "🆕 Nouvelle collection", title: "La nouvelle collection est là", subtitle: "Nouveautés", ctaLabel: "Découvrir", ctaUrl: "/categorie/nouveautes", bgColor: "#0B0B0C", textColor: "#ffffff" },
    { name: "🖤 Black Friday", title: "Black Friday : -50%", subtitle: "Du 24 au 30 novembre", ctaLabel: "J'en profite", ctaUrl: "/decouvrir", bgColor: "#0A0A0A", textColor: "#F2D58A" },
  ],
};
const presets = computed(() => PRESETS[tab.value] || []);

function state(p) {
  const now = Date.now();
  if (!p.active) return { label: "Désactivée", cls: "bg-page text-muted" };
  if (p.endsAt && new Date(p.endsAt) < now) return { label: "Terminée", cls: "bg-page text-muted" };
  if (p.startsAt && new Date(p.startsAt) > now) return { label: "Programmée", cls: "bg-amber-50 text-warn" };
  return { label: "En ligne", cls: "bg-green-50 text-good" };
}

async function load() {
  loading.value = true;
  try {
    const [a, b] = await Promise.all([apiClient.get("/promos"), apiClient.get("/promos/flash")]);
    promos.value = a.data; flash.value = b.data;
  } finally { loading.value = false; }
}

function blank() { return { kind: tab.value, title: "", subtitle: "", image: "", ctaLabel: "", ctaUrl: "", bgColor: null, textColor: null, startsAt: "", endsAt: "", active: true, position: 0 }; }
function openCreate() { editing.value = null; err.value = ""; form.value = blank(); modal.value = true; }
function openEdit(p) { editing.value = p; err.value = ""; form.value = { ...p, startsAt: toLocal(p.startsAt), endsAt: toLocal(p.endsAt), image: p.image || "" }; modal.value = true; }
function applyPreset(p) { const { name, ...rest } = p; form.value = { ...form.value, ...rest }; }

async function save() {
  busy.value = true; err.value = "";
  const f = form.value;
  const body = { ...f, kind: tab.value, image: f.image || null, startsAt: f.startsAt ? new Date(f.startsAt).toISOString() : null, endsAt: f.endsAt ? new Date(f.endsAt).toISOString() : null };
  delete body.id; delete body.createdAt; delete body.updatedAt;
  try {
    if (editing.value) await apiClient.patch(`/promos/${editing.value.id}`, body); else await apiClient.post("/promos", body);
    modal.value = false; await load();
  } catch (e) { err.value = e.response?.data?.error || "Échec de l'enregistrement."; }
  finally { busy.value = false; }
}
async function toggle(p) { p.active = !p.active; try { await apiClient.patch(`/promos/${p.id}`, { active: p.active }); } catch { p.active = !p.active; } }
async function remove(p) { if (!confirm(`Supprimer « ${p.title} » ?`)) return; await apiClient.delete(`/promos/${p.id}`); load(); }

async function openFlash(f = null) {
  err.value = ""; fEditing.value = f && f.id ? f : null;
  if (!products.value.length) { const { data } = await apiClient.get("/products?all=1"); products.value = data; }
  fForm.value = f && f.id ? { productId: f.id, flashPrice: f.flashPrice, flashEndsAt: toLocal(f.flashEndsAt) } : { productId: "", flashPrice: null, flashEndsAt: inHours(24) };
  flashModal.value = true;
}
async function saveFlash() {
  busy.value = true; err.value = "";
  try {
    await apiClient.put(`/promos/flash/${fForm.value.productId}`, { flashPrice: fForm.value.flashPrice, flashEndsAt: new Date(fForm.value.flashEndsAt).toISOString() });
    flashModal.value = false; await load();
  } catch (e) { err.value = e.response?.data?.error || "Échec de l'enregistrement."; }
  finally { busy.value = false; }
}
async function stopFlash(f) { if (!confirm(`Arrêter la vente flash de « ${f.name} » ?`)) return; await apiClient.delete(`/promos/flash/${f.id}`); load(); }

onMounted(load);
</script>
