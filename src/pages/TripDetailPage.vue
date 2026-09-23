<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <!-- Top bar -->
    <header class="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="/" class="text-sm text-slate-400 hover:text-white">&larr; FTMS</a>
        <button v-if="tripInfo" @click="printKashf" class="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
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
    <div v-else-if="tripInfo" class="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <!-- Header Card -->
      <div class="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-5 sm:p-8">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Trip Detail</div>
            <h1 class="mt-1 text-2xl font-bold sm:text-3xl">{{ tripInfo.trip_title || tripInfo.title || 'Trip' }}</h1>
            <p v-if="tripInfo.trip_date || tripInfo.date" class="mt-1 text-slate-400">{{ formatDate(tripInfo.trip_date || tripInfo.date) }}</p>
          </div>
          <span class="mt-2 self-start rounded-full px-3 py-1 text-xs font-medium sm:mt-0" :class="statusClass(tripInfo.trip_status || tripInfo.status)">
            {{ tripInfo.trip_status || tripInfo.status || 'Draft' }}
          </span>
        </div>
      </div>

      <!-- TripScanner Tools -->
      <div class="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <section class="rounded-[1.75rem] border border-blue-400/20 bg-blue-500/10 p-5 shadow-xl shadow-blue-950/20">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-xs uppercase tracking-[0.25em] text-blue-200/80">TripScanner</div>
              <h2 class="mt-1 text-2xl font-black">Document scan</h2>
              <p class="mt-2 text-sm leading-6 text-blue-100/70">Capture passport, Iqama, ID, or passenger sheet images and stage extracted passengers before adding them to the Kashf list.</p>
            </div>
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-2xl shadow-lg shadow-blue-900/40">▣</div>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <button class="rounded-2xl bg-blue-500 px-4 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition active:scale-[0.98] disabled:opacity-60" :disabled="scanQueue.scanning" @click="cameraInput?.click()">
              Open camera
            </button>
            <button class="relative overflow-hidden rounded-2xl bg-slate-50 px-4 py-4 text-sm font-black uppercase tracking-[0.16em] text-slate-950 transition active:scale-[0.98] disabled:opacity-60" :disabled="scanQueue.scanning" @click="fileInput?.click()">
              <span v-if="!scanQueue.scanning">Batch upload</span>
              <span v-else>Scanning {{ scanQueue.processed }}/{{ scanQueue.total }}</span>
              <span v-if="scanQueue.scanning" class="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all" :style="{ width: `${scanProgress}%` }"></span>
            </button>
          </div>
          <input ref="cameraInput" class="hidden" type="file" accept="image/*" capture="environment" @change="handleScanFiles" />
          <input ref="fileInput" class="hidden" type="file" accept="image/*,.pdf,application/pdf" multiple @change="handleScanFiles" />

          <div class="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-500">Manual fallback</div>
            <div class="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <input v-model="manualPassenger.passenger_name" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-blue-300" placeholder="Passenger name" />
              <input v-model="manualPassenger.document_number" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-blue-300" placeholder="Passport / ID" />
              <input v-model="manualPassenger.nationality" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-blue-300" placeholder="Nationality" />
            </div>
            <button class="mt-3 w-full rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5" @click="addManualPassenger">Add to scanned list</button>
          </div>
        </section>

        <section class="rounded-[1.75rem] border border-white/10 bg-slate-900/50 p-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Passenger manifest</div>
              <h2 class="mt-1 text-2xl font-black">Kashf passenger list</h2>
            </div>
            <div class="flex gap-2">
              <button class="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5" @click="mergeScannedPassengers" :disabled="!scannedPassengers.length">Merge scanned</button>
              <button class="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5" @click="printKashf">Print Kashf</button>
            </div>
          </div>

          <div v-if="scanMessage" class="mt-4 rounded-2xl border px-4 py-3 text-sm" :class="scanError ? 'border-amber-400/30 bg-amber-400/10 text-amber-100' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'">{{ scanMessage }}</div>

          <div v-if="scannedPassengers.length" class="mt-4 rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4">
            <div class="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Scanned preview</div>
            <div class="space-y-2">
              <div v-for="(p, index) in scannedPassengers" :key="p.key" class="grid gap-2 rounded-xl bg-slate-950/50 p-3 text-sm sm:grid-cols-[1fr_0.8fr_0.7fr_auto]">
                <input v-model="p.passenger_name" class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 outline-none" placeholder="Name" />
                <input v-model="p.document_number" class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 outline-none" placeholder="Document" />
                <input v-model="p.nationality" class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 outline-none" placeholder="Nationality" />
                <button class="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/5" @click="scannedPassengers.splice(index, 1)">Remove</button>
              </div>
            </div>
          </div>

          <div class="mt-4 overflow-hidden rounded-2xl border border-white/10">
            <div class="grid grid-cols-[44px_1fr_0.8fr_0.7fr_0.6fr] bg-white/[0.04] px-3 py-3 text-xs uppercase tracking-[0.14em] text-slate-500">
              <span>#</span><span>Name</span><span>Document</span><span>Nationality</span><span>Status</span>
            </div>
            <div v-for="(p, index) in manifestPassengers" :key="p.key || p.name || index" class="grid grid-cols-[44px_1fr_0.8fr_0.7fr_0.6fr] border-t border-white/10 px-3 py-3 text-sm text-slate-300">
              <span class="text-slate-500">{{ index + 1 }}</span>
              <span class="font-semibold text-white">{{ p.passenger_name || p.full_name || p.name || 'Unnamed' }}</span>
              <span>{{ p.document_number || p.id_no || p.passport || '—' }}</span>
              <span>{{ p.nationality || '—' }}</span>
              <span>{{ p.status || 'Pending' }}</span>
            </div>
            <div v-if="!manifestPassengers.length" class="px-4 py-8 text-center text-sm text-slate-500">No passengers yet. Scan documents or add passengers manually.</div>
          </div>
        </section>
      </div>

      <!-- Info Grid -->
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <!-- Route -->
        <div class="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500">Route</h3>
          <div class="mt-3 space-y-2">
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-emerald-400" />
                <span class="text-sm">{{ tripInfo.from_city || tripInfo.from_location || 'Origin' }}</span>
            </div>
            <div class="ml-1 h-6 w-0.5 border-l border-dashed border-slate-600" />
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-rose-400" />
                <span class="text-sm">{{ tripInfo.to_city || tripInfo.to_location || 'Destination' }}</span>
            </div>
          </div>
          <div v-if="tripInfo.estimated_distance_km || tripInfo.distance_km" class="mt-3 text-xs text-slate-500">{{ tripInfo.estimated_distance_km || tripInfo.distance_km }} km</div>
        </div>

        <!-- Schedule -->
        <div class="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500">Schedule</h3>
          <dl class="mt-3 space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-slate-400">Date</dt>
              <dd>{{ tripInfo.trip_date || tripInfo.date || '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-slate-400">Departure</dt>
              <dd>{{ tripInfo.departure_time?.slice(0, 5) || tripInfo.estimated_departure_time?.slice(0, 5) || tripInfo.departure?.slice(11, 16) || '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-slate-400">Arrival</dt>
              <dd>{{ tripInfo.arrival_time?.slice(0, 5) || tripInfo.estimated_arrival_time?.slice(0, 5) || tripInfo.arrival?.slice(11, 16) || '—' }}</dd>
            </div>
          </dl>
        </div>

        <!-- Captain -->
        <div class="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500">Captain</h3>
          <div v-if="captainInfo" class="mt-3 space-y-1 text-sm">
            <p class="font-medium">{{ captainInfo.full_name || captainInfo.name || tripInfo.captain_name || '—' }}</p>
            <p v-if="captainInfo.mobile_no" class="text-slate-400">{{ captainInfo.mobile_no }}</p>
          </div>
          <p v-else class="mt-3 text-sm text-slate-500">Not assigned</p>
        </div>

        <!-- Vehicle -->
        <div class="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500">Vehicle</h3>
          <div v-if="vehicleInfo" class="mt-3 space-y-1 text-sm">
            <p class="font-medium">{{ vehicleInfo.vehicle_name || vehicleInfo.name || tripInfo.vehicle_name || '—' }}</p>
            <p v-if="vehicleInfo.plate_no || vehicleInfo.plate" class="text-slate-400">{{ vehicleInfo.plate_no || vehicleInfo.plate }}</p>
            <p v-if="vehicleInfo.vehicle_model" class="text-xs text-slate-500">{{ vehicleInfo.vehicle_model }}</p>
          </div>
          <p v-else class="mt-3 text-sm text-slate-500">Not assigned</p>
        </div>

        <!-- Company -->
        <div v-if="companyInfo" class="rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:col-span-2">
          <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500">Company</h3>
          <div class="mt-3 space-y-1 text-sm">
            <p class="font-medium">{{ companyInfo.company_name || companyInfo.name || tripInfo.company_name || '—' }}</p>
            <p v-if="companyInfo.vat_no" class="text-slate-400">VAT: {{ companyInfo.vat_no }}</p>
            <p v-if="companyInfo.cr_no" class="text-slate-400">CR: {{ companyInfo.cr_no }}</p>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="tripInfo.notes" class="rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:col-span-2">
          <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500">Notes</h3>
          <p class="mt-3 text-sm text-slate-300">{{ tripInfo.notes }}</p>
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
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../lib/api'

const route = useRoute()
const trip = ref(null)
const loading = ref(true)
const error = ref('')
const cameraInput = ref(null)
const fileInput = ref(null)
const scannedPassengers = ref([])
const manifestDraft = ref([])
const scanMessage = ref('')
const scanError = ref(false)
const scanQueue = ref({ total: 0, processed: 0, scanning: false })
const manualPassenger = ref({ passenger_name: '', document_number: '', nationality: '' })

const tripInfo = computed(() => trip.value?.trip || trip.value)
const passengerRows = computed(() => trip.value?.passengers || tripInfo.value?.passengers || [])
const captainInfo = computed(() => trip.value?.driver || tripInfo.value?.captain || null)
const vehicleInfo = computed(() => trip.value?.vehicle || tripInfo.value?.vehicle || null)
const companyInfo = computed(() => trip.value?.company || tripInfo.value?.company || null)
const manifestPassengers = computed(() => mergeUniquePassengers(passengerRows.value, manifestDraft.value))
const scanProgress = computed(() => scanQueue.value.total ? Math.round((scanQueue.value.processed / scanQueue.value.total) * 100) : 0)

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

function normalizePassenger(input, source = 'manual') {
  const passenger = {
    key: input.key || `${source}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    passenger_name: String(input.passenger_name || input.full_name || input.name || '').trim(),
    document_number: String(input.document_number || input.id_no || input.passport || input.passport_number || '').trim(),
    nationality: String(input.nationality || input.country || '').trim(),
    mobile_no: String(input.mobile_no || input.contact_no || '').trim(),
    status: input.status || 'Scanned',
    source,
  }
  if (!passenger.passenger_name && !passenger.document_number && !passenger.nationality) return null
  return passenger
}

function mergeUniquePassengers(...groups) {
  const result = []
  const seen = new Set()
  groups.flat().forEach((row) => {
    const passenger = normalizePassenger(row, row.source || 'trip')
    if (!passenger) return
    const key = `${passenger.document_number || ''}|${passenger.passenger_name.toLowerCase()}`
    if (seen.has(key)) return
    seen.add(key)
    result.push(passenger)
  })
  return result
}

async function handleScanFiles(event) {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (!files.length) return
  scanQueue.value = { total: files.length, processed: 0, scanning: true }
  scanMessage.value = ''
  scanError.value = false
  const extracted = []
  for (const file of files) {
    extracted.push(...await extractPassengersFromFile(file))
    scanQueue.value = { ...scanQueue.value, processed: scanQueue.value.processed + 1 }
  }
  scannedPassengers.value = mergeUniquePassengers(scannedPassengers.value, extracted)
  scanQueue.value = { ...scanQueue.value, scanning: false }
  scanError.value = true
  scanMessage.value = extracted.length
    ? `Prepared ${extracted.length} passenger row(s). Review before merging into Kashf.`
    : 'No readable passenger data was detected. Log in for AI OCR, add manually, or rename files like NAME-PASSPORT-NATIONALITY.'
}

async function extractPassengersFromFile(file) {
  if (file.type?.startsWith('image/')) {
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const result = await api.extractPassengerDocument(dataUrl, file.type)
      const passengers = Array.isArray(result?.passengers) ? result.passengers : []
      if (passengers.length) {
        return passengers.map((row) => normalizePassenger({ ...row, status: 'Scanned' }, 'ai')).filter(Boolean)
      }
    } catch (error) {
      scanError.value = true
      scanMessage.value = 'AI OCR is unavailable for this scan. Using filename/manual fallback.'
    }
  }
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const cleaned = baseName.replace(/[_]+/g, '-').replace(/\s+/g, ' ').trim()
  const parts = cleaned.split('-').map((part) => part.trim()).filter(Boolean)
  const looksLikeDocument = /pass|iqama|id|visa|passport|doc|pax|passenger/i.test(file.name)
  if (parts.length >= 2) {
    return [normalizePassenger({
      passenger_name: titleCase(parts[0]),
      document_number: parts[1],
      nationality: parts[2] || '',
      status: 'Scanned',
    }, 'scan')].filter(Boolean)
  }
  if (looksLikeDocument) {
    return [normalizePassenger({
      passenger_name: titleCase(parts[0] || 'Scanned Passenger'),
      document_number: '',
      nationality: '',
      status: 'Needs Review',
    }, 'scan')].filter(Boolean)
  }
  return []
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

function titleCase(value) {
  return String(value || '').replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}

function addManualPassenger() {
  const passenger = normalizePassenger(manualPassenger.value, 'manual')
  if (!passenger) {
    scanError.value = true
    scanMessage.value = 'Enter at least a passenger name, document number, or nationality.'
    return
  }
  scannedPassengers.value = mergeUniquePassengers(scannedPassengers.value, [passenger])
  manualPassenger.value = { passenger_name: '', document_number: '', nationality: '' }
  scanError.value = false
  scanMessage.value = 'Passenger added to scanned preview.'
}

function mergeScannedPassengers() {
  manifestDraft.value = mergeUniquePassengers(manifestDraft.value, scannedPassengers.value)
  const count = scannedPassengers.value.length
  scannedPassengers.value = []
  scanError.value = false
  scanMessage.value = `${count} scanned passenger row(s) merged into the Kashf list.`
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
  if (!tripInfo.value) return
  const currentTrip = tripInfo.value
  const currentPassengers = manifestPassengers.value
  const currentVehicle = vehicleInfo.value || {}
  const currentCaptain = captainInfo.value || {}
  const currentCompany = companyInfo.value || {}
  const el = document.createElement('div')
  el.innerHTML = `
    <html>
    <head>
      <title>Kashf — ${currentTrip.trip_title || currentTrip.title || 'Trip'}</title>
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
      <h1>${currentTrip.trip_title || currentTrip.title || 'Trip'} <span class="badge">${currentTrip.trip_status || currentTrip.status || 'Draft'}</span></h1>
      <div class="sub">${currentTrip.trip_date || currentTrip.date || ''}</div>

      <div class="section">
        <h2>Trip Information</h2>
        <table>
          <tr><th style="width:160px">Route</th><td>${currentTrip.from_city || currentTrip.from_location || '—'} → ${currentTrip.to_city || currentTrip.to_location || '—'}</td></tr>
          <tr><th>Distance</th><td>${currentTrip.estimated_distance_km || currentTrip.distance_km ? (currentTrip.estimated_distance_km || currentTrip.distance_km) + ' km' : '—'}</td></tr>
          <tr><th>Departure</th><td>${currentTrip.departure_time?.slice(0,5) || currentTrip.estimated_departure_time?.slice(0,5) || currentTrip.departure?.slice(11,16) || '—'}</td></tr>
          <tr><th>Arrival</th><td>${currentTrip.arrival_time?.slice(0,5) || currentTrip.estimated_arrival_time?.slice(0,5) || currentTrip.arrival?.slice(11,16) || '—'}</td></tr>
          ${currentTrip.notes ? `<tr><th>Notes</th><td>${currentTrip.notes}</td></tr>` : ''}
        </table>
      </div>

      <div class="section">
        <h2>Vehicle</h2>
        <table>
          <tr><th style="width:160px">Vehicle</th><td>${currentVehicle.vehicle_name || currentVehicle.name || currentTrip.vehicle_name || '—'}</td></tr>
          <tr><th>Plate</th><td>${currentVehicle.plate_no || currentVehicle.plate || currentTrip.plate_no || '—'}</td></tr>
          <tr><th>Model</th><td>${currentVehicle.vehicle_model || currentTrip.vehicle_model || '—'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Captain</h2>
        <table>
          <tr><th style="width:160px">Name</th><td>${currentCaptain.full_name || currentCaptain.name || currentTrip.captain_name || '—'}</td></tr>
          <tr><th>Mobile</th><td>${currentCaptain.mobile_no || currentTrip.captain_mobile || '—'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Company</h2>
        <table>
          <tr><th style="width:160px">Name</th><td>${currentCompany.company_name || currentCompany.name || currentTrip.company_name || '—'}</td></tr>
          <tr><th>VAT</th><td>${currentCompany.vat_no || currentTrip.vat_no || '—'}</td></tr>
          <tr><th>CR</th><td>${currentCompany.cr_no || currentTrip.cr_no || '—'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Passengers (${currentPassengers.length})</h2>
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Document</th><th>Nationality</th><th>Status</th></tr></thead>
          <tbody>
            ${currentPassengers.map((p, i) => `<tr>
              <td>${i + 1}</td>
              <td>${p.passenger_name || p.full_name || p.name}</td>
              <td>${p.document_number || p.id_no || p.passport || '—'}</td>
              <td>${p.nationality || '—'}</td>
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
