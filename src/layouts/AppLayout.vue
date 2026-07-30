<template>
  <!-- Guest Landing -->
  <div v-if="!currentUser.is_authenticated && !loadError" class="flex min-h-screen items-center justify-center bg-slate-950 p-4">
    <div class="w-full max-w-lg text-center">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-500/25">
        F
      </div>
      <h1 class="mt-6 text-3xl font-bold text-white">FTMS</h1>
      <p class="mt-2 text-slate-400">Fleet Transportation Management System</p>
      <p class="mt-1 text-sm text-slate-500">Manage trips, fleet, captains & bookings</p>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button @click="showLogin = true" class="rounded-xl bg-blue-500 px-8 py-3 text-sm font-medium text-white hover:bg-blue-400">
          Login
        </button>
        <button @click="showSignup = true" class="rounded-xl border border-white/10 px-8 py-3 text-sm font-medium text-white hover:bg-white/5">
          Create account
        </button>
      </div>

      <div class="mt-6">
        <button @click="loginWithGoogle" class="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm text-slate-300 hover:bg-white/10">
          <svg class="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
      </div>
    </div>
  </div>

  <!-- Authenticated App Layout -->
  <div v-if="currentUser.is_authenticated" class="flex h-full min-h-screen">
    <Sidebar :active="active" :items="nav" @navigate="navigate" />

    <main class="flex min-w-0 flex-1 flex-col">
      <Topbar
        v-model="selectedCompany"
        :title="pageTitle"
        :companies="companies"
        :user="currentUser"
        @login="showLogin = true"
        @logout="logout"
        @profile="navigate('settings')"
        @signup="showSignup = true"
      />

      <div class="border-b border-white/10 bg-slate-950/60 px-4 py-3 lg:hidden">
        <select v-model="active" @change="navigate(active)" class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none">
          <option v-for="item in nav" :key="item.key" :value="item.key">{{ item.label }}</option>
        </select>
      </div>

      <section class="flex-1 overflow-y-auto p-4 sm:p-6">
        <div v-if="loadError" class="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{{ loadError }}</div>
        <div v-if="saveMessage" class="mb-4 rounded-2xl border px-4 py-3 text-sm" :class="saveError ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'">{{ saveMessage }}</div>
        <router-view :key="route.fullPath" />
      </section>
    </main>
  </div>

  <!-- Login Modal -->
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
      <div v-if="loginMessage" class="mt-4 rounded-2xl border px-4 py-3 text-sm" :class="loginError ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'">{{ loginMessage }}</div>
      <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5" @click="closeLogin">Cancel</button>
        <button type="submit" class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400 disabled:opacity-60" :disabled="loginLoading">{{ loginLoading ? 'Logging in...' : 'Login' }}</button>
      </div>
      <div class="mt-5 border-t border-white/10 pt-4">
        <button type="button" class="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10" @click="loginWithGoogle">
          <svg class="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
      </div>
    </form>
  </div>

  <!-- Signup Modal -->
  <div v-if="showSignup" class="fixed inset-0 z-50 flex items-end bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center sm:justify-center" @click.self="closeSignup">
    <form class="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl" @submit.prevent="submitSignup">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Account Creation</div>
          <h2 class="mt-1 text-2xl font-semibold text-white">Create your FTMS account</h2>
          <p class="mt-2 text-sm text-slate-400">Enter your details to get started.</p>
        </div>
        <button type="button" class="rounded-xl border border-white/10 px-3 py-1 text-sm text-slate-300 hover:bg-white/5" @click="closeSignup">Close</button>
      </div>
      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <label class="space-y-2 text-sm text-slate-300"><span>Email</span>
          <input v-model="signupForm.email" required type="email" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="admin@company.com" />
        </label>
        <label class="space-y-2 text-sm text-slate-300"><span>User name</span>
          <input v-model="signupForm.username" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="admin" />
        </label>
        <label class="space-y-2 text-sm text-slate-300"><span>First name</span>
          <input v-model="signupForm.first_name" required class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="First name" />
        </label>
        <label class="space-y-2 text-sm text-slate-300"><span>Last name</span>
          <input v-model="signupForm.last_name" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="Last name" />
        </label>
        <label class="space-y-2 text-sm text-slate-300"><span>Password</span>
          <input v-model="signupForm.password" required type="password" autocomplete="new-password" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="Min 8 characters" />
        </label>
        <label class="space-y-2 text-sm text-slate-300"><span>Confirm password</span>
          <input v-model="signupForm.confirm_password" required type="password" autocomplete="new-password" class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="Repeat password" />
        </label>
      </div>
      <div v-if="signupMessage" class="mt-4 rounded-2xl border px-4 py-3 text-sm" :class="signupError ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'">{{ signupMessage }}</div>
      <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5" @click="closeSignup">Cancel</button>
        <button type="submit" class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400 disabled:opacity-60" :disabled="signupLoading">{{ signupLoading ? 'Creating...' : 'Create account' }}</button>
      </div>
    </form>
  </div>

  <!-- Onboarding Modal -->
  <OnboardingModal v-if="showOnboarding" :user="currentUser" @close="showOnboarding = false" @done="showOnboarding = false; loadData()" />
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../lib/api'
import Sidebar from '../components/Sidebar.vue'
import Topbar from '../components/Topbar.vue'
import OnboardingModal from '../components/OnboardingModal.vue'

const router = useRouter()
const route = useRoute()

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

const active = ref('dashboard')
const selectedCompany = ref('')
const companies = ref([{ name: 'default', company_name: 'Default Company' }])
const loadError = ref('')
const saveMessage = ref('')
const saveError = ref(false)
const currentUser = ref({ is_authenticated: false })
const showLogin = ref(false)
const showSignup = ref(false)
const showOnboarding = ref(false)
const loginLoading = ref(false)
const loginMessage = ref('')
const loginError = ref(false)
const loginForm = ref({ usr: '', pwd: '' })
const signupLoading = ref(false)
const signupMessage = ref('')
const signupError = ref(false)
const signupForm = ref({ email: '', username: '', first_name: '', last_name: '', password: '', confirm_password: '' })

const pageTitle = computed(() => nav.find((item) => item.key === active.value)?.label || 'Dashboard')

function navigate(key) {
  active.value = key
  router.push({ name: key })
}

async function loadCompanies() {
  const rows = await api.companies()
  if (rows?.length) { companies.value = rows; selectedCompany.value = selectedCompany.value || rows[0].name }
}

async function loadCurrentUser() {
  currentUser.value = await api.currentUser()
  if (currentUser.value?.company) selectedCompany.value = currentUser.value.company
}

async function loadData() {
  loadError.value = ''
  try {
    await Promise.all([
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
  } catch (error) { loadError.value = String(error?.message || error) }
}

function closeLogin() { showLogin.value = false; loginMessage.value = ''; loginError.value = false }
function closeSignup() { showSignup.value = false; signupMessage.value = ''; signupError.value = false }

async function submitLogin() {
  loginLoading.value = true; loginMessage.value = ''; loginError.value = false
  try {
    await api.login(loginForm.value.usr, loginForm.value.pwd)
    await loadCurrentUser()
    loginForm.value = { usr: '', pwd: '' }
    showLogin.value = false
    await loadCompanies(); await loadData(); await checkOnboarding()
  } catch (error) { loginError.value = true; loginMessage.value = String(error?.message || error) }
  finally { loginLoading.value = false }
}

async function submitSignup() {
  signupLoading.value = true; signupMessage.value = ''; signupError.value = false
  try {
    if (signupForm.value.password !== signupForm.value.confirm_password) throw new Error('Passwords do not match')
    await api.signupUser(signupForm.value)
    await api.login(signupForm.value.email, signupForm.value.password)
    signupForm.value = { email: '', username: '', first_name: '', last_name: '', password: '', confirm_password: '' }
    showSignup.value = false
    await loadCurrentUser(); await loadCompanies(); await loadData(); await checkOnboarding()
  } catch (error) { signupError.value = true; signupMessage.value = String(error?.message || error || 'Signup failed') }
  finally { signupLoading.value = false }
}

async function loginWithGoogle() { window.location.href = await api.getGoogleLoginUrl(window.location.origin) }

async function logout() {
  await api.logout()
  currentUser.value = { is_authenticated: false }
  selectedCompany.value = companies.value[0]?.name || ''
  active.value = 'dashboard'
  router.push({ name: 'dashboard' })
}

async function checkOnboarding() {
  if (!currentUser.value?.is_authenticated) return
  try {
    const status = await api.getOnboardingStatus()
    if (!status.onboarded && status.available_roles?.length) showOnboarding.value = true
  } catch {}
}

watch(selectedCompany, loadData)
watch(() => route.name, (name) => { if (name && name !== 'trip-detail') active.value = name }, { immediate: true })
onMounted(async () => {
  try { await loadCurrentUser(); await loadCompanies(); await loadData(); await checkOnboarding() }
  catch (error) { loadError.value = String(error?.message || error) }
})
</script>
