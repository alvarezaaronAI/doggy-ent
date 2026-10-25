import { createApp } from 'vue'
import './assets/styles/main.css'
import App from './App.vue'
import router from '@application-router'

createApp(App).use(router).mount('#app')
