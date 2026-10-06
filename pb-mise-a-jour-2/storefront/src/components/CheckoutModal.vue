<template>
  <div class="pb-modal-overlay on" @click="checkout.closeModal"></div>
  <div class="pb-modal on">
    <button class="pb-modal-close" @click="checkout.closeModal"><i class="fa-solid fa-xmark"></i></button>

    <!-- CONFIRMATION -->
    <div v-if="checkout.confirmation" class="pb-confirm">
      <div class="pb-confirm-check"><i class="fa-solid fa-check"></i></div>
      <h3>Commande enregistrée</h3>
      <p>Référence <strong>{{ checkout.confirmation.ref }}</strong> — {{ fmt(checkout.confirmation.total) }}</p>
      <p v-if="checkout.confirmation.fee" class="pb-modal-sub">dont livraison : {{ fmt(checkout.confirmation.fee) }}</p>
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
        <template v-if="delivery.zones.length">
          <label>Zone de livraison</label>
          <select v-model="checkout.zoneId" required>
            <option value="" disabled>Choisissez votre commune…</option>
            <option v-for="z in delivery.zones" :key="z.id" :value="z.id">
              {{ z.name }} — {{ cart.subtotal >= delivery.freeFrom ? "offerte" : fmt(z.fee) }}
            </option>
          </select>
        </template>
        <label>{{ delivery.zones.length ? "Adresse précise (quartier, rue, repère)" : "Adresse de livraison" }}</label>
        <input v-model="form.address" type="text" :placeholder="delivery.zones.length ? 'Ex. Riviera 3, rue des Jardins, près de la pharmacie' : 'Quartier, commune, Abidjan'" required/>
        <label>Mode de paiement</label>
        <div class="pb-pay-choice">
          <button type="button" class="pb-pay-btn" :class="{ on: checkout.method === 'mobile_money' }" @click="checkout.method = 'mobile_money'">
            <i class="fa-solid fa-mobile-screen"></i> Mobile Money
          </button>
          <button type="button" class="pb-pay-btn" :class="{ on: checkout.method === 'card' }" @click="checkout.method = 'card'">
            <i class="fa-regular fa-credit-card"></i> Carte bancaire
          </button>
        </div>
        <div v-if="delivery.zones.length" class="pb-sum" style="margin-top:16px;font-size:0.92rem;line-height:1.9;">
          <div style="display:flex;justify-content:space-between;"><span>Sous-total</span><span>{{ fmt(cart.subtotal) }}</span></div>
          <div style="display:flex;justify-content:space-between;"><span>Livraison</span><span>{{ !checkout.zoneId ? "—" : fee === 0 ? "Offerte" : fmt(fee) }}</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid var(--line,#e5e5e5);margin-top:4px;padding-top:6px;"><span>Total à payer</span><span>{{ fmt(cart.subtotal + fee) }}</span></div>
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
import { reactive, computed } from "vue";
import { useCartStore } from "../stores/cart";
import { useCheckoutStore } from "../stores/checkout";
import { useAuthStore } from "../stores/auth";
import { useDeliveryStore } from "../stores/delivery";

const delivery = useDeliveryStore();
const cart = useCartStore();
const checkout = useCheckoutStore();
const auth = useAuthStore();
// Les informations du compte sont préremplies : le client n'a rien à retaper
const u = auth.user || {};
const form = reactive({
  name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
  phone: u.phone || "",
  // Avec des zones de livraison, la commune est choisie dans la liste : on ne préremplit que la rue
  address: (delivery.zones.length ? [u.address] : [u.address, u.city]).filter(Boolean).join(", "),
});

const fee = computed(() => delivery.feeFor(checkout.zoneId, cart.subtotal));
function fmt(n) { return Number(n).toLocaleString("fr-FR") + " FCFA"; }
function submit() { checkout.submit(form); }
</script>
