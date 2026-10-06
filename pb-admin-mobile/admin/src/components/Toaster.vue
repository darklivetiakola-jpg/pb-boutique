<template>
  <Transition name="toast">
    <div v-if="toastState.text" role="status" aria-live="polite"
      class="fixed left-1/2 -translate-x-1/2 z-[70] max-w-[calc(100vw-32px)] bottom-[calc(76px+env(safe-area-inset-bottom))] lg:bottom-6 text-sm font-medium px-5 py-2.5 rounded-full shadow-pop text-center"
      :class="toastState.kind === 'error' ? 'bg-bad text-white' : 'bg-ink text-white'">
      {{ toastState.text }}
    </div>
  </Transition>
</template>

<script setup>
import { toastState } from "../utils/toast";
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: opacity .2s, transform .25s cubic-bezier(.2,.8,.2,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 10px); }
</style>
