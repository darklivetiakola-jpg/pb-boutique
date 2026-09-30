<template>
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg2);">
    <div style="background:var(--surface);padding:48px 40px;border-radius:var(--r-lg);max-width:420px;text-align:center;box-shadow:var(--shadow-3);">
      <div style="width:60px;height:60px;border-radius:50%;background:var(--orange);color:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin:0 auto 20px;">
        <i class="fa-solid fa-check"></i>
      </div>
      <h1 style="font-size:1.4rem;margin-bottom:10px;">Merci pour votre commande</h1>
      <p style="color:var(--ink3);font-size:0.9rem;margin-bottom:22px;">{{ text }}</p>
      <router-link to="/" class="btn btn-primary" style="justify-content:center;">Retour à la boutique</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const text = computed(() => {
  const ref = route.query.ref;
  return ref
    ? `Commande ${ref} — paiement en cours de vérification. Vous recevrez une confirmation par téléphone.`
    : "Votre paiement est en cours de vérification. Vous recevrez une confirmation par téléphone.";
});
</script>
