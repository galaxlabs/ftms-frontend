import { reactive } from 'vue'
import { api } from './api'

export const auth = reactive({
  user: { is_authenticated: false, name: '' },
  loading: true,
})

export async function checkAuth() {
  try {
    auth.user = await api.currentUser()
  } catch {
    auth.user = { is_authenticated: false }
  } finally {
    auth.loading = false
  }
  return auth.user
}
