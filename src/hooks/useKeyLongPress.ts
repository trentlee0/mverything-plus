import { onKeyDown, onKeyUp, KeyFilter } from '@vueuse/core'
import { onBeforeUnmount } from 'vue'

export function useKeyLongPress(
  key: KeyFilter,
  downHandler: (event: KeyboardEvent) => void,
  upHandler: (event: KeyboardEvent) => void,
  timeout: number
) {
  let timer: number

  onKeyDown(key, (e) => {
    timer = window.setTimeout(() => {
      downHandler(e)
    }, timeout)
  })
  onKeyUp(key, (e) => {
    window.clearTimeout(timer)
    upHandler(e)
  })

  onBeforeUnmount(() => {
    window.clearTimeout(timer)
  })
}
