<template>
  <span :class="classes">{{ value || 'Unknown' }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ value: [String, Number, Boolean] })

const classes = computed(() => {
  const normalized = String(props.value ?? '').toLowerCase()
  const base = 'inline-flex rounded-full px-2.5 py-1 text-xs font-medium'
  if (['active', 'completed', 'paid', 'approved', 'submitted', '1', 'true'].includes(normalized)) {
    return `${base} bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20`
  }
  if (['draft', 'pending', 'unpaid', 'scheduled'].includes(normalized)) {
    return `${base} bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20`
  }
  if (['cancelled', 'inactive', 'rejected', 'failed', '0', 'false'].includes(normalized)) {
    return `${base} bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/20`
  }
  return `${base} bg-slate-400/10 text-slate-300 ring-1 ring-slate-400/20`
})
</script>
