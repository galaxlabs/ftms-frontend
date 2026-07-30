<template>
  <div class="space-y-6">
    <PageHeader
      eyebrow="Account Settings"
      title="Profile Settings"
      description="Manage your login profile and review the active company membership used by FTMS tenancy."
    />

    <div v-if="!user?.is_authenticated" class="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-5 text-sm text-amber-100">
      Login to update your profile settings.
    </div>

    <form v-else class="grid gap-6 lg:grid-cols-[1fr_420px]" @submit.prevent="submit">
      <section class="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
        <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Identity</div>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="space-y-2 text-sm text-slate-300">
            <span>First name</span>
            <input v-model="form.first_name" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>Last name</span>
            <input v-model="form.last_name" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>Email</span>
            <input :value="user.email" disabled class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-400" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>Mobile</span>
            <input v-model="form.mobile_no" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="+966..." />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>ID Document Type</span>
            <select v-model="form.id_document_type" @change="validateDocNumber" required class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400">
              <option value="">Select document type</option>
              <option v-for="dt in docTypes" :key="dt" :value="dt">{{ dt }}</option>
            </select>
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>ID No</span>
            <input v-model="form.id_no" @input="validateDocNumber" required class="w-full rounded-xl border px-3 py-2 text-white outline-none focus:border-blue-400" :class="docBorderClass" :placeholder="docPlaceholder" />
            <p v-if="docHint" class="mt-1 text-xs text-slate-400">{{ docHint }}</p>
            <p v-if="docError" class="mt-1 text-xs text-rose-400">{{ docError }}</p>
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>Nationality</span>
            <div class="relative">
              <input v-model="form.nationality" @input="searchCountries" @focus="showCountryList = true" @blur="hideCountryListDelayed" required class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="Type country name..." autocomplete="off" />
              <ul v-if="showCountryList && filteredCountries.length" class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-white/10 bg-slate-800 shadow-xl">
                <li v-for="c in filteredCountries" :key="c.alpha_2" class="cursor-pointer px-3 py-2 text-sm text-slate-200 hover:bg-blue-500/20" @mousedown.prevent="selectCountry(c)">{{ c.country_name }}</li>
              </ul>
            </div>
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>ID Expiry Date</span>
            <input v-model="form.id_expiry_date" type="date" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" />
          </label>
          <label class="space-y-2 text-sm text-slate-300 sm:col-span-2">
            <span>ID Document URL</span>
            <input v-model="form.id_document" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="/files/id-document.pdf" />
          </label>
        </div>

        <div v-if="message" class="mt-4 rounded-2xl border px-4 py-3 text-sm" :class="error ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'">
          {{ message }}
        </div>

        <div class="mt-5 flex justify-end">
          <button class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save profile' }}
          </button>
        </div>
      </section>

      <aside class="space-y-4">
        <section class="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Company Link</div>
          <dl class="mt-4 space-y-3 text-sm">
            <div>
              <dt class="text-slate-500">Company</dt>
              <dd class="text-white">{{ user.company_data?.company_name || user.company || '-' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Role</dt>
              <dd class="text-white">{{ user.portal_role || '-' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Status</dt>
              <dd class="text-white">{{ user.company_data?.status || '-' }}</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Subscription</div>
          <dl class="mt-4 space-y-3 text-sm">
            <div>
              <dt class="text-slate-500">Status</dt>
              <dd class="text-white">{{ user.subscription?.status || '-' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Trial ends</dt>
              <dd class="text-white">{{ user.subscription?.trial_end || '-' }}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { api } from '../lib/api'

const props = defineProps({ user: Object, saveProfile: Function })

const loading = ref(false)
const message = ref('')
const error = ref(false)
const form = reactive({ first_name: '', last_name: '', mobile_no: '', id_document_type: '', id_no: '', nationality: '', id_expiry_date: '', id_document: '' })

const countries = ref([])
const docTypes = ref([])
const showCountryList = ref(false)
const filteredCountries = ref([])
const docFormat = ref(null)
const docError = ref('')
let hideCountryTimer = null

const docBorderClass = computed(() => {
  if (!form.id_no || !form.id_document_type) return 'border border-white/10 bg-white/5'
  return docError.value ? 'border-rose-400/50 bg-rose-500/10' : 'border-emerald-400/50 bg-emerald-500/10'
})
const docPlaceholder = computed(() => docFormat.value?.placeholder || 'Document number')
const docHint = computed(() => {
  if (!docFormat.value || !form.id_document_type) return ''
  return docFormat.value.description || `Format: ${docFormat.value.pattern || docFormat.value.placeholder}`
})

onMounted(async () => {
  try { countries.value = await api.countryList() } catch {}
  try { docTypes.value = await api.documentTypes() } catch {}
})

function searchCountries() {
  const q = (form.nationality || '').toLowerCase()
  if (!q) { filteredCountries.value = countries.value.slice(0, 20); return }
  filteredCountries.value = countries.value.filter(c => c.country_name.toLowerCase().includes(q)).slice(0, 20)
  showCountryList.value = true
}

function hideCountryListDelayed() {
  hideCountryTimer = setTimeout(() => { showCountryList.value = false }, 200)
}

function selectCountry(c) {
  form.nationality = c.country_name
  showCountryList.value = false
  clearTimeout(hideCountryTimer)
  if (form.id_document_type) validateDocNumber()
}

async function validateDocNumber() {
  const alpha2 = countries.value.find(c => c.country_name === form.nationality)?.alpha_2
  const docType = form.id_document_type
  const value = form.id_no
  if (!alpha2 || !docType) { docFormat.value = null; docError.value = ''; return }
  if (!value) { docError.value = ''; return }
  try {
    const result = await api.validateDocument(alpha2, docType, value)
    docFormat.value = result.format
    docError.value = result.valid ? '' : (result.error || 'Invalid format')
  } catch { docError.value = '' }
}

watch(
  () => props.user,
  (user) => {
    form.first_name = user?.first_name || ''
    form.last_name = user?.last_name || ''
    form.mobile_no = user?.mobile_no || ''
    form.id_document_type = user?.id_document_type || ''
    form.id_no = user?.id_no || ''
    form.nationality = user?.nationality || ''
    form.id_expiry_date = user?.id_expiry_date || ''
    form.id_document = user?.id_document || ''
  },
  { immediate: true },
)

async function submit() {
  loading.value = true
  message.value = ''
  error.value = false
  try {
    await props.saveProfile({ ...form })
    message.value = 'Profile updated.'
  } catch (err) {
    error.value = true
    message.value = String(err?.message || err)
  } finally {
    loading.value = false
  }
}
</script>
