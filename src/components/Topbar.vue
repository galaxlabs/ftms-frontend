<template>
  <header class="flex flex-col gap-4 border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <div>
      <div class="text-xs uppercase tracking-[0.35em] text-slate-500">Company dashboard</div>
      <h1 class="text-2xl font-semibold text-white">{{ title }}</h1>
    </div>

    <div class="flex w-full flex-wrap items-center gap-3 sm:w-auto">
      <select v-model="modelValueProxy" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none">
        <option v-for="company in companies" :key="company.name" :value="company.name">{{ company.company_name }}</option>
      </select>
      <div v-if="user?.is_authenticated" class="hidden text-right text-xs text-slate-400 md:block">
        <div class="text-sm font-medium text-white">{{ user.full_name || user.email }}</div>
        <div>{{ user.portal_role || 'User' }}</div>
      </div>
      <button v-if="!user?.is_authenticated" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10" @click="$emit('login')">Login</button>
      <button v-if="!user?.is_authenticated" class="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400" @click="$emit('signup')">Sign up</button>
      <button v-if="user?.is_authenticated" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10" @click="$emit('profile')">Profile</button>
      <button v-if="user?.is_authenticated" class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10" @click="$emit('logout')">Logout</button>
      <button class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">Export</button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ title: String, companies: Array, modelValue: String, user: Object })
const emit = defineEmits(['update:modelValue', 'login', 'logout', 'profile', 'signup'])

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>
