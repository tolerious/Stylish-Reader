import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const shadow = document.getElementById(
  'stylish-reader-phrase-floating-panel-shadow-root'
)?.shadowRoot

const mountPoint = shadow?.getElementById('stylish-reader-phrase-panel')

app.mount(mountPoint!)
