<template>
  <div class="pb-modal-overlay on" @click="checkout.closeModal"></div>
  <div class="pb-modal on">
    <button class="pb-modal-close" @click="checkout.closeModal"><i class="fa-solid fa-xmark"></i></button>

    <!-- CONFIRMATION -->
    <div v-if="checkout.confirmation" class="pb-confirm">
      <div class="pb-confirm-check"><i class="fa-solid fa-check"></i></div>
      <h3>Commande enregistrée</h3>
      <p>Référence <strong>{{ checkout.confirmation.ref }}</strong> — {{ fmt(checkout.confirmation.total) }}</p>
      <p class="pb-modal-sub">Vous serez contacté au numéro indiqué pour confirmer le paiement et la livraison.</p>
      <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:18px;" @click="checkout.closeModal">Fermer</button>
    </div>

    <!-- FORMULAIRE -->
    <div v-else>
      <h3>Finaliser la commande</h3>
      <p class="pb-modal-sub">{{ cart.itemsCount }} article(s) — <strong>{{ fmt(cart.subtotal) }}</strong></p>
      <form @submit.prevent="submit">
        <label>Nom complet</label><input v-model="form.name" type="text" required/>
        <label>Téléphone</label><input v-model="form.phone" type="tel" placeholder="07 00 00 00 00" required/>
        <label>Adresse de livraison</label><input v-model="form.address" type="text" placeholder="Quartier, commune, Abidjan" required/>
        <label>Mode de paiement</label>
        <div class="pb-pay-choice">
          <button type="button" class="pb-pay-btn" :class="{ on: checkout.method === 'mobile_money' }" @click="checkout.method = 'mobile_money'">
            <i class="fa-solid fa-mobile-screen"></i> Mobile Money
          </button>
          <button type="button" class="pb-pay-btn" :class="{ on: checkout.method === 'card' }" @click="checkout.method = 'card'">
            <i class="fa-regular fa-credit-card"></i> Carte bancaire
          </button>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="checkout.submitting"
          style="width:100%;justify-content:center;margin-top:18px;">
          <i class="fa-solid" :class="checkout.submitting ? 'fa-spinner fa-spin' : 'fa-lock'"></i>
          {{ checkout.submitting ? "Traitement…" : "Confirmer la commande" }}
        </button>
        <p v-if="checkout.error" style="color:#c0392b;font-size:0.85rem;margin-top:10px;">{{ checkout.error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useCartStore } from "../stores/cart";
import { useCheckoutStore } from "../stores/checkout";

const cart = useCartStore();
const checkout = useCheckoutStore();
const form = reactive({ name: "", phone: "", address: "" });

function fmt(n) { return Number(n).toLocaleString("fr-FR") + " FCFA"; }
function submit() { checkout.submit(form); }
</script>
