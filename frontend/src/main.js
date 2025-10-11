import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import vue3GoogleLogin from 'vue3-google-login'

const app = createApp(App)

// 配置Google登录
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-client-id'
})

app.use(router)
app.mount('#app')