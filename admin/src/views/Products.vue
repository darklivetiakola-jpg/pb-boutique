<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="relative w-full sm:w-72">
        <Icon name="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input v-model="search" placeholder="Rechercher un produit…" class="input pl-10" />
      </div>
      <button @click="openCreate" class="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
        <Icon name="plus" class="w-4 h-4" /> Nouveau produit
      </button>
    </div>

    <div class="card overflow-hidden hidden sm:block">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-line text-left text-xs text-muted font-medium">
            <th class="py-3 px-5">Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Statut</th><th class="pr-5">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="p-8"><div class="skeleton h-40 w-full"></div></td></tr>
          <tr v-for="(p, i) in filtered" :key="p.id" class="border-b border-line last:border-0 animate-rise hover:bg-page/60 transition-colors" :style="{ animationDelay: `${i * 30}ms` }">
            <td class="py-3 px-5 font-medium">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-page overflow-hidden shrink-0 grid place-items-center text-muted">
                  <img v-if="p.coverImage" :src="p.coverImage" :alt="p.name" class="w-full h-full object-cover" />
                  <Icon v-else name="image" class="w-5 h-5" />
                </div>
                {{ p.name }}
              </div>
            </td>
            <td class="text-muted">{{ p.category || "—" }}</td>
            <td>{{ fmt(p.basePrice) }} F</td>
            <td>
              <span class="badge" :class="p.totalStock === 0 ? 'bg-red-50 text-bad' : p.totalStock < 15 ? 'bg-amber-50 text-warn' : 'bg-green-50 text-good'">
                {{ p.totalStock }}
              </span>
            </td>
            <td>
              <span class="badge" :class="p.status === 'PUBLISHED' ? 'bg-green-50 text-good' : 'bg-page text-muted'">
                {{ p.status === 'PUBLISHED' ? 'Publié' : 'Brouillon' }}
              </span>
            </td>
            <td class="pr-5">
              <button @click="openEdit(p)" class="text-muted hover:text-ink transition-colors mr-3"><Icon name="edit" class="w-4 h-4" /></button>
              <button @click="remove(p)" class="text-muted hover:text-bad transition-colors"><Icon name="trash" class="w-4 h-4" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- LISTE MOBILE -->
    <div class="sm:hidden space-y-3">
      <div v-if="loading" class="skeleton h-40 w-full"></div>
      <div v-for="p in filtered" :key="p.id" class="card p-3.5">
        <div class="flex gap-3">
          <div class="w-16 h-16 rounded-xl bg-page overflow-hidden shrink-0 grid place-items-center text-muted">
            <img v-if="p.coverImage" :src="p.coverImage" :alt="p.name" class="w-full h-full object-cover" />
            <Icon v-else name="image" class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold leading-snug break-words">{{ p.name }}</div>
            <div class="text-xs mt-0.5" :class="p.category ? 'text-muted' : 'text-warn font-medium'">{{ p.category || "Sans catégorie" }}</div>
            <div class="font-semibold mt-1">{{ fmt(p.basePrice) }} F</div>
          </div>
        </div>
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-line">
          <div class="flex items-center gap-2">
            <span class="badge" :class="p.totalStock === 0 ? 'bg-red-50 text-bad' : p.totalStock < 15 ? 'bg-amber-50 text-warn' : 'bg-green-50 text-good'">Stock {{ p.totalStock }}</span>
            <span class="badge" :class="p.status === 'PUBLISHED' ? 'bg-green-50 text-good' : 'bg-page text-muted'">{{ p.status === 'PUBLISHED' ? 'Publié' : 'Brouillon' }}</span>
          </div>
          <div class="flex items-center">
            <button @click="openEdit(p)" class="p-2.5 rounded-lg text-muted hover:text-ink hover:bg-page" aria-label="Modifier"><Icon name="edit" class="w-5 h-5" /></button>
            <button @click="remove(p)" class="p-2.5 rounded-lg text-muted hover:text-bad hover:bg-page" aria-label="Supprimer"><Icon name="trash" class="w-5 h-5" /></button>
          </div>
        </div>
      </div>
      <div v-if="!loading && !filtered.length" class="text-center text-sm text-muted py-8">Aucun produit.</div>
    </div>

    <!-- MODAL -->
    <Transition name="modal">
      <div v-if="modalOpen" class="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4" @click.self="modalOpen = false">
        <Transition name="modal-content" appear>
          <div class="bg-paper rounded-t-3xl sm:rounded-3xl shadow-pop w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-xl font-bold tracking-tight">{{ editing ? "Modifier le produit" : "Nouveau produit" }}</h2>
              <button @click="modalOpen = false" class="text-muted hover:text-ink"><Icon name="close" class="w-5 h-5" /></button>
            </div>
            <form @submit.prevent="save" class="space-y-3.5">
              <div>
                <div class="text-sm font-semibold mb-2">Photos du produit</div>
                <ImageUpload v-model="form.images" multiple :max="6" />
              </div>
              <input v-model="form.name" required placeholder="Nom du produit" class="input" />
              <select v-model="form.categorySlug" required class="input">
                <option value="" disabled>Choisir une catégorie…</option>
                <option v-for="c in categories" :key="c.id" :value="c.slug">{{ c.name }}</option>
              </select>
              <div class="grid grid-cols-2 gap-3">
                <input v-model.number="form.basePrice" required type="number" placeholder="Prix (F CFA)" class="input" />
                <input v-model.number="form.compareAtPrice" type="number" placeholder="Prix barré (optionnel)" class="input" />
              </div>
              <input v-model="form.material" placeholder="Matière" class="input" />
              <textarea v-model="form.description" placeholder="Description" rows="3" class="input"></textarea>
              <select v-model="form.status" class="input">
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
              </select>
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.isFeatured" type="checkbox" class="rounded" /> Mettre en avant sur l'accueil
              </label>
              <div class="flex gap-3 pt-2">
                <button type="button" @click="modalOpen = false" class="btn-outline flex-1">Annuler</button>
                <button type="submit" class="btn-primary flex-1">{{ editing ? "Enregistrer" : "Créer" }}</button>
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

const products = ref([]);
const loading = ref(true);
const search = ref("");
const modalOpen = ref(false);
const editing = ref(null);
const categories = ref([]);
const form = ref({ name: "", categorySlug: "", basePrice: null, compareAtPrice: null, material: "", description: "", status: "DRAFT", isFeatured: false, images: [] });

const filtered = computed(() =>
  products.value.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase()))
);

function fmt(n) { return Math.round(n).toLocaleString("fr-FR"); }

async function load() {
  loading.value = true;
  const { data } = await apiClient.get("/products?all=1");
  products.value = data;
  loading.value = false;
}

function openCreate() {
  editing.value = null;
  form.value = { name: "", categorySlug: "", basePrice: null, compareAtPrice: null, material: "", description: "", status: "DRAFT", isFeatured: false, images: [] };
  modalOpen.value = true;
}

async function openEdit(p) {
  editing.value = p;
  form.value = { ...p, categorySlug: p.categorySlug || "", status: p.status || "DRAFT", images: p.coverImage ? [p.coverImage] : [] };
  modalOpen.value = true;
  try { // charge toute la galerie du produit
    const { data } = await apiClient.get(`/products/${p.id}`);
    form.value.images = data.gallery || [];
    form.value.description = data.description || "";
    form.value.material = data.material || "";
  } catch { /* on garde la photo principale */ }
}

async function save() {
  if (editing.value) {
    await apiClient.patch(`/products/${editing.value.id}`, form.value);
  } else {
    await apiClient.post("/products", form.value);
  }
  modalOpen.value = false;
  load();
}

async function remove(p) {
  if (!confirm(`Supprimer "${p.name}" ?`)) return;
  try {
    const { data } = await apiClient.delete(`/products/${p.id}`);
    if (data?.archived) alert("Ce produit figure dans des commandes : il a été archivé (retiré de la boutique) au lieu d'être supprimé.");
  } catch {
    alert("Suppression impossible pour le moment. Réessaie dans un instant.");
  }
  load();
}

async function loadCategories() {
  try { categories.value = (await apiClient.get("/products/categories")).data; } catch { categories.value = []; }
}

onMounted(() => { load(); loadCategories(); });
</script>
