<template>
  <div v-if="promos.alert || promos.ticker.length" class="pt">
    <!-- ALERTE (ex. BLACK FRIDAY) -->
    <component v-if="promos.alert" :is="promos.alert.ctaUrl ? linkTag(promos.alert.ctaUrl) : 'div'" v-bind="promos.alert.ctaUrl ? linkProps(promos.alert.ctaUrl) : {}"
      class="pt-alert" :style="{ background: promos.alert.bgColor || '#0A0A0A', color: promos.alert.textColor || '#fff' }">
      <span class="pt-siren"><i class="fa-solid fa-bell"></i> ALERTE !</span>
      <b class="pt-alert-title">{{ promos.alert.title }}</b>
      <span v-if="promos.alert.subtitle" class="pt-alert-sub">{{ promos.alert.subtitle }}</span>
      <span v-if="cd && !cd.done" class="pt-cd">
        <i v-if="cd.d">{{ cd.d }}j</i><i>{{ pad(cd.h) }}</i>:<i>{{ pad(cd.m) }}</i>:<i>{{ pad(cd.s) }}</i>
      </span>
      <span v-if="promos.alert.ctaUrl" class="pt-cta">{{ promos.alert.ctaLabel || "J'en profite" }} <i class="fa-solid fa-arrow-right"></i></span>
    </component>

    <!-- BANDEAU DÉFILANT : tickets avec image -->
    <div v-if="promos.ticker.length" class="pt-marquee" aria-label="Informations et promotions">
      <div class="pt-track" :style="{ animationDuration: dur }">
        <template v-for="copy in 2" :key="copy">
          <component v-for="t in promos.ticker" :key="copy + t.id" :is="t.ctaUrl ? linkTag(t.ctaUrl) : 'div'" v-bind="t.ctaUrl ? linkProps(t.ctaUrl) : {}"
            class="pt-ticket" :class="{ dup: copy === 2 }" :style="t.bgColor ? { '--tk': t.bgColor, '--tkt': t.textColor || '#fff' } : {}">
            <img v-if="t.image" :src="t.image" alt="" loading="lazy" />
            <span class="pt-tk-txt"><b>{{ t.title }}</b><small v-if="t.subtitle">{{ t.subtitle }}</small></span>
          </component>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { usePromosStore } from "../stores/promos";
import { linkTag, linkProps } from "../utils/promo-link";
import { useCountdown, pad } from "../utils/countdown";

const promos = usePromosStore();
const { parts: cd } = useCountdown(() => promos.alert?.endsAt, () => promos.offset);
const dur = computed(() => `${Math.max(24, promos.ticker.length * 9)}s`);
</script>

<style>
.pt { position: relative; z-index: 995; }
.pt-alert { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; padding: 9px 16px; text-decoration: none; font-size: .88rem; text-align: center; }
.pt-siren { background: #E5484D; color: #fff; font-weight: 800; font-size: .72rem; letter-spacing: .08em; padding: 4px 9px; border-radius: 999px; animation: pt-pulse 1.4s ease-in-out infinite; white-space: nowrap; }
@keyframes pt-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(229,72,77,.7); } 50% { box-shadow: 0 0 0 7px rgba(229,72,77,0); } }
.pt-alert-title { font-size: .98rem; letter-spacing: .02em; } .pt-alert-sub { opacity: .85; }
.pt-cd { display: inline-flex; align-items: center; gap: 3px; font-variant-numeric: tabular-nums; font-weight: 700; }
.pt-cd i { font-style: normal; background: rgba(255,255,255,.16); border-radius: 6px; padding: 2px 6px; }
.pt-cta { font-weight: 700; text-decoration: underline; text-underline-offset: 3px; white-space: nowrap; }
.pt-marquee { overflow: hidden; background: #F4EFE3; border-bottom: 1px solid #E6DCC0; padding: 7px 0; }
[data-theme="dark"] .pt-marquee { background: #14161B; border-color: #232730; }
.pt-track { display: flex; width: max-content; gap: 14px; padding-left: 14px; animation: pt-scroll 40s linear infinite; }
.pt-marquee:hover .pt-track { animation-play-state: paused; }
@keyframes pt-scroll { to { transform: translateX(-50%); } }
.pt-ticket { --tk: #0B0B0C; --tkt: #F2D58A; position: relative; display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 18px 0 6px; border-radius: 10px; background: var(--tk); color: var(--tkt); text-decoration: none; white-space: nowrap; flex-shrink: 0;
  -webkit-mask: radial-gradient(circle 6px at 0 50%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 6px at 100% 50%, #0000 98%, #000) right / 51% 100% no-repeat; mask: radial-gradient(circle 6px at 0 50%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 6px at 100% 50%, #0000 98%, #000) right / 51% 100% no-repeat; }
.pt-ticket:not(:has(img)) { padding-left: 20px; }
.pt-ticket img { width: 34px; height: 34px; object-fit: cover; border-radius: 7px; border: 1px dashed rgba(255,255,255,.4); }
.pt-tk-txt { display: flex; flex-direction: column; line-height: 1.15; } .pt-tk-txt b { font-size: .82rem; } .pt-tk-txt small { font-size: .68rem; opacity: .8; }
@media (prefers-reduced-motion: reduce) { .pt-track { animation: none; overflow-x: auto; } .pt-ticket.dup { display: none; } .pt-siren { animation: none; } }
@media (max-width: 640px) { .pt-alert { gap: 8px; padding: 8px 12px; font-size: .8rem; } .pt-alert-title { font-size: .86rem; } }
</style>
