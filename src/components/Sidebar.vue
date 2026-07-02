<template>
  <aside class="w-72 shrink-0 border-r border-white/10 bg-slate-950/80 backdrop-blur-xl">
    <div class="flex h-full flex-col p-4">
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-soft">
        <div class="text-xs uppercase tracking-[0.35em] text-blue-300">FTMS</div>
        <div class="mt-2 text-lg font-semibold text-white">Transportation Admin</div>
        <div class="mt-1 text-sm text-slate-400">Tenant isolated Vue dashboard</div>
      </div>

      <nav class="mt-4 space-y-2 text-sm">
        <button v-for="item in items" :key="item.key" @click="$emit('navigate', item.key)" :class="['flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition', active===item.key ? 'bg-blue-500 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white']">
          <span>{{ item.label }}</span>
          <span class="text-xs opacity-70">{{ item.short }}</span>
        </button>
      </nav>

      <div class="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400">
        <div class="font-medium text-slate-200">Scope</div>
        <div class="mt-1">Company + Transportation domain only.</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({ active: String, items: Array })
defineEmits(['navigate'])
</script>
