import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Trading from '../views/Trading.vue'
import Wallet from '../views/Wallet.vue'
import PrivyDebug from '../components/PrivyDebug.vue'
import TestSync from '../views/TestSync.vue'
import CreateWallet from '../views/CreateWallet.vue'
import LogoutTest from '../components/LogoutTest.vue'
import TestWalletCreation from '../views/TestWalletCreation.vue'
import DiagnosticTool from '../views/DiagnosticTool.vue'
import WalletDiagnostic from '../views/WalletDiagnostic.vue'

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
  },
  {
    path: '/create-wallet',
    name: 'CreateWallet',
    component: CreateWallet
  },
  {
    path: '/logout-test',
    name: 'LogoutTest',
    component: LogoutTest
  },
  {
    path: '/test-wallet-creation',
    name: 'TestWalletCreation',
    component: TestWalletCreation
  },
  {
    path: '/diagnostic-tool',
    name: 'DiagnosticTool',
    component: DiagnosticTool
  },
  {
    path: '/wallet-diagnostic',
    name: 'WalletDiagnostic',
    component: WalletDiagnostic
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router