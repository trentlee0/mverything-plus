import { App, nextTick, DirectiveBinding } from 'vue'

function vTitle(el: HTMLElement, binding: DirectiveBinding<string | undefined>) {
  nextTick(() => {
    const { clientWidth, scrollWidth } = el
    if (clientWidth < scrollWidth) {
      el.title = binding.value ?? el.innerText
    }
  })
}

export default {
  install: (app: App) => {
    app.directive('title', {
      mounted: vTitle,
      updated: vTitle
    })
  }
}
