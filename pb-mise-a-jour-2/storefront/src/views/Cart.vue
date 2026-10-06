<template>
  <main class="cartp container">
    <div class="cartp-head">
      <h1>Mon panier</h1>
      <span v-if="cart.items.length" class="cartp-count">{{ cart.itemsCount }} article{{ cart.itemsCount > 1 ? "s" : "" }}</span>
    </div>

    <!-- Panier vide -->
    <div v-if="!cart.items.length" class="cartp-empty">
      <div class="cartp-empty-ic"><IconBag /></div>
      <h2>Votre panier est vide</h2>
      <p>Découvrez nos dernières pièces et trouvez celle qui vous ressemble.</p>
      <router-link to="/categorie/nouveautes" class="btn btn-primary btn-lg">Voir les nouveautés</router-link>
    </div>

    <div v-else class="cartp-grid">
      <section>
        <!-- Progression livraison offerte -->
        <div class="cartp-ship">
          <div class="cartp-ship-txt">
            <i class="fa-solid fa-truck-fast"></i>
            <span v-if="remaining > 0">Plus que <b>{{ fmt(remaining) }}</b> pour la livraison offerte</span>
            <span v-else><b>Livraison offerte</b> sur cette commande</span>
          </div>
          <div class="cartp-bar"><i :style="{ width: pct + '%' }"></i></div>
        </div>

        <ul class="cartp-list">
          <li v-for="it in cart.items" :key="it.key || it.id" class="cartp-item">
            <router-link :to="`/produit/${it.id}`" class="cartp-img"><img :src="it.img" :alt="it.name" loading="lazy" /></router-link>
            <div class="cartp-info">
              <router-link :to="`/produit/${it.id}`" class="cartp-name">{{ it.name }}</router-link>
              <div class="cartp-unit">{{ fmt(it.price) }}<template v-if="it.size"> · Taille {{ it.size }}</template></div>
              <div class="cartp-ctrl">
                <div class="cartp-qty" role="group" :aria-label="`Quantité de ${it.name}`">
                  <button @click="cart.changeQty(it.key || it.id, -1)" :disabled="it.qty <= 1" aria-label="Diminuer"><i class="fa-solid fa-minus"></i></button>
                  <span>{{ it.qty }}</span>
                  <button @click="cart.changeQty(it.key || it.id, 1)" aria-label="Augmenter"><i class="fa-solid fa-plus"></i></button>
                </div>
                <button class="cartp-rm" @click="cart.remove(it.key || it.id)"><i class="fa-regular fa-trash-can"></i> Retirer</button>
              </div>
            </div>
            <div class="cartp-line">{{ fmt(it.price * it.qty) }}</div>
          </li>
        </ul>

        <div class="cartp-links">
          <router-link to="/categorie/nouveautes"><i class="fa-solid fa-arrow-left"></i> Continuer mes achats</router-link>
          <button @click="clearAll">Vider le panier</button>
        </div>
      </section>

      <!-- Récapitulatif -->
      <aside class="cartp-sum">
        <h2>Récapitulatif</h2>
        <div class="cartp-row"><span>Sous-total</span><span>{{ fmt(cart.subtotal) }}</span></div>
        <div class="cartp-row"><span>Livraison</span><span :class="{ ok: remaining <= 0 }">{{ remaining <= 0 ? "Offerte" : delivery.zones.length ? "Selon votre zone (étape suivante)" : "Confirmée avant paiement" }}</span></div>
        <div class="cartp-total"><span>Total</span><span>{{ fmt(cart.subtotal) }}</span></div>
        <button class="btn btn-primary btn-lg cartp-cta" @click="order"><i class="fa-solid fa-lock"></i> Passer la commande</button>
        <div class="cartp-pay"><span>Wave</span><span>Orange Money</span><span>MTN</span><span>Moov</span><span>Visa</span></div>
        <ul class="cartp-trust">
          <li><i class="fa-solid fa-shield-halved"></i><div><b>Paiement 100 % sécurisé</b><span>Vos données ne sont jamais partagées.</span></div></li>
          <li><i class="fa-solid fa-truck-fast"></i><div><b>Livraison en 48h</b><span>Suivi par téléphone jusqu'à votre porte.</span></div></li>
          <li><i class="fa-solid fa-rotate-left"></i><div><b>Échange sous 7 jours</b><span>Taille ou modèle : on s'adapte.</span></div></li>
          <li><i class="fa-brands fa-whatsapp"></i><div><b>Une question ?</b><span><a :href="waLink()" target="_blank" rel="noopener">Écrivez-nous sur WhatsApp</a></span></div></li>
        </ul>
      </aside>
    </div>

    <!-- Barre d'achat mobile -->
    <div v-if="cart.items.length" class="cartp-bar-m">
      <div><small>Total</small><b>{{ fmt(cart.subtotal) }}</b></div>
      <button class="btn btn-primary btn-lg" @click="order">Commander</button>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted } from "vue";
import IconBag from "../components/IconBag.vue";
import { useCartStore } from "../stores/cart";
import { useCheckoutStore } from "../stores/checkout";
import { useToastStore } from "../stores/toast";
import { useDeliveryStore } from "../stores/delivery";
import { waLink } from "../config/site";

const cart = useCartStore(), checkout = useCheckoutStore(), toast = useToastStore(), delivery = useDeliveryStore();
const remaining = computed(() => Math.max(0, delivery.freeFrom - cart.subtotal));
const pct = computed(() => Math.min(100, (cart.subtotal / delivery.freeFrom) * 100));
onMounted(() => delivery.load());
const fmt = (n) => Number(n).toLocaleString("fr-FR") + " FCFA";

function order() { if (!checkout.openModal()) toast.show("Votre panier est vide"); }
function clearAll() { if (confirm("Vider tout le panier ?")) cart.clear(); }
</script>
