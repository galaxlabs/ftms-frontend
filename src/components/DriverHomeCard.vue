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

      <div v-if="!canGoOnline" class="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100">
        آپ کی سبسکرپشن فعال نہیں ہے۔ آن لائن ہونے کے لیے نیچے سبسکرپشن کا حصہ دیکھیں۔
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

const online = computed(() => !!subscription.value?.is_online)
const canGoOnline = computed(() => !!subscription.value?.can_create)

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

onMounted(loadStatus)
</script>
