<template>
  <div class="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
    <div class="border-b border-white/10 px-4 py-3 text-sm font-medium text-white">{{ title }}</div>
    <div class="overflow-x-auto">
    <table class="w-full min-w-[760px] text-left text-sm">
      <thead class="bg-white/5 text-slate-400">
        <tr>
          <th v-for="column in columns" :key="column.key" class="px-4 py-3 font-medium">{{ column.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.name" class="border-t border-white/5 text-slate-200 hover:bg-white/5">
          <td v-for="column in columns" :key="column.key" class="px-4 py-3">
            <StatusBadge v-if="column.type === 'status'" :value="row[column.key]" />
            <span v-else>{{ formatCell(row, column) }}</span>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-slate-500">No records</td>
        </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'

defineProps({ title: String, columns: Array, rows: Array })

function formatCell(row, column) {
  const value = row[column.key]
  if (value === undefined || value === null || value === '') return '-'
  return `${value}${column.suffix || ''}`
}
</script>
