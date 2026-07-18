<template>
  <div class="space-y-6">
    <PageHeader :eyebrow="eyebrow" :title="title" :description="description">
      <template #actions>
        <div class="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-400">
          {{ rows.length }} records
        </div>
        <button class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400">
          New {{ singularTitle }}
        </button>
      </template>
    </PageHeader>

    <RecordsTable :title="`${title} Records`" :columns="columns" :rows="rows" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import RecordsTable from '../components/RecordsTable.vue'

const props = defineProps({
  eyebrow: { type: String, default: 'Records' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
})

const singularTitle = computed(() => props.title.replace(/s$/, ''))
</script>
