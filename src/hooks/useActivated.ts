import { onActivated } from 'vue'

export function onNonFirstActivated(hook: Function) {
  let isFirst = true
  onActivated(() => {
    if (isFirst) {
      isFirst = false
    } else {
      hook()
    }
  })
}
