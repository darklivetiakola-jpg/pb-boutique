<template>
  <section v-if="promos.banners.length" class="pbn">
    <div class="container">
      <div class="pbn-slider" @mouseenter="paused = true" @mouseleave="paused = false" @touchstart.passive="paused = true" @touchend.passive="resume">
        <div class="pbn-track" ref="track" @scroll.passive="onScroll">
          <component v-for="b in promos.banners" :key="b.id" :is="b.ctaUrl ? linkTag(b.ctaUrl) : 'div'" v-bind="b.ctaUrl ? linkProps(b.ctaUrl) : {}"
            class="pbn-slide" :style="{ background: b.bgColor || '#0B0B0C', color: b.textColor || '#fff' }">
            <img v-if="b.image" :src="b.image" :alt="b.title" loading="lazy" />
            <span class="pbn-shade"></span>
            <span class="pbn-txt">
              <em v-if="b.subtitle">{{ b.subtitle }}</em>
              <b>{{ b.title }}</b>
              <span v-if="b.ctaUrl" class="pbn-btn">{{ b.ctaLabel || "Découvrir" }} <i class="fa-solid fa-arrow-right"></i></span>
            </span>
          </component>
        </div>
        <template v-if="promos.banners.length > 1">
          <button class="pbn-nav prev" @click="go(idx - 1)" aria-label="Précédent"><i class="fa-solid fa-chevron-left"></i></button>
          <button class="pbn-nav next" @click="go(idx + 1)" aria-label="Suivant"><i class="fa-solid fa-chevron-right"></i></button>
          <div class="pbn-dots"><i v-for="(b, i) in promos.banners" :key="b.id" :class="{ on: i === idx }" @click="go(i)"></i></div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { usePromosStore } from "../stores/promos";
import { linkTag, linkProps } from "../utils/promo-link";

const promos = usePromosStore();
const track = ref(null), idx = ref(0), paused = ref(false);
let timer;

function onScroll() {
  const el = track.value; if (!el || !el.clientWidth) return;
  idx.value = Math.round(el.scrollLeft / el.clientWidth);
}
function go(i) {
  const el = track.value; if (!el) return;
  const n = promos.banners.length;
  const k = (i + n) % n;
  el.scrollTo({ left: k * el.clientWidth, behavior: "smooth" });
}
function resume() { setTimeout(() => { paused.value = false; }, 4000); }

onMounted(() => { timer = setInterval(() => { if (!paused.value && !document.hidden && promos.banners.length > 1) go(idx.value + 1); }, 5000); });
onBeforeUnmount(() => clearInterval(timer));
</script>

<style>
.pbn { padding: 24px 0 8px; }
.pbn-slider { position: relative; border-radius: 20px; overflow: hidden; }
.pbn-track { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.pbn-track::-webkit-scrollbar { display: none; }
.pbn-slide { position: relative; flex: 0 0 100%; scroll-snap-align: start; aspect-ratio: 21 / 8; min-height: 170px; display: flex; align-items: flex-end; text-decoration: none; overflow: hidden; }
.pbn-slide img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.pbn-shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.62), rgba(0,0,0,.05) 70%); }
.pbn-txt { position: relative; display: flex; flex-direction: column; gap: 8px; align-items: flex-start; padding: 0 0 26px 32px; max-width: 62%; }
.pbn-txt em { font-style: normal; font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: #F2D58A; font-weight: 700; }
.pbn-txt b { font-size: clamp(1.25rem, 3.4vw, 2.3rem); line-height: 1.08; letter-spacing: -.01em; }
.pbn-btn { background: #fff; color: #111; font-weight: 700; font-size: .82rem; padding: 8px 16px; border-radius: 999px; display: inline-flex; gap: 8px; align-items: center; }
.pbn-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 38px; height: 38px; border-radius: 50%; border: 0; background: rgba(255,255,255,.9); color: #111; cursor: pointer; display: grid; place-items: center; box-shadow: 0 4px 14px rgba(0,0,0,.25); }
.pbn-nav.prev { left: 12px; } .pbn-nav.next { right: 12px; }
.pbn-dots { position: absolute; bottom: 10px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; pointer-events: none; }
.pbn-dots i { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.5); transition: all .25s; pointer-events: auto; cursor: pointer; } .pbn-dots i.on { width: 22px; border-radius: 6px; background: #fff; }
@media (max-width: 640px) { .pbn { padding: 16px 0 4px; } .pbn-slider { border-radius: 16px; } .pbn-slide { aspect-ratio: 16 / 10; } .pbn-txt { padding: 0 0 30px 18px; max-width: 80%; } .pbn-nav { display: none; } }
</style>
