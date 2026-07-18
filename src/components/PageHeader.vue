<template>
  <section class="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div class="text-xs uppercase tracking-[0.35em] text-blue-300">{{ eyebrow }}</div>
        <h2 class="mt-2 text-2xl font-semibold text-white">{{ title }}</h2>
        <p v-if="description" class="mt-1 max-w-2xl text-sm text-slate-400">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-3">
        <slot name="actions" />
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, default: 'FTMS' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>
