import { computed } from 'vue'
import { onBeforeUnmount } from 'vue'
import { onBeforeMount } from 'vue'
import { useTheme } from 'vuetify'

export function useDark() {
  const theme = useTheme()

  function setThemeName(dark: boolean) {
    theme.global.name.value = dark ? 'dark' : 'light'
  }

  return {
    isDark: computed(() => theme.global.current.value.dark),
    setDark(dark: boolean = true) {
      setThemeName(dark)
    },
    autoDark() {
      const matchMedia = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => setThemeName(e.matches)

      onBeforeMount(() => {
        setThemeName(matchMedia.matches)
        matchMedia.addEventListener('change', handler)
      })

      onBeforeUnmount(() => {
        matchMedia.removeEventListener('change', handler)
      })
    }
  }
}
