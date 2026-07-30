import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'
import TripDetailPage from './pages/TripDetailPage.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'dashboard', meta: { title: 'Dashboard' } },
      { path: 'companies', name: 'companies', meta: { title: 'Companies' } },
      { path: 'trips', name: 'trips', meta: { title: 'Trips' } },
      { path: 'bookings', name: 'bookings', meta: { title: 'Bookings' } },
      { path: 'customers', name: 'customers', meta: { title: 'Customers' } },
      { path: 'invoices', name: 'invoices', meta: { title: 'Invoices' } },
      { path: 'contracts', name: 'contracts', meta: { title: 'Contracts' } },
      { path: 'vehicles', name: 'vehicles', meta: { title: 'Vehicles' } },
      { path: 'captains', name: 'captains', meta: { title: 'Captains' } },
      { path: 'join_requests', name: 'join_requests', meta: { title: 'Join Requests' } },
      { path: 'expenses', name: 'expenses', meta: { title: 'Expenses' } },
      { path: 'routes', name: 'routes', meta: { title: 'Routes' } },
      { path: 'settings', name: 'settings', meta: { title: 'Settings' } },
    ],
  },
  {
    path: '/trip/:uuid',
    name: 'trip-detail',
    component: TripDetailPage,
    meta: { public: true, title: 'Trip Details' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
