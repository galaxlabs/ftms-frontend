<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-soft">
    <div class="text-sm text-slate-400">{{ label }}</div>
    <div class="mt-2 text-3xl font-semibold text-white">{{ value }}</div>
    <div class="mt-1 text-xs text-slate-500">{{ hint }}</div>
  </div>
</template>

<script setup>
defineProps({ label: String, value: [String, Number], hint: String })
</script>
