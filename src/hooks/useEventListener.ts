import { onBeforeUnmount, onMounted } from 'vue'

export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any
): void {
  onMounted(() => {
    window.addEventListener(type, listener)
  })

  onBeforeUnmount(() => {
    window.removeEventListener(type, listener)
  })
}
