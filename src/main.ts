import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import pinia from './store'
import router from './router'
import directives from './directives'
import vuetify from './plugins/vuetify'
import toastification from './plugins/toastification'
import contextMenu from './plugins/context-menu'

createApp(App)
  .use(pinia)
  .use(router)
  .use(directives)
  .use(vuetify)
  .use(toastification)
  .use(contextMenu)
  .mount('#app')
