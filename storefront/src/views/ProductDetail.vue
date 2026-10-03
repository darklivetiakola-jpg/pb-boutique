<template>
  <main v-if="p" class="pdx">
    <!-- Galerie : on glisse les photos, un point indique laquelle on voit -->
    <section class="gal">
      <div class="track" ref="track" @scroll.passive="onScroll">
        <img v-for="(g, i) in gallery" :key="i" :src="g" :alt="`${p.name} — photo ${i + 1}`" class="slide" :loading="i ? 'lazy' : 'eager'" />
      </div>
      <button class="rb back" @click="goBack" aria-label="Retour"><i class="fa-solid fa-chevron-left"></i></button>
      <button class="rb wish" :class="{ on: cart.isWished(p.id) }" @click="cart.toggleWishlist(p.id)" :aria-label="cart.isWished(p.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'" :aria-pressed="cart.isWished(p.id)">
        <i class="fa-heart" :class="cart.isWished(p.id) ? 'fa-solid' : 'fa-regular'"></i>
      </button>
      <span v-if="p.badge === 'new'" class="tag">Nouveau</span>
      <span v-else-if="p.pct >= 25" class="tag">−{{ p.pct }}%</span>
      <div v-if="gallery.length > 1" class="dots"><i v-for="(g, i) in gallery" :key="i" :class="{ on: i === curIdx }"></i></div>
    </section>

    <!-- Informations : l'essentiel, rien de plus -->
    <section class="info">
      <router-link :to="`/categorie/${p.cat}`" class="kicker">{{ capitalize(p.cat) }}</router-link>
      <h1>{{ p.name }}</h1>
      <div class="price">
        <b>{{ fmt(p.price) }}</b>
        <s v-if="p.oldPrice">{{ fmt(p.oldPrice) }}</s>
        <em v-if="p.pct">−{{ p.pct }}%</em>
      </div>

      <div v-if="sizes.length > 1" class="sz" ref="sizesEl" :class="{ shake }">
        <div class="sz-h"><span>Taille</span><small v-if="needSize">Choisissez une taille</small></div>
        <div class="sz-row">
          <button v-for="s in sizes" :key="s" :class="{ on: selectedSize === s }" @click="selectedSize = s; needSize = false">{{ s }}</button>
        </div>
      </div>

      <div class="acc">
        <details v-if="p.desc"><summary>Description</summary><p>{{ p.desc }}</p></details>
        <details v-if="p.composition || p.care"><summary>Matière &amp; entretien</summary>
          <p v-if="p.composition"><b>Matière</b> · {{ p.composition }}</p>
          <p v-if="p.care"><b>Entretien</b> · {{ p.care }}</p>
        </details>
        <details><summary>Livraison &amp; retours</summary>
          <p>Abidjan sous 48h, 3 à 5 jours ailleurs en Côte d’Ivoire.</p>
          <p>Échange gratuit sous 7 jours si l’article est non porté, avec son étiquette.</p>
        </details>
      </div>

      <!-- Barre d'achat : prix + un seul bouton -->
      <div class="buy">
        <div class="buy-p"><small>Prix</small><b>{{ fmt(p.price) }}</b></div>
        <router-link v-if="added" to="/panier" class="cta ok"><i class="fa-solid fa-check"></i> Voir le panier</router-link>
        <button v-else class="cta" @click="doAdd">Ajouter au panier</button>
      </div>
    </section>
  </main>

  <!-- Suggestions -->
  <section v-if="p && related.length" class="more">
    <h2>Dans la même collection</h2>
    <div class="rel"><ProductCard v-for="r in related" :key="r.id" :p="r" /></div>
  </section>

  <main v-else-if="notFound" class="nf">
    <p>Cet article n’existe plus.</p>
    <router-link to="/decouvrir" class="cta">Retour à la boutique</router-link>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProductCard from "../components/ProductCard.vue";
import { useProductsStore } from "../stores/products";
import { useCartStore } from "../stores/cart";
import { useToastStore } from "../stores/toast";

const route = useRoute(), router = useRouter();
const products = useProductsStore(), cart = useCartStore(), toast = useToastStore();

const p = ref(null), notFound = ref(false), curIdx = ref(0);
const selectedSize = ref(null), needSize = ref(false), shake = ref(false), added = ref(false);
const track = ref(null), sizesEl = ref(null);

const fmt = (n) => Number(n).toLocaleString("fr-FR") + " FCFA";
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const gallery = computed(() => (p.value?.gallery?.length ? p.value.gallery : [p.value?.img]).filter(Boolean));
const sizes = computed(() => (p.value?.sizes?.length ? p.value.sizes : []));
const related = computed(() => (p.value ? products.items.filter((x) => x.cat === p.value.cat && x.id !== p.value.id).slice(0, 8) : []));

function onScroll() { const el = track.value; if (el) curIdx.value = Math.round(el.scrollLeft / (el.clientWidth || 1)); }
function goBack() { window.history.length > 1 ? router.back() : router.push("/decouvrir"); }

function doAdd() {
  if (!p.value) return;
  if (sizes.value.length > 1 && !selectedSize.value) {
    needSize.value = true; shake.value = true; setTimeout(() => (shake.value = false), 500);
    sizesEl.value?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  cart.add(p.value, null, selectedSize.value);
  added.value = true;
  toast.show(`Ajouté${selectedSize.value ? ` · taille ${selectedSize.value}` : ""}`);
}
// Si la taille change, le bouton redevient « Ajouter » (on peut ajouter une autre taille)
watch(selectedSize, () => { added.value = false; });

async function load() {
  p.value = null; notFound.value = false; curIdx.value = 0; added.value = false; needSize.value = false;
  try {
    p.value = await products.fetchOne(route.params.id);
    selectedSize.value = sizes.value.length === 1 ? sizes.value[0] : null;   // une seule taille : choisie d'office
    document.title = `${p.value.name} — PB Boutique Hommes`;
    window.scrollTo({ top: 0 });
  } catch { notFound.value = true; }
}

onMounted(() => { document.body.classList.add("on-pd"); load(); });
onBeforeUnmount(() => document.body.classList.remove("on-pd"));
watch(() => route.params.id, load);
</script>

<style scoped>
.pdx { max-width: 1240px; margin: 0 auto; padding-bottom: 130px; }
/* ---------- Galerie ---------- */
.gal { position: relative; }
.track { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -webkit-overflow-scrolling: touch; background: var(--bg2); border-radius: 0 0 28px 28px; }
.track::-webkit-scrollbar { display: none; }
.slide { flex: 0 0 100%; width: 100%; aspect-ratio: 4 / 5; object-fit: cover; scroll-snap-align: center; display: block; }
.rb { position: absolute; top: 14px; width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-size: 1rem; background: rgba(20, 20, 22, .55); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, .12); transition: transform .15s; }
.rb:active { transform: scale(.9); }
.back { left: 14px; } .wish { right: 14px; } .wish.on { color: #FF6B70; }
.tag { position: absolute; left: 14px; bottom: 18px; background: #D4A62A; color: #111; font-size: .74rem; font-weight: 800; padding: 6px 12px; border-radius: 99px; }
.dots { position: absolute; left: 0; right: 0; bottom: 16px; display: flex; justify-content: center; gap: 6px; pointer-events: none; }
.dots i { width: 6px; height: 6px; border-radius: 3px; background: rgba(255, 255, 255, .45); transition: width .25s, background .25s; }
.dots i.on { width: 20px; background: #fff; }
/* ---------- Infos ---------- */
.info { padding: 24px 20px 0; }
.kicker { color: #E6BB4E; font-size: .82rem; font-weight: 700; text-decoration: none; letter-spacing: .02em; }
h1 { font-size: clamp(1.7rem, 6.5vw, 2.3rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; margin: 6px 0 12px; color: var(--ink); }
.price { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.price b { font-size: 1.55rem; letter-spacing: -0.03em; color: var(--ink); }
.price s { color: var(--ink3); font-size: 1rem; } .price em { font-style: normal; background: rgba(212, 166, 42, .16); color: #E6BB4E; font-weight: 700; font-size: .8rem; padding: 3px 9px; border-radius: 99px; }
.sz { margin-top: 28px; }
.sz-h { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; font-weight: 700; color: var(--ink); }
.sz-h small { color: #FF6B70; font-weight: 600; font-size: .8rem; }
.sz-row { display: flex; flex-wrap: wrap; gap: 10px; }
.sz-row button { min-width: 56px; height: 52px; padding: 0 16px; border-radius: 16px; background: var(--surface); border: 1.5px solid var(--border); color: var(--ink); font-weight: 700; font-size: 1rem; transition: all .2s; }
.sz-row button.on { background: #D4A62A; border-color: #D4A62A; color: #111; }
.shake { animation: shake .45s; }
@keyframes shake { 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
/* Accordéons : fermés par défaut pour laisser respirer la page */
.acc { margin-top: 30px; border-top: 1px solid var(--border); }
details { border-bottom: 1px solid var(--border); }
summary { list-style: none; display: flex; justify-content: space-between; align-items: center; padding: 18px 2px; font-weight: 600; color: var(--ink); cursor: pointer; }
summary::-webkit-details-marker { display: none; }
summary::after { content: ""; width: 9px; height: 9px; border-right: 2px solid var(--ink3); border-bottom: 2px solid var(--ink3); transform: rotate(45deg); transition: transform .25s; margin-right: 4px; }
details[open] summary::after { transform: rotate(-135deg); }
details p { color: var(--ink2); line-height: 1.65; padding: 0 2px 14px; font-size: .95rem; }
details p b { color: var(--ink); }
/* ---------- Barre d'achat ---------- */
.buy { position: fixed; z-index: 990; left: 14px; right: 14px; max-width: 480px; margin: 0 auto; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); display: flex; align-items: center; gap: 14px; padding: 8px 8px 8px 22px; border-radius: 32px; background: rgba(24, 24, 27, .78); -webkit-backdrop-filter: saturate(190%) blur(26px); backdrop-filter: saturate(190%) blur(26px); border: 1px solid rgba(255, 255, 255, .09); box-shadow: 0 14px 40px rgba(0, 0, 0, .5); }
[data-theme="light"] .buy { background: rgba(255, 255, 255, .85); border-color: rgba(0, 0, 0, .07); }
.buy-p { display: grid; line-height: 1.15; } .buy-p small { color: var(--ink3); font-size: .7rem; } .buy-p b { color: var(--ink); font-size: 1.05rem; letter-spacing: -0.02em; white-space: nowrap; }
.cta { flex: 1; height: 52px; border-radius: 99px; background: #D4A62A; color: #111; font-weight: 800; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; transition: transform .15s, background .2s; }
.cta:active { transform: scale(.97); } .cta.ok { background: #30D158; color: #06260f; }
/* ---------- Suggestions ---------- */
.more { max-width: 1240px; margin: 8px auto 0; padding: 0 20px 20px; }
.more h2 { font-size: 1.4rem; letter-spacing: -0.03em; margin-bottom: 14px; }
.rel { display: flex; gap: 14px; overflow-x: auto; margin: 0 -20px; padding: 0 20px 8px; scrollbar-width: none; scroll-snap-type: x proximity; }
.rel::-webkit-scrollbar { display: none; }
.rel :deep(.prod-card) { flex: 0 0 158px; scroll-snap-align: start; }
.nf { text-align: center; padding: 90px 20px; color: var(--ink2); } .nf .cta { display: inline-flex; padding: 0 28px; margin-top: 16px; flex: none; }
/* ---------- Ordinateur : deux colonnes, bouton dans la colonne ---------- */
@media (min-width: 900px) {
  .pdx { display: grid; grid-template-columns: 1.05fr 1fr; gap: 56px; padding: 32px 24px 60px; align-items: start; }
  .gal { position: sticky; top: calc(var(--header-h) + 24px); }
  .track { border-radius: 28px; } .back { display: none; }
  .info { padding: 8px 0 0; }
  .buy { position: static; max-width: none; margin: 28px 0 0; padding: 0; background: none; border: 0; box-shadow: none; -webkit-backdrop-filter: none; backdrop-filter: none; }
  .buy-p { display: none; } .cta { height: 56px; }
  .more { padding: 0 24px 80px; } .rel { margin: 0; padding: 0 0 8px; } .rel :deep(.prod-card) { flex-basis: 220px; }
}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
</style>

<style>
/* Sur la fiche produit : WhatsApp et « haut de page » remontent pour ne pas masquer la barre d'achat */
@media (max-width: 899px) {
  .on-pd .whatsapp-float { bottom: calc(92px + env(safe-area-inset-bottom, 0px)); left: 14px; width: 46px; height: 46px; }
  .on-pd .btt { display: none; }
  .on-pd .footer { display: none; }
}
</style>
