<template>
  <div class="flex h-full min-h-screen">
    <Sidebar :active="active" :items="nav" @navigate="active = $event" />

    <main class="flex min-w-0 flex-1 flex-col">
      <Topbar v-model="selectedCompany" :title="pageTitle" :companies="companies" />

      <section class="flex-1 overflow-y-auto p-6">
        <div v-if="active === 'dashboard'" class="space-y-6">
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Trips" :value="dashboard.cards.trips" hint="All active and recent trips" />
            <KpiCard label="Bookings" :value="dashboard.cards.bookings" hint="Ride app and desk bookings" />
            <KpiCard label="Invoices" :value="dashboard.cards.invoices" hint="Trip invoice pipeline" />
            <KpiCard label="VAT" :value="dashboard.cards.vat" hint="Company-level tax summary" />
          </div>

          <div class="grid gap-6 xl:grid-cols-2">
            <section class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-soft">
              <div class="text-sm font-medium text-white">Operations</div>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <div v-for="item in ops" :key="item.label" class="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                  <div class="text-xs text-slate-400">{{ item.label }}</div>
                  <div class="mt-1 text-xl font-semibold text-white">{{ item.value }}</div>
                </div>
              </div>
            </section>

            <section class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-soft">
              <div class="text-sm font-medium text-white">Recent Activity</div>
              <div class="mt-4 space-y-3 text-sm">
                <div v-for="row in dashboard.activity" :key="row.label" class="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-300">
                  <span>{{ row.label }}</span>
                  <span class="text-slate-500">{{ row.time }}</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-soft">
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="text-sm text-slate-400">{{ active.toUpperCase() }}</div>
                <h2 class="text-xl font-semibold text-white">{{ pageTitle }}</h2>
              </div>
              <button class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white">New {{ pageTitle }}</button>
            </div>
          </div>

          <RecordsTable :title="pageTitle + ' Records'" :columns="tableColumns" :rows="tableRows" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { api } from './lib/api'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'
import KpiCard from './components/KpiCard.vue'
import RecordsTable from './components/RecordsTable.vue'

const nav = [
  { key: 'dashboard', label: 'Dashboard', short: 'Overview' },
  { key: 'companies', label: 'Companies', short: 'Tenants' },
  { key: 'trips', label: 'Trips', short: 'Operations' },
  { key: 'bookings', label: 'Bookings', short: 'Ride app' },
  { key: 'invoices', label: 'Invoices', short: 'Tax' },
  { key: 'contracts', label: 'Contracts', short: 'B2B' },
  { key: 'vehicles', label: 'Vehicles', short: 'Fleet' },
  { key: 'employees', label: 'Captains', short: 'Staff' },
  { key: 'routes', label: 'Routes', short: 'Pricing' },
  { key: 'settings', label: 'Settings', short: 'Branding' },
]

const active = ref('dashboard')
const selectedCompany = ref('')
const companies = ref([{ name: 'default', company_name: 'Default Company' }])
const dashboard = ref({ cards: { trips: 0, bookings: 0, invoices: 0, vat: 0 }, activity: [] })
const tableRows = ref([])

const pageTitle = computed(() => nav.find((item) => item.key === active.value)?.label || 'Dashboard')
const tableColumns = computed(() => {
  const map = {
    companies: [
      { label: 'Code', key: 'company_code' },
      { label: 'Name', key: 'company_name' },
      { label: 'Domain', key: 'domain' },
      { label: 'Status', key: 'status' },
    ],
    trips: [
      { label: 'Title', key: 'trip_title' },
      { label: 'Date', key: 'trip_date' },
      { label: 'Route', key: 'route' },
      { label: 'Status', key: 'trip_status' },
    ],
    bookings: [
      { label: 'Title', key: 'booking_title' },
      { label: 'Date', key: 'booking_date' },
      { label: 'Customer', key: 'customer_name' },
      { label: 'Status', key: 'booking_status' },
    ],
    invoices: [
      { label: 'Invoice', key: 'name' },
      { label: 'Date', key: 'invoice_date' },
      { label: 'Customer', key: 'customer' },
      { label: 'Total', key: 'grand_total' },
    ],
    contracts: [
      { label: 'Title', key: 'contract_title' },
      { label: 'Route', key: 'route' },
      { label: 'Shift', key: 'shift_type' },
      { label: 'Active', key: 'is_active' },
    ],
    vehicles: [
      { label: 'Name', key: 'vehicle_name' },
      { label: 'Plate', key: 'plate_no' },
      { label: 'Type', key: 'vehicle_type' },
      { label: 'Status', key: 'status' },
    ],
    employees: [
      { label: 'Name', key: 'employee_name' },
      { label: 'Company', key: 'company' },
    ],
    routes: [
      { label: 'Route', key: 'route_title' },
      { label: 'Source', key: 'source' },
      { label: 'Destination', key: 'destination' },
      { label: 'Status', key: 'status' },
    ],
  }
  return map[active.value] || []
})

const ops = computed(() => [
  { label: 'Active Fleet', value: dashboard.value.cards.trips },
  { label: 'Pending Bookings', value: dashboard.value.cards.bookings },
  { label: 'Open Invoices', value: dashboard.value.cards.invoices },
  { label: 'VAT Ready', value: dashboard.value.cards.vat },
])

async function loadDashboard() {
  try {
    const [tripRows, bookingRows, invoiceRows, contractRows, vehicleRows, employeeRows, routeRows] = await Promise.all([
      api.trips(selectedCompany.value, 10),
      api.bookings(selectedCompany.value, 10),
      api.invoices(selectedCompany.value, 10),
      api.contracts(selectedCompany.value, 10),
      api.vehicles(selectedCompany.value, 10),
      api.employees(selectedCompany.value, 10),
      api.routes(selectedCompany.value, 10),
    ])

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
        { label: `Invoices loaded: ${invoiceRows.length}`, time: 'now' },
      ],
    }

    const tableMap = { companies: companies.value, trips: tripRows, bookings: bookingRows, invoices: invoiceRows, contracts: contractRows, vehicles: vehicleRows, employees: employeeRows, routes: routeRows }
    tableRows.value = tableMap[active.value] || []
  } catch (error) {
    dashboard.value.activity = [{ label: String(error), time: 'error' }]
  }
}

watch([active, selectedCompany], loadDashboard, { immediate: true })

onMounted(async () => {
  try {
    const rows = await api.companies()
    if (rows?.length) {
      companies.value = rows
      selectedCompany.value = rows[0].name
    }
  } catch {
    // Keep the shell usable even before backend company list exists.
  }
})
</script>
