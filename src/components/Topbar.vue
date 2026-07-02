<template>
  <header class="flex items-center justify-between gap-4 border-b border-white/10 bg-slate-950/70 px-6 py-4 backdrop-blur-xl">
    <div>
      <div class="text-xs uppercase tracking-[0.35em] text-slate-500">Company dashboard</div>
      <h1 class="text-2xl font-semibold text-white">{{ title }}</h1>
    </div>

    <div class="flex items-center gap-3">
      <select v-model="modelValueProxy" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none">
        <option v-for="company in companies" :key="company.name" :value="company.name">{{ company.company_name }}</option>
      </select>
      <button class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">Export</button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ title: String, companies: Array, modelValue: String })
const emit = defineEmits(['update:modelValue'])

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>
