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

    <div class="card p-6 animate-rise" style="animation-delay:40ms">
      <h2 class="text-lg font-bold mb-1">Changer le mot de passe</h2>
      <p class="text-sm text-muted mb-4">Utilisez au moins 10 caractères, avec des lettres et des chiffres.</p>
      <form @submit.prevent="changePwd" class="space-y-3">
        <div class="relative">
          <input v-model="pwd.current" :type="show ? 'text' : 'password'" autocomplete="current-password" placeholder="Mot de passe actuel" required class="input pr-24" />
          <button type="button" @click="show = !show" class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gold font-semibold">{{ show ? "Masquer" : "Afficher" }}</button>
        </div>
        <input v-model="pwd.next" :type="show ? 'text' : 'password'" autocomplete="new-password" placeholder="Nouveau mot de passe" required minlength="10" class="input" />
        <div class="h-1.5 rounded-full bg-line overflow-hidden"><div class="h-full transition-all" :style="{ width: strength.pct + '%', background: strength.color }"></div></div>
        <p class="text-xs text-muted">Force : <b>{{ strength.label }}</b></p>
        <input v-model="pwd.confirm" :type="show ? 'text' : 'password'" autocomplete="new-password" placeholder="Confirmer le nouveau mot de passe" required class="input" />
        <p v-if="msg.text" class="text-sm rounded-xl px-4 py-3" :class="msg.ok ? 'bg-green-50 text-good' : 'bg-red-50 text-bad'">{{ msg.text }}</p>
        <button class="btn-primary w-full" :disabled="busy">{{ busy ? "Enregistrement…" : "Mettre à jour le mot de passe" }}</button>
      </form>
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
import { ref, reactive, computed } from "vue";
import apiClient from "../api/client";
import { useAuthStore } from "../stores/auth";
import Icon from "../components/Icon.vue";
const auth = useAuthStore();

const pwd = reactive({ current: "", next: "", confirm: "" });
const show = ref(false), busy = ref(false), msg = reactive({ ok: false, text: "" });

const strength = computed(() => {
  const v = pwd.next; let n = 0;
  if (v.length >= 10) n++; if (v.length >= 14) n++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) n++;
  if (/\d/.test(v)) n++; if (/[^A-Za-z0-9]/.test(v)) n++;
  const L = [["Très faible", "#C62828"], ["Faible", "#C62828"], ["Moyen", "#D4A62A"], ["Bon", "#D4A62A"], ["Fort", "#137A3F"], ["Excellent", "#137A3F"]][n];
  return { pct: (n / 5) * 100, label: v ? L[0] : "—", color: L[1] };
});

async function changePwd() {
  msg.text = "";
  if (pwd.next !== pwd.confirm) { msg.ok = false; msg.text = "Les deux mots de passe ne correspondent pas."; return; }
  busy.value = true;
  try {
    await apiClient.post("/auth/change-password", { currentPassword: pwd.current, newPassword: pwd.next });
    msg.ok = true; msg.text = "Mot de passe mis à jour. Les autres appareils ont été déconnectés.";
    pwd.current = pwd.next = pwd.confirm = "";
  } catch (e) {
    const d = e.response?.data;
    msg.ok = false; msg.text = d?.details?.newPassword?.[0] || d?.error || "La mise à jour a échoué. Réessayez.";
  } finally { busy.value = false; }
}
</script>
