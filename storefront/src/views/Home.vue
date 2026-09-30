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

    <!-- FEATURE STRIP -->
    <div class="feature-strip">
      <div class="feat-item"><div class="feat-icon"><i class="fa-solid fa-truck-fast"></i></div><div class="feat-text"><strong>Livraison 48h</strong><span>Abidjan et intérieur du pays</span></div></div>
      <div class="feat-item"><div class="feat-icon"><i class="fa-solid fa-mobile-screen"></i></div><div class="feat-text"><strong>Mobile Money</strong><span>Wave · Orange · MTN · Moov</span></div></div>
      <div class="feat-item"><div class="feat-icon"><i class="fa-solid fa-rotate-left"></i></div><div class="feat-text"><strong>Échange gratuit</strong><span>7 jours sans condition</span></div></div>
      <div class="feat-item"><div class="feat-icon"><i class="fa-brands fa-whatsapp"></i></div><div class="feat-text"><strong>Conseil style</strong><span>Sur WhatsApp</span></div></div>
    </div>

    <!-- CATEGORIES -->
    <section class="section" id="categories">
      <div class="container">
        <div class="sec-header"><div class="sec-header-left">
          <h2 class="sec-title">Explorez la collection.</h2>
          <p class="sec-sub">Chaque pièce pensée pour la coupe, la matière et la tenue</p>
        </div></div>
        <div class="cat-grid-clean">
          <router-link v-for="c in cats" :key="c.slug" :to="`/categorie/${c.slug}`" class="cat-card">
            <div class="cat-card-bg" :style="{ backgroundImage: `url('${c.img}')` }"></div>
            <div class="cat-card-overlay"></div>
            <div class="cat-card-arrow"><i class="fa-solid fa-arrow-right"></i></div>
            <div class="cat-card-info"><div class="cat-card-name">{{ c.name }}</div><div class="cat-card-count">{{ c.tags }}</div></div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- COUP DE COEUR -->
    <section style="padding:0 0 72px;">
      <div class="container">
        <div class="sec-header">
          <div class="sec-header-left"><h2 class="sec-title">Coup de cœur.</h2></div>
        </div>
        <div class="prod-scroll-wrap"><div class="prod-scroll">
          <ProductCard v-for="p in products.items.slice(0, 10)" :key="p.id" :p="p" />
        </div></div>
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
          <ProductCard v-for="p in products.items.slice(0, 8)" :key="p.id" :p="p" />
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
import { ref, onMounted } from "vue";
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
</script>
