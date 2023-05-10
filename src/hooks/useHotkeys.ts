import hotkeys, { KeyHandler } from 'hotkeys-js'
import { onBeforeMount, onBeforeUnmount, ref } from 'vue'

type Options = {
  scope?: string
  element?: HTMLElement | null
  keyup?: boolean | null
  keydown?: boolean | null
  capture?: boolean
  splitKey?: string
}

// 关闭过滤
hotkeys.filter = (e) => true
export function useHotkeys(key: string, method: KeyHandler, options?: Options) {
  if (options) {
    onBeforeMount(() => hotkeys(key, options, method))
  } else {
    onBeforeMount(() => hotkeys(key, method))
  }
  onBeforeUnmount(() => hotkeys.unbind(key))
}

export function useHotkeysScope(scopeName: string) {
  onBeforeUnmount(() => hotkeys.deleteScope(scopeName))

  return {
    setScope() {
      hotkeys.setScope(scopeName)
    },
    isCurrentScope() {
      return hotkeys.getScope() === scopeName
    }
  }
}
