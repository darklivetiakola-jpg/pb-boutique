<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div class="flex gap-2 scroll-x">
        <button v-for="t in tabs" :key="t.value" @click="tab = t.value" class="chip" :class="tab === t.value ? 'chip-on' : 'chip-off'">{{ t.label }}</button>
      </div>
      <button @click="openCreate" class="btn-primary flex items-center gap-2 text-sm shrink-0 !px-4">
        <Icon name="plus" class="w-4 h-4" /><span class="hidden sm:inline">{{ tab === "PROMOTION" ? "Nouvelle promo" : "Nouvelle publication" }}</span><span class="sm:hidden">Ajouter</span>
      </button>
    </div>

    <div v-if="loading" class="grid md:grid-cols-2 gap-4"><div v-for="i in 4" :key="i" class="skeleton h-32 w-full"></div></div>
    <div v-else-if="loadError" class="card p-8 text-center">
      <p class="text-bad font-medium mb-3">{{ loadError }}</p>
      <button @click="load" class="btn-outline">Réessayer</button>
    </div>
    <div v-else-if="!filtered.length" class="card p-10 text-center text-muted">
      <div class="text-4xl mb-2">{{ tab === "PROMOTION" ? "🏷️" : "📰" }}</div>
      {{ tab === "PROMOTION" ? "Aucune promotion. Créez-en une pour attirer vos clients." : "Aucun article. Partagez une actualité de la boutique." }}
    </div>
    <div v-else class="grid md:grid-cols-2 gap-4">
      <article v-for="p in filtered" :key="p.id" class="card overflow-hidden">
        <div class="aspect-[16/9] bg-page">
          <img v-if="p.coverImage" :src="p.coverImage" :alt="p.title" class="w-full h-full object-cover" loading="lazy" />
          <div v-else class="w-full h-full grid place-items-center text-muted"><Icon name="image" class="w-8 h-8" /></div>
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between mb-1">
            <button @click="togglePublish(p)" class="badge min-h-[32px] px-3" :class="p.status === 'PUBLISHED' ? 'bg-green-50 text-good' : 'bg-page text-muted'" :aria-label="p.status === 'PUBLISHED' ? 'Passer en brouillon' : 'Publier'">
              {{ p.status === "PUBLISHED" ? "● Publié" : "○ Brouillon" }}
            </button>
            <div class="flex -mr-2">
              <button @click="openEdit(p)" class="icon-btn" aria-label="Modifier"><Icon name="edit" class="w-[18px] h-[18px]" /></button>
              <button @click="remove(p)" class="icon-btn hover:!text-bad" aria-label="Supprimer"><Icon name="trash" class="w-[18px] h-[18px]" /></button>
            </div>
          </div>
          <h3 class="font-semibold text-base mb-1">{{ p.title }}</h3>
          <p class="text-sm text-muted line-clamp-2">{{ p.excerpt }}</p>
          <div v-if="p.discountPct" class="mt-2 text-xs font-semibold text-gold">-{{ p.discountPct }}%</div>
        </div>
      </article>
    </div>

    <Transition name="modal">
      <div v-if="modalOpen" class="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4" @click.self="closeModal">
        <Transition name="modal-content" appear>
          <div class="modal-panel bg-paper rounded-t-3xl sm:rounded-3xl shadow-pop w-full max-w-lg px-5 pt-5 overflow-y-auto overscroll-contain" role="dialog" aria-modal="true">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold tracking-tight">{{ editing ? "Modifier" : form.type === "PROMOTION" ? "Nouvelle promotion" : "Nouvel article" }}</h2>
              <button @click="closeModal" class="icon-btn -mr-2" aria-label="Fermer"><Icon name="close" class="w-5 h-5" /></button>
            </div>
            <form @submit.prevent="save" class="space-y-4">
              <ImageUpload v-model="form.coverImage" />
              <label class="block">
                <span class="text-sm font-semibold">Type</span>
                <select v-model="form.type" class="input mt-1.5">
                  <option value="ARTICLE">Article / actualité</option>
                  <option value="PROMOTION">Promotion</option>
                </select>
              </label>
              <label class="block">
                <span class="text-sm font-semibold">Titre</span>
                <input v-model.trim="form.title" required placeholder="Ex. Soldes de fin de saison" class="input mt-1.5" />
              </label>
              <label class="block">
                <span class="text-sm font-semibold">Résumé court</span>
                <textarea v-model="form.excerpt" placeholder="Une phrase qui donne envie de lire" rows="2" class="input mt-1.5"></textarea>
              </label>
              <label class="block">
                <span class="text-sm font-semibold">Contenu complet</span>
                <textarea v-model="form.content" rows="4" class="input mt-1.5"></textarea>
              </label>
              <label v-if="form.type === 'PROMOTION'" class="block">
                <span class="text-sm font-semibold">Remise (%)</span>
                <input v-model.number="form.discountPct" type="number" min="1" max="90" inputmode="numeric" placeholder="20" class="input mt-1.5" />
              </label>
              <label class="block">
                <span class="text-sm font-semibold">Visibilité</span>
                <select v-model="form.status" class="input mt-1.5">
                  <option value="DRAFT">Brouillon</option>
                  <option value="PUBLISHED">Publié</option>
                </select>
              </label>
              <p v-if="formError" class="text-sm rounded-xl px-4 py-3 bg-red-50 text-bad" role="alert">{{ formError }}</p>
              <div class="sheet-footer flex gap-3">
                <button type="button" @click="closeModal" class="btn-outline flex-1 !h-12">Annuler</button>
                <button type="submit" :disabled="saving" class="btn-primary flex-1 !h-12 disabled:opacity-60">{{ saving ? "Enregistrement…" : "Enregistrer" }}</button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import apiClient from "../api/client";
import Icon from "../components/Icon.vue";
import ImageUpload from "../components/ImageUpload.vue";
import { say, errMsg } from "../utils/toast";

const posts = ref([]);
const loading = ref(true);
const loadError = ref("");
const tab = ref("ARTICLE");
const modalOpen = ref(false);
const editing = ref(null);
const saving = ref(false);
const formError = ref("");
const blank = (type = "ARTICLE") => ({ type, title: "", excerpt: "", content: "", coverImage: "", status: "DRAFT", discountPct: null });
const form = ref(blank());

const tabs = [{ value: "ARTICLE", label: "Articles" }, { value: "PROMOTION", label: "Promotions" }];
const filtered = computed(() => posts.value.filter((p) => p.type === tab.value));

async function load() {
  loading.value = true; loadError.value = "";
  try { const { data } = await apiClient.get("/posts?all=1"); posts.value = data; }
  catch (e) { loadError.value = errMsg(e, "Impossible de charger les publications."); }
  finally { loading.value = false; }
}

function openCreate() { editing.value = null; formError.value = ""; form.value = blank(tab.value); modalOpen.value = true; }
function openEdit(p) { editing.value = p; formError.value = ""; form.value = { ...p }; modalOpen.value = true; }
function closeModal() { if (!saving.value) modalOpen.value = false; }

async function save() {
  formError.value = "";
  const payload = { ...form.value };
  if (!payload.coverImage) payload.coverImage = null;
  if (payload.type !== "PROMOTION") payload.discountPct = null;
  saving.value = true;
  try {
    if (editing.value) await apiClient.patch(`/posts/${editing.value.id}`, payload);
    else await apiClient.post("/posts", payload);
    modalOpen.value = false;
    say(editing.value ? "Publication mise à jour" : "Publication créée");
    load();
  } catch (e) { formError.value = errMsg(e, "L'enregistrement a échoué. Réessayez."); }
  finally { saving.value = false; }
}

async function togglePublish(p) {
  const next = p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  const prev = p.status; p.status = next;
  try { await apiClient.patch(`/posts/${p.id}`, { status: next }); say(next === "PUBLISHED" ? "Publié" : "Repassé en brouillon"); }
  catch (e) { p.status = prev; say(errMsg(e, "Changement impossible"), "error"); }
}

async function remove(p) {
  if (!confirm(`Supprimer « ${p.title} » ?`)) return;
  try { await apiClient.delete(`/posts/${p.id}`); posts.value = posts.value.filter((x) => x.id !== p.id); say("Publication supprimée"); }
  catch (e) { say(errMsg(e, "Suppression impossible"), "error"); }
}

onMounted(load);
</script>
