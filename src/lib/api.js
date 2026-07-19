export const API_BASE = (import.meta.env.VITE_FTMS_BACKEND_URL || '').replace(/\/$/, '')

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
  dashboard: (company) => call('ftms.api.dashboard.overview', { company }),
  signup: (payload) => call('ftms.api.onboarding.signup', payload),
  companies: () => call('ftms.api.company.list_companies'),
  customers: (company, limit = 20) => call('ftms.api.customer.list_customers', { company, limit }),
  trips: (company, limit = 20) => call('ftms.api.trip.list_trips', { company, limit }),
  bookings: (company, limit = 20) => call('ftms.api.booking.list_bookings', { company, limit }),
  createBooking: (payload) => call('ftms.api.booking.create_booking', payload),
  invoices: (company, limit = 20) => call('ftms.api.invoice.list_invoices', { company, limit }),
  contracts: (company, limit = 20) => call('ftms.api.contract.list_contracts', { company, limit }),
  captains: (company, limit = 20) => call('ftms.api.captain.list_captains', { company, limit }),
  expenses: (company, limit = 20) => call('ftms.api.expense.list_expenses', { company, limit }),
  vehicles: (company, limit = 20) => call('ftms.api.vehicle.list_vehicles', { company, limit }),
  routes: (company, limit = 20) => call('ftms.api.route.list_routes', { company, limit }),
  createRoute: (payload) => call('ftms.api.route.create_route', payload),
}
