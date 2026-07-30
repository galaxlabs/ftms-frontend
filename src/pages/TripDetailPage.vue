<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <!-- Top bar -->
    <header class="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="/" class="text-sm text-slate-400 hover:text-white">&larr; FTMS</a>
        <button v-if="trip" @click="printKashf" class="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
          Print Kashf
        </button>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="mx-auto max-w-4xl px-4 py-32 text-center sm:px-6">
      <div class="text-5xl">🔍</div>
      <h1 class="mt-4 text-2xl font-semibold text-white">Trip not found</h1>
      <p class="mt-2 text-slate-400">{{ error }}</p>
    </div>

    <!-- Trip Detail -->
    <div v-else-if="trip" class="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <!-- Header Card -->
      <div class="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-5 sm:p-8">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Trip Detail</div>
            <h1 class="mt-1 text-2xl font-bold sm:text-3xl">{{ trip.trip_title || 'Trip' }}</h1>
            <p v-if="trip.trip_date" class="mt-1 text-slate-400">{{ formatDate(trip.trip_date) }}</p>
          </div>
          <span class="mt-2 self-start rounded-full px-3 py-1 text-xs font-medium sm:mt-0" :class="statusClass(trip.trip_status)">
            {{ trip.trip_status || 'Draft' }}
          </span>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <!-- Route -->
        <div class="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500">Route</h3>
          <div class="mt-3 space-y-2">
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-emerald-400" />
              <span class="text-sm">{{ trip.from_city || trip.from_location || 'Origin' }}</span>
            </div>
            <div class="ml-1 h-6 w-0.5 border-l border-dashed border-slate-600" />
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-rose-400" />
              <span class="text-sm">{{ trip.to_city || trip.to_location || 'Destination' }}</span>
            </div>
          </div>
          <div v-if="trip.estimated_distance_km" class="mt-3 text-xs text-slate-500">{{ trip.estimated_distance_km }} km</div>
        </div>

        <!-- Schedule -->
        <div class="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500">Schedule</h3>
          <dl class="mt-3 space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-slate-400">Date</dt>
              <dd>{{ trip.trip_date || '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-slate-400">Departure</dt>
              <dd>{{ trip.departure_time?.slice(0, 5) || trip.estimated_departure_time?.slice(0, 5) || '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-slate-400">Arrival</dt>
              <dd>{{ trip.arrival_time?.slice(0, 5) || trip.estimated_arrival_time?.slice(0, 5) || '—' }}</dd>
            </div>
          </dl>
        </div>

        <!-- Captain -->
        <div class="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500">Captain</h3>
          <div v-if="trip.captain" class="mt-3 space-y-1 text-sm">
            <p class="font-medium">{{ trip.captain.full_name || trip.captain_name || '—' }}</p>
            <p v-if="trip.captain.mobile_no" class="text-slate-400">{{ trip.captain.mobile_no }}</p>
          </div>
          <p v-else class="mt-3 text-sm text-slate-500">Not assigned</p>
        </div>

        <!-- Vehicle -->
        <div class="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500">Vehicle</h3>
          <div v-if="trip.vehicle" class="mt-3 space-y-1 text-sm">
            <p class="font-medium">{{ trip.vehicle.vehicle_name || trip.vehicle_name || '—' }}</p>
            <p v-if="trip.vehicle.plate_no" class="text-slate-400">{{ trip.vehicle.plate_no }}</p>
            <p v-if="trip.vehicle.vehicle_model" class="text-xs text-slate-500">{{ trip.vehicle.vehicle_model }}</p>
          </div>
          <p v-else class="mt-3 text-sm text-slate-500">Not assigned</p>
        </div>

        <!-- Company -->
        <div v-if="trip.company" class="rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:col-span-2">
          <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500">Company</h3>
          <div class="mt-3 space-y-1 text-sm">
            <p class="font-medium">{{ trip.company.company_name || trip.company_name || '—' }}</p>
            <p v-if="trip.company.vat_no" class="text-slate-400">VAT: {{ trip.company.vat_no }}</p>
            <p v-if="trip.company.cr_no" class="text-slate-400">CR: {{ trip.company.cr_no }}</p>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="trip.notes" class="rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:col-span-2">
          <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500">Notes</h3>
          <p class="mt-3 text-sm text-slate-300">{{ trip.notes }}</p>
        </div>
      </div>

      <!-- Passengers -->
      <div v-if="trip.passengers?.length" class="mt-4">
        <div class="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500">Passengers ({{ trip.passengers.length }})</h3>
          <div class="mt-3 divide-y divide-white/5">
            <div v-for="p in trip.passengers" :key="p.name" class="flex items-center justify-between py-2 text-sm">
              <div>
                <p class="font-medium">{{ p.passenger_name || p.full_name || p.name }}</p>
                <p v-if="p.mobile_no" class="text-xs text-slate-500">{{ p.mobile_no }}</p>
              </div>
              <span class="rounded-full px-2.5 py-0.5 text-xs" :class="p.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-400'">
                {{ p.status || 'Pending' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="border-t border-white/10 py-6 text-center text-xs text-slate-600">
      FTMS — Fleet Transportation Management System
    </footer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../lib/api'

const route = useRoute()
const trip = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    trip.value = await api.getPublicTrip(route.params.uuid)
  } catch (err) {
    error.value = String(err?.message || err || 'Trip not found')
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('en-SA', { dateStyle: 'long' }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

function statusClass(status) {
  const map = {
    Scheduled: 'bg-blue-500/20 text-blue-300',
    'In Progress': 'bg-amber-500/20 text-amber-300',
    Completed: 'bg-emerald-500/20 text-emerald-300',
    Cancelled: 'bg-rose-500/20 text-rose-300',
    Draft: 'bg-slate-500/20 text-slate-300',
  }
  return map[status] || 'bg-slate-500/20 text-slate-300'
}

function printKashf() {
  if (!trip.value) return
  const el = document.createElement('div')
  el.innerHTML = `
    <html>
    <head>
      <title>Kashf — ${trip.value.trip_title || 'Trip'}</title>
      <style>
        body { font-family: 'Arial', sans-serif; padding: 40px; color: #222; direction: ltr; }
        h1 { font-size: 24px; margin: 0 0 4px; }
        .sub { color: #666; font-size: 13px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; font-size: 13px; }
        th { background: #f5f5f5; font-weight: 600; }
        .section { margin-top: 24px; }
        .section h2 { font-size: 16px; border-bottom: 2px solid #333; padding-bottom: 4px; margin: 0 0 8px; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; border: 1px solid #ccc; }
        .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 11px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <h1>${trip.value.trip_title || 'Trip'} <span class="badge">${trip.value.trip_status || 'Draft'}</span></h1>
      <div class="sub">${trip.value.trip_date || ''}</div>

      <div class="section">
        <h2>Trip Information</h2>
        <table>
          <tr><th style="width:160px">Route</th><td>${trip.value.from_city || trip.value.from_location || '—'} → ${trip.value.to_city || trip.value.to_location || '—'}</td></tr>
          <tr><th>Distance</th><td>${trip.value.estimated_distance_km ? trip.value.estimated_distance_km + ' km' : '—'}</td></tr>
          <tr><th>Departure</th><td>${trip.value.departure_time?.slice(0,5) || trip.value.estimated_departure_time?.slice(0,5) || '—'}</td></tr>
          <tr><th>Arrival</th><td>${trip.value.arrival_time?.slice(0,5) || trip.value.estimated_arrival_time?.slice(0,5) || '—'}</td></tr>
          ${trip.value.notes ? `<tr><th>Notes</th><td>${trip.value.notes}</td></tr>` : ''}
        </table>
      </div>

      <div class="section">
        <h2>Vehicle</h2>
        <table>
          <tr><th style="width:160px">Vehicle</th><td>${trip.value.vehicle?.vehicle_name || trip.value.vehicle_name || '—'}</td></tr>
          <tr><th>Plate</th><td>${trip.value.vehicle?.plate_no || trip.value.plate_no || '—'}</td></tr>
          <tr><th>Model</th><td>${trip.value.vehicle?.vehicle_model || trip.value.vehicle_model || '—'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Captain</h2>
        <table>
          <tr><th style="width:160px">Name</th><td>${trip.value.captain?.full_name || trip.value.captain_name || '—'}</td></tr>
          <tr><th>Mobile</th><td>${trip.value.captain?.mobile_no || trip.value.captain_mobile || '—'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Company</h2>
        <table>
          <tr><th style="width:160px">Name</th><td>${trip.value.company?.company_name || trip.value.company_name || '—'}</td></tr>
          <tr><th>VAT</th><td>${trip.value.company?.vat_no || trip.value.vat_no || '—'}</td></tr>
          <tr><th>CR</th><td>${trip.value.company?.cr_no || trip.value.cr_no || '—'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Passengers (${(trip.value.passengers || []).length})</h2>
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Mobile</th><th>Status</th></tr></thead>
          <tbody>
            ${(trip.value.passengers || []).map((p, i) => `<tr>
              <td>${i + 1}</td>
              <td>${p.passenger_name || p.full_name || p.name}</td>
              <td>${p.mobile_no || '—'}</td>
              <td>${p.status || 'Pending'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        Generated by FTMS — ${new Date().toLocaleDateString('en-SA', { dateStyle: 'long' })}
      </div>
    </body>
    </html>
  `
  const win = window.open('', '_blank')
  win.document.write(el.innerHTML)
  win.document.close()
  win.print()
}
</script>
