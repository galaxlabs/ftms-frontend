<template>
  <div class="flex h-full min-h-screen">
    <Sidebar :active="active" :items="nav" @navigate="active = $event" />

    <main class="flex min-w-0 flex-1 flex-col">
      <Topbar
        v-model="selectedCompany"
        :title="pageTitle"
        :companies="companies"
        :user="currentUser"
        @login="showLogin = true"
        @logout="logout"
        @profile="active = 'settings'"
        @signup="showSignup = true"
      />

      <div class="border-b border-white/10 bg-slate-950/60 px-4 py-3 lg:hidden">
        <select v-model="active" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none">
          <option v-for="item in nav" :key="item.key" :value="item.key">{{ item.label }}</option>
        </select>
      </div>

      <section class="flex-1 overflow-y-auto p-4 sm:p-6">
        <div v-if="loadError" class="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {{ loadError }}
        </div>

        <DashboardPage v-if="active === 'dashboard'" :dashboard="dashboard" @refresh="loadData" />

        <RoutesPage v-else-if="active === 'routes'" :rows="datasets.routes" @create="addDraftRecord('routes', $event)" />

        <ProfileSettingsPage v-else-if="active === 'settings'" :user="currentUser" :save-profile="saveProfile" />

        <RecordsPage
          v-else
          :eyebrow="pageMeta.eyebrow"
          :title="pageMeta.title"
          :description="pageMeta.description"
          :columns="pageMeta.columns"
          :rows="tableRows"
          @create="addDraftRecord(active, $event)"
        />
      </section>
    </main>

    <div v-if="showLogin" class="fixed inset-0 z-50 flex items-end bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center sm:justify-center" @click.self="closeLogin">
      <form class="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl" @submit.prevent="submitLogin">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs uppercase tracking-[0.25em] text-slate-500">User Login</div>
            <h2 class="mt-1 text-2xl font-semibold text-white">Login to FTMS</h2>
          </div>
          <button type="button" class="rounded-xl border border-white/10 px-3 py-1 text-sm text-slate-300 hover:bg-white/5" @click="closeLogin">Close</button>
        </div>

        <div class="mt-5 space-y-4">
          <label class="block space-y-2 text-sm text-slate-300">
            <span>Email</span>
            <input v-model="loginForm.usr" required type="email" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="admin@company.com" />
          </label>
          <label class="block space-y-2 text-sm text-slate-300">
            <span>Password</span>
            <input v-model="loginForm.pwd" required type="password" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="Password" />
          </label>
        </div>

        <div v-if="loginMessage" class="mt-4 rounded-2xl border px-4 py-3 text-sm" :class="loginError ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'">
          {{ loginMessage }}
        </div>

        <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5" @click="closeLogin">Cancel</button>
          <button type="submit" class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60" :disabled="loginLoading">
            {{ loginLoading ? 'Logging in...' : 'Login' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="showSignup" class="fixed inset-0 z-50 flex items-end bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center sm:justify-center" @click.self="closeSignup">
      <form class="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl" @submit.prevent="submitSignup">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Company Onboarding</div>
            <h2 class="mt-1 text-2xl font-semibold text-white">Create your FTMS account</h2>
            <p class="mt-2 text-sm text-slate-400">This creates a company, user, and active Company Admin link for tenant access.</p>
          </div>
          <button type="button" class="rounded-xl border border-white/10 px-3 py-1 text-sm text-slate-300 hover:bg-white/5" @click="closeSignup">Close</button>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="space-y-2 text-sm text-slate-300">
            <span>Company</span>
            <input v-model="signupForm.company_name" required class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="Galaxy Transport" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>Email</span>
            <input v-model="signupForm.email" required type="email" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="admin@company.com" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>User name</span>
            <input v-model="signupForm.username" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="admin" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>First name</span>
            <input v-model="signupForm.first_name" required class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="First name" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>Last name</span>
            <input v-model="signupForm.last_name" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="Last name" />
          </label>
        </div>

        <div v-if="signupMessage" class="mt-4 rounded-2xl border px-4 py-3 text-sm" :class="signupError ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'">
          {{ signupMessage }}
        </div>

        <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5" @click="closeSignup">Cancel</button>
          <button type="submit" class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60" :disabled="signupLoading">
            {{ signupLoading ? 'Creating...' : 'Create account' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { api } from './lib/api'
import DashboardPage from './pages/DashboardPage.vue'
import ProfileSettingsPage from './pages/ProfileSettingsPage.vue'
import RecordsPage from './pages/RecordsPage.vue'
import RoutesPage from './pages/RoutesPage.vue'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'

const nav = [
  { key: 'dashboard', label: 'Dashboard', short: 'Overview' },
  { key: 'companies', label: 'Companies', short: 'Tenants' },
  { key: 'trips', label: 'Trips', short: 'Operations' },
  { key: 'bookings', label: 'Bookings', short: 'Ride app' },
  { key: 'invoices', label: 'Invoices', short: 'ZATCA' },
  { key: 'contracts', label: 'Contracts', short: 'B2B' },
  { key: 'vehicles', label: 'Vehicles', short: 'Fleet' },
  { key: 'employees', label: 'Captains', short: 'Staff' },
  { key: 'routes', label: 'Routes', short: 'Distance' },
  { key: 'settings', label: 'Settings', short: 'System' },
]

const pageConfig = {
  companies: {
    eyebrow: 'Tenant Registry',
    title: 'Companies',
    description: 'Manage transportation companies and their operating domains.',
    columns: [
      { label: 'Code', key: 'company_code' },
      { label: 'Name', key: 'company_name' },
      { label: 'Domain', key: 'domain' },
      { label: 'Status', key: 'status', type: 'status' },
    ],
  },
  trips: {
    eyebrow: 'Operations',
    title: 'Trips',
    description: 'Trip schedules, vehicles, routes, and operational state.',
    columns: [
      { label: 'Title', key: 'trip_title' },
      { label: 'Date', key: 'trip_date' },
      { label: 'Route', key: 'route' },
      { label: 'Vehicle', key: 'vehicle' },
      { label: 'Status', key: 'trip_status', type: 'status' },
    ],
  },
  bookings: {
    eyebrow: 'Passenger Demand',
    title: 'Bookings',
    description: 'Ride app and desk bookings with customer and trip details.',
    columns: [
      { label: 'Title', key: 'booking_title' },
      { label: 'Date', key: 'booking_date' },
      { label: 'Customer', key: 'customer_name' },
      { label: 'Mobile', key: 'mobile_no' },
      { label: 'Status', key: 'booking_status', type: 'status' },
    ],
  },
  invoices: {
    eyebrow: 'Billing & ZATCA',
    title: 'Invoices',
    description: 'Trip invoices, VAT amount, and submission readiness.',
    columns: [
      { label: 'Invoice', key: 'name' },
      { label: 'Date', key: 'invoice_date' },
      { label: 'Customer', key: 'customer' },
      { label: 'VAT', key: 'vat_amount' },
      { label: 'Total', key: 'grand_total' },
      { label: 'Status', key: 'status', type: 'status' },
    ],
  },
  contracts: {
    eyebrow: 'B2B Transport',
    title: 'Contracts',
    description: 'Employee transport contracts and shift-based routes.',
    columns: [
      { label: 'Title', key: 'contract_title' },
      { label: 'Route', key: 'route' },
      { label: 'Shift', key: 'shift_type' },
      { label: 'Active', key: 'is_active', type: 'status' },
    ],
  },
  vehicles: {
    eyebrow: 'Fleet',
    title: 'Vehicles',
    description: 'Fleet registry with plate numbers, types, and operating status.',
    columns: [
      { label: 'Name', key: 'vehicle_name' },
      { label: 'Plate', key: 'plate_no' },
      { label: 'Type', key: 'vehicle_type' },
      { label: 'Status', key: 'status', type: 'status' },
    ],
  },
  employees: {
    eyebrow: 'Captains',
    title: 'Captains',
    description: 'Drivers and operating staff linked to a transportation company.',
    columns: [
      { label: 'Name', key: 'employee_name' },
      { label: 'Company', key: 'company' },
    ],
  },
  settings: {
    eyebrow: 'System',
    title: 'Settings',
    description: 'Configuration surfaces will be connected here as modules mature.',
    columns: [
      { label: 'Area', key: 'area' },
      { label: 'Status', key: 'status', type: 'status' },
      { label: 'Notes', key: 'notes' },
    ],
  },
}

const active = ref('dashboard')
const selectedCompany = ref('')
const companies = ref([{ name: 'default', company_name: 'Default Company' }])
const loadError = ref('')
const currentUser = ref({ is_authenticated: false })
const showLogin = ref(false)
const loginLoading = ref(false)
const loginMessage = ref('')
const loginError = ref(false)
const loginForm = ref({ usr: '', pwd: '' })
const showSignup = ref(false)
const signupLoading = ref(false)
const signupMessage = ref('')
const signupError = ref(false)
const signupForm = ref({ company_name: '', email: '', username: '', first_name: '', last_name: '' })
const dashboard = ref({ cards: { trips: 0, bookings: 0, invoices: 0, vat: 0 }, activity: [] })
const datasets = ref({ companies: [], trips: [], bookings: [], invoices: [], contracts: [], vehicles: [], employees: [], routes: [], settings: [] })

const pageTitle = computed(() => nav.find((item) => item.key === active.value)?.label || 'Dashboard')
const pageMeta = computed(() => pageConfig[active.value] || pageConfig.settings)
const tableRows = computed(() => datasets.value[active.value] || [])

async function loadCompanies() {
  const rows = await api.companies()
  if (rows?.length) {
    companies.value = rows
    datasets.value.companies = rows
    selectedCompany.value = selectedCompany.value || rows[0].name
  }
}

async function loadCurrentUser() {
  currentUser.value = await api.currentUser()
  if (currentUser.value?.company) selectedCompany.value = currentUser.value.company
}

async function loadData() {
  loadError.value = ''
  try {
    const [tripRows, bookingRows, invoiceRows, contractRows, vehicleRows, employeeRows, routeRows] = await Promise.all([
      api.trips(selectedCompany.value, 50),
      api.bookings(selectedCompany.value, 50),
      api.invoices(selectedCompany.value, 50),
      api.contracts(selectedCompany.value, 50),
      api.vehicles(selectedCompany.value, 50),
      api.employees(selectedCompany.value, 50),
      api.routes(selectedCompany.value, 50),
    ])

    datasets.value = {
      ...datasets.value,
      trips: tripRows,
      bookings: bookingRows,
      invoices: invoiceRows,
      contracts: contractRows,
      vehicles: vehicleRows,
      employees: employeeRows,
      routes: routeRows,
      settings: [
        { name: 'zatca', area: 'ZATCA Phase 2', status: 'Pending', notes: 'Needs real VAT/CR credentials for CSID onboarding' },
        { name: 'distance', area: 'Route Distance', status: 'Active', notes: 'Haversine auto-calculation via KSA City lat/lng' },
        { name: 'mobile', area: 'Android App', status: 'Draft', notes: 'Migrated from TSS to FTMS endpoints' },
      ],
    }

    dashboard.value = {
      cards: {
        trips: tripRows.length,
        bookings: bookingRows.length,
        invoices: invoiceRows.length,
        vat: invoiceRows.reduce((sum, row) => sum + Number(row.vat_amount || 0), 0).toFixed(2),
      },
      activity: [
        { label: `Trips loaded: ${tripRows.length}`, time: 'now' },
        { label: `Bookings loaded: ${bookingRows.length}`, time: 'now' },
        { label: `Routes loaded: ${routeRows.length}`, time: 'now' },
        { label: `Invoices loaded: ${invoiceRows.length}`, time: 'now' },
      ],
    }
  } catch (error) {
    loadError.value = String(error?.message || error)
    dashboard.value.activity = [{ label: loadError.value, time: 'error' }]
  }
}

function addDraftRecord(key, row) {
  datasets.value = {
    ...datasets.value,
    [key]: [{ ...row, company: selectedCompany.value, status: row.status || 'Draft' }, ...(datasets.value[key] || [])],
  }
}

function closeLogin() {
  showLogin.value = false
  loginMessage.value = ''
  loginError.value = false
}

async function submitLogin() {
  loginLoading.value = true
  loginMessage.value = ''
  loginError.value = false
  try {
    await api.login(loginForm.value.usr, loginForm.value.pwd)
    await loadCurrentUser()
    loginForm.value = { usr: '', pwd: '' }
    loginMessage.value = 'Logged in.'
    showLogin.value = false
    await loadCompanies()
    await loadData()
  } catch (error) {
    loginError.value = true
    loginMessage.value = String(error?.message || error)
  } finally {
    loginLoading.value = false
  }
}

async function logout() {
  await api.logout()
  currentUser.value = { is_authenticated: false }
  selectedCompany.value = companies.value[0]?.name || ''
  active.value = 'dashboard'
  await loadData()
}

function closeSignup() {
  showSignup.value = false
  signupMessage.value = ''
  signupError.value = false
}

async function submitSignup() {
  signupLoading.value = true
  signupMessage.value = ''
  signupError.value = false
  try {
    const result = await api.signup(signupForm.value)
    signupMessage.value = result.reset_email_sent
      ? `Created ${result.company_name}. A password reset email was sent to ${result.user}.`
      : `Created ${result.company_name}. Password reset email could not be sent; contact admin to set a password.`
    await loadCompanies()
    if (result.company) selectedCompany.value = result.company
    signupForm.value = { company_name: '', email: '', username: '', first_name: '', last_name: '' }
  } catch (error) {
    signupError.value = true
    signupMessage.value = String(error?.message || error)
  } finally {
    signupLoading.value = false
  }
}

async function saveProfile(payload) {
  currentUser.value = await api.updateProfile(payload)
}

watch(selectedCompany, loadData)

onMounted(async () => {
  try {
    await loadCurrentUser()
    await loadCompanies()
    await loadData()
  } catch (error) {
    loadError.value = String(error?.message || error)
  }
})
</script>
