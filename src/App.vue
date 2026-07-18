<template>
  <div class="flex h-full min-h-screen">
    <Sidebar :active="active" :items="nav" @navigate="active = $event" />

    <main class="flex min-w-0 flex-1 flex-col">
      <Topbar v-model="selectedCompany" :title="pageTitle" :companies="companies" />

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

        <RoutesPage v-else-if="active === 'routes'" :rows="datasets.routes" />

        <RecordsPage
          v-else
          :eyebrow="pageMeta.eyebrow"
          :title="pageMeta.title"
          :description="pageMeta.description"
          :columns="pageMeta.columns"
          :rows="tableRows"
        />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { api } from './lib/api'
import DashboardPage from './pages/DashboardPage.vue'
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

watch(selectedCompany, loadData)

onMounted(async () => {
  try {
    await loadCompanies()
    await loadData()
  } catch (error) {
    loadError.value = String(error?.message || error)
  }
})
</script>
