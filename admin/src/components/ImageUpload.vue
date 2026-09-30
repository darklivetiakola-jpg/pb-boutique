<template>
  <div>
    <div class="grid gap-2.5" :class="multiple ? 'grid-cols-3' : 'grid-cols-1'">
      <div v-for="(url, i) in list" :key="url" class="relative rounded-2xl overflow-hidden bg-page group" :class="multiple ? 'aspect-square' : 'aspect-[16/9]'">
        <img :src="url" alt="" class="w-full h-full object-cover" />
        <span v-if="multiple && i === 0" class="absolute left-2 top-2 bg-gold text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">Principale</span>
        <button type="button" @click="removeAt(i)" aria-label="Retirer l'image"
          class="absolute right-2 top-2 w-7 h-7 rounded-full bg-paper/90 text-ink grid place-items-center shadow-soft hover:text-bad">
          <Icon name="close" class="w-4 h-4" />
        </button>
      </div>

      <label v-if="multiple || !list.length"
        class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-colors text-muted"
        :class="[multiple ? 'aspect-square' : 'min-h-[150px]', over ? 'border-gold bg-gold-soft' : 'border-line bg-page hover:border-gold']"
        @dragover.prevent="over = true" @dragleave="over = false" @drop.prevent="onDrop">
        <input type="file" accept="image/jpeg,image/png,image/webp" :multiple="multiple" class="sr-only" @change="onPick" />
        <template v-if="busy"><span class="text-sm font-medium text-gold">Envoi…</span></template>
        <template v-else>
          <Icon name="upload" class="w-6 h-6 text-gold" />
          <span class="text-sm font-semibold text-ink">{{ multiple ? "Ajouter des photos" : "Ajouter une photo" }}</span>
          <span class="text-xs px-2">Glissez ou touchez · JPG, PNG, WebP · 5 Mo max</span>
        </template>
      </label>
    </div>
    <p v-if="error" class="text-bad text-sm mt-2">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import apiClient from "../api/client";
import Icon from "./Icon.vue";

// modelValue : liste d'URL (multiple) ou URL simple (une seule image)
const props = defineProps({ modelValue: [Array, String], multiple: Boolean, max: { type: Number, default: 6 } });
const emit = defineEmits(["update:modelValue"]);
const over = ref(false), busy = ref(false), error = ref("");

const list = computed(() => props.multiple ? (props.modelValue || []) : (props.modelValue ? [props.modelValue] : []));

function commit(urls) { emit("update:modelValue", props.multiple ? urls : (urls[0] || "")); }
function removeAt(i) { commit(list.value.filter((_, k) => k !== i)); }

async function send(files) {
  error.value = "";
  files = [...files].filter(f => f.type.startsWith("image/"));
  if (!files.length) { error.value = "Choisissez un fichier image."; return; }
  if (files.some(f => f.size > 5 * 1024 * 1024)) { error.value = "Une image dépasse 5 Mo."; return; }
  if (props.multiple) files = files.slice(0, Math.max(0, props.max - list.value.length));
  else files = files.slice(0, 1);
  const fd = new FormData();
  files.forEach(f => fd.append("files", f));
  busy.value = true;
  try {
    const { data } = await apiClient.post("/uploads", fd);
    commit(props.multiple ? [...list.value, ...data.urls] : data.urls);
  } catch (e) {
    error.value = e.response?.data?.error || "L'envoi a échoué. Réessayez.";
  } finally { busy.value = false; over.value = false; }
}
const onPick = (e) => { send(e.target.files); e.target.value = ""; };
const onDrop = (e) => send(e.dataTransfer.files);
</script>
