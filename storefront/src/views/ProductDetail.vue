<template>
  <main v-if="p">
    <div class="breadcrumb"><div class="container"><div class="bc-inner">
      <router-link to="/">Accueil</router-link><span class="bc-sep"><i class="fa-solid fa-chevron-right"></i></span>
      <router-link :to="`/categorie/${p.cat}`">{{ capitalize(p.cat) }}</router-link><span class="bc-sep"><i class="fa-solid fa-chevron-right"></i></span>
      <span class="bc-current">{{ p.name }}</span>
    </div></div></div>

    <div class="container">
      <div class="pd-wrap">
        <div class="pd-thumbs">
          <img v-for="(g, i) in gallery" :key="i" :src="g" :class="{ active: i === curIdx }" @click="curIdx = i"/>
        </div>
        <div class="pd-main-img">
          <span v-if="p.badge === 'new'" class="prod-badge new">Nouveau</span>
          <span v-else-if="p.pct >= 25" class="prod-badge sale">−{{ p.pct }}%</span>
          <img :src="gallery[curIdx]" :alt="p.name"/>
          <div class="pd-arrows">
            <button @click="curIdx = (curIdx - 1 + gallery.length) % gallery.length"><i class="fa-solid fa-chevron-left"></i></button>
            <button @click="curIdx = (curIdx + 1) % gallery.length"><i class="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
        <div class="pd-info">
          <h1 class="pd-name">{{ p.name }}</h1>
          <div class="pd-rating">
            <div class="stars"><i v-for="s in stars" :key="s.i" class="fa-star" :class="s.cls"></i></div>
            <span>{{ p.rating }} · {{ p.reviews.toLocaleString("fr-FR") }} avis</span>
          </div>
          <div class="pd-price">
            <span class="price-main">{{ fmt(p.price) }}</span>
            <span v-if="p.oldPrice" class="price-was">{{ fmt(p.oldPrice) }}</span>
            <span v-if="p.pct" class="price-off">−{{ p.pct }}%</span>
          </div>
          <p class="pd-desc">{{ p.desc }}</p>

          <div class="pd-block">
            <div class="pd-label">Taille</div>
            <div class="pd-sizes">
              <button v-for="s in sizes" :key="s" class="pd-size-btn" :class="{ on: selectedSize === s }" @click="selectedSize = s">{{ s }}</button>
            </div>
          </div>

          <div class="pd-block">
            <div class="pd-label">Quantité</div>
            <div class="pd-qty">
              <button @click="qty > 1 && qty--">−</button><span>{{ qty }}</span><button @click="qty++">+</button>
            </div>
          </div>

          <div class="pd-actions">
            <button class="btn btn-primary btn-lg" @click="doAdd"><i class="fa-solid fa-bag-shopping"></i> Ajouter au panier</button>
            <button class="pd-wl-btn" :class="{ on: cart.isWished(p.id) }" @click="cart.toggleWishlist(p.id)">
              <i class="fa-heart" :class="cart.isWished(p.id) ? 'fa-solid' : 'fa-regular'"></i>
            </button>
          </div>

          <div class="pd-trust">
            <div><i class="fa-solid fa-truck-fast"></i> Livraison Abidjan sous 48h</div>
            <div><i class="fa-solid fa-mobile-screen"></i> Paiement Mobile Money ou carte</div>
            <div><i class="fa-solid fa-rotate-left"></i> Échange gratuit sous 7 jours</div>
          </div>
        </div>
      </div>

      <div class="pd-tabs">
        <div v-for="t in tabs" :key="t.key" class="pd-tab" :class="{ on: activeTab === t.key }" @click="activeTab = t.key">{{ t.label }}</div>
      </div>
      <div class="pd-tab-panel on" v-show="activeTab === 'desc'"><p>{{ p.desc }}</p></div>
      <div class="pd-tab-panel on" v-show="activeTab === 'carac'">
        <p><strong>Composition :</strong> {{ p.composition || "—" }}</p>
        <p style="margin-top:8px;"><strong>Entretien :</strong> {{ p.care || "—" }}</p>
      </div>
      <div class="pd-tab-panel on" v-show="activeTab === 'avis'">
        <div v-for="r in fakeReviews" :key="r.name" class="pd-review">
          <strong>{{ r.name }}</strong> — <div class="stars" style="display:inline-flex;"><i v-for="s in stars" :key="s.i" class="fa-star" :class="s.cls"></i></div>
          <p style="margin-top:6px;">{{ r.text }}</p>
        </div>
      </div>
      <div class="pd-tab-panel on" v-show="activeTab === 'livraison'">
        <p>Livraison à Abidjan sous 48h ouvrées, et sous 3 à 5 jours dans le reste de la Côte d'Ivoire. Paiement à la commande via Mobile Money (Wave, Orange, MTN, Moov) ou carte bancaire.</p>
        <p style="margin-top:10px;">Échange gratuit sous 7 jours si la taille ne convient pas — l'article doit être non porté, avec son étiquette.</p>
      </div>

      <div style="margin:64px 0 80px;">
        <div class="sec-header"><div class="sec-header-left"><div class="sec-kicker">Vous aimerez aussi</div><h2 class="sec-title">Dans la même collection</h2></div></div>
        <div class="prod-scroll-wrap"><div class="prod-scroll">
          <ProductCard v-for="r in related" :key="r.id" :p="r" />
        </div></div>
      </div>
    </div>
  </main>

  <div v-if="p" class="pd-sticky-bar">
    <span class="price-main">{{ fmt(p.price) }}</span>
    <button class="btn btn-primary btn-lg" style="flex:1;justify-content:center;" @click="doAdd">Ajouter au panier</button>
  </div>

  <main v-else-if="notFound">
    <div style="padding:80px 0;text-align:center;">
      <p style="margin-bottom:16px;">Produit introuvable.</p>
      <router-link to="/" class="btn btn-primary">Retour à l'accueil</router-link>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import ProductCard from "../components/ProductCard.vue";
import { useProductsStore } from "../stores/products";
import { useCartStore } from "../stores/cart";
import { useToastStore } from "../stores/toast";

const route = useRoute();
const products = useProductsStore();
const cart = useCartStore();
const toast = useToastStore();

const p = ref(null);
const notFound = ref(false);
const curIdx = ref(0);
const selectedSize = ref(null);
const qty = ref(1);
const activeTab = ref("desc");

const tabs = [
  { key: "desc", label: "Description" }, { key: "carac", label: "Caractéristiques" },
  { key: "avis", label: "Avis clients" }, { key: "livraison", label: "Livraison & retours" },
];
const fakeReviews = [
  { name: "Yao K.", text: "Très belle matière, la coupe tombe parfaitement. Livré en 2 jours à Cocody." },
  { name: "Franck A.", text: "Qualité au-dessus de ce que je payais avant pour le même prix. Je recommande." },
  { name: "Aïcha T.", text: "Achat pour mon mari, il adore. Le paiement Mobile Money était simple et rapide." },
];

function fmt(n) { return Number(n).toLocaleString("fr-FR") + " FCFA"; }
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }

const gallery = computed(() => (p.value?.gallery?.length ? p.value.gallery : [p.value?.img]).filter(Boolean));
const sizes = computed(() => (p.value?.sizes?.length ? p.value.sizes : ["Taille unique"]));
const stars = computed(() => {
  const r = p.value?.rating || 0;
  return Array.from({ length: 5 }, (_, idx) => {
    const i = idx + 1;
    let cls = "fa-regular";
    if (i <= Math.floor(r)) cls = "fa-solid";
    else if (i - r < 1) cls = "fa-solid fa-star-half-stroke";
    return { i, cls };
  });
});
const related = computed(() =>
  p.value ? products.items.filter(x => x.cat === p.value.cat && x.id !== p.value.id).slice(0, 8) : []
);

function doAdd() {
  if (!p.value) return;
  for (let i = 0; i < qty.value; i++) cart.add(p.value, null);
  toast.show(`${p.value.name.substring(0, 28)}… (${selectedSize.value}) ajouté ×${qty.value}`);
}

async function load() {
  p.value = null; notFound.value = false; curIdx.value = 0; qty.value = 1; activeTab.value = "desc";
  try {
    p.value = await products.fetchOne(route.params.id);
    selectedSize.value = sizes.value[0];
    document.title = `${p.value.name} — PB Boutique Hommes`;
  } catch {
    notFound.value = true;
  }
}

onMounted(load);
watch(() => route.params.id, load);
</script>
