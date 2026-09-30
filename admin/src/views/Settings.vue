<template>
  <div class="max-w-lg space-y-6">
    <div class="card p-6 animate-rise">
      <h2 class="font-serif text-lg mb-4">Profil administrateur</h2>
      <div class="space-y-3.5">
        <input :value="auth.user?.firstName + ' ' + auth.user?.lastName" disabled class="input opacity-60" />
        <input :value="auth.user?.email" disabled class="input opacity-60" />
        <p class="text-xs text-muted">La modification du profil se fait pour l'instant côté base de données — un formulaire d'édition peut être ajouté rapidement si besoin.</p>
      </div>
    </div>

    <div class="card p-6 animate-rise" style="animation-delay:80ms">
      <h2 class="font-serif text-lg mb-2">Sécurité</h2>
      <p class="text-sm text-muted mb-4">Le mot de passe de démonstration créé par le seed doit être changé avant la mise en production.</p>
      <ul class="text-sm space-y-2 text-muted">
        <li class="flex items-center gap-2"><Icon name="check" class="w-4 h-4 text-good" /> Cookies JWT httpOnly (protection XSS)</li>
        <li class="flex items-center gap-2"><Icon name="check" class="w-4 h-4 text-good" /> Rate-limiting sur la connexion</li>
        <li class="flex items-center gap-2"><Icon name="check" class="w-4 h-4 text-good" /> Mots de passe hashés (bcrypt, 12 rounds)</li>
        <li class="flex items-center gap-2"><Icon name="check" class="w-4 h-4 text-good" /> Signature vérifiée sur le webhook de paiement</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "../stores/auth";
import Icon from "../components/Icon.vue";
const auth = useAuthStore();
</script>
