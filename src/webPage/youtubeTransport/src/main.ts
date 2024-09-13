import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const shadow = document.getElementById('youtube-stylish-reader-shadow-root-id')?.shadowRoot

const mountPoint =
  shadow?.getElementById('youtube-stylish-reader-mount-point') ??
  '#youtube-stylish-reader-mount-point'

app.mount(mountPoint)
