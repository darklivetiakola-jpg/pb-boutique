<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <button v-for="t in tabs" :key="t.value" @click="tab = t.value"
          class="text-sm font-medium px-4 py-1.5 rounded-full border transition-all"
          :class="tab === t.value ? 'bg-gold text-white border-gold' : 'bg-paper border-line text-muted hover:text-ink'">
          {{ t.label }}
        </button>
      </div>
      <button @click="openCreate" class="btn-primary flex items-center gap-2 text-sm">
        <Icon name="plus" class="w-4 h-4" /> {{ tab === "PROMOTION" ? "Nouvelle promo" : "Nouvelle publication" }}
      </button>
    </div>

    <div v-if="loading" class="grid md:grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i" class="skeleton h-32 w-full"></div>
    </div>
    <div v-else-if="!filtered.length" class="card p-10 text-center text-muted">
      Rien à afficher ici pour l'instant.
    </div>
    <div v-else class="grid md:grid-cols-2 gap-4">
      <div v-for="(p, i) in filtered" :key="p.id" class="card overflow-hidden animate-rise" :style="{ animationDelay: `${i * 40}ms` }">
        <div class="aspect-[16/9] bg-page">
          <img v-if="p.coverImage" :src="p.coverImage" :alt="p.title" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full grid place-items-center text-muted"><Icon name="image" class="w-8 h-8" /></div>
        </div>
        <div class="p-5">
        <div class="flex items-start justify-between mb-2">
          <span class="badge" :class="p.status === 'PUBLISHED' ? 'bg-green-50 text-good' : 'bg-page text-muted'">
            {{ p.status === "PUBLISHED" ? "Publié" : "Brouillon" }}
          </span>
          <div class="flex gap-2">
            <button @click="openEdit(p)" class="text-muted hover:text-ink"><Icon name="edit" class="w-4 h-4" /></button>
            <button @click="remove(p)" class="text-muted hover:text-bad"><Icon name="trash" class="w-4 h-4" /></button>
          </div>
        </div>
        <h3 class="font-semibold text-base mb-1">{{ p.title }}</h3>
        <p class="text-sm text-muted line-clamp-2">{{ p.excerpt }}</p>
        <div v-if="p.discountPct" class="mt-2 text-xs font-semibold text-gold-deep">-{{ p.discountPct }}%</div>
        </div>
      </div>
    </div>

    <Transition name="modal">
      <div v-if="modalOpen" class="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4" @click.self="modalOpen = false">
        <Transition name="modal-content" appear>
          <div class="bg-paper rounded-t-3xl sm:rounded-3xl shadow-pop w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-xl font-bold tracking-tight">{{ editing ? "Modifier" : "Nouveau" }}</h2>
              <button @click="modalOpen = false" class="text-muted hover:text-ink"><Icon name="close" class="w-5 h-5" /></button>
            </div>
            <form @submit.prevent="save" class="space-y-3.5">
              <ImageUpload v-model="form.coverImage" />
              <select v-model="form.type" class="input">
                <option value="ARTICLE">Article / Actu</option>
                <option value="PROMOTION">Promotion</option>
              </select>
              <input v-model="form.title" required placeholder="Titre" class="input" />
              <textarea v-model="form.excerpt" placeholder="Résumé court" rows="2" class="input"></textarea>
              <textarea v-model="form.content" placeholder="Contenu complet" rows="4" class="input"></textarea>
              <input v-if="form.type === 'PROMOTION'" v-model.number="form.discountPct" type="number" placeholder="Remise (%)" class="input" />
              <select v-model="form.status" class="input">
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
              </select>
              <div class="flex gap-3 pt-2">
                <button type="button" @click="modalOpen = false" class="btn-outline flex-1">Annuler</button>
                <button type="submit" class="btn-primary flex-1">Enregistrer</button>
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

const posts = ref([]);
const loading = ref(true);
const tab = ref("ARTICLE");
const modalOpen = ref(false);
const editing = ref(null);
const form = ref({ type: "ARTICLE", title: "", excerpt: "", content: "", coverImage: "", status: "DRAFT", discountPct: null });

const tabs = [{ value: "ARTICLE", label: "Articles" }, { value: "PROMOTION", label: "Promotions" }];
const filtered = computed(() => posts.value.filter(p => p.type === tab.value));

async function load() {
  loading.value = true;
  const { data } = await apiClient.get("/posts?all=1");
  posts.value = data;
  loading.value = false;
}

function openCreate() {
  editing.value = null;
  form.value = { type: tab.value, title: "", excerpt: "", content: "", coverImage: "", status: "DRAFT", discountPct: null };
  modalOpen.value = true;
}
function openEdit(p) { editing.value = p; form.value = { ...p }; modalOpen.value = true; }

async function save() {
  if (!form.value.coverImage) form.value.coverImage = null;
  if (editing.value) await apiClient.patch(`/posts/${editing.value.id}`, form.value);
  else await apiClient.post("/posts", form.value);
  modalOpen.value = false;
  load();
}
async function remove(p) {
  if (!confirm(`Supprimer "${p.title}" ?`)) return;
  await apiClient.delete(`/posts/${p.id}`);
  load();
}

onMounted(load);
</script>
