<template>
  <div class="space-y-4">
    <!-- Barre d'outils -->
    <div class="flex gap-3">
      <div class="relative flex-1 min-w-0">
        <Icon name="search" class="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input v-model.trim="search" type="search" placeholder="Rechercher un produit…" class="input !pl-11 !bg-paper !border-line" />
      </div>
      <button @click="openCreate" class="btn-primary flex items-center gap-2 shrink-0 !px-4 sm:!px-5">
        <Icon name="plus" class="w-4 h-4" /><span class="hidden sm:inline">Nouveau produit</span><span class="sm:hidden">Ajouter</span>
      </button>
    </div>

    <!-- Filtres -->
    <div class="flex gap-2 scroll-x -mx-4 px-4 lg:mx-0 lg:px-0">
      <button v-for="f in filters" :key="f.value" @click="filter = f.value" class="chip flex items-center gap-2" :class="filter === f.value ? 'chip-on' : 'chip-off'">
        {{ f.label }}
        <span class="text-[11px] font-bold rounded-full px-1.5 min-w-[20px] text-center" :class="filter === f.value ? 'bg-white/20' : 'bg-page'">{{ count(f.value) }}</span>
      </button>
    </div>

    <div v-if="loading" class="space-y-3"><div v-for="i in 4" :key="i" class="skeleton h-24 w-full"></div></div>
    <div v-else-if="loadError" class="card p-8 text-center">
      <p class="text-bad font-medium mb-3">{{ loadError }}</p>
      <button @click="load" class="btn-outline">Réessayer</button>
    </div>
    <div v-else-if="!filtered.length" class="card p-10 text-center text-muted">
      <div class="text-4xl mb-2">👕</div>
      {{ products.length ? "Aucun produit ne correspond." : "Aucun produit pour l’instant. Ajoutez le premier !" }}
    </div>

    <template v-else>
      <!-- Téléphone : cartes -->
      <div class="grid gap-3 md:hidden">
        <article v-for="p in filtered" :key="p.id" class="card p-3 flex gap-3">
          <div class="w-20 h-20 rounded-xl bg-page overflow-hidden shrink-0 grid place-items-center text-muted">
            <img v-if="p.coverImage" :src="p.coverImage" :alt="p.name" class="w-full h-full object-cover" loading="lazy" />
            <Icon v-else name="image" class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1 flex flex-col">
            <div class="font-semibold leading-snug line-clamp-2">{{ p.name }}</div>
            <div class="text-xs mt-0.5 truncate" :class="p.category ? 'text-muted' : 'text-warn font-medium'">{{ p.category || "⚠ Sans catégorie : invisible dans les rubriques" }}</div>
            <div class="flex items-center gap-2 mt-1.5 flex-wrap">
              <span class="font-bold">{{ fmt(p.basePrice) }} F</span>
              <span class="badge" :class="stockClass(p.totalStock)">{{ p.totalStock === 0 ? "Rupture" : p.totalStock + " en stock" }}</span>
            </div>
            <div class="flex items-center justify-between mt-auto pt-2 -mb-1">
              <button @click="togglePublish(p)" class="badge min-h-[32px] px-3" :class="p.status === 'PUBLISHED' ? 'bg-green-50 text-good' : 'bg-page text-muted'" :aria-label="p.status === 'PUBLISHED' ? 'Passer en brouillon' : 'Publier'">
                {{ p.status === "PUBLISHED" ? "● Publié" : p.status === "ARCHIVED" ? "↩ Restaurer" : "○ Brouillon" }}
              </button>
              <div class="flex">
                <button @click="openEdit(p)" class="icon-btn" aria-label="Modifier"><Icon name="edit" class="w-[18px] h-[18px]" /></button>
                <button @click="remove(p)" class="icon-btn hover:!text-bad" aria-label="Supprimer"><Icon name="trash" class="w-[18px] h-[18px]" /></button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Ordinateur / tablette : tableau -->
      <div class="card overflow-hidden hidden md:block">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line text-left text-xs text-muted font-medium">
              <th class="py-3 px-5">Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Statut</th><th class="pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id" class="border-b border-line last:border-0 hover:bg-page/60 transition-colors">
              <td class="py-3 px-5 font-medium">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-page overflow-hidden shrink-0 grid place-items-center text-muted">
                    <img v-if="p.coverImage" :src="p.coverImage" :alt="p.name" class="w-full h-full object-cover" loading="lazy" />
                    <Icon v-else name="image" class="w-5 h-5" />
                  </div>
                  {{ p.name }}
                </div>
              </td>
              <td :class="p.category ? 'text-muted' : 'text-warn font-medium'">{{ p.category || "⚠ Aucune" }}</td>
              <td>{{ fmt(p.basePrice) }} F</td>
              <td><span class="badge" :class="stockClass(p.totalStock)">{{ p.totalStock }}</span></td>
              <td>
                <button @click="togglePublish(p)" class="badge hover:opacity-80" :class="p.status === 'PUBLISHED' ? 'bg-green-50 text-good' : 'bg-page text-muted'" title="Cliquer pour changer le statut">
                  {{ p.status === "PUBLISHED" ? "Publié" : p.status === "ARCHIVED" ? "Archivé · restaurer" : "Brouillon" }}
                </button>
              </td>
              <td class="pr-5 text-right whitespace-nowrap">
                <button @click="openEdit(p)" class="icon-btn" aria-label="Modifier"><Icon name="edit" class="w-4 h-4" /></button>
                <button @click="remove(p)" class="icon-btn hover:!text-bad" aria-label="Supprimer"><Icon name="trash" class="w-4 h-4" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Feuille d'édition -->
    <Transition name="modal">
      <div v-if="modalOpen" class="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4" @click.self="closeModal">
        <Transition name="modal-content" appear>
          <div class="modal-panel bg-paper rounded-t-3xl sm:rounded-3xl shadow-pop w-full max-w-lg px-5 pt-5 overflow-y-auto overscroll-contain" role="dialog" aria-modal="true">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold tracking-tight">{{ editing ? "Modifier le produit" : "Nouveau produit" }}</h2>
              <button @click="closeModal" class="icon-btn -mr-2" aria-label="Fermer"><Icon name="close" class="w-5 h-5" /></button>
            </div>
            <form @submit.prevent="save" class="space-y-4">
              <div>
                <div class="text-sm font-semibold mb-2">Photos du produit</div>
                <ImageUpload v-model="form.images" multiple :max="6" />
                <p class="text-xs text-muted mt-1.5">La première photo est la photo principale.</p>
              </div>
              <label class="block">
                <span class="text-sm font-semibold">Nom du produit</span>
                <input v-model.trim="form.name" required placeholder="Ex. Chemise lin blanc" class="input mt-1.5" autocomplete="off" />
              </label>
              <label class="block">
                <span class="text-sm font-semibold">Catégorie</span>
                <select v-model="form.categoryId" class="input mt-1.5">
                  <option value="">— Aucune (non classé) —</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <span class="text-xs text-muted mt-1 block">Détermine la rubrique du site où le produit apparaît.</span>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <label class="block">
                  <span class="text-sm font-semibold">Prix (F CFA)</span>
                  <input v-model.number="form.basePrice" required type="number" min="0" inputmode="numeric" placeholder="25000" class="input mt-1.5" />
                </label>
                <label class="block">
                  <span class="text-sm font-semibold">Ancien prix <span class="font-normal text-muted">(option)</span></span>
                  <input v-model.number="form.compareAtPrice" type="number" min="0" inputmode="numeric" placeholder="30000" class="input mt-1.5" />
                </label>
              </div>
              <label class="block">
                <span class="text-sm font-semibold">Matière</span>
                <input v-model.trim="form.material" placeholder="Ex. 100 % coton" class="input mt-1.5" />
              </label>
              <label class="block">
                <span class="text-sm font-semibold">Description</span>
                <textarea v-model="form.description" rows="3" placeholder="Coupe, détails, conseils d’entretien…" class="input mt-1.5"></textarea>
              </label>
              <label class="block">
                <span class="text-sm font-semibold">Visibilité</span>
                <select v-model="form.status" class="input mt-1.5">
                  <option value="DRAFT">Brouillon (invisible sur la boutique)</option>
                  <option value="PUBLISHED">Publié (visible par les clients)</option>
                  <option v-if="form.status === 'ARCHIVED'" value="ARCHIVED">Archivé (retiré du site)</option>
                </select>
              </label>
              <label class="flex items-center gap-3 text-sm min-h-[44px]">
                <input v-model="form.isFeatured" type="checkbox" class="w-5 h-5 rounded accent-[#0071E3]" /> Mettre en avant sur l'accueil
              </label>
              <p v-if="formError" class="text-sm rounded-xl px-4 py-3 bg-red-50 text-bad" role="alert">{{ formError }}</p>
              <div class="sheet-footer flex gap-3">
                <button type="button" @click="closeModal" class="btn-outline flex-1 !h-12">Annuler</button>
                <button type="submit" :disabled="saving" class="btn-primary flex-1 !h-12 disabled:opacity-60">{{ saving ? "Enregistrement…" : editing ? "Enregistrer" : "Créer le produit" }}</button>
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

const blank = () => ({ name: "", categoryId: "", basePrice: null, compareAtPrice: null, material: "", description: "", status: "DRAFT", isFeatured: false, images: [] });

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const loadError = ref("");
const search = ref("");
const filter = ref("ALL");
const modalOpen = ref(false);
const editing = ref(null);
const form = ref(blank());
const formError = ref("");
const saving = ref(false);

const filters = [
  { value: "ALL", label: "Tous" },
  { value: "PUBLISHED", label: "Publiés" },
  { value: "DRAFT", label: "Brouillons" },
  { value: "OUT", label: "En rupture" },
  { value: "ARCHIVED", label: "Archivés" },
];
// « Tous » n'affiche pas les produits archivés (retirés du catalogue mais conservés pour l'historique des commandes)
const matches = (p, f) => (f === "ALL" ? p.status !== "ARCHIVED" : f === "OUT" ? p.status !== "ARCHIVED" && p.totalStock === 0 : p.status === f);
const count = (f) => products.value.filter((p) => matches(p, f)).length;

const filtered = computed(() => {
  const s = search.value.toLowerCase();
  return products.value.filter((p) => matches(p, filter.value) && (!s || p.name.toLowerCase().includes(s)));
});

const fmt = (n) => Math.round(n || 0).toLocaleString("fr-FR");
const stockClass = (n) => (n === 0 ? "bg-red-50 text-bad" : n < 15 ? "bg-amber-50 text-warn" : "bg-green-50 text-good");

async function load() {
  loading.value = true; loadError.value = "";
  try {
    const [{ data }, cats] = await Promise.all([
      apiClient.get("/products?all=1"),
      apiClient.get("/products/categories").catch(() => ({ data: [] })),
    ]);
    products.value = data;
    categories.value = cats.data;
  } catch (e) {
    loadError.value = errMsg(e, "Impossible de charger les produits.");
  } finally { loading.value = false; }
}

function openCreate() {
  editing.value = null; formError.value = "";
  form.value = blank();
  modalOpen.value = true;
}

async function openEdit(p) {
  editing.value = p; formError.value = "";
  form.value = { ...blank(), ...p, categoryId: p.categoryId || "", images: p.coverImage ? [p.coverImage] : [] };
  modalOpen.value = true;
  try { // charge la galerie complète et les champs détaillés
    const { data } = await apiClient.get(`/products/${p.id}`);
    form.value = { ...form.value, images: data.gallery || [], description: data.description || "", material: data.material || "", status: data.status || p.status || "DRAFT", isFeatured: data.isFeatured ?? p.isFeatured, categoryId: data.categoryId || "" };
  } catch { /* on garde les infos de la liste */ }
}

function closeModal() { if (!saving.value) modalOpen.value = false; }

async function save() {
  formError.value = "";
  if (!form.value.name) { formError.value = "Donnez un nom au produit."; return; }
  if (!(form.value.basePrice > 0)) { formError.value = "Indiquez un prix supérieur à 0."; return; }
  const payload = { ...form.value };
  if (!payload.compareAtPrice) payload.compareAtPrice = null;
  payload.categoryId = payload.categoryId || null;
  delete payload.categorySlug; delete payload.category; delete payload.variants;
  saving.value = true;
  try {
    if (editing.value) await apiClient.patch(`/products/${editing.value.id}`, payload);
    else await apiClient.post("/products", payload);
    modalOpen.value = false;
    say(editing.value ? "Produit mis à jour" : "Produit créé");
    load();
  } catch (e) {
    formError.value = errMsg(e, "L'enregistrement a échoué. Vérifiez les champs et réessayez.");
  } finally { saving.value = false; }
}

async function togglePublish(p) {
  const next = p.status === "PUBLISHED" ? "DRAFT" : p.status === "ARCHIVED" ? "DRAFT" : "PUBLISHED";
  const prev = p.status; p.status = next;
  try {
    await apiClient.patch(`/products/${p.id}`, { status: next });
    say(prev === "ARCHIVED" ? "Produit restauré en brouillon" : next === "PUBLISHED" ? "Produit publié" : "Produit repassé en brouillon");
  } catch (e) { p.status = prev; say(errMsg(e, "Changement impossible"), "error"); }
}

async function remove(p) {
  if (!confirm(`Supprimer « ${p.name} » ?\nS'il figure déjà dans des commandes, il sera archivé (retiré du site, historique conservé).`)) return;
  try {
    const { data } = await apiClient.delete(`/products/${p.id}`);
    if (data?.archived) { p.status = "ARCHIVED"; say("Produit archivé (il figure dans des commandes)"); }
    else { products.value = products.value.filter((x) => x.id !== p.id); say("Produit supprimé"); }
  } catch (e) { say(errMsg(e, "Suppression impossible"), "error"); }
}

onMounted(load);
</script>
