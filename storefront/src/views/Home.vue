<template>
  <main>
    <!-- HERO VIDÉO -->
    <section class="hv" ref="hv" @mousemove="spot">
      <video class="hv-video" autoplay muted loop playsinline webkit-playsinline="true" disablepictureinpicture preload="auto"
             :poster="img('hero-poster')" ref="vid">
        <source src="https://assets.mixkit.co/videos/4832/4832-720.mp4" type="video/mp4">
      </video>
      <div class="hv-shade"></div>
      <div class="hv-spot"></div>
      <div class="container hv-inner">
        <span class="hv-pill"><span class="hv-dot"></span> Nouvelle collection</span>
        <h1 class="hv-title" aria-label="L'élégance, sans effort.">
          <span v-for="(w, i) in words" :key="i" class="hv-word" :style="{ '--i': i }" aria-hidden="true">{{ w }}</span>
        </h1>
        <p class="hv-sub">Chemises, polos, costumes et accessoires choisis pour leur coupe et leur matière. Livrés chez vous en 48h.</p>
        <div class="hv-cta">
          <router-link to="/categorie/nouveautes" class="btn btn-lg hv-btn-main">Découvrir la collection <i class="fa-solid fa-arrow-right"></i></router-link>
          <a href="#categories" class="btn btn-lg hv-btn-glass">Explorer</a>
        </div>
        <div class="hv-chips">
          <span><i class="fa-solid fa-truck-fast"></i> Livraison 48h</span>
          <span><i class="fa-solid fa-lock"></i> Paiement sécurisé</span>
          <span><i class="fa-solid fa-rotate-left"></i> Échange 7 jours</span>
        </div>
      </div>
      <button class="hv-toggle" @click="toggleVideo" :aria-label="playing ? 'Mettre la vidéo en pause' : 'Lire la vidéo'">
        <i class="fa-solid" :class="playing ? 'fa-pause' : 'fa-play'"></i>
      </button>
    </section>

    <!-- CATEGORIES -->
    <section class="section" id="categories">
      <div class="container">
        <div class="sec-header"><div class="sec-header-left">
          <h2 class="sec-title">Explorez la collection.</h2>
          <p class="sec-sub">Chaque pièce pensée pour la coupe, la matière et la tenue</p>
        </div></div>
        <div class="vs-wrap" aria-label="Nos catégories">
          <div class="vs" ref="vsEl" @scroll.passive="onVs" @pointerdown="pauseVs" @wheel.passive="pauseVs" @touchstart.passive="pauseVs">
            <router-link v-for="(c, i) in cats" :key="c.slug" :to="`/categorie/${c.slug}`" class="vs-tile">
              <span class="vs-bg" :style="{ backgroundImage: `url('${c.img}')` }"></span>
              <span class="vs-shade"></span>
              <span class="vs-info">
                <em>{{ String(i + 1).padStart(2, "0") }} / {{ String(cats.length).padStart(2, "0") }}</em>
                <b>{{ c.name }}</b>
                <small>{{ c.tags }}</small>
                <span class="vs-cta">Découvrir <i class="fa-solid fa-arrow-right"></i></span>
              </span>
            </router-link>
          </div>
          <div class="vs-dots" aria-hidden="true"><i v-for="(c, i) in cats" :key="c.slug" :class="{ on: i === vsIdx }"></i></div>
        </div>
      </div>
    </section>

    <!-- HERITAGE -->
    <section style="padding:0 0 72px;">
      <div class="container">
        <div class="origin-wrap">
          <div class="origin-text">
            <div class="origin-kicker"><div class="flag-ci"><span class="f1"></span><span class="f2"></span><span class="f3"></span></div>Fait à Abidjan</div>
            <h2 class="origin-title">La rigueur du<br/><span>tailleur ivoirien</span></h2>
            <p class="origin-body">Chaque pièce PB Boutique Hommes est sélectionnée et contrôlée à Abidjan pour son tombé, sa matière et sa tenue dans le temps — pas de compromis sur la qualité.</p>
            <div class="origin-stats">
              <div><div class="ostat-num">100%</div><div class="ostat-lbl">Contrôle qualité<br/>avant expédition</div></div>
              <div><div class="ostat-num">48h</div><div class="ostat-lbl">Livraison<br/>Abidjan</div></div>
              <div><div class="ostat-num">7j</div><div class="ostat-lbl">Échange<br/>gratuit</div></div>
            </div>
            <router-link to="/categorie/nouveautes" class="btn btn-orange">Découvrir <i class="fa-solid fa-arrow-right"></i></router-link>
          </div>
          <div class="origin-img"><img :src="img('origin')" alt="PB Boutique Hommes — savoir-faire"/></div>
        </div>
      </div>
    </section>

    <!-- MAIN GRID -->
    <section style="padding:0 0 72px;background:var(--bg2);">
      <div style="padding:72px 0 0;"><div class="container">
        <div class="sec-header">
          <div class="sec-header-left"><h2 class="sec-title">Produits du moment.</h2><p class="sec-sub">Les plus portés en ce moment</p></div>
          <router-link to="/categorie/nouveautes" class="btn-text">Voir tout <i class="fa-solid fa-arrow-right"></i></router-link>
        </div>
        <div class="prod-grid">
          <ProductCard v-for="p in products.items.slice(0, 12)" :key="p.id" :p="p" />
        </div>
      </div></div>
    </section>

    <!-- PAYMENT -->
    <section class="section" style="background:var(--surface);padding:48px 0;">
      <div class="container"><div class="payment-section">
        <div class="pay-text"><h3>Payez comme vous voulez</h3><p>Tous les moyens de paiement locaux et internationaux acceptés</p></div>
        <div class="pay-methods">
          <div class="pay-chip"><div class="pay-dot" style="background:#FF6B00;"></div>Orange Money</div>
          <div class="pay-chip"><div class="pay-dot" style="background:#FFB800;"></div>MTN Money</div>
          <div class="pay-chip"><div class="pay-dot" style="background:#00B4D8;"></div>Wave</div>
          <div class="pay-chip"><div class="pay-dot" style="background:#003087;"></div>Moov Money</div>
          <div class="pay-chip"><i class="fa-brands fa-cc-visa" style="font-size:1rem;"></i>Visa</div>
          <div class="pay-chip"><i class="fa-brands fa-cc-mastercard" style="font-size:1rem;"></i>Mastercard</div>
        </div>
      </div></div>
    </section>

    <!-- NEWSLETTER -->
    <section class="section" style="background:var(--bg);padding:72px 0;">
      <div class="container"><div class="newsletter-clean">
        <h2>Les belles pièces, en avant-première.</h2>
        <p>Inscrivez-vous et soyez le premier à connaître nos nouvelles arrivées et offres exclusives.</p>
        <form class="nl-row" @submit.prevent="subscribe">
          <input class="nl-input" v-model="email" type="email" placeholder="Votre adresse email…" required/>
          <button class="btn btn-primary" type="submit">{{ subscribed ? "✓ Inscrit !" : "S'abonner" }}</button>
        </form>
        <div class="nl-note"><i class="fa-solid fa-shield-halved"></i> Vos données restent privées. Désabonnement en 1 clic.</div>
      </div></div>
    </section>
  </main>
</template>

<script setup>
import { img } from "../config/images";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import ProductCard from "../components/ProductCard.vue";
import { useProductsStore } from "../stores/products";
import { useToastStore } from "../stores/toast";

const products = useProductsStore();
const toast = useToastStore();
const email = ref("");
const words = ["L'élégance,", "sans", "effort."];
const vid = ref(null), hv = ref(null), playing = ref(true);
function toggleVideo() {
  const v = vid.value; if (!v) return;
  if (v.paused) { v.play(); playing.value = true; } else { v.pause(); playing.value = false; }
}
// Halo lumineux qui suit la souris sur la vidéo
function spot(e) {
  const r = hv.value.getBoundingClientRect();
  hv.value.style.setProperty("--mx", (e.clientX - r.left) + "px");
  hv.value.style.setProperty("--my", (e.clientY - r.top) + "px");
}
const subscribed = ref(false);

const cats = [
  { slug: "chemises", name: "Chemises", tags: "Popeline · Lin · Coton peigné", img: img("cat-chemises") },
  { slug: "tee-shirts", name: "Tee-shirts", tags: "Coton · Oversize · Basiques", img: img("cat-tee-shirts") },
  { slug: "polos", name: "Polos", tags: "Piqué · Maille côtelée", img: img("cat-polos") },
  { slug: "costumes", name: "Costumes & Blazers", tags: "Laine · Coupe ajustée", img: img("cat-costumes") },
  { slug: "pantalons", name: "Pantalons", tags: "Chino · Costume · Stretch", img: img("cat-pantalons") },
  { slug: "accessoires", name: "Accessoires", tags: "Ceintures · Montres · Cravates", img: img("cat-accessoires") },
  { slug: "nouveautes", name: "Nouveautés", tags: "Les dernières arrivées", img: img("cat-nouveautes") },
];

function subscribe() {
  subscribed.value = true;
  toast.show("Bienvenue ! Vous êtes inscrit.");
  setTimeout(() => { subscribed.value = false; email.value = ""; }, 3000);
}

onMounted(() => products.fetchAll());
const vsEl = ref(null), vsIdx = ref(0);
let vsTimer = null, vsPausedUntil = 0;
const isMobile = () => window.innerWidth < 900;
const tileH = () => { const el = vsEl.value; return el && el.firstElementChild ? el.firstElementChild.offsetHeight + 12 : 1; };
const onVs = () => { const el = vsEl.value; if (el) vsIdx.value = Math.round(el.scrollTop / tileH()); };
const pauseVs = () => { vsPausedUntil = Date.now() + 9000; };   // le client reprend la main : l'auto-défilement attend 9 s
function nextVs() {
  const el = vsEl.value;
  if (!el || !isMobile() || document.hidden || Date.now() < vsPausedUntil) return;
  const next = (vsIdx.value + 1) % cats.length;
  el.scrollTo({ top: next * tileH(), behavior: "smooth" });
}
onMounted(() => { if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) vsTimer = setInterval(nextVs, 3800); });
onBeforeUnmount(() => clearInterval(vsTimer));
</script>

<style>
/* Catégories : une grande image à la fois (défilement vertical automatique sur téléphone), le client peut faire défiler librement */
.vs-wrap { position: relative; }
.vs { display: flex; flex-direction: column; gap: 12px; height: min(74svh, 560px); overflow-y: auto; scroll-snap-type: y mandatory; scrollbar-width: none; -webkit-overflow-scrolling: touch; border-radius: 16px; }
.vs::-webkit-scrollbar { display: none; }
.vs-tile { position: relative; display: block; flex: 0 0 min(66svh, 470px); scroll-snap-align: start; border-radius: 16px; overflow: hidden; background: #151517; }
.vs-bg { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform .7s; }
.vs-tile:hover .vs-bg { transform: scale(1.04); }
.vs-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.05) 35%, rgba(0,0,0,.78)); }
.vs-info { position: absolute; left: 20px; right: 20px; bottom: 22px; display: grid; gap: 4px; color: #fff; }
.vs-info em { font-style: normal; font-size: .76rem; letter-spacing: .08em; color: #E6BB4E; font-weight: 700; }
.vs-info b { font-size: clamp(1.9rem, 8vw, 2.4rem); font-weight: 800; letter-spacing: -0.045em; line-height: 1.02; }
.vs-info small { color: rgba(255,255,255,.75); font-size: .86rem; }
.vs-cta { margin-top: 12px; justify-self: start; display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 18px; border-radius: 99px; background: #fff; color: #111; font-weight: 700; font-size: .88rem; }
.vs-dots { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 6px; z-index: 2; pointer-events: none; }
.vs-dots i { width: 5px; height: 5px; border-radius: 3px; background: rgba(255,255,255,.55); transition: height .25s, background .25s; }
.vs-dots i.on { height: 20px; background: #fff; }
@media (min-width: 900px) {
  .vs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; height: auto; overflow: visible; scroll-snap-type: none; }
  .vs-tile { flex: none; aspect-ratio: 4 / 5; } .vs-dots { display: none; }
}
</style>
