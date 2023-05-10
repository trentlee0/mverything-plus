<template>
  <div class="tw-relative tw-h-full tw-w-full tw-overflow-auto tw-px-5 tw-py-3">
    <OverlayProgress v-show="loading" :dark="isDark" />
    <div v-show="!loading">
      <FolderSubItem
        v-for="(file, index) in files"
        :key="file.name"
        :file="file"
        :dir-path="dirPath"
        :active="activeIndex === index"
        :isDiffStyle="index % 2 === 1"
        @click="handleActive(index)"
        @dblclick="handleDoubleClick(file.name)"
        @contextmenu="onContextMenu($event, file, index)"
      />
      <FolderSubItem
        v-for="(i, index) in Math.max(0, maxLine - files.length)"
        :key="i"
        :isDiffStyle="(files.length + index) % 2 === 1"
        @click="handleActive(files.length + index)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import FolderSubItem from './FolderSubItem.vue'
import ContextMenu from '@imengyu/vue3-context-menu'
import { SimpleFileInfo } from '@/models'
import { useSettingStore } from '@/store'
import { copyText, shellOpenPath, shellShowItemInFolder } from 'utools-api'
import { copyFromPath } from '@/utils/common'
import { ref, watch } from 'vue'
import { useDark } from '@/hooks/useDark'
import OverlayProgress from '../common/OverlayProgress.vue'

const settingStore = useSettingStore()
const maxLine = ref(8)
const props = defineProps<{
  dirPath: string
  files: Array<SimpleFileInfo>
  loading?: boolean
}>()

function getFullPath(filename: string) {
  if (!props.dirPath) return ''
  return `${props.dirPath}/${filename}`
}

function handleDoubleClick(filename: string) {
  shellOpenPath(getFullPath(filename))
}

const activeIndex = ref<number>()
function handleActive(index: number) {
  if (props.files && index < props.files.length) {
    activeIndex.value = index
  } else {
    activeIndex.value = undefined
  }
}

watch(
  () => props.files,
  () => {
    activeIndex.value = undefined
  }
)

const { isDark } = useDark()
function onContextMenu(e: MouseEvent, file: SimpleFileInfo, index: number) {
  e.preventDefault()

  activeIndex.value = index
  const fullPath = getFullPath(file.name)
  ContextMenu.showContextMenu({
    theme: isDark.value ? 'mac dark' : 'mac',
    x: e.x,
    y: e.y,
    items: [
      {
        label: '打开',
        onClick: () => shellOpenPath(fullPath)
      },
      {
        label: '在访达中显示',
        onClick: () => shellShowItemInFolder(fullPath)
      },
      {
        label: '拷贝',
        onClick: () => copyFromPath(fullPath, settingStore.pictureExtension)
      },
      {
        label: '拷贝名称',
        onClick: () => copyText(file.name)
      },
      {
        label: '拷贝路径',
        onClick: () => copyText(fullPath)
      }
    ]
  })
}
</script>

<style lang="scss" scoped></style>
