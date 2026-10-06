<template>
  <div
    class="card p-4 sm:p-5 animate-rise h-full lg:hover:shadow-pop lg:hover:-translate-y-0.5 transition-all duration-300"
    :style="{ animationDelay: `${delay}ms` }"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="w-9 h-9 rounded-lg flex items-center justify-center" :class="iconBg">
        <Icon :name="icon" class="w-[18px] h-[18px]" :class="iconColor" />
      </div>
      <span v-if="trend !== null" class="flex items-center gap-1 text-xs font-semibold" :class="trend >= 0 ? 'text-good' : 'text-bad'">
        <Icon :name="trend >= 0 ? 'trend-up' : 'trend-down'" class="w-3.5 h-3.5" />
        {{ Math.abs(trend) }}%
      </span>
    </div>
    <div class="text-xs text-muted mb-1">{{ label }}</div>
    <div class="font-bold tracking-tight whitespace-nowrap text-[clamp(1.1rem,5.2vw,1.5rem)]">
      <span v-if="prefix">{{ prefix }} </span><CountUp :value="value" :format="format" /><span v-if="suffix">&nbsp;{{ suffix }}</span>
    </div>
  </div>
</template>

<script setup>
import Icon from "./Icon.vue";
import CountUp from "./CountUp.vue";

defineProps({
  label: String, value: { type: Number, default: 0 }, icon: String,
  trend: { type: Number, default: null }, delay: { type: Number, default: 0 },
  prefix: String, suffix: String,
  iconBg: { type: String, default: "bg-gold-soft" },
  iconColor: { type: String, default: "text-gold-deep" },
  format: { type: Function, default: (n) => Math.round(n).toLocaleString("fr-FR") },
});
</script>
