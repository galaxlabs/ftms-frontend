<template>
  <div class="space-y-6">
    <PageHeader
      eyebrow="TripScanner"
      title="Create Trip From Documents"
      description="Upload passenger documents, review the child-table rows, then create an FTMS trip under your linked company."
    />

    <div class="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <section class="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs uppercase tracking-[0.25em] text-blue-200">Document Upload</div>
            <h2 class="mt-1 text-2xl font-black text-white">Scan passenger files</h2>
            <p class="mt-2 text-sm leading-6 text-slate-400">Use camera or batch upload. AI OCR runs when you are logged in; filename/manual fallback remains available.</p>
          </div>
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 text-2xl text-white">▣</div>
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <button class="rounded-2xl bg-blue-500 px-4 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition active:scale-[0.98] disabled:opacity-60" :disabled="queue.scanning" @click="cameraInput?.click()">Open camera</button>
          <button class="relative overflow-hidden rounded-2xl bg-white px-4 py-4 text-sm font-black uppercase tracking-[0.16em] text-slate-950 transition active:scale-[0.98] disabled:opacity-60" :disabled="queue.scanning" @click="fileInput?.click()">
            <span v-if="!queue.scanning">Batch upload</span>
            <span v-else>Scanning {{ queue.processed }}/{{ queue.total }}</span>
            <span v-if="queue.scanning" class="absolute bottom-0 left-0 h-1 bg-blue-500" :style="{ width: `${progress}%` }"></span>
          </button>
        </div>

        <input ref="cameraInput" class="hidden" type="file" accept="image/*" capture="environment" @change="handleFiles" />
        <input ref="fileInput" class="hidden" type="file" accept="image/*,.pdf,application/pdf" multiple @change="handleFiles" />

        <div class="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <div class="text-xs uppercase tracking-[0.2em] text-slate-500">Manual passenger</div>
          <div class="mt-3 grid gap-3">
            <input v-model="manual.passenger_name" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-300" placeholder="Passenger name" />
            <input v-model="manual.document_number" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-300" placeholder="Passport / ID" />
            <input v-model="manual.nationality" class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-300" placeholder="Nationality" />
          </div>
          <button class="mt-3 w-full rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5" @click="addManual">Add passenger row</button>
        </div>

        <div v-if="message" class="mt-4 rounded-2xl border px-4 py-3 text-sm" :class="messageError ? 'border-amber-400/30 bg-amber-400/10 text-amber-100' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'">{{ message }}</div>
      </section>

      <section class="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Trip form</div>
            <h2 class="mt-1 text-2xl font-black text-white">Trip and passenger child table</h2>
          </div>
          <span class="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-200">{{ passengers.length }} passenger(s)</span>
        </div>

        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <label class="space-y-2 text-sm text-slate-300"><span>Trip title</span><input v-model="form.trip_title" class="field" placeholder="Kashf Trip" /></label>
          <label class="space-y-2 text-sm text-slate-300"><span>Trip date</span><input v-model="form.trip_date" type="date" class="field" /></label>
          <label class="space-y-2 text-sm text-slate-300"><span>Route</span><select v-model="form.route" class="field"><option value="">No route yet</option><option v-for="route in routes" :key="route.name" :value="route.name">{{ route.route_title || route.name }}</option></select></label>
          <label class="space-y-2 text-sm text-slate-300"><span>Vehicle</span><select v-model="form.vehicle" class="field"><option value="">No vehicle yet</option><option v-for="vehicle in vehicles" :key="vehicle.name" :value="vehicle.name">{{ vehicle.vehicle_name || vehicle.plate_no || vehicle.name }}</option></select></label>
          <label class="space-y-2 text-sm text-slate-300"><span>Captain</span><select v-model="form.assigned_captain_user" class="field"><option value="">No captain yet</option><option v-for="captain in captains" :key="captain.user || captain.name" :value="captain.user">{{ captain.full_name || captain.user }}</option></select></label>
          <label class="space-y-2 text-sm text-slate-300"><span>Status</span><select v-model="form.status" class="field"><option>Draft</option><option>Scheduled</option></select></label>
        </div>

        <label class="mt-4 block space-y-2 text-sm text-slate-300"><span>Notes</span><textarea v-model="form.notes" class="field min-h-20" placeholder="Optional trip notes"></textarea></label>

        <div class="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div class="grid grid-cols-[36px_1fr_0.8fr_0.65fr_0.65fr_44px] bg-white/[0.04] px-3 py-3 text-xs uppercase tracking-[0.14em] text-slate-500">
            <span>#</span><span>Name</span><span>Document</span><span>Type</span><span>Nationality</span><span></span>
          </div>
          <div v-for="(row, index) in passengers" :key="row.key" class="grid grid-cols-[36px_1fr_0.8fr_0.65fr_0.65fr_44px] gap-2 border-t border-white/10 px-3 py-3 text-sm">
            <span class="py-2 text-slate-500">{{ index + 1 }}</span>
            <input v-model="row.passenger_name" class="mini-field" placeholder="Name" />
            <input v-model="row.document_number" class="mini-field" placeholder="Document" />
            <select v-model="row.document_type" class="mini-field"><option>Passport</option><option>National ID</option><option>Residency</option><option>Visa</option><option>Other</option></select>
            <input v-model="row.nationality" class="mini-field" placeholder="Nationality" />
            <button class="rounded-lg border border-white/10 text-xs text-slate-300 hover:bg-white/5" @click="passengers.splice(index, 1)">×</button>
          </div>
          <div v-if="!passengers.length" class="px-4 py-8 text-center text-sm text-slate-500">Upload documents or add passenger manually to create child rows.</div>
        </div>

        <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button class="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5" @click="resetForm">Reset</button>
          <button class="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-emerald-300 disabled:opacity-60" :disabled="saving" @click="saveTrip">{{ saving ? 'Creating...' : 'Create Trip' }}</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { api } from '../lib/api'

const props = defineProps({ selectedCompany: { type: String, default: '' } })

const today = new Date().toISOString().slice(0, 10)
const form = ref({ trip_title: 'Kashf Trip', trip_date: today, route: '', vehicle: '', assigned_captain_user: '', status: 'Draft', notes: '' })
const passengers = ref([])
const manual = ref({ passenger_name: '', document_number: '', nationality: '' })
const routes = ref([])
const vehicles = ref([])
const captains = ref([])
const cameraInput = ref(null)
const fileInput = ref(null)
const message = ref('')
const messageError = ref(false)
const saving = ref(false)
const queue = ref({ scanning: false, total: 0, processed: 0 })
const progress = computed(() => queue.value.total ? Math.round((queue.value.processed / queue.value.total) * 100) : 0)

onMounted(loadLookups)

async function loadLookups() {
  const company = props.selectedCompany || undefined
  const [routeRows, vehicleRows, captainRows] = await Promise.all([
    api.routes(company, 100).catch(() => []),
    api.vehicles(company, 100).catch(() => []),
    api.captains(company, 100).catch(() => []),
  ])
  routes.value = routeRows
  vehicles.value = vehicleRows
  captains.value = captainRows
}

async function handleFiles(event) {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (!files.length) return
  queue.value = { scanning: true, total: files.length, processed: 0 }
  message.value = ''
  const rows = []
  for (const file of files) {
    rows.push(...await extractFile(file))
    queue.value = { ...queue.value, processed: queue.value.processed + 1 }
  }
  addPassengers(rows)
  queue.value = { ...queue.value, scanning: false }
  messageError.value = !rows.length
  message.value = rows.length ? `Added ${rows.length} passenger row(s).` : 'No rows detected. Use manual entry or filename NAME-PASSPORT-NATIONALITY.'
}

async function extractFile(file) {
  if (file.type?.startsWith('image/')) {
    try {
      const fileData = await readFileAsDataUrl(file)
      const result = await api.extractPassengerDocument(fileData, file.type)
      const rows = Array.isArray(result?.passengers) ? result.passengers : []
      if (rows.length) return rows.map((row) => normalizePassenger({ ...row, source: 'OCR' }))
    } catch {}
  }
  return filenamePassenger(file.name)
}

function filenamePassenger(name) {
  const parts = name.replace(/\.[^.]+$/, '').replace(/[_]+/g, '-').split('-').map((part) => part.trim()).filter(Boolean)
  if (parts.length < 2) return []
  return [normalizePassenger({ passenger_name: titleCase(parts[0]), document_number: parts[1], nationality: parts[2] || '', source: 'OCR' })]
}

function normalizePassenger(row) {
  return {
    key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    passenger_name: String(row.passenger_name || row.name || '').trim(),
    document_number: String(row.document_number || row.passport || '').trim(),
    document_type: normalizeDocumentType(row.document_type),
    nationality: String(row.nationality || '').trim(),
    mobile_no: row.mobile_no || '',
    luggage_qty: row.luggage_qty || 0,
    source: row.source || 'OCR',
  }
}

function normalizeDocumentType(value) {
  const text = String(value || '').toLowerCase()
  if (text.includes('national')) return 'National ID'
  if (text.includes('iqama') || text.includes('resid')) return 'Residency'
  if (text.includes('visa')) return 'Visa'
  if (text.includes('other')) return 'Other'
  return 'Passport'
}

function addPassengers(rows) {
  const seen = new Set(passengers.value.map((row) => `${row.document_number}|${row.passenger_name.toLowerCase()}`))
  rows.filter(Boolean).forEach((row) => {
    if (!row.passenger_name && !row.document_number) return
    const key = `${row.document_number}|${row.passenger_name.toLowerCase()}`
    if (seen.has(key)) return
    seen.add(key)
    passengers.value.push(row)
  })
}

function addManual() {
  addPassengers([normalizePassenger({ ...manual.value, source: 'Manual' })])
  manual.value = { passenger_name: '', document_number: '', nationality: '' }
}

async function saveTrip() {
  saving.value = true
  message.value = ''
  messageError.value = false
  try {
    const result = await api.createTripWithPassengers({ ...form.value, company: props.selectedCompany, passengers: passengers.value })
    message.value = `Trip ${result.name} created with ${result.passenger_count} passenger(s).`
    resetForm(false)
  } catch (error) {
    messageError.value = true
    message.value = String(error?.message || error || 'Could not create trip')
  } finally {
    saving.value = false
  }
}

function resetForm(clearMessage = true) {
  form.value = { trip_title: 'Kashf Trip', trip_date: today, route: '', vehicle: '', assigned_captain_user: '', status: 'Draft', notes: '' }
  passengers.value = []
  if (clearMessage) message.value = ''
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
</script>

<style scoped>
.field { @apply w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-300; }
.mini-field { @apply min-w-0 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-white outline-none focus:border-blue-300; }
</style>
