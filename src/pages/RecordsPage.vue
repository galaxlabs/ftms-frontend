<template>
  <div class="space-y-6">
    <PageHeader :eyebrow="eyebrow" :title="title" :description="description">
      <template #actions>
        <div class="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-400">
          {{ rows.length }} records
        </div>
        <button class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400" @click="openCreate">
          New {{ singularTitle }}
        </button>
      </template>
    </PageHeader>

    <RecordsTable :title="`${title} Records`" :columns="columns" :rows="rows" @select="openDetail" />

    <div v-if="selectedRow" class="fixed inset-0 z-40 flex items-end bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center" @click.self="selectedRow = null">
      <section class="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs uppercase tracking-[0.25em] text-slate-500">{{ singularTitle }} Detail</div>
            <h2 class="mt-1 text-xl font-semibold text-white">{{ selectedRow.name || selectedRow[columns[0]?.key] }}</h2>
          </div>
          <button class="rounded-xl border border-white/10 px-3 py-1 text-sm text-slate-300 hover:bg-white/5" @click="selectedRow = null">Close</button>
        </div>

        <dl class="mt-5 grid gap-3 sm:grid-cols-2">
          <div v-for="field in detailFields" :key="field.key" class="rounded-2xl border border-white/10 bg-white/5 p-3">
            <dt class="text-xs uppercase tracking-[0.2em] text-slate-500">{{ field.label }}</dt>
            <dd class="mt-1 break-words text-sm text-slate-100">{{ formatValue(selectedRow[field.key]) }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <div v-if="showCreate" class="fixed inset-0 z-40 flex items-end bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center" @click.self="closeCreate">
      <form class="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl" @submit.prevent="submitCreate">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs uppercase tracking-[0.25em] text-slate-500">New {{ singularTitle }}</div>
            <h2 class="mt-1 text-xl font-semibold text-white">Create draft record</h2>
          </div>
          <button type="button" class="rounded-xl border border-white/10 px-3 py-1 text-sm text-slate-300 hover:bg-white/5" @click="closeCreate">Close</button>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label v-for="column in editableColumns" :key="column.key" class="space-y-2 text-sm text-slate-300">
            <span>{{ column.label }}</span>
            <input v-model="draft[column.key]" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" :placeholder="column.label" />
          </label>
        </div>

        <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5" @click="closeCreate">Cancel</button>
          <button type="submit" class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400">Add draft</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import RecordsTable from '../components/RecordsTable.vue'

const props = defineProps({
  eyebrow: { type: String, default: 'Records' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
})

const emit = defineEmits(['create'])
const selectedRow = ref(null)
const showCreate = ref(false)
const draft = ref({})
const singularTitle = computed(() => props.title.replace(/s$/, ''))
const editableColumns = computed(() => props.columns.filter((column) => column.key !== 'name'))
const detailFields = computed(() => {
  const known = props.columns.map((column) => ({ key: column.key, label: column.label }))
  const extras = Object.keys(selectedRow.value || {})
    .filter((key) => !known.some((field) => field.key === key))
    .map((key) => ({ key, label: key.replace(/_/g, ' ') }))
  return [...known, ...extras]
})

function openDetail(row) {
  selectedRow.value = row
}

function openCreate() {
  draft.value = Object.fromEntries(editableColumns.value.map((column) => [column.key, '']))
  showCreate.value = true
}

function closeCreate() {
  showCreate.value = false
  draft.value = {}
}

function submitCreate() {
  emit('create', { ...draft.value, name: `draft-${Date.now()}` })
  closeCreate()
}

function formatValue(value) {
  if (value === undefined || value === null || value === '') return '-'
  return typeof value === 'object' ? JSON.stringify(value) : value
}
</script>
