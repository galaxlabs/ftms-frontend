<template>
  <section dir="rtl" class="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-white shadow-2xl shadow-black/30 sm:p-7">
    <div class="text-sm text-slate-400">آپ کی آج کی حالت</div>

    <div v-if="loading" class="mt-4 text-sm text-slate-400">لوڈ ہو رہا ہے...</div>

    <template v-else>
      <button
        type="button"
        class="mt-4 flex w-full items-center justify-center rounded-3xl px-6 py-7 text-2xl font-black transition disabled:cursor-not-allowed disabled:opacity-60 sm:text-3xl"
        :class="online ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300' : 'bg-slate-700 text-white hover:bg-slate-600'"
        :disabled="busy || !canGoOnline"
        @click="toggleOnline"
      >
        {{ busy ? 'براہ کرم انتظار کریں...' : online ? 'آف لائن ہوں' : 'آن لائن ہوں' }}
      </button>

      <p class="mt-4 text-center text-base leading-7" :class="online ? 'text-emerald-200' : 'text-slate-300'">
        {{ statusText }}
      </p>

      <div v-if="home" class="mt-5 rounded-2xl border border-white/10 bg-slate-950/60">
        <div class="flex items-center justify-between gap-3 px-4 py-3">
          <span class="text-sm text-slate-400">آج کے ٹرپس</span>
          <span class="text-lg font-bold">{{ home.trips_today || 0 }}</span>
        </div>
        <div class="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
          <span class="text-sm text-slate-400">آج کا کل کرایہ</span>
          <span class="text-lg font-bold">{{ money(home.gross_today) }}</span>
        </div>
        <div class="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
          <span class="text-sm text-slate-400">آپ کا حصہ</span>
          <span class="text-lg font-bold text-emerald-200">{{ money(home.driver_share_today) }}</span>
        </div>
      </div>

      <div v-if="homeError" class="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
        {{ homeError }}
      </div>

      <div v-if="home" class="mt-5">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-base font-bold">دستاویزات کی تجدید</h3>
          <span class="shrink-0 text-xs text-slate-400">{{ expiringDocuments.length }} دستاویزات</span>
        </div>

        <p v-if="!expiringDocuments.length" class="mt-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
          اگلے 30 دن میں کوئی دستاویز ختم نہیں ہو رہی۔
        </p>

        <ul v-else class="mt-3 space-y-2">
          <li
            v-for="doc in expiringDocuments"
            :key="`${doc.doctype}-${doc.name}-${doc.document}`"
            class="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3"
            :class="expiryClass(doc.days_left)"
          >
            <div class="min-w-0">
              <div class="truncate text-sm font-semibold">{{ documentLabel(doc) }}</div>
              <div class="mt-1 text-xs opacity-80">{{ ownerLabel(doc.owner) }} · {{ doc.expiry_date }}</div>
            </div>
            <span class="shrink-0 rounded-full bg-black/25 px-3 py-1 text-xs font-bold">
              {{ daysLabel(doc.days_left) }}
            </span>
          </li>
        </ul>
      </div>

      <div v-if="subscription" class="mt-5 grid grid-cols-2 gap-3">
        <div class="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-center">
          <div class="text-2xl font-bold">{{ subscription.active_days_remaining }}</div>
          <div class="mt-1 text-xs text-slate-400">باقی دن</div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-center">
          <div class="text-2xl font-bold">{{ Number(subscription.active_hours_remaining || 0).toFixed(1) }}</div>
          <div class="mt-1 text-xs text-slate-400">باقی گھنٹے</div>
        </div>
      </div>

      <div
        v-if="subscription"
        class="mt-5 rounded-2xl border px-4 py-4 text-sm leading-7"
        :class="canGoOnline ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100' : 'border-rose-400/30 bg-rose-400/10 text-rose-100'"
      >
        <div class="text-base font-bold">{{ subscriptionTitle }}</div>
        <div class="mt-1 opacity-90">{{ subscriptionDetail }}</div>
        <button
          v-if="!canGoOnline"
          type="button"
          class="mt-3 flex w-full items-center justify-center rounded-2xl bg-amber-300 px-4 py-3 text-base font-black text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="paying"
          @click="payNow"
        >
          {{ paying ? 'براہ کرم انتظار کریں...' : 'ادائیگی کریں اور دوبارہ فعال کریں' }}
        </button>
      </div>

      <div v-if="message" class="mt-4 rounded-2xl border px-4 py-3 text-sm" :class="messageError ? 'border-rose-400/30 bg-rose-400/10 text-rose-100' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'">
        {{ message }}
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from '../lib/api'

const loading = ref(true)
const busy = ref(false)
const subscription = ref(null)
const message = ref('')
const messageError = ref(false)
const home = ref(null)
const homeError = ref('')

const online = computed(() => !!subscription.value?.is_online)
const canGoOnline = computed(() => !!subscription.value?.can_create)
const expiringDocuments = computed(() => home.value?.expiring_documents || [])
const paying = ref(false)

const subscriptionTitle = computed(() => {
  const status = subscription.value?.status
  if (status === 'Trial') return 'مفت آزمائشی مدت'
  if (status === 'Active') return 'سبسکرپشن فعال ہے'
  return 'سبسکرپشن ختم ہو گئی ہے'
})

const subscriptionDetail = computed(() => {
  const sub = subscription.value || {}
  if (sub.status === 'Trial') return sub.trial_end ? `آزمائشی مدت ${sub.trial_end} تک ہے۔` : 'آزمائشی مدت شروع ہو چکی ہے۔'
  if (sub.status === 'Active') return sub.period_end ? `مدت ${sub.period_end} تک ہے۔` : 'آپ آن لائن ہو سکتے ہیں۔'
  return 'کام جاری رکھنے کے لیے ادائیگی کریں۔ ادائیگی کے بعد سبسکرپشن خودکار طور پر فعال ہوگی۔'
})

const documentLabels = {
  Iqama: 'اقامہ',
  'Driving license': 'ڈرائیونگ لائسنس',
  'Driver card': 'ڈرائیور کارڈ',
  'Vehicle registration': 'گاڑی کی رجسٹریشن',
  Insurance: 'انشورنس',
  'Operation card': 'آپریشن کارڈ',
}
const ownerLabels = { driver: 'ڈرائیور', vehicle: 'گاڑی' }

const statusText = computed(() => {
  if (!subscription.value) return 'کمپنی سے منسلک ہونے کے بعد آپ آن لائن ہو سکیں گے۔'
  if (!canGoOnline.value) return 'سبسکرپشن فعال کریں تاکہ آپ کو سواری مل سکے۔'
  return online.value ? 'آپ آن لائن ہیں، نئی سواری آ سکتی ہے۔' : 'آپ آف لائن ہیں، کوئی سواری نہیں آئے گی۔'
})

async function loadStatus() {
  loading.value = true
  try {
    const data = await api.subscriptionStatus()
    subscription.value = data && data.status !== 'No Company' ? data : null
  } catch (error) {
    messageError.value = true
    message.value = String(error?.message || error)
  } finally {
    loading.value = false
  }
}

async function toggleOnline() {
  busy.value = true
  message.value = ''
  messageError.value = false
  try {
    await api.setOnline(!online.value)
    await loadStatus()
  } catch (error) {
    messageError.value = true
    message.value = String(error?.message || error)
  } finally {
    busy.value = false
  }
}

async function payNow() {
  paying.value = true
  message.value = ''
  messageError.value = false
  try {
    const result = await api.subscribe()
    if (result?.payment_url) {
      window.location.href = result.payment_url
      return
    }
    message.value = 'ادائیگی کی درخواست بن گئی ہے۔ تصدیق کے بعد سبسکرپشن فعال ہوگی۔'
    await loadStatus()
  } catch (error) {
    messageError.value = true
    message.value = String(error?.message || error)
  } finally {
    paying.value = false
  }
}

async function loadHome() {
  homeError.value = ''
  try {
    home.value = await api.driverHome()
  } catch (error) {
    homeError.value = 'آج کا خلاصہ لوڈ نہیں ہو سکا۔ دوبارہ کوشش کریں۔'
  }
}

function money(value) {
  return `${new Intl.NumberFormat('en-SA', { maximumFractionDigits: 2 }).format(Number(value || 0))} ریال`
}

function documentLabel(doc) {
  return documentLabels[doc?.document] || doc?.document || 'دستاویز'
}

function ownerLabel(owner) {
  return ownerLabels[owner] || owner || ''
}

function daysLabel(days) {
  const count = Number(days)
  if (count < 0) return `${Math.abs(count)} دن پہلے ختم`
  if (count === 0) return 'آج ختم'
  return `${count} دن باقی`
}

function expiryClass(days) {
  const count = Number(days)
  if (count < 0) return 'border-rose-400/40 bg-rose-500/10 text-rose-100'
  if (count <= 7) return 'border-amber-300/40 bg-amber-400/10 text-amber-100'
  return 'border-white/10 bg-slate-950/60 text-slate-200'
}

onMounted(() => {
  loadStatus()
  loadHome()
})
</script>
