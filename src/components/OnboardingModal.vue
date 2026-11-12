<template>
  <div class="fixed inset-0 z-50 flex items-end bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center sm:justify-center" @click.self="$emit('close')">
    <div class="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
      <!-- Role Selection -->
      <div v-if="step === 'choose'" class="space-y-5">
        <div>
          <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Getting Started</div>
          <h2 class="mt-1 text-2xl font-semibold text-white">How will you use Al Haramain Taxi?</h2>
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

      <!-- Captain Profile: one question per screen (Urdu) -->
      <form v-if="step === 'captain_form'" dir="rtl" class="space-y-6" @submit.prevent="currentCaptainStep === 'review' ? submitCaptainProfile() : nextCaptainStep()">
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm text-slate-400">مرحلہ {{ captainStepIndex + 1 }} از {{ captainSteps.length }}</div>
          <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-base text-slate-300 hover:bg-white/5" @click="prevCaptainStep">
            {{ captainStepIndex === 0 ? 'واپس' : 'پیچھے' }}
          </button>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-white/10">
          <div class="h-2 rounded-full bg-emerald-400 transition-all" :style="{ width: captainProgress + '%' }"></div>
        </div>

        <section v-if="currentCaptainStep === 'full_name'" class="space-y-4">
          <h2 class="text-2xl font-bold text-white">آپ کا پورا نام کیا ہے؟</h2>
          <p class="text-base text-slate-400">جیسا شناختی کارڈ پر لکھا ہے۔</p>
          <input v-model="captainForm.full_name" dir="auto" autofocus class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xl text-white outline-none focus:border-emerald-400" placeholder="مثلاً محمد علی" />
        </section>

        <section v-if="currentCaptainStep === 'mobile_no'" class="space-y-4">
          <h2 class="text-2xl font-bold text-white">آپ کا موبائل نمبر؟</h2>
          <p class="text-base text-slate-400">اس نمبر پر ہم آپ سے رابطہ کریں گے۔</p>
          <input v-model="captainForm.mobile_no" dir="ltr" inputmode="tel" autofocus class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xl text-white outline-none focus:border-emerald-400" placeholder="05XXXXXXXX" />
        </section>

        <section v-if="currentCaptainStep === 'id_document_type'" class="space-y-4">
          <h2 class="text-2xl font-bold text-white">آپ کے پاس کون سا کارڈ ہے؟</h2>
          <p class="text-base text-slate-400">کوئی ایک چنیں۔</p>
          <div class="grid gap-3">
            <button
              v-for="option in idTypeOptions"
              :key="option.value"
              type="button"
              class="flex items-center justify-between rounded-2xl border px-5 py-5 text-left text-xl font-bold transition"
              :class="captainForm.id_document_type === option.value ? 'border-emerald-400 bg-emerald-400/15 text-emerald-200' : 'border-white/10 bg-white/5 text-white hover:border-emerald-400/50'"
              @click="chooseDocumentType(option.value)"
            >
              <span>{{ option.label }}</span>
              <span class="text-base font-normal text-slate-400">{{ option.hint }}</span>
            </button>
          </div>
        </section>

        <section v-if="currentCaptainStep === 'identity_number'" class="space-y-4">
          <h2 class="text-2xl font-bold text-white">
            {{ captainForm.id_document_type === 'Iqama' ? 'اقامہ نمبر کیا ہے؟' : 'قومی شناختی کارڈ کا نمبر کیا ہے؟' }}
          </h2>
          <p class="text-base text-slate-400">صرف 10 ہندسے لکھیں۔</p>
          <input
            v-model="captainForm.identity_number"
            dir="ltr"
            inputmode="numeric"
            autofocus
            class="w-full rounded-2xl border px-4 py-4 text-xl tracking-widest text-white outline-none focus:border-emerald-400"
            :class="captainIdError ? 'border-rose-400/50 bg-rose-500/10' : 'border-white/10 bg-white/5'"
            :placeholder="captainForm.id_document_type === 'Iqama' ? '2123456789' : '1234567890'"
            @input="captainIdError = ''"
          />
        </section>

        <section v-if="currentCaptainStep === 'license_no'" class="space-y-4">
          <h2 class="text-2xl font-bold text-white">ڈرائیونگ لائسنس نمبر؟</h2>
          <input v-model="captainForm.license_no" dir="ltr" autofocus class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xl text-white outline-none focus:border-emerald-400" placeholder="لائسنس نمبر" />
        </section>

        <section v-if="currentCaptainStep === 'license_expiry_date'" class="space-y-4">
          <h2 class="text-2xl font-bold text-white">لائسنس کب ختم ہوتا ہے؟</h2>
          <input v-model="captainForm.license_expiry_date" type="date" dir="ltr" autofocus class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xl text-white outline-none focus:border-emerald-400" />
        </section>

        <section v-if="currentCaptainStep === 'city'" class="space-y-4">
          <h2 class="text-2xl font-bold text-white">آپ کس شہر میں رہتے ہیں؟</h2>
          <input v-model="captainForm.city" dir="auto" autofocus class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xl text-white outline-none focus:border-emerald-400" placeholder="مثلاً ریاض" />
        </section>

        <section v-if="currentCaptainStep === 'address'" class="space-y-4">
          <h2 class="text-2xl font-bold text-white">آپ کا پتہ؟</h2>
          <p class="text-base text-slate-400">محلہ اور سڑک کا نام لکھیں۔</p>
          <input v-model="captainForm.address" dir="auto" autofocus class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xl text-white outline-none focus:border-emerald-400" placeholder="محلہ، سڑک، شہر" />
        </section>

        <section v-if="currentCaptainStep === 'review'" class="space-y-4">
          <h2 class="text-2xl font-bold text-white">کیا سب درست ہے؟</h2>
          <dl class="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5 text-base">
            <div class="flex justify-between gap-4 px-4 py-3"><dt class="text-slate-400">نام</dt><dd class="text-white">{{ captainForm.full_name }}</dd></div>
            <div class="flex justify-between gap-4 px-4 py-3"><dt class="text-slate-400">موبائل</dt><dd class="text-white" dir="ltr">{{ captainForm.mobile_no }}</dd></div>
            <div class="flex justify-between gap-4 px-4 py-3"><dt class="text-slate-400">{{ captainForm.id_document_type === 'Iqama' ? 'اقامہ' : 'شناختی کارڈ' }}</dt><dd class="text-white" dir="ltr">{{ maskedIdentity }}</dd></div>
            <div class="flex justify-between gap-4 px-4 py-3"><dt class="text-slate-400">لائسنس</dt><dd class="text-white" dir="ltr">{{ captainForm.license_no }} · {{ captainForm.license_expiry_date }}</dd></div>
            <div class="flex justify-between gap-4 px-4 py-3"><dt class="text-slate-400">شہر</dt><dd class="text-white">{{ captainForm.city }}</dd></div>
            <div class="flex justify-between gap-4 px-4 py-3"><dt class="text-slate-400">پتہ</dt><dd class="text-white">{{ captainForm.address }}</dd></div>
          </dl>
        </section>

        <div v-if="message" class="rounded-2xl border px-4 py-3 text-base" :class="isError ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'">{{ message }}</div>

        <button
          v-if="currentCaptainStep !== 'id_document_type'"
          type="submit"
          class="flex w-full items-center justify-center rounded-2xl py-5 text-xl font-black text-slate-950 transition disabled:opacity-60"
          :class="currentCaptainStep === 'review' ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-emerald-500 hover:bg-emerald-400'"
          :disabled="loading"
        >
          {{ loading ? 'براہ کرم انتظار کریں...' : currentCaptainStep === 'review' ? 'پروفائل بنائیں' : 'آگے' }}
        </button>
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
const captainForm = ref({ full_name: '', mobile_no: '', id_document_type: 'National ID', nationality: 'Saudi Arabia', identity_number: '', license_no: '', license_expiry_date: '', city: '', address: '' })
const captainIdError = ref('')

async function selectRole(role) {
  try {
    await api.setRole(role)
    if (role === 'Passenger') step.value = 'passenger_form'
    else if (role === 'Partner') step.value = 'partner_type'
    else if (role === 'Captain') { captainStepIndex.value = 0; message.value = ''; step.value = 'captain_form' }
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
    if (!validateCaptainId()) throw new Error(captainIdError.value)
    const identityNumber = normalizeDigits(captainForm.value.identity_number)
    await api.createCaptainProfile({
      ...captainForm.value,
      identity_number: undefined,
      national_id: captainForm.value.id_document_type === 'National ID' ? identityNumber : '',
      iqama_no: captainForm.value.id_document_type === 'Iqama' ? identityNumber : '',
    })
    await api.setUserType('Captain')
    await api.completeOnboarding()
    message.value = 'کپتان کا پروفائل بن گیا ہے۔ اب آپ کمپنی میں شامل ہونے کی درخواست دے سکتے ہیں۔'
    setTimeout(() => emit('done'), 1500)
  } catch (error) {
    isError.value = true; message.value = String(error?.message || error)
  } finally { loading.value = false }
}

const idTypeOptions = [
  { value: 'National ID', label: 'سعودی قومی شناختی کارڈ', hint: '1 سے شروع' },
  { value: 'Iqama', label: 'اقامہ', hint: '2 سے شروع' },
]

const captainSteps = ['full_name', 'mobile_no', 'id_document_type', 'identity_number', 'license_no', 'license_expiry_date', 'city', 'address', 'review']
const captainStepIndex = ref(0)
const currentCaptainStep = computed(() => captainSteps[captainStepIndex.value])
const captainProgress = computed(() => Math.round((captainStepIndex.value / (captainSteps.length - 1)) * 100))
const maskedIdentity = computed(() => {
  const digits = normalizeDigits(captainForm.value.identity_number)
  return digits ? `••••${digits.slice(-4)}` : ''
})

function captainStepError(key) {
  const f = captainForm.value
  if (key === 'full_name' && !f.full_name.trim()) return 'نام لکھنا ضروری ہے۔'
  if (key === 'mobile_no' && !f.mobile_no.trim()) return 'موبائل نمبر لکھیں۔'
  if (key === 'identity_number') return validateCaptainId() ? '' : captainIdError.value
  if (key === 'license_no' && !f.license_no.trim()) return 'لائسنس نمبر لکھیں۔'
  if (key === 'license_expiry_date' && !f.license_expiry_date) return 'لائسنس کی میعاد کی تاریخ چنیں۔'
  if (key === 'city' && !f.city.trim()) return 'شہر کا نام لکھیں۔'
  if (key === 'address' && !f.address.trim()) return 'پتہ لکھیں۔'
  return ''
}

function nextCaptainStep() {
  const error = captainStepError(currentCaptainStep.value)
  if (error) {
    isError.value = true
    message.value = error
    return
  }
  message.value = ''
  isError.value = false
  if (captainStepIndex.value < captainSteps.length - 1) captainStepIndex.value++
}

function prevCaptainStep() {
  message.value = ''
  if (captainStepIndex.value === 0) {
    step.value = 'choose'
    return
  }
  captainStepIndex.value--
}

function chooseDocumentType(type) {
  captainForm.value.id_document_type = type
  captainIdError.value = ''
  nextCaptainStep()
}

function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

function validateCaptainId() {
  const value = normalizeDigits(captainForm.value.identity_number)
  const isIqama = captainForm.value.id_document_type === 'Iqama'
  if (!value) { captainIdError.value = 'ID number is required.'; return false }
  if (!/^\d{10}$/.test(value)) { captainIdError.value = 'ID number must be exactly 10 digits.'; return false }
  if (isIqama && !value.startsWith('2')) { captainIdError.value = 'Iqama number must start with 2.'; return false }
  if (!isIqama && !value.startsWith('1')) { captainIdError.value = 'Saudi National ID must start with 1.'; return false }
  captainIdError.value = ''
  captainForm.value.identity_number = value
  return true
}
</script>
