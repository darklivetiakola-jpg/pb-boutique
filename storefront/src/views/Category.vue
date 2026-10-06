<template>
  <main>
    <div class="breadcrumb"><div class="container"><div class="bc-inner">
      <router-link to="/">Accueil</router-link><span class="bc-sep"><i class="fa-solid fa-chevron-right"></i></span>
      <span class="bc-current">{{ meta.eyebrow }}</span>
    </div></div></div>

    <div class="cat-hero">
      <div class="cat-hero-bg" :style="{ backgroundImage: `url('${meta.heroImg}')` }"></div>
      <div class="cat-hero-ov"></div>
      <div class="container"><div class="cat-hero-content"><div class="cat-hero-text">
        <div class="cat-hero-eyebrow">{{ meta.eyebrow }}</div>
        <h1 class="cat-hero-title" v-html="meta.title"></h1>
        <p class="cat-hero-sub">{{ meta.sub }}</p>
        <div class="cat-hero-meta">
          <span><i class="fa-solid fa-box"></i> {{ filtered.length }} article{{ filtered.length > 1 ? 's' : '' }}</span>
          <span><i class="fa-solid fa-truck-fast"></i> Livraison 48h</span>
          <span><i class="fa-solid fa-rotate-left"></i> Échange gratuit</span>
        </div>
      </div></div></div>
    </div>

    <div class="filter-bar"><div class="container"><div class="filter-bar-inner">
      <button v-for="s in sorts" :key="s.value" class="filter-chip" :class="{ on: sort === s.value }" @click="sort = s.value">{{ s.label }}</button>
      <div class="filter-sep"></div>
      <button v-for="p in priceRanges" :key="p.label" class="filter-chip" :class="{ on: priceRange === p.label }" @click="togglePrice(p)">{{ p.label }}</button>
    </div></div></div>

    <div class="cat-section"><div class="container">
      <div class="cat-top-bar">
        <div class="result-count"><strong>{{ filtered.length.toLocaleString("fr-FR") }}</strong> produit{{ filtered.length > 1 ? "s" : "" }}</div>
        <div class="view-btns">
          <button class="vbtn" :class="{ on: view === 'grid' }" @click="view = 'grid'"><i class="fa-solid fa-grid-2"></i></button>
          <button class="vbtn" :class="{ on: view === 'list' }" @click="view = 'list'"><i class="fa-solid fa-list"></i></button>
        </div>
      </div>

      <div v-if="!filtered.length" style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--ink3);">
        <i class="fa-regular fa-face-meh" style="font-size:2.5rem;display:block;margin-bottom:12px;opacity:0.3"></i>
        <p style="font-size:0.9rem;">Aucun produit correspond à votre sélection</p>
      </div>
      <div v-else class="cat-prod-grid" :class="{ list: view === 'list' }">
        <ProductCard v-for="p in filtered" :key="p.id" :p="p" />
      </div>
    </div></div>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { img } from "../config/images";
import ProductCard from "../components/ProductCard.vue";
import { useProductsStore } from "../stores/products";

const route = useRoute();
const products = useProductsStore();

const sort = ref("popular");
const view = ref("grid");
const priceRange = ref(null);
const priceMin = ref(0);
const priceMax = ref(9999999);

const sorts = [
  { value: "popular", label: "Populaires" }, { value: "price-asc", label: "Prix ↑" },
  { value: "price-desc", label: "Prix ↓" }, { value: "newest", label: "Nouveautés" },
  { value: "discount", label: "Meilleures remises" },
];
const priceRanges = [
  { label: "Moins de 30k", min: 0, max: 30000 },
  { label: "30k – 100k", min: 30000, max: 100000 },
  { label: "Plus de 100k", min: 100000, max: 9999999 },
];

const META = {
  chemises: { eyebrow: "Chemises PB", title: "Chemises &amp;<br/><span>Coupe Impeccable</span>", sub: "Popeline, lin et coton peigné — la base d'un vestiaire homme irréprochable.", heroImg: img("cat-chemises") },
  polos: { eyebrow: "Polos PB", title: "Polos,<br/><span>Décontracté Chic</span>", sub: "Piqué de coton et maille côtelée, pour un style relâché sans jamais perdre en élégance.", heroImg: img("cat-polos") },
  costumes: { eyebrow: "Costumes & Blazers", title: "Costumes &amp;<br/><span>Blazers Sur Mesure</span>", sub: "Laine mélangée, coupe ajustée — pour les occasions qui comptent.", heroImg: img("cat-costumes") },
  pantalons: { eyebrow: "Pantalons PB", title: "Pantalons,<br/><span>Chino &amp; Costume</span>", sub: "Coupe droite ou ajustée, en coton stretch ou en laine, pour toutes les journées.", heroImg: img("cat-pantalons") },
  accessoires: { eyebrow: "Accessoires PB", title: "Accessoires,<br/><span>Le Détail Qui Compte</span>", sub: "Ceintures, montres et cravates en cuir et matières nobles — la touche finale d'une tenue réussie.", heroImg: img("cat-accessoires") },
  nouveautes: { eyebrow: "Dernières Arrivées", title: "Les Toutes<br/><span>Dernières Pièces</span>", sub: "Fraîchement arrivées en boutique — soyez parmi les premiers à les porter.", heroImg: img("cat-nouveautes") },
};

const meta = computed(() => META[route.params.slug] || { eyebrow: "", title: "", sub: "", heroImg: "" });

function togglePrice(p) {
  if (priceRange.value === p.label) { priceRange.value = null; priceMin.value = 0; priceMax.value = 9999999; }
  else { priceRange.value = p.label; priceMin.value = p.min; priceMax.value = p.max; }
}

const filtered = computed(() => {
  const slug = route.params.slug;
  let list = slug === "nouveautes"
    ? products.items.filter(p => p.badge === "new")
    : products.items.filter(p => p.cat === slug);

  list = list.filter(p => p.price >= priceMin.value && p.price <= priceMax.value);

  const sorted = [...list];
  switch (sort.value) {
    case "price-asc": sorted.sort((a, b) => a.price - b.price); break;
    case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
    case "newest": sorted.sort((a, b) => (b.badge === "new" ? 1 : 0) - (a.badge === "new" ? 1 : 0)); break;
    case "discount": sorted.sort((a, b) => (b.pct || 0) - (a.pct || 0)); break;
    default: sorted.sort((a, b) => b.reviews - a.reviews);
  }
  return sorted;
});

onMounted(() => products.fetchAll());
watch(() => route.params.slug, () => { sort.value = "popular"; priceRange.value = null; priceMin.value = 0; priceMax.value = 9999999; });
</script>
