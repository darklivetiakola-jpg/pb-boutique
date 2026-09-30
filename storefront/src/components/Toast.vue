<template>
  <div class="toast" :class="{ on: toast.visible }">
    <i class="fa-solid fa-check"></i><span>{{ toast.message }}</span>
  </div>
</template>

<script setup>
import { useToastStore } from "../stores/toast";
const toast = useToastStore();
</script>
