import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Trading from '../views/Trading.vue'
import Wallet from '../views/Wallet.vue'
import PrivyDebug from '../components/PrivyDebug.vue'
import TestSync from '../views/TestSync.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/trading',
    name: 'Trading',
    component: Trading
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: Wallet
  },
  {
    path: '/debug',
    name: 'Debug',
    component: PrivyDebug
  },
  {
    path: '/test-sync',
    name: 'TestSync',
    component: TestSync
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router