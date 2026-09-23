<template>
  <div class="min-h-screen bg-[#070b12] text-white">
    <div class="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.22),transparent_30%)]"></div>

    <main class="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <header class="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div class="grid gap-6 p-5 lg:grid-cols-[1.15fr_0.85fr] lg:p-7">
          <section>
            <div class="flex flex-wrap items-center gap-3">
              <span class="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">Driver workspace</span>
              <span class="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs text-sky-100">Website bookings only</span>
            </div>
            <h1 class="mt-6 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              FTMS for compliant driver operations, cash, VAT, and trip settlement.
            </h1>
            <p class="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              This screen is not a passenger marketplace. Bookings come from your website or admin channels, then FTMS assigns drivers, calculates trip value, cash received, VAT, commission, and company settlement.
            </p>
            <div class="mt-6 grid gap-3 sm:grid-cols-3">
              <div v-for="metric in heroMetrics" :key="metric.label" class="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div class="text-2xl font-bold">{{ metric.value }}</div>
                <div class="mt-1 text-xs text-slate-400">{{ metric.label }}</div>
              </div>
            </div>
          </section>

          <aside class="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Demo tenant</div>
                <h2 class="mt-1 text-2xl font-bold">{{ selectedCompany.name }}</h2>
                <p class="mt-1 text-sm text-slate-400">{{ selectedCompany.city }} · VAT {{ selectedCompany.vat }}</p>
              </div>
              <span :class="['rounded-full px-3 py-1 text-xs font-semibold', subscription.active ? 'bg-emerald-400/15 text-emerald-200' : 'bg-rose-400/15 text-rose-200']">
                {{ subscription.active ? 'Active' : 'Payment due' }}
              </span>
            </div>

            <label v-if="isDemo" class="mt-5 block text-sm text-slate-300">
              <span>Switch demo company</span>
              <select v-model="selectedCompanyId" class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-300">
                <option v-for="company in visibleCompanies" :key="company.id" :value="company.id" class="bg-slate-950">{{ company.name }}</option>
              </select>
            </label>

            <div v-else class="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div class="text-xs uppercase tracking-[0.2em] text-slate-500">Company locked</div>
              <div class="mt-2 text-sm leading-6 text-slate-300">
                Drivers can only see bookings, cash, VAT and subscription status for their linked company.
              </div>
            </div>

            <div class="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-semibold">Subscription agreement</div>
                  <div class="mt-1 text-xs text-slate-400">Backend-controlled price and period</div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold">{{ subscription.plan }}</div>
                  <div class="text-xs text-slate-500">{{ subscription.days }} days · {{ subscription.hours }} hrs</div>
                </div>
              </div>
              <button class="mt-4 w-full rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60" :disabled="paying" @click="payNow">
                {{ paying ? 'Preparing payment...' : payLabel }}
              </button>
              <p class="mt-3 text-xs leading-5 text-slate-500">Drivers never edit pricing. Admin agreement and payment confirmation activate usage.</p>
            </div>
          </aside>
        </div>
      </header>

      <div v-if="paymentMessage" class="rounded-2xl border px-4 py-3 text-sm" :class="paymentError ? 'border-rose-400/30 bg-rose-400/10 text-rose-100' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'">
        {{ paymentMessage }}
      </div>

      <section class="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div class="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Website queue</div>
              <h2 class="mt-1 text-2xl font-bold">Booking intake</h2>
              <p class="mt-1 text-sm text-slate-400">Read-only operations queue. Customers do not book from this driver screen.</p>
            </div>
            <span class="rounded-full bg-amber-300/15 px-3 py-1 text-xs text-amber-100">{{ pendingBookings.length }} pending</span>
          </div>

          <div class="mt-5 space-y-3">
            <article v-for="booking in bookings" :key="booking.id" class="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="font-semibold">{{ booking.pickup }} → {{ booking.dropoff }}</div>
                  <div class="mt-1 text-sm text-slate-400">{{ booking.customer }} · {{ booking.time }}</div>
                </div>
                <span :class="statusClass(booking.status)">{{ booking.status }}</span>
              </div>
              <div class="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div><div class="text-slate-500">Distance</div><div class="font-semibold">{{ booking.km }} km</div></div>
                <div><div class="text-slate-500">Fare</div><div class="font-semibold">{{ money(booking.fare) }}</div></div>
                <div><div class="text-slate-500">Channel</div><div class="font-semibold">{{ booking.channel }}</div></div>
              </div>
            </article>
          </div>
        </div>

        <div class="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Driver settlement</div>
              <h2 class="mt-1 text-2xl font-bold">Cash, VAT, trip calculation</h2>
            </div>
            <button class="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5" @click="useNextScenario">Next demo</button>
          </div>

          <div class="mt-5 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div class="text-sm text-emerald-100/80">Active driver</div>
                <div class="mt-1 text-2xl font-bold">{{ activeDriver.name }}</div>
                <div class="mt-1 text-sm text-emerald-100/70">{{ activeDriver.car }} · {{ activeDriver.plate }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm text-emerald-100/80">Cash collected</div>
                <div class="mt-1 text-3xl font-black">{{ money(settlement.cash) }}</div>
              </div>
            </div>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div v-for="item in settlementCards" :key="item.label" class="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div class="text-xs text-slate-500">{{ item.label }}</div>
              <div class="mt-2 text-xl font-bold">{{ item.value }}</div>
              <div class="mt-1 text-xs text-slate-500">{{ item.hint }}</div>
            </div>
          </div>

          <div class="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div class="grid grid-cols-4 bg-white/[0.04] px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-500">
              <span>Trip</span><span>Fare</span><span>VAT</span><span class="text-right">Net</span>
            </div>
            <div v-for="trip in completedTrips" :key="trip.id" class="grid grid-cols-4 border-t border-white/10 px-4 py-3 text-sm text-slate-300">
              <span>{{ trip.id }}</span><span>{{ money(trip.fare) }}</span><span>{{ money(vatOf(trip.fare)) }}</span><span class="text-right font-semibold text-white">{{ money(netOf(trip.fare)) }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-5 lg:grid-cols-3">
        <div class="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5 lg:col-span-2">
          <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Compliance flow</div>
          <h2 class="mt-1 text-2xl font-bold">Why bookings stay on your website</h2>
          <div class="mt-5 grid gap-4 md:grid-cols-3">
            <div v-for="step in complianceSteps" :key="step.title" class="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div class="text-lg font-bold">{{ step.title }}</div>
              <p class="mt-2 text-sm leading-6 text-slate-400">{{ step.text }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
          <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Demo data</div>
          <h2 class="mt-1 text-2xl font-bold">Companies ready</h2>
          <div class="mt-5 space-y-3">
            <button v-for="company in visibleCompanies" :key="company.id" class="w-full rounded-2xl border p-4 text-left transition" :class="selectedCompanyId === company.id ? 'border-emerald-300/50 bg-emerald-300/10' : 'border-white/10 bg-slate-950/60 hover:bg-white/[0.07]'" :disabled="!isDemo" @click="isDemo && (selectedCompanyId = company.id)">
              <div class="font-semibold">{{ company.name }}</div>
              <div class="mt-1 text-sm text-slate-400">{{ company.city }} · {{ company.drivers }} drivers · {{ company.vehicles }} vehicles</div>
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { api } from '../lib/api'

const props = defineProps({
  user: { type: Object, default: () => ({}) },
  companies: { type: Array, default: () => [] },
  selectedCompany: { type: String, default: '' },
})

const selectedCompanyId = ref('tamayuz')
const scenario = ref(0)
const paying = ref(false)
const paymentMessage = ref('')
const paymentError = ref(false)

const demoCompanies = [
  { id: 'tamayuz', name: 'Tamayuz Transport', city: 'Riyadh', vat: '300998877600003', drivers: 18, vehicles: 24, plan: 'Yearly', days: 365, hours: 2920 },
  { id: 'demo', name: 'DEMO Fleet', city: 'Jeddah', vat: '301111222200003', drivers: 5, vehicles: 7, plan: 'Monthly', days: 30, hours: 240 },
  { id: 'digihoopoe', name: 'Digihoopoe Logistics', city: 'Dammam', vat: '302222111100003', drivers: 9, vehicles: 12, plan: 'Custom', days: 180, hours: 1440 },
]

const isDemo = computed(() => !props.user?.is_authenticated)
const ownCompany = computed(() => {
  if (isDemo.value) return null
  const companyName = props.user?.company || props.selectedCompany || props.companies?.[0]?.name || 'Linked Company'
  const companyRecord = props.companies.find((company) => company.name === companyName || company.company_name === companyName) || {}
  return {
    id: 'own-company',
    name: companyRecord.company_name || companyRecord.name || companyName,
    city: companyRecord.city || companyRecord.location || 'Company workspace',
    vat: companyRecord.tax_id || companyRecord.vat_no || 'From company profile',
    drivers: companyRecord.drivers || 1,
    vehicles: companyRecord.vehicles || 1,
    plan: 'Company Agreement',
    days: 30,
    hours: 240,
  }
})
const visibleCompanies = computed(() => (isDemo.value ? demoCompanies : [ownCompany.value]))

const bookingsByCompany = {
  tamayuz: [
    { id: 'BK-1042', customer: 'Riyadh Web Lead', pickup: 'Olaya', dropoff: 'King Khalid Airport', time: 'Today 18:30', km: 38, fare: 142, status: 'Pending', channel: 'Website' },
    { id: 'BK-1041', customer: 'Hotel Desk', pickup: 'Al Malqa', dropoff: 'Diriyah', time: 'Today 16:10', km: 19, fare: 84, status: 'Assigned', channel: 'Portal' },
    { id: 'BK-1040', customer: 'Corporate Guest', pickup: 'KAFD', dropoff: 'Exit 8', time: 'Done', km: 23, fare: 96, status: 'Completed', channel: 'Website' },
  ],
  demo: [
    { id: 'BK-2201', customer: 'Demo Customer', pickup: 'Corniche', dropoff: 'Airport', time: 'Today 21:00', km: 28, fare: 110, status: 'Pending', channel: 'Website' },
    { id: 'BK-2200', customer: 'Walk-in Desk', pickup: 'Al Hamra', dropoff: 'Balad', time: 'Done', km: 12, fare: 52, status: 'Completed', channel: 'Admin' },
  ],
  digihoopoe: [
    { id: 'BK-3304', customer: 'Plant Visitor', pickup: 'Dammam Station', dropoff: 'Industrial Area', time: 'Today 13:20', km: 31, fare: 118, status: 'Assigned', channel: 'Website' },
    { id: 'BK-3303', customer: 'Airport Transfer', pickup: 'Khobar', dropoff: 'DMM Airport', time: 'Done', km: 54, fare: 186, status: 'Completed', channel: 'Website' },
  ],
}

const drivers = [
  { name: 'Kashif Ali', car: 'Toyota Camry 2023', plate: 'RDA 4821' },
  { name: 'Mohammed Nasser', car: 'Hyundai Sonata 2022', plate: 'KSA 9182' },
  { name: 'Abdul Rahman', car: 'Kia Carnival 2024', plate: 'DMM 7742' },
]

const selectedCompany = computed(() => {
  if (!isDemo.value) return ownCompany.value
  return demoCompanies.find((company) => company.id === selectedCompanyId.value) || demoCompanies[0]
})
const ownCompanyBookings = computed(() => [
  { id: 'WEB-001', customer: 'Website Customer', pickup: 'Pickup from website', dropoff: 'Drop-off from website', time: 'Assigned', km: 18, fare: 75, status: 'Assigned', channel: 'Website' },
  { id: 'WEB-000', customer: 'Completed Website Trip', pickup: 'Company service area', dropoff: 'Customer destination', time: 'Done', km: 14, fare: 60, status: 'Completed', channel: 'Website' },
])
const bookings = computed(() => (isDemo.value ? bookingsByCompany[selectedCompanyId.value] || [] : ownCompanyBookings.value))
const pendingBookings = computed(() => bookings.value.filter((booking) => booking.status !== 'Completed'))
const completedTrips = computed(() => bookings.value.filter((booking) => booking.status === 'Completed'))
const activeDriver = computed(() => drivers[scenario.value % drivers.length])
const vatRate = 0.15

const subscription = computed(() => ({
  active: !isDemo.value || selectedCompanyId.value !== 'demo',
  plan: selectedCompany.value.plan,
  days: selectedCompany.value.days,
  hours: selectedCompany.value.hours,
}))

const settlement = computed(() => {
  const fare = completedTrips.value.reduce((total, trip) => total + trip.fare, 0)
  const vat = fare - fare / (1 + vatRate)
  const commission = fare * 0.12
  return { cash: fare, vat, commission, companyNet: fare - vat - commission }
})

const heroMetrics = computed(() => [
  { label: 'Website bookings today', value: bookings.value.length },
  { label: 'Cash to reconcile', value: money(settlement.value.cash) },
  { label: 'VAT included', value: money(settlement.value.vat) },
])

const settlementCards = computed(() => [
  { label: 'Gross fare', value: money(settlement.value.cash), hint: 'Customer cash/card total' },
  { label: 'VAT 15%', value: money(settlement.value.vat), hint: 'Included VAT amount' },
  { label: 'Driver commission', value: money(settlement.value.commission), hint: 'Demo 12% commission' },
  { label: 'Company net', value: money(settlement.value.companyNet), hint: 'After VAT and commission' },
])

const complianceSteps = [
  { title: '1. Website gets booking', text: 'Customer accepts your website terms and pricing. FTMS receives the booking as an operations record.' },
  { title: '2. Driver executes trip', text: 'Driver sees assigned trip, collects payment if cash, and confirms distance/status.' },
  { title: '3. FTMS settles books', text: 'System calculates VAT, cash due, commission, and invoice values for Saudi compliance.' },
]

const payLabel = computed(() => (subscription.value.active ? 'Pay next agreement period' : 'Pay to activate agreement'))

function money(value) {
  return new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 2 }).format(Number(value || 0))
}

function vatOf(fare) {
  return Number(fare || 0) - Number(fare || 0) / (1 + vatRate)
}

function netOf(fare) {
  return Number(fare || 0) - vatOf(fare)
}

function statusClass(status) {
  const base = 'rounded-full px-3 py-1 text-xs font-semibold'
  if (status === 'Completed') return `${base} bg-emerald-400/15 text-emerald-200`
  if (status === 'Assigned') return `${base} bg-sky-400/15 text-sky-200`
  return `${base} bg-amber-400/15 text-amber-100`
}

function useNextScenario() {
  scenario.value += 1
}

async function payNow() {
  paying.value = true
  paymentMessage.value = ''
  paymentError.value = false
  try {
    const result = await api.subscribe()
    if (result?.payment_url) {
      window.location.href = result.payment_url
      return
    }
    paymentMessage.value = 'Agreement renewal created. Admin/payment confirmation will activate the balance.'
  } catch (error) {
    paymentError.value = true
    paymentMessage.value = 'Demo payment: backend payment is unavailable or user is not logged in. In production this button opens Moyasar and activates only after Paid confirmation.'
  } finally {
    paying.value = false
  }
}
</script>
