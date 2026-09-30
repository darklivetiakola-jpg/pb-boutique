<template>
  <div class="min-h-screen bg-page flex items-center justify-center px-4">
    <div class="w-full max-w-sm bg-paper rounded-3xl shadow-soft border border-line p-8 animate-popin">
      <div class="flex flex-col items-center mb-8">
        <img src="/logo.png" alt="PB" class="w-14 h-14 rounded-xl mb-4" />
        <h1 class="text-2xl font-bold tracking-tight">Administration</h1>
        <p class="text-muted text-sm">PB Boutique Hommes</p>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <input v-model="email" type="email" required placeholder="Email" class="input" />
        <input v-model="password" type="password" required placeholder="Mot de passe" class="input" />
        <button type="submit" :disabled="loading" class="btn-primary w-full disabled:opacity-50">
          {{ loading ? "Connexion…" : "Se connecter" }}
        </button>
        <p v-if="error" class="text-bad text-sm text-center">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const email = ref(""); const password = ref(""); const error = ref(""); const loading = ref(false);
const auth = useAuthStore(); const router = useRouter();

async function submit() {
  loading.value = true; error.value = "";
  try {
    await auth.login(email.value, password.value);
    router.push("/");
  } catch {
    error.value = "Email ou mot de passe incorrect.";
  } finally {
    loading.value = false;
  }
}
</script>
