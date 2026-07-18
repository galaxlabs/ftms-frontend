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
        <button class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400">New Route</button>
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

    <RecordsTable title="Route Records" :columns="columns" :rows="rows" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import RecordsTable from '../components/RecordsTable.vue'

const props = defineProps({ rows: { type: Array, required: true } })

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
</script>
