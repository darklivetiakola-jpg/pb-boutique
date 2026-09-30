<template>
  <router-link :to="to" v-slot="{ isActive, navigate, href }" :custom="true">
    <a :href="href" @click="navigate"
      class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors"
      :class="active(isActive) ? 'bg-gold-soft text-gold' : 'text-muted hover:text-ink hover:bg-page'">
      <Icon :name="icon" class="w-5 h-5 shrink-0" />
      <span>{{ label }}</span>
      <span v-if="badge" class="ml-auto bg-gold text-white text-[0.7rem] font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center">{{ badge }}</span>
    </a>
  </router-link>
</template>

<script setup>
import { useRoute } from "vue-router";
import Icon from "./Icon.vue";
const props = defineProps({ to: String, icon: String, label: String, exact: Boolean, badge: [Number, String] });
const route = useRoute();
function active(isActive) { return props.exact ? route.path === props.to : isActive; }
</script>
