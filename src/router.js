import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'
import DashboardPage from './pages/DashboardPage.vue'
import JoinRequestsPage from './pages/JoinRequestsPage.vue'
import RecordsPage from './pages/RecordsPage.vue'
import RoutesPage from './pages/RoutesPage.vue'
import ProfileSettingsPage from './pages/ProfileSettingsPage.vue'
import TripDetailPage from './pages/TripDetailPage.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'dashboard', component: DashboardPage, meta: { title: 'Dashboard', recordKey: 'dashboard' } },
      { path: 'companies', name: 'companies', component: RecordsPage, meta: { title: 'Companies', recordKey: 'companies' } },
      { path: 'trips', name: 'trips', component: RecordsPage, meta: { title: 'Trips', recordKey: 'trips' } },
      { path: 'bookings', name: 'bookings', component: RecordsPage, meta: { title: 'Bookings', recordKey: 'bookings' } },
      { path: 'customers', name: 'customers', component: RecordsPage, meta: { title: 'Customers', recordKey: 'customers' } },
      { path: 'invoices', name: 'invoices', component: RecordsPage, meta: { title: 'Invoices', recordKey: 'invoices' } },
      { path: 'contracts', name: 'contracts', component: RecordsPage, meta: { title: 'Contracts', recordKey: 'contracts' } },
      { path: 'vehicles', name: 'vehicles', component: RecordsPage, meta: { title: 'Vehicles', recordKey: 'vehicles' } },
      { path: 'captains', name: 'captains', component: RecordsPage, meta: { title: 'Captains', recordKey: 'captains' } },
      { path: 'join_requests', name: 'join_requests', component: JoinRequestsPage, meta: { title: 'Join Requests', recordKey: 'joinRequests' } },
      { path: 'expenses', name: 'expenses', component: RecordsPage, meta: { title: 'Expenses', recordKey: 'expenses' } },
      { path: 'routes', name: 'routes', component: RoutesPage, meta: { title: 'Routes', recordKey: 'routes' } },
      { path: 'settings', name: 'settings', component: ProfileSettingsPage, meta: { title: 'Settings' } },
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
