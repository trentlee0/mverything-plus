import { App } from 'vue'
import Toast, { PluginOptions } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const options: PluginOptions = {
  timeout: 2000,
  bodyClassName: 'custom-toast-body-class'
}

export default {
  install: (app: App) => {
    app.use(Toast, options)
  }
}
