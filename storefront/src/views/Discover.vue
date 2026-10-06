<template>
  <main class="dsc container">
    <h1 class="big">Découvrir</h1>

    <label class="srch">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input v-model.trim="q" type="search" placeholder="Chemise, polo, costume…" enterkeyhint="search" aria-label="Rechercher un article" />
      <button v-if="q" type="button" class="clr" @click="q = ''" aria-label="Effacer"><i class="fa-solid fa-circle-xmark"></i></button>
    </label>

    <div class="rail" role="tablist">
      <button v-for="c in cats" :key="c.key" role="tab" :aria-selected="cat === c.key" :class="{ on: cat === c.key }" @click="cat = c.key">{{ c.label }}</button>
    </div>

    <p v-if="!products.ready" class="note">Chargement de la collection…</p>

    <template v-else>
      <!-- Vue d'ensemble -->
      <template v-if="!q && cat === 'all'">
        <section v-if="featured.length" class="blk">
          <div class="bh"><h2>Coups de cœur</h2></div>
          <div class="hs">
            <router-link v-for="p in featured" :key="p.id" :to="`/produit/${p.id}`" class="fc">
              <img :src="p.img" :alt="p.name" loading="lazy" />
              <span class="fc-g"></span>
              <span class="fc-t"><b>{{ p.name }}</b><em>{{ fmt(p.price) }}</em></span>
            </router-link>
          </div>
        </section>

        <section class="blk">
          <div class="bh"><h2>Toute la collection</h2><span>{{ products.items.length }} articles</span></div>
          <div class="prod-grid"><ProductCard v-for="p in products.items" :key="p.id" :p="p" /></div>
        </section>
      </template>

      <!-- Résultats -->
      <section v-else class="blk">
        <div class="bh"><h2>{{ q ? `Résultats pour « ${q} »` : currentLabel }}</h2><span>{{ results.length }}</span></div>
        <div v-if="!results.length" class="empty">
          <div class="empty-ic"><i class="fa-solid fa-magnifying-glass"></i></div>
          <h3>Aucun article trouvé</h3>
          <p>Essayez un autre mot, ou parcourez une catégorie.</p>
          <button class="reset" @click="q = ''; cat = 'all'">Tout afficher</button>
        </div>
        <div v-else class="prod-grid"><ProductCard v-for="p in results" :key="p.id" :p="p" /></div>
      </section>
    </template>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import ProductCard from "../components/ProductCard.vue";
import { useProductsStore } from "../stores/products";

const route = useRoute(), products = useProductsStore();
const q = ref(String(route.query.q || "")), cat = ref("all");

const cats = [
  { key: "all", label: "Tout" }, { key: "new", label: "Nouveautés" }, { key: "chemises", label: "Chemises" },
  { key: "polos", label: "Polos" }, { key: "tee-shirts", label: "Tee-shirts" }, { key: "costumes", label: "Costumes" }, { key: "pantalons", label: "Pantalons" }, { key: "accessoires", label: "Accessoires" },
];
const currentLabel = computed(() => cats.find((c) => c.key === cat.value)?.label || "");
const fmt = (n) => Number(n).toLocaleString("fr-FR") + " FCFA";
const norm = (s = "") => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const featured = computed(() => products.items.filter((p) => p.badge === "new").slice(0, 8));
const results = computed(() => {
  const s = norm(q.value);
  return products.items.filter((p) =>
    (cat.value === "all" || (cat.value === "new" ? p.badge === "new" : p.cat === cat.value)) &&
    (!s || [p.name, p.description, p.composition, p.cat].some((x) => norm(x).includes(s))));
});

watch(() => route.query.q, (v) => { q.value = String(v || ""); });
onMounted(() => products.fetchAll());
</script>

<style scoped>
.dsc { padding-top: 18px; padding-bottom: 40px; }
.big { font-size: clamp(2.2rem, 9vw, 3rem); font-weight: 800; letter-spacing: -0.045em; line-height: 1.05; margin-bottom: 14px; }
.srch { display: flex; align-items: center; gap: 10px; height: 46px; padding: 0 14px; border-radius: 14px; background: var(--bg2); color: var(--ink3); border: 1px solid transparent; transition: border-color .2s, background .2s; }
.srch:focus-within { border-color: #D4A62A; background: var(--surface); }
.srch svg { width: 19px; height: 19px; flex: none; }
.srch input { flex: 1; min-width: 0; height: 100%; background: transparent; border: 0; outline: none; color: var(--ink); font-size: 16px; -webkit-appearance: none; appearance: none; }
.srch input::placeholder { color: var(--ink3); }
.srch input::-webkit-search-cancel-button { display: none; }
.clr { color: var(--ink3); font-size: 1.05rem; padding: 6px; }
.rail { display: flex; gap: 8px; overflow-x: auto; margin: 14px -16px 4px; padding: 2px 16px 8px; scrollbar-width: none; scroll-snap-type: x proximity; }
.rail::-webkit-scrollbar { display: none; }
.rail button { flex: none; scroll-snap-align: start; height: 36px; padding: 0 16px; border-radius: 99px; background: var(--surface); border: 1px solid var(--border); color: var(--ink2); font-size: .88rem; font-weight: 600; transition: all .2s; }
.rail button.on { background: #D4A62A; border-color: #D4A62A; color: #111; }
.blk { margin-top: 22px; }
.bh { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.bh h2 { font-size: 1.35rem; letter-spacing: -0.03em; } .bh span { color: var(--ink3); font-size: .82rem; }
.hs { display: flex; gap: 12px; overflow-x: auto; margin: 0 -16px; padding: 0 16px 6px; scrollbar-width: none; scroll-snap-type: x mandatory; }
.hs::-webkit-scrollbar { display: none; }
.fc { position: relative; flex: none; width: 168px; aspect-ratio: 4 / 5.2; border-radius: 22px; overflow: hidden; background: var(--bg2); scroll-snap-align: start; box-shadow: var(--shadow-1); }
.fc img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s; }
.fc:active img { transform: scale(1.04); }
.fc-g { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 45%, rgba(0, 0, 0, .78)); }
.fc-t { position: absolute; left: 12px; right: 12px; bottom: 12px; display: grid; gap: 2px; color: #fff; }
.fc-t b { font-size: .88rem; line-height: 1.25; letter-spacing: -0.01em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.fc-t em { font-style: normal; font-size: .8rem; color: #E6BB4E; font-weight: 700; }
.note { color: var(--ink2); margin-top: 24px; text-align: center; }
.empty { text-align: center; padding: 44px 10px; } .empty-ic { width: 76px; height: 76px; margin: 0 auto 14px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); display: grid; place-items: center; color: var(--ink3); font-size: 1.5rem; }
.empty h3 { font-size: 1.2rem; margin-bottom: 4px; } .empty p { color: var(--ink2); margin-bottom: 16px; }
.reset { height: 44px; padding: 0 24px; border-radius: 99px; background: #D4A62A; color: #111; font-weight: 700; }
@media (min-width: 721px) { .fc { width: 220px; } .hs, .rail { margin-left: 0; margin-right: 0; padding-left: 0; padding-right: 0; } }
</style>
