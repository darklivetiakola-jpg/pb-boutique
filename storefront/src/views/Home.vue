<template>
  <main>
    <!-- HERO VIDÉO -->
    <section class="hv" ref="hv" @mousemove="spot">
      <video class="hv-video" autoplay muted loop playsinline webkit-playsinline="true" disablepictureinpicture preload="auto"
             poster="https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=1920&q=85" ref="vid">
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
        <div class="vm" aria-label="Nos catégories">
          <div v-for="(col, ci) in vmCols" :key="ci" class="vm-col" :class="[ci % 2 ? 'down' : 'up', `c${ci}`]">
            <div class="vm-track">
              <div v-for="copy in 2" :key="copy" class="vm-set" :class="{ dup: copy === 2 }">
                <router-link v-for="c in col" :key="c.slug" :to="`/categorie/${c.slug}`" class="vm-tile" :tabindex="copy === 2 ? -1 : undefined">
                  <span class="vm-bg" :style="{ backgroundImage: `url('${c.img}')` }"></span>
                  <span class="vm-shade"></span>
                  <span class="vm-info"><b>{{ c.name }}</b><em>{{ c.tags }}</em></span>
                  <i class="fa-solid fa-arrow-right vm-go"></i>
                </router-link>
              </div>
            </div>
          </div>
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
          <div class="origin-img"><img src="https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=700&q=85" alt="PB Boutique Hommes — savoir-faire"/></div>
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
  { slug: "chemises", name: "Chemises", tags: "Popeline · Lin · Coton peigné", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80" },
  { slug: "polos", name: "Polos", tags: "Piqué · Maille côtelée", img: "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=800&q=80" },
  { slug: "costumes", name: "Costumes & Blazers", tags: "Laine · Coupe ajustée", img: "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=800&q=80" },
  { slug: "pantalons", name: "Pantalons", tags: "Chino · Costume · Stretch", img: "https://images.unsplash.com/photo-1617113930975-f9c7243ae527?w=800&q=80" },
  { slug: "accessoires", name: "Accessoires", tags: "Ceintures · Montres · Cravates", img: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&q=80" },
  { slug: "nouveautes", name: "Nouveautés", tags: "Les dernières arrivées", img: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=800&q=80" },
];

function subscribe() {
  subscribed.value = true;
  toast.show("Bienvenue ! Vous êtes inscrit.");
  setTimeout(() => { subscribed.value = false; email.value = ""; }, 3000);
}

onMounted(() => products.fetchAll());
const nCols = ref(typeof window !== "undefined" && window.innerWidth >= 900 ? 3 : 2);
const vmCols = computed(() => Array.from({ length: nCols.value }, (_, k) => cats.filter((_, i) => i % nCols.value === k)));
const onResize = () => { nCols.value = window.innerWidth >= 900 ? 3 : 2; };
onMounted(() => window.addEventListener("resize", onResize));
onBeforeUnmount(() => window.removeEventListener("resize", onResize));
</script>

<style>
/* Catégories : colonnes qui défilent seules (vers le haut / vers le bas), pause au toucher ou au survol */
.vm { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; height: min(78vh, 620px); overflow: hidden; margin-top: 8px;
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 10%, #000 90%, transparent); mask-image: linear-gradient(180deg, transparent, #000 10%, #000 90%, transparent); }
.vm-col { overflow: hidden; min-width: 0; }
.vm-track { display: flex; flex-direction: column; will-change: transform; animation: vm-up var(--vm-t, 34s) linear infinite; }
.vm-col.down .vm-track { animation-name: vm-down; --vm-t: 40s; }
.vm-col.c2 .vm-track { --vm-t: 46s; }
.vm-set { display: flex; flex-direction: column; gap: 12px; padding-bottom: 12px; }
@keyframes vm-up { from { transform: translateY(0); } to { transform: translateY(-50%); } }
@keyframes vm-down { from { transform: translateY(-50%); } to { transform: translateY(0); } }
.vm:hover .vm-track, .vm:focus-within .vm-track, .vm:active .vm-track { animation-play-state: paused; }
.vm-tile { position: relative; display: block; flex: none; aspect-ratio: 4 / 5.2; border-radius: 22px; overflow: hidden; background: #151517; box-shadow: var(--shadow-1); }
.vm-bg { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform .6s; }
.vm-tile:hover .vm-bg { transform: scale(1.05); }
.vm-shade { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, .78)); }
.vm-info { position: absolute; left: 14px; right: 14px; bottom: 14px; display: grid; gap: 2px; color: #fff; }
.vm-info b { font-size: 1.15rem; letter-spacing: -0.03em; line-height: 1.15; }
.vm-info em { font-style: normal; font-size: .74rem; color: rgba(255, 255, 255, .72); }
.vm-go { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%; background: #D4A62A; color: #111; display: grid; place-items: center; font-size: .8rem; }
@media (min-width: 900px) { .vm { grid-template-columns: repeat(3, 1fr); gap: 16px; height: 640px; } .vm-set { gap: 16px; padding-bottom: 16px; } }
@media (prefers-reduced-motion: reduce) {
  .vm { height: auto; -webkit-mask-image: none; mask-image: none; }
  .vm-track { animation: none; } .vm-set.dup { display: none; }
}
</style>
