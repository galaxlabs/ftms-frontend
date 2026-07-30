import { createApp } from 'vue'
import { FrappeUI } from 'frappe-ui'
import router from './router'
import App from './App.vue'
import './styles/index.css'

createApp(App).use(FrappeUI, { socketio: false }).use(router).mount('#app')
