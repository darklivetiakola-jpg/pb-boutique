import { ref, computed, onMounted, onBeforeUnmount } from "vue";

export const pad = (n) => String(n).padStart(2, "0");

/** Compte à rebours en direct. getEnd() -> date de fin ; getOffset() -> décalage horloge serveur/navigateur. */
export function useCountdown(getEnd, getOffset = () => 0) {
  const now = ref(Date.now());
  let t;
  onMounted(() => { t = setInterval(() => { now.value = Date.now(); }, 1000); });
  onBeforeUnmount(() => clearInterval(t));
  const serverNow = computed(() => now.value + getOffset());
  const parts = computed(() => {
    const end = getEnd();
    if (!end) return null;
    const left = Math.max(0, new Date(end).getTime() - serverNow.value);
    const s = Math.floor(left / 1000);
    return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, done: left <= 0 };
  });
  return { parts, serverNow };
}
