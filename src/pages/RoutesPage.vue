<template>
  <div class="space-y-6">
    <PageHeader
      eyebrow="Route Network"
      title="Routes & Distance"
      description="City-to-city routes powered by KSA City links. Distance is auto-filled server-side using Haversine coordinates."
    >
      <template #actions>
        <div class="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-400">
          {{ activeRoutes }} active routes
        </div>
        <button class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400" @click="openCreate">New Route</button>
      </template>
    </PageHeader>

    <div class="grid gap-4 md:grid-cols-3">
      <div class="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Total Distance</div>
        <div class="mt-2 text-3xl font-semibold text-white">{{ totalDistance }} km</div>
      </div>
      <div class="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Longest Route</div>
        <div class="mt-2 text-lg font-semibold text-white">{{ longestRoute?.route_title || '-' }}</div>
        <div class="mt-1 text-sm text-slate-400">{{ longestRoute?.distance_km || 0 }} km</div>
      </div>
      <div class="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div class="text-xs uppercase tracking-[0.25em] text-slate-500">City Links</div>
        <div class="mt-2 text-3xl font-semibold text-white">{{ rows.length }}</div>
      </div>
    </div>

    <RecordsTable title="Route Records" :columns="columns" :rows="rows" @select="openDetail" />

    <div v-if="selectedRow" class="fixed inset-0 z-40 flex items-end bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center" @click.self="selectedRow = null">
      <section class="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Route Detail</div>
            <h2 class="mt-1 text-xl font-semibold text-white">{{ selectedRow.route_title || selectedRow.name }}</h2>
          </div>
          <button class="rounded-xl border border-white/10 px-3 py-1 text-sm text-slate-300 hover:bg-white/5" @click="selectedRow = null">Close</button>
        </div>
        <dl class="mt-5 grid gap-3 sm:grid-cols-2">
          <div v-for="column in columns" :key="column.key" class="rounded-2xl border border-white/10 bg-white/5 p-3">
            <dt class="text-xs uppercase tracking-[0.2em] text-slate-500">{{ column.label }}</dt>
            <dd class="mt-1 break-words text-sm text-slate-100">{{ selectedRow[column.key] || '-' }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <div v-if="showCreate" class="fixed inset-0 z-40 flex items-end bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center" @click.self="closeCreate">
      <form class="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl" @submit.prevent="submitCreate">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs uppercase tracking-[0.25em] text-slate-500">New Route</div>
            <h2 class="mt-1 text-xl font-semibold text-white">Create draft route</h2>
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

const props = defineProps({ rows: { type: Array, required: true } })
const emit = defineEmits(['create'])
const selectedRow = ref(null)
const showCreate = ref(false)
const draft = ref({})

const columns = [
  { label: 'Route', key: 'route_title' },
  { label: 'Source', key: 'source' },
  { label: 'Destination', key: 'destination' },
  { label: 'Distance', key: 'distance_km', suffix: ' km' },
  { label: 'Duration', key: 'estimated_duration_minutes', suffix: ' min' },
  { label: 'Status', key: 'status', type: 'status' },
]

const activeRoutes = computed(() => props.rows.filter((row) => String(row.status || '').toLowerCase() === 'active').length)
const totalDistance = computed(() => props.rows.reduce((sum, row) => sum + Number(row.distance_km || 0), 0).toFixed(1))
const longestRoute = computed(() => [...props.rows].sort((a, b) => Number(b.distance_km || 0) - Number(a.distance_km || 0))[0])
const editableColumns = computed(() => columns.filter((column) => !['distance_km', 'estimated_duration_minutes'].includes(column.key)))

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
  emit('create', { ...draft.value, name: `draft-route-${Date.now()}`, distance_km: 0, estimated_duration_minutes: 0 })
  closeCreate()
}
</script>
