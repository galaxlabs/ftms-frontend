<template>
  <div class="space-y-6">
    <PageHeader
      eyebrow="Captain Onboarding"
      title="Join Requests"
      description="Pending captain requests to join your company. Approve or reject based on document verification."
    >
      <template #actions>
        <div class="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-400">
          {{ rows.length }} pending
        </div>
        <button class="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5" @click="$emit('refresh')">Refresh</button>
      </template>
    </PageHeader>

    <div v-if="!rows.length" class="rounded-3xl border border-white/10 bg-slate-900/70 px-6 py-12 text-center text-sm text-slate-500">
      No pending join requests.
    </div>

    <div v-for="row in rows" :key="row.name" class="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-xs uppercase tracking-[0.25em] text-slate-500">Request {{ row.name }}</div>
          <h3 class="mt-1 text-lg font-semibold text-white">{{ row.captain_profile }}</h3>
          <div class="mt-1 text-sm text-slate-400">
            Requested by <span class="text-slate-200">{{ row.requested_by }}</span>
            on <span class="text-slate-200">{{ formatDate(row.requested_on) }}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400" @click="approve(row.name)">Approve</button>
          <button class="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5" @click="reject(row.name)">Reject</button>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <button class="rounded-xl border border-white/10 px-3 py-1 text-xs text-slate-400 hover:bg-white/5" @click="showProfile[row.name] = !showProfile[row.name]">
          {{ showProfile[row.name] ? 'Hide Profile' : 'View Profile' }}
        </button>
      </div>

      <div v-if="showProfile[row.name]" class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div v-if="profiles[row.name]" class="grid gap-3 sm:grid-cols-2">
          <div v-for="val in profileFields" :key="val.key" class="text-sm">
            <span class="text-slate-500">{{ val.label }}:</span>
            <span class="ml-2 text-slate-200">{{ profiles[row.name][val.key] || '-' }}</span>
          </div>
        </div>
        <div v-else class="text-sm text-slate-400">Could not load profile details.</div>
      </div>

      <div v-if="showReject[row.name]" class="mt-4 flex gap-2">
        <input v-model="rejectNotes[row.name]" class="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-400" placeholder="Optional rejection reason..." />
        <button class="rounded-xl bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-400" @click="confirmReject(row.name)">Confirm</button>
        <button class="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5" @click="cancelReject(row.name)">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { api } from '../lib/api'
import PageHeader from '../components/PageHeader.vue'

const props = defineProps({ rows: { type: Array, required: true } })
const emit = defineEmits(['approve', 'reject', 'refresh'])

const showProfile = reactive({})
const showReject = reactive({})
const rejectNotes = reactive({})
const profiles = reactive({})

const profileFields = [
  { label: 'Full Name', key: 'full_name' },
  { label: 'Mobile', key: 'mobile_no' },
  { label: 'ID Type', key: 'id_document_type' },
  { label: 'Nationality', key: 'nationality' },
  { label: 'Iqama No', key: 'iqama_no' },
  { label: 'Iqama Expiry', key: 'iqama_expiry_date' },
  { label: 'National ID', key: 'national_id' },
  { label: 'License No', key: 'license_no' },
  { label: 'License Expiry', key: 'license_expiry_date' },
  { label: 'Driver Card No', key: 'driver_card_no' },
  { label: 'Driver Card Expiry', key: 'driver_card_expiry_date' },
  { label: 'City', key: 'city' },
  { label: 'Status', key: 'status' },
]

async function loadProfile(name) {
  try {
    profiles[name] = await api.captains(null, 100).then(rows => rows.find(r => r.name === props.rows.find(p => p.captain_profile === name)?.captain_profile))
    if (!profiles[name]) {
      const data = await api.call('ftms.api.captain.get_captain', { name: name })
      profiles[name] = data
    }
  } catch { profiles[name] = null }
}

function approve(name) {
  emit('approve', name)
}

function reject(name) {
  showReject[name] = true
  rejectNotes[name] = ''
}

function cancelReject(name) {
  showReject[name] = false
  rejectNotes[name] = ''
}

function confirmReject(name) {
  emit('reject', name)
  showReject[name] = false
}

function formatDate(val) {
  if (!val) return '-'
  return new Date(val).toLocaleDateString()
}
</script>
