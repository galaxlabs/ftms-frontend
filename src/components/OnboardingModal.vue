<template>
  <div class="fixed inset-0 z-50 flex items-end bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center sm:justify-center" @click.self="$emit('close')">
    <div class="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
      <!-- Role Selection -->
      <div v-if="step === 'choose'" class="space-y-5">
        <div>
          <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Getting Started</div>
          <h2 class="mt-1 text-2xl font-semibold text-white">How will you use FTMS?</h2>
          <p class="mt-2 text-sm text-slate-400">Choose your role to get started.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-3">
          <button class="group rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition-all hover:border-blue-400/50 hover:bg-blue-500/5" @click="selectRole('Passenger')">
            <div class="mb-2 text-3xl">🧑</div>
            <div class="text-lg font-semibold text-white group-hover:text-blue-300">I want to travel</div>
            <p class="mt-1 text-sm text-slate-400">Book trips for yourself or groups</p>
          </button>
          <button class="group rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition-all hover:border-amber-400/50 hover:bg-amber-500/5" @click="selectRole('Partner')">
            <div class="mb-2 text-3xl">🤝</div>
            <div class="text-lg font-semibold text-white group-hover:text-amber-300">Become a partner</div>
            <p class="mt-1 text-sm text-slate-400">Register your transport business</p>
          </button>
          <button class="group rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition-all hover:border-emerald-400/50 hover:bg-emerald-500/5" @click="selectRole('Captain')">
            <div class="mb-2 text-3xl">🚗</div>
            <div class="text-lg font-semibold text-white group-hover:text-emerald-300">I am a captain</div>
            <p class="mt-1 text-sm text-slate-400">Drive and accept bookings</p>
          </button>
        </div>
        <div class="flex justify-end">
          <button class="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5" @click="$emit('close')">Skip for now</button>
        </div>
      </div>

      <!-- Passenger Form -->
      <form v-if="step === 'passenger_form'" @submit.prevent="submitPassengerProfile">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Passenger</div>
            <h2 class="mt-1 text-2xl font-semibold text-white">Complete your profile</h2>
          </div>
          <button type="button" class="rounded-xl border border-white/10 px-3 py-1 text-sm text-slate-300 hover:bg-white/5" @click="step = 'choose'">Back</button>
        </div>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="space-y-2 text-sm text-slate-300">
            <span>Full name</span>
            <input v-model="form.full_name" required class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" :placeholder="user?.name || 'Your name'" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>Mobile no.</span>
            <input v-model="form.mobile_no" required class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="+966 5X XXX XXXX" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>Nationality</span>
            <div class="relative">
              <input v-model="form.nationality" @input="searchCountries" @focus="showCountryList = true" @blur="hideCountryListDelayed" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="Type country name..." autocomplete="off" />
              <ul v-if="showCountryList && filteredCountries.length" class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-white/10 bg-slate-800 shadow-xl">
                <li v-for="c in filteredCountries" :key="c.alpha_2" class="cursor-pointer px-3 py-2 text-sm text-slate-200 hover:bg-blue-500/20" @mousedown.prevent="selectCountry(c)">{{ c.country_name }}</li>
              </ul>
            </div>
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>ID type</span>
            <select v-model="form.id_document_type" @change="validateDocNumber" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400">
              <option value="">Select</option>
              <option v-for="dt in docTypes" :key="dt" :value="dt">{{ dt }}</option>
            </select>
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>ID number</span>
            <input v-model="form.id_number" @input="validateDocNumber" class="w-full rounded-xl border px-3 py-2 text-white outline-none focus:border-blue-400" :class="docBorderClass" :placeholder="docPlaceholder" />
            <p v-if="docHint" class="mt-1 text-xs text-slate-400">{{ docHint }}</p>
            <p v-if="docError" class="mt-1 text-xs text-rose-400">{{ docError }}</p>
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>ID expiry</span>
            <input v-model="form.id_expiry_date" type="date" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" />
          </label>
        </div>
        <div v-if="message" class="mt-4 rounded-2xl border px-4 py-3 text-sm" :class="isError ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'">{{ message }}</div>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5" @click="step = 'choose'">Back</button>
          <button type="submit" class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400 disabled:opacity-60" :disabled="loading">{{ loading ? 'Saving...' : 'Continue' }}</button>
        </div>
      </form>

      <!-- Partner: Choose Type -->
      <div v-if="step === 'partner_type'" class="space-y-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Partner Registration</div>
            <h2 class="mt-1 text-2xl font-semibold text-white">What type of partner are you?</h2>
          </div>
          <button type="button" class="rounded-xl border border-white/10 px-3 py-1 text-sm text-slate-300 hover:bg-white/5" @click="step = 'choose'">Back</button>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <button v-for="pt in partnerTypes" :key="pt.value" class="group rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:border-amber-400/50 hover:bg-amber-500/5" @click="partnerForm.partner_type = pt.value; step = 'partner_form'">
            <div class="font-semibold text-white group-hover:text-amber-300">{{ pt.label }}</div>
            <p class="mt-1 text-sm text-slate-400">{{ pt.desc }}</p>
          </button>
        </div>
      </div>

      <!-- Partner Registration Form -->
      <form v-if="step === 'partner_form'" @submit.prevent="submitPartnerProfile">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Partner — {{ partnerForm.partner_type }}</div>
            <h2 class="mt-1 text-2xl font-semibold text-white">Register your business</h2>
          </div>
          <button type="button" class="rounded-xl border border-white/10 px-3 py-1 text-sm text-slate-300 hover:bg-white/5" @click="step = 'partner_type'">Back</button>
        </div>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="space-y-2 text-sm text-slate-300">
            <span>Company name</span>
            <input v-model="partnerForm.company_name" required class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-amber-400" placeholder="Galaxy Transport" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>Legal name</span>
            <input v-model="partnerForm.legal_name" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-amber-400" placeholder="Legal name" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>VAT No / Tax ID</span>
            <input v-model="partnerForm.vat_no" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-amber-400" placeholder="KSA VAT number" @blur="lookupPartnerCompany" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>CR No</span>
            <input v-model="partnerForm.cr_no" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-amber-400" placeholder="Commercial Registration" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>Phone</span>
            <input v-model="partnerForm.phone" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-amber-400" placeholder="+966" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>Email</span>
            <input v-model="partnerForm.email" type="email" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-amber-400" placeholder="company@example.com" />
          </label>
          <label class="space-y-2 text-sm text-slate-300 sm:col-span-2">
            <span>Address</span>
            <input v-model="partnerForm.address" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-amber-400" placeholder="Business address" />
          </label>
          <template v-if="partnerForm.partner_type === 'Service Contract'">
            <label class="space-y-2 text-sm text-slate-300 sm:col-span-2">
              <span>Service contract type</span>
              <select v-model="partnerForm.service_contract_type" required class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-amber-400">
                <option value="">Select type</option>
                <option value="Employee Pick & Drop">Employee Pick & Drop</option>
                <option value="School Transport">School Transport</option>
                <option value="Staff Transport">Staff Transport</option>
                <option value="Vehicle Rent">Vehicle Rent (monthly/recurring)</option>
              </select>
            </label>
          </template>
        </div>
        <div v-if="message" class="mt-4 rounded-2xl border px-4 py-3 text-sm" :class="isError ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'">{{ message }}</div>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5" @click="step = 'partner_type'">Back</button>
          <button type="submit" class="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-400 disabled:opacity-60" :disabled="loading">{{ loading ? 'Registering...' : 'Register Partner' }}</button>
        </div>
      </form>

      <!-- Captain Profile Form -->
      <form v-if="step === 'captain_form'" @submit.prevent="submitCaptainProfile">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Captain Profile</div>
            <h2 class="mt-1 text-2xl font-semibold text-white">Become a captain</h2>
          </div>
          <button type="button" class="rounded-xl border border-white/10 px-3 py-1 text-sm text-slate-300 hover:bg-white/5" @click="step = 'choose'">Back</button>
        </div>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="space-y-2 text-sm text-slate-300">
            <span>Full name</span>
            <input v-model="captainForm.full_name" required class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-emerald-400" placeholder="Full name as per ID" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>Mobile no.</span>
            <input v-model="captainForm.mobile_no" required class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-emerald-400" placeholder="+966 5X XXX XXXX" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>National ID / Iqama</span>
            <input v-model="captainForm.national_id" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-emerald-400" placeholder="National ID or Iqama number" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>License no.</span>
            <input v-model="captainForm.license_no" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-emerald-400" placeholder="Driving license number" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>License expiry</span>
            <input v-model="captainForm.license_expiry_date" type="date" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-emerald-400" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>City</span>
            <input v-model="captainForm.city" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-emerald-400" placeholder="Riyadh" />
          </label>
        </div>
        <div v-if="message" class="mt-4 rounded-2xl border px-4 py-3 text-sm" :class="isError ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'">{{ message }}</div>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5" @click="step = 'choose'">Back</button>
          <button type="submit" class="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:opacity-60" :disabled="loading">{{ loading ? 'Creating...' : 'Create Captain Profile' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../lib/api'

const props = defineProps({ user: { type: Object, default: () => ({}) } })
const emit = defineEmits(['close', 'done'])

const step = ref('choose')
const loading = ref(false)
const message = ref('')
const isError = ref(false)

const partnerTypes = [
  { value: 'Travel Agent', label: 'Travel Agent', desc: 'IATA/booking agent for transport services' },
  { value: 'Taxi Service', label: 'Taxi Service', desc: 'Taxi fleet operating in KSA cities' },
  { value: 'Fleet Owner', label: 'Fleet Owner', desc: 'Own multiple vehicles for transport' },
  { value: 'Rent A Car Service', label: 'Rent A Car Service', desc: 'Vehicle rental with or without driver' },
  { value: 'Service Contract', label: 'Service Contract', desc: 'Employee P&D, school transport, staff, vehicle rent' },
]

const form = ref({ full_name: '', mobile_no: '', nationality: '', id_document_type: '', id_number: '', id_expiry_date: '' })
const countries = ref([])
const docTypes = ref([])
const showCountryList = ref(false)
const filteredCountries = ref([])
const docFormat = ref(null)
const docError = ref('')
let hideCountryTimer = null

const docBorderClass = computed(() => {
  if (!form.value.id_number || !form.value.id_document_type) return 'border border-white/10 bg-white/5'
  return docError.value ? 'border-rose-400/50 bg-rose-500/10' : 'border-emerald-400/50 bg-emerald-500/10'
})
const docPlaceholder = computed(() => docFormat.value?.placeholder || 'Document number')
const docHint = computed(() => {
  if (!docFormat.value || !form.value.id_document_type) return ''
  return docFormat.value.description || `Format: ${docFormat.value.pattern || docFormat.value.placeholder}`
})

onMounted(async () => {
  try { countries.value = await api.countryList() } catch {}
  try { docTypes.value = await api.documentTypes() } catch {}
})

function searchCountries() {
  const q = (form.value.nationality || '').toLowerCase()
  if (!q) { filteredCountries.value = countries.value.slice(0, 20); return }
  filteredCountries.value = countries.value.filter(c => c.country_name.toLowerCase().includes(q)).slice(0, 20)
  showCountryList.value = true
}

function hideCountryListDelayed() {
  hideCountryTimer = setTimeout(() => { showCountryList.value = false }, 200)
}

function selectCountry(c) {
  form.value.nationality = c.country_name
  showCountryList.value = false
  clearTimeout(hideCountryTimer)
  if (form.value.id_document_type) validateDocNumber()
}

async function validateDocNumber() {
  const alpha2 = countries.value.find(c => c.country_name === form.value.nationality)?.alpha_2
  const docType = form.value.id_document_type
  const value = form.value.id_number
  if (!alpha2 || !docType) { docFormat.value = null; docError.value = ''; return }
  if (!value) { docError.value = ''; return }
  try {
    const result = await api.validateDocument(alpha2, docType, value)
    docFormat.value = result.format
    docError.value = result.valid ? '' : (result.error || 'Invalid format')
  } catch { docError.value = '' }
}
const partnerForm = ref({ partner_type: '', service_contract_type: '', company_name: '', legal_name: '', vat_no: '', cr_no: '', phone: '', email: '', address: '' })
const captainForm = ref({ full_name: '', mobile_no: '', national_id: '', license_no: '', license_expiry_date: '', city: '' })

async function selectRole(role) {
  try {
    await api.setRole(role)
    if (role === 'Passenger') step.value = 'passenger_form'
    else if (role === 'Partner') step.value = 'partner_type'
    else if (role === 'Captain') step.value = 'captain_form'
  } catch (error) {
    isError.value = true; message.value = String(error?.message || error)
  }
}

async function lookupPartnerCompany() {
  if (!partnerForm.value.vat_no) return
  try {
    const company = await api.lookupCompanyByTaxId(null, partnerForm.value.vat_no)
    if (company?.found) {
      partnerForm.value.company_name = partnerForm.value.company_name || company.company_name
      partnerForm.value.cr_no = partnerForm.value.cr_no || company.cr_no
      partnerForm.value.phone = partnerForm.value.phone || company.phone
      partnerForm.value.email = partnerForm.value.email || company.email
      partnerForm.value.address = partnerForm.value.address || company.address
    }
  } catch {}
}

async function submitPassengerProfile() {
  loading.value = true; message.value = ''; isError.value = false
  try {
    await api.createPassengerProfile(form.value)
    emit('done')
  } catch (error) {
    isError.value = true; message.value = String(error?.message || error)
  } finally { loading.value = false }
}

async function submitPartnerProfile() {
  loading.value = true; message.value = ''; isError.value = false
  try {
    const result = await api.createPartnerProfile(partnerForm.value)
    message.value = `${result.partner_type} profile created for ${result.company}. Welcome!`
    setTimeout(() => emit('done'), 1500)
  } catch (error) {
    isError.value = true; message.value = String(error?.message || error)
  } finally { loading.value = false }
}

async function submitCaptainProfile() {
  loading.value = true; message.value = ''; isError.value = false
  try {
    await api.createCaptainProfile(captainForm.value)
    await api.setUserType('Captain')
    await api.completeOnboarding()
    message.value = 'Captain profile created. You can now request to join a company.'
    setTimeout(() => emit('done'), 1500)
  } catch (error) {
    isError.value = true; message.value = String(error?.message || error)
  } finally { loading.value = false }
}
</script>
