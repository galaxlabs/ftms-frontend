export const API_BASE = (import.meta.env.VITE_FTMS_BACKEND_URL || 'https://ftms.galaxylabs.online').replace(/\/$/, '')

async function call(method, params = {}) {
  const body = new URLSearchParams()
  body.set('cmd', method)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
  })

  const response = await fetch(`${API_BASE}/api/method/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    credentials: 'include',
    body,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.exception || data?._server_messages || response.statusText)
  return data.message ?? data
}

export const api = {
  call,
  login: (usr, pwd) => call('login', { usr, pwd }),
  logout: () => call('logout'),
  currentUser: () => call('ftms.api.auth.get_current_user'),
  updateProfile: (payload) => call('ftms.api.auth.update_profile', payload),
  dashboard: () => call('ftms.api.dashboard.overview'),
  signup: (payload) => call('ftms.api.onboarding.signup', payload),
  companies: () => call('ftms.api.company.list_companies'),
  trips: (company, limit = 20) => call('ftms.api.trip.list_trips', { company, limit }),
  bookings: (company, limit = 20) => call('ftms.api.booking.list_bookings', { company, limit }),
  invoices: (company, limit = 20) => call('ftms.api.invoice.list_invoices', { company, limit }),
  contracts: (company, limit = 20) => call('ftms.api.contract.list_contracts', { company, limit }),
  employees: (company, limit = 20) => call('ftms.api.employee.list_employees', { company, limit }),
  vehicles: (company, limit = 20) => call('ftms.api.vehicle.list_vehicles', { company, limit }),
  routes: (company, limit = 20) => call('ftms.api.route.list_routes', { company, limit }),
}
