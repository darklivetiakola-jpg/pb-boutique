<template>
  <svg :class="$attrs.class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <template v-if="name === 'grid'"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></template>
    <template v-else-if="name === 'shirt'"><path d="M8 3l4 2 4-2 4 4-3 3v10H7V10L4 7z"/></template>
    <template v-else-if="name === 'box'"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></template>
    <template v-else-if="name === 'cart'"><circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M2.5 3h2l2.6 12.6a2 2 0 002 1.6h8.4a2 2 0 002-1.6L21 7H6"/></template>
    <template v-else-if="name === 'users'"><path d="M16 20v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 004 18.5V20"/><circle cx="9" cy="8" r="3.2"/><path d="M17 8a3 3 0 100-6"/><path d="M20 20v-1.5a3.4 3.4 0 00-2.2-3.2"/></template>
    <template v-else-if="name === 'card'"><rect x="2.5" y="5" width="19" height="14" rx="2.2"/><path d="M2.5 9.5h19"/></template>
    <template v-else-if="name === 'edit'"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></template>
    <template v-else-if="name === 'settings'"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.36.14.68.36.95.63"/></template>
    <template v-else-if="name === 'trend-up'"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></template>
    <template v-else-if="name === 'trend-down'"><path d="M3 7l6 6 4-4 8 8"/><path d="M15 17h6v-6"/></template>
    <template v-else-if="name === 'alert'"><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></template>
    <template v-else-if="name === 'plus'"><path d="M12 5v14M5 12h14"/></template>
    <template v-else-if="name === 'search'"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></template>
    <template v-else-if="name === 'trash'"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></template>
    <template v-else-if="name === 'close'"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></template>
    <template v-else-if="name === 'upload'"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 15v3a2 2 0 002 2h10a2 2 0 002-2v-3"/></template>
    <template v-else-if="name === 'image'"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/></template>
    <template v-else-if="name === 'check'"><path d="M20 6L9 17l-5-5"/></template>
    <template v-else-if="name === 'more'"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></template>
    <template v-else-if="name === 'logout'"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></template>
    <template v-else-if="name === 'store'"><path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.7 2.7 0 005.3 0 2.7 2.7 0 005.4 0A2.7 2.7 0 0020 9"/><path d="M5 12v8h14v-8"/></template>
    <template v-else-if="name === 'chevron'"><path d="M9 6l6 6-6 6"/></template>
  </svg>
</template>
<script setup>
defineProps({ name: String });
</script>
