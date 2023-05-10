<template>
  <context-menu v-model:show="showMenu" :options="contextOptions">
    <context-menu-item label="打开" @click="actions.open" />
    <context-menu-item label="在访达中显示" @click="actions.openInFinder" />
    <context-menu-item
      v-show="showQuickLook"
      label="快速查看"
      @click="actions.quickLook"
    />
    <context-menu-sperator />
    <context-menu-item label="拷贝" @click="actions.copy" />
    <context-menu-item label="拷贝名称" @click="actions.copyName" />
    <context-menu-item label="拷贝路径" @click="actions.copyPath" />

    <context-menu-sperator />
    <context-menu-item label="移到废纸篓" @click="actions.moveToTrash" />
  </context-menu>
</template>

<script lang="ts" setup>
import { useDark } from '@/hooks/useDark'
import { ref } from 'vue'

type ActionKey =
  | 'open'
  | 'openInFinder'
  | 'copy'
  | 'copyName'
  | 'copyPath'
  | 'quickLook'
  | 'moveToTrash'
defineProps<{
  actions: Partial<Record<ActionKey, () => void>>
  showQuickLook?: boolean
}>()

const { isDark } = useDark()
const showMenu = ref(false)
const contextOptions = ref({
  zIndex: 3,
  minWidth: 230,
  x: 500,
  y: 200,
  theme: 'mac'
})

function onContextMenu(x: number, y: number) {
  contextOptions.value.theme = isDark.value ? 'mac dark' : 'mac'
  showMenu.value = true
  contextOptions.value.x = x
  contextOptions.value.y = y
}

defineExpose({
  showMenu: (x: number, y: number) => onContextMenu(x, y)
})
</script>

<style lang="scss" scoped></style>
