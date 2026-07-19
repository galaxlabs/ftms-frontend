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

        <div v-if="saveMessage" class="mb-4 rounded-2xl border px-4 py-3 text-sm" :class="saveError ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'">
          {{ saveMessage }}
        </div>

        <DashboardPage v-if="active === 'dashboard'" :dashboard="dashboard" @refresh="loadData" />

        <RoutesPage v-else-if="active === 'routes'" :rows="datasets.routes" @create="addDraftRecord('routes', $event)" />

        <JoinRequestsPage
          v-else-if="active === 'join_requests'"
          :rows="datasets.join_requests"
          @approve="handleApproveJoin"
          @reject="handleRejectJoin"
          @refresh="loadJoinRequests"
        />

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
            <input v-model="loginForm.usr" required type="email" autocomplete="username" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="admin@company.com" />
          </label>
          <label class="block space-y-2 text-sm text-slate-300">
            <span>Password</span>
            <input v-model="loginForm.pwd" required type="password" autocomplete="current-password" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="Password" />
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
import JoinRequestsPage from './pages/JoinRequestsPage.vue'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'

const nav = [
  { key: 'dashboard', label: 'Dashboard', short: 'Overview' },
  { key: 'companies', label: 'Companies', short: 'Tenants' },
  { key: 'trips', label: 'Trips', short: 'Operations' },
  { key: 'bookings', label: 'Bookings', short: 'Ride app' },
  { key: 'customers', label: 'Customers', short: 'People' },
  { key: 'invoices', label: 'Invoices', short: 'ZATCA' },
  { key: 'contracts', label: 'Contracts', short: 'B2B' },
  { key: 'vehicles', label: 'Vehicles', short: 'Fleet' },
  { key: 'captains', label: 'Captains', short: 'Drivers' },
  { key: 'join_requests', label: 'Join Req', short: 'Pending' },
  { key: 'expenses', label: 'Expenses', short: 'OCR' },
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
      { label: 'Arabic Name', key: 'company_name_ar' },
      { label: 'VAT No', key: 'vat_no' },
      { label: 'CR No', key: 'cr_no' },
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
  customers: {
    eyebrow: 'Customers',
    title: 'Customers',
    description: 'Passenger and customer records for bookings, contracts, and invoices.',
    columns: [
      { label: 'Name', key: 'customer_name' },
      { label: 'Arabic Name', key: 'customer_name_ar' },
      { label: 'Mobile', key: 'mobile_no' },
      { label: 'Email', key: 'email' },
      { label: 'Status', key: 'status', type: 'status' },
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
      { label: 'Registration', key: 'registration_no' },
      { label: 'Operation Card', key: 'operation_card_no' },
      { label: 'Op Card Expiry', key: 'operation_card_expiry_date' },
      { label: 'Insurance Expiry', key: 'insurance_expiry_date' },
      { label: 'Status', key: 'status', type: 'status' },
    ],
  },
  captains: {
    eyebrow: 'Captains',
    title: 'Captains',
    description: 'Licensed captains linked to a transportation company with full KSA documents.',
    columns: [
      { label: 'Name', key: 'full_name' },
      { label: 'Mobile', key: 'mobile_no' },
      { label: 'Iqama No', key: 'iqama_no' },
      { label: 'License Expiry', key: 'license_expiry_date' },
      { label: 'Driver Card', key: 'driver_card_no' },
      { label: 'Status', key: 'status', type: 'status' },
    ],
  },
  expenses: {
    eyebrow: 'Expense OCR',
    title: 'Expenses',
    description: 'Captain trip expenses with receipt OCR extraction and company-name validation.',
    columns: [
      { label: 'Date', key: 'expense_date' },
      { label: 'Captain', key: 'captain_user' },
      { label: 'Type', key: 'expense_type' },
      { label: 'Supplier', key: 'supplier_name' },
      { label: 'Invoice', key: 'invoice_no' },
      { label: 'Total', key: 'total_amount' },
      { label: 'Receipt Check', key: 'receipt_validation_status', type: 'status' },
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
const saveMessage = ref('')
const saveError = ref(false)
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
const datasets = ref({ companies: [], trips: [], bookings: [], customers: [], invoices: [], contracts: [], vehicles: [], captains: [], expenses: [], routes: [], settings: [], join_requests: [] })

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

async function loadJoinRequests() {
  try {
    datasets.value.join_requests = await api.joinRequests(selectedCompany.value, 'Pending')
  } catch { datasets.value.join_requests = [] }
}

async function loadData() {
  loadError.value = ''
  try {
    const [dashboardData, tripRows, bookingRows, customerRows, invoiceRows, contractRows, vehicleRows, captainRows, expenseRows, routeRows, joinRows] = await Promise.all([
      api.dashboard(selectedCompany.value),
      api.trips(selectedCompany.value, 50),
      api.bookings(selectedCompany.value, 50),
      currentUser.value?.is_authenticated ? api.customers(selectedCompany.value, 50) : Promise.resolve([]),
      api.invoices(selectedCompany.value, 50),
      api.contracts(selectedCompany.value, 50),
      api.vehicles(selectedCompany.value, 50),
      currentUser.value?.is_authenticated ? api.captains(selectedCompany.value, 50) : Promise.resolve([]),
      currentUser.value?.is_authenticated ? api.expenses(selectedCompany.value, 50) : Promise.resolve([]),
      api.routes(selectedCompany.value, 50),
      currentUser.value?.is_authenticated ? api.joinRequests(selectedCompany.value, 'Pending').catch(() => []) : Promise.resolve([]),
    ])

    datasets.value = {
      ...datasets.value,
      trips: tripRows,
      bookings: bookingRows,
      customers: customerRows,
      invoices: invoiceRows,
      contracts: contractRows,
      vehicles: vehicleRows,
      captains: captainRows,
      expenses: expenseRows,
      routes: routeRows,
      join_requests: joinRows || [],
      settings: [
        { name: 'zatca', area: 'ZATCA Phase 2', status: 'Pending', notes: 'Needs real VAT/CR credentials for CSID onboarding' },
        { name: 'distance', area: 'Route Distance', status: 'Active', notes: 'Haversine auto-calculation via KSA City lat/lng' },
        { name: 'mobile', area: 'Android App', status: 'Draft', notes: 'Migrated from TSS to FTMS endpoints' },
      ],
    }

    dashboard.value = dashboardData || dashboard.value
  } catch (error) {
    loadError.value = String(error?.message || error)
    dashboard.value.activity = [{ label: loadError.value, time: 'error' }]
  }
}

async function addDraftRecord(key, row) {
  saveMessage.value = ''
  saveError.value = false
  const handlers = {
    bookings: () => api.createBooking({ ...row, company: selectedCompany.value, source_channel: 'Website' }),
    routes: () => api.createRoute({ ...row, company: selectedCompany.value }),
    customers: () => api.createCustomer({ ...row }),
    trips: () => api.createTrip({ ...row }),
    vehicles: () => api.createVehicle({ ...row }),
    invoices: () => api.createInvoice({ ...row }),
    contracts: () => api.createContract({ ...row }),
  }
  const handler = handlers[key]
  if (!handler) {
    datasets.value = {
      ...datasets.value,
      [key]: [{ ...row, company: selectedCompany.value, status: row.status || 'Draft' }, ...(datasets.value[key] || [])],
    }
    saveMessage.value = `${pageMeta.value.title} draft added locally.`
    return
  }
  try {
    const saved = await handler()
    datasets.value = {
      ...datasets.value,
      [key]: [saved, ...(datasets.value[key] || [])],
    }
    saveMessage.value = `${saved.customer_name || saved.name || saved.vehicle_name || saved.trip_title || saved.contract_title || saved.booking_title || saved.route_title || 'Record'} saved.`
  } catch (error) {
    saveError.value = true
    saveMessage.value = String(error?.message || error)
  }
}

async function handleApproveJoin(name) {
  try {
    await api.approveJoinRequest(name)
    saveMessage.value = `Join request ${name} approved.`
    await loadJoinRequests()
    await loadData()
  } catch (error) {
    saveError.value = true
    saveMessage.value = String(error?.message || error)
  }
}

async function handleRejectJoin(name) {
  try {
    await api.rejectJoinRequest(name)
    saveMessage.value = `Join request ${name} rejected.`
    await loadJoinRequests()
  } catch (error) {
    saveError.value = true
    saveMessage.value = String(error?.message || error)
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
