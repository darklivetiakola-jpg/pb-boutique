<template>
  <button class="btt" :class="{ on: visible }" @click="scrollTop"><i class="fa-solid fa-arrow-up"></i></button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
const visible = ref(false);
function onScroll() { visible.value = window.scrollY > 300; }
function scrollTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }
onMounted(() => window.addEventListener("scroll", onScroll));
onUnmounted(() => window.removeEventListener("scroll", onScroll));
</script>
