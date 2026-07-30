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
  getGoogleLoginUrl: (redirect_to) => call('ftms.api.auth.get_google_login_url', { redirect_to }),
  signupUser: (payload) => call('ftms.api.onboarding.signup_user', payload),
  registerTransportationCompany: (payload) => call('ftms.api.onboarding.register_transportation_company', payload),
  createCaptainProfile: (payload) => call('ftms.api.onboarding.create_captain_profile', payload),
  setUserType: (user_type) => call('ftms.api.onboarding.set_user_type', { user_type }),
  completeOnboarding: () => call('ftms.api.onboarding.complete'),
  getOnboardingStatus: () => call('ftms.api.onboarding.get_status'),
  setRole: (role) => call('ftms.api.onboarding.set_role', { role }),
  createPassengerProfile: (payload) => call('ftms.api.onboarding.create_passenger_profile', payload),
  createPartnerProfile: (payload) => call('ftms.api.onboarding.create_partner_profile', payload),
  lookupCompanyByTaxId: (tax_id, vat_no) => call('ftms.api.onboarding.lookup_company_by_tax_id', { tax_id, vat_no }),
  registerCaptainVehicle: (payload) => call('ftms.api.captain.register_vehicle', payload),
  captainLookupCompanyByTaxId: (tax_id, vat_no) => call('ftms.api.captain.lookup_company_by_tax_id', { tax_id, vat_no }),
  companies: () => call('ftms.api.company.list_companies'),
  availableBookings: (company, vehicleType, limit = 50) => call('ftms.api.booking.list_available_bookings', { company, vehicle_type: vehicleType, limit }),
  makeOffer: (payload) => call('ftms.api.booking.make_offer', payload),
  listOffers: (booking) => call('ftms.api.booking.list_offers', { booking }),
  acceptOffer: (offer_name) => call('ftms.api.booking.accept_offer', { offer_name }),
  cancelBooking: (booking_name) => call('ftms.api.booking.cancel_booking', { booking_name }),
  reactivateBooking: (booking_name) => call('ftms.api.booking.reactivate_booking', { booking_name }),
  joinBookingGroup: (payload) => call('ftms.api.booking.join_booking_group', payload),
  pricingRules: (company, limit = 50) => call('ftms.api.pricing_rule.list_pricing_rules', { company, limit }),
  customers: (company, limit = 20) => call('ftms.api.customer.list_customers', { company, limit }),
  createCustomer: (payload) => call('ftms.api.customer.create_customer', payload),
  trips: (company, limit = 20) => call('ftms.api.trip.list_trips', { company, limit }),
  createTrip: (payload) => call('ftms.api.trip.create_trip', payload),
  bookings: (company, limit = 20) => call('ftms.api.booking.list_bookings', { company, limit }),
  createBooking: (payload) => call('ftms.api.booking.create_booking', payload),
  invoices: (company, limit = 20) => call('ftms.api.invoice.list_invoices', { company, limit }),
  createInvoice: (payload) => call('ftms.api.invoice.create_invoice', payload),
  contracts: (company, limit = 20) => call('ftms.api.contract.list_contracts', { company, limit }),
  createContract: (payload) => call('ftms.api.contract.create_contract', payload),
  captains: (company, limit = 20) => call('ftms.api.captain.list_captains', { company, limit }),
  createCaptainProfile: (payload) => call('ftms.api.captain.create_captain_profile', payload),
  requestJoinCompany: (company) => call('ftms.api.captain.request_join_company', { company }),
  joinRequests: (company, status) => call('ftms.api.captain.list_join_requests', { company, status }),
  approveJoinRequest: (name, notes) => call('ftms.api.captain.approve_join_request', { name, notes }),
  rejectJoinRequest: (name, notes) => call('ftms.api.captain.reject_join_request', { name, notes }),
  myCaptainProfile: () => call('ftms.api.captain.get_my_profile'),
  expenses: (company, limit = 20) => call('ftms.api.expense.list_expenses', { company, limit }),
  vehicles: (company, limit = 20) => call('ftms.api.vehicle.list_vehicles', { company, limit }),
  createVehicle: (payload) => call('ftms.api.vehicle.create_vehicle', payload),
  vehicleMakes: () => call('ftms.api.vehicle.list_vehicle_makes'),
  vehicleModels: (make) => call('ftms.api.vehicle.list_vehicle_models', { make }),
  routes: (company, limit = 20) => call('ftms.api.route.list_routes', { company, limit }),
  createRoute: (payload) => call('ftms.api.route.create_route', payload),
  ksaCities: (limit = 100) => call('ftms.api.route.list_ksa_cities', { limit }),
  getPublicTrip: (uuid) => call('ftms.api.trip.get_public_trip', { uuid }),
  countryList: () => call('ftms.country.id_format.get_country_list'),
  documentTypes: () => call('ftms.country.id_format.get_document_types'),
  documentFormat: (alpha_2, doc_type) => call('ftms.country.id_format.get_document_format', { alpha_2, doc_type }),
  validateDocument: (alpha_2, doc_type, value) => call('ftms.country.id_format.validate_document_number', { alpha_2, doc_type, value }),
  countryInfo: (alpha_2) => call('ftms.country.registry.get_country_info', { alpha_2 }),
}
