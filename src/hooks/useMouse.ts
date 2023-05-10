import { onBeforeMount } from 'vue'
import { onBeforeUnmount } from 'vue'
import { ref } from 'vue'

interface MouseOptions {
  delay?: number
}

export function useMouse(options?: MouseOptions) {
  const isMouseMove = ref(false)
  const position = ref<{ x: number; y: number }>({ x: 0, y: 0 })

  let mouseMoveTimer: number

  const handler = (e: MouseEvent) => {
    position.value.x = e.clientX
    position.value.y = e.clientY

    isMouseMove.value = true
    window.clearTimeout(mouseMoveTimer)
    mouseMoveTimer = window.setTimeout(
      () => (isMouseMove.value = false),
      options?.delay ?? 200
    )
  }

  onBeforeMount(() => {
    window.addEventListener('mousemove', handler)
  })

  onBeforeUnmount(() => {
    window.clearTimeout(mouseMoveTimer)
    window.removeEventListener('mousemove', handler)
  })

  return {
    isMouseMove,
    position
  }
}
