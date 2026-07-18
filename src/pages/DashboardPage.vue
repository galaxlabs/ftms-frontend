<template>
  <div class="space-y-6">
    <PageHeader
      eyebrow="Operations Command"
      title="FTMS Control Center"
      description="Live company-level transport activity across fleet, routes, bookings, invoices, and ZATCA readiness."
    />

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Trips" :value="cards.trips" hint="Scheduled and recent trips" />
      <KpiCard label="Bookings" :value="cards.bookings" hint="Passenger and desk bookings" />
      <KpiCard label="Invoices" :value="cards.invoices" hint="Trip invoice pipeline" />
      <KpiCard label="VAT" :value="cards.vat" hint="Company VAT total" />
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section class="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-white">Operational Signals</div>
            <div class="mt-1 text-xs text-slate-500">Loaded from FTMS APIs for the selected company.</div>
          </div>
          <button class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10" @click="$emit('refresh')">
            Refresh
          </button>
        </div>
        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <div v-for="item in signals" :key="item.label" class="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div class="text-xs text-slate-400">{{ item.label }}</div>
            <div class="mt-2 text-2xl font-semibold text-white">{{ item.value }}</div>
            <div class="mt-1 text-xs text-slate-500">{{ item.hint }}</div>
          </div>
        </div>
      </section>

      <section class="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
        <div class="text-sm font-medium text-white">Recent Activity</div>
        <div class="mt-4 space-y-3 text-sm">
          <div v-for="row in activity" :key="row.label" class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-300">
            <span>{{ row.label }}</span>
            <span class="shrink-0 text-slate-500">{{ row.time }}</span>
          </div>
          <div v-if="!activity.length" class="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-8 text-center text-sm text-slate-500">
            No activity loaded yet.
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import KpiCard from '../components/KpiCard.vue'
import PageHeader from '../components/PageHeader.vue'

const props = defineProps({ dashboard: { type: Object, required: true } })
defineEmits(['refresh'])

const cards = computed(() => props.dashboard.cards || {})
const activity = computed(() => props.dashboard.activity || [])
const signals = computed(() => [
  { label: 'Active Fleet', value: cards.value.trips || 0, hint: 'Trips loaded for operation planning' },
  { label: 'Pending Bookings', value: cards.value.bookings || 0, hint: 'Demand waiting for confirmation' },
  { label: 'Open Invoices', value: cards.value.invoices || 0, hint: 'Billing records requiring review' },
  { label: 'VAT Ready', value: cards.value.vat || 0, hint: 'Amount prepared for tax reporting' },
])
</script>
