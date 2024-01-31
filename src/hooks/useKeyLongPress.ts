import { onBeforeUnmount, onMounted } from 'vue'

export function useKeyLongPress(
  key: string,
  handler: (event: KeyboardEvent) => void,
  cancelHandler: (event: KeyboardEvent, isKeyUp: boolean) => void,
  timeout: number
) {
  const checkKey = (e: KeyboardEvent) => e.key === key

  let timer: number
  const handleDown = (e: KeyboardEvent) => {
    if (checkKey(e)) {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        handler(e)
      }, timeout)
    } else {
      window.clearTimeout(timer)
      cancelHandler(e, false)
    }
  }
  const handleUp = (e: KeyboardEvent) => {
    if (checkKey(e)) {
      window.clearTimeout(timer)
      cancelHandler(e, true)
    } else {
      window.clearTimeout(timer)
    }
  }
  onMounted(() => {
    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleDown)
    window.removeEventListener('keyup', handleUp)
  })
}
