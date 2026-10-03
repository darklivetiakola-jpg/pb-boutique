<template>
  <div class="cart-overlay" :class="{ on: cart.open }" @click="cart.closeDrawer"></div>
  <aside class="cart-drawer" :class="{ on: cart.open }">
    <div class="drawer-head">
      <h3>Panier</h3>
      <button class="drawer-close" @click="cart.closeDrawer"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <div class="drawer-body">
      <div v-if="!cart.items.length" class="cart-empty">
        <i class="fa-solid fa-bag-shopping"></i>
        <p>Votre panier est vide</p>
      </div>
      <div v-for="it in cart.items" :key="it.key || it.id" class="cart-item-row">
        <img class="ci-img" :src="it.img" :alt="it.name"/>
        <div class="ci-body">
          <div class="ci-name">{{ it.name }}</div>
          <div class="ci-price">{{ fmt(it.price) }}<span v-if="it.size"> · Taille {{ it.size }}</span></div>
          <div class="ci-row2">
            <button class="qty-btn" @click="cart.changeQty(it.key || it.id, -1)"><i class="fa-solid fa-minus"></i></button>
            <span class="qty-val">{{ it.qty }}</span>
            <button class="qty-btn" @click="cart.changeQty(it.key || it.id, 1)"><i class="fa-solid fa-plus"></i></button>
            <button class="ci-del" @click="cart.remove(it.key || it.id)"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="cart.items.length" class="drawer-foot" style="display:flex;flex-direction:column;gap:10px;">
      <div class="cart-row"><span>Sous-total</span><span>{{ fmt(cart.subtotal) }}</span></div>
      <div class="cart-row"><span>Livraison</span><span class="ship-free"><i class="fa-solid fa-truck-fast"></i> Gratuite dès 100 000 F</span></div>
      <div class="cart-total"><span>Total</span><span>{{ fmt(cart.subtotal) }}</span></div>
      <router-link to="/panier" class="btn btn-ghost" style="width:100%;justify-content:center;" @click="cart.closeDrawer">Voir mon panier</router-link>
      <button class="btn btn-primary btn-lg" style="width:100%;justify-content:center;border-radius:var(--r-md);" @click="startCheckout">
        <i class="fa-solid fa-lock"></i> Commander
      </button>
      <p style="font-size:0.72rem;color:var(--ink3);text-align:center;">Wave · Orange Money · MTN · Moov · Visa</p>
    </div>
  </aside>
</template>

<script setup>
import { useCartStore } from "../stores/cart";
import { useCheckoutStore } from "../stores/checkout";
import { useToastStore } from "../stores/toast";

const cart = useCartStore();
const checkout = useCheckoutStore();
const toast = useToastStore();

function fmt(n) { return Number(n).toLocaleString("fr-FR") + " FCFA"; }

function startCheckout() {
  const opened = checkout.openModal();
  if (!opened) toast.show("Votre panier est vide");
}
</script>
