<!--
  Compteur animé : la valeur "compte" du 0 jusqu'à sa valeur finale à chaque
  fois qu'elle change. C'est le détail "motion" le plus visible d'un dashboard
  — sans lui, un chiffre qui change semble juste "sauter".
-->
<template>{{ display }}</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  value: { type: Number, default: 0 },
  duration: { type: Number, default: 900 },
  format: { type: Function, default: (n) => Math.round(n).toLocaleString("fr-FR") },
});

const display = ref(props.format(0));

function animateTo(target) {
  const start = performance.now();
  const from = 0;
  function tick(now) {
    const p = Math.min((now - start) / props.duration, 1);
    const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
    display.value = props.format(from + (target - from) * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

onMounted(() => animateTo(props.value));
watch(() => props.value, (v) => animateTo(v));
</script>
