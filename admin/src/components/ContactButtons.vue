<template>
  <div class="flex items-center gap-2" :class="compact ? '' : 'flex-wrap'">
    <a v-if="wa" :href="wa" target="_blank" rel="noopener" :title="`WhatsApp ${name || ''}`" @click.stop
      class="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-95"
      :class="compact ? 'w-9 h-9 bg-[#25D366]/15 text-[#128C4A]' : 'h-11 px-5 bg-[#25D366] text-[#06260f] hover:brightness-95'">
      <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4.1A8 8 0 1 1 20 12Z"/><path d="M9.2 8.8c.3 2.3 2.7 4.7 5 5l1.1-1.2-1.8-1-.8.6c-.7-.3-1.5-1.1-1.8-1.8l.6-.8-1-1.8-1.3 1Z"/></svg>
      <span v-if="!compact">WhatsApp</span>
    </a>
    <a v-if="tel" :href="tel" title="Appeler" @click.stop
      class="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-95"
      :class="compact ? 'w-9 h-9 bg-blue-50 text-blue-600' : 'h-11 px-5 bg-gold text-white hover:opacity-90'">
      <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>
      <span v-if="!compact">Appeler</span>
    </a>
    <a v-if="mail" :href="mail" title="Envoyer un e-mail" @click.stop
      class="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-95"
      :class="compact ? 'w-9 h-9 bg-page text-ink' : 'h-11 px-5 bg-page text-ink hover:bg-line'">
      <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>
      <span v-if="!compact">E-mail</span>
    </a>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { waLink, telLink, mailLink } from "../utils/contact";
const props = defineProps({ phone: String, email: String, name: String, message: String, subject: String, compact: Boolean });
const wa = computed(() => waLink(props.phone, props.message || ""));
const tel = computed(() => telLink(props.phone));
const mail = computed(() => mailLink(props.email, props.subject || "PB Boutique Hommes", props.message || ""));
</script>
