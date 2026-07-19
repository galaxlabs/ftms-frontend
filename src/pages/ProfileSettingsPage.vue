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
            <select v-model="form.id_document_type" required class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400">
              <option value="">Select document type</option>
              <option>National ID</option>
              <option>Iqama</option>
              <option>Passport</option>
              <option>GCC ID</option>
              <option>Other</option>
            </select>
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>ID No</span>
            <input v-model="form.id_no" required class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="National ID / Iqama / Passport" />
          </label>
          <label class="space-y-2 text-sm text-slate-300">
            <span>Nationality</span>
            <input v-model="form.nationality" required class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400" placeholder="Saudi Arabia" />
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
import { reactive, ref, watch } from 'vue'
import PageHeader from '../components/PageHeader.vue'

const props = defineProps({ user: Object, saveProfile: Function })

const loading = ref(false)
const message = ref('')
const error = ref(false)
const form = reactive({ first_name: '', last_name: '', mobile_no: '', id_document_type: '', id_no: '', nationality: '', id_expiry_date: '', id_document: '' })

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
